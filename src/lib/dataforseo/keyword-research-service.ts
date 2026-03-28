import { classifyDifficultyLabel, computeDifficultyScore } from "../keyword-difficulty-engine";
import { clusterKeywords } from "../keyword-clustering";
import { recommendContentType } from "../keyword-content-recommendation";
import { classifyKeywordIntent } from "../keyword-intent";
import { createDataForSeoClient } from "./client";
import {
  buildKeywordResearchCacheKey,
  getKeywordMetricsCache,
  getKeywordResearchCache,
  KEYWORD_DIFFICULTY_TTL_DAYS,
  KEYWORD_RESEARCH_TTL_DAYS,
  markKeywordMetricsPending,
  normalizeDomain,
  normalizeKeyword,
  normalizeKeywordSeed,
  SERP_SNAPSHOT_TTL_DAYS,
  upsertKeywordMetricsCache,
  upsertKeywordResearchCache,
  type CachedKeywordSuggestion,
  type KeywordMetricCacheRecord,
  type KeywordResearchMode,
} from "./cache";
import {
  adjustFetchSizeForBudget,
  assertKeywordSearchQuota,
  canAutoAnalyzeDifficulty,
  canForceRefresh,
  getDailyBudgetState,
  getKeywordQuota,
} from "./cost-control";
import {
  computeFullOpportunityScore,
  computePreOpportunityScore,
} from "./opportunity-score";
import { buildRequestFingerprint, logDataForSeoUsage } from "./usage-log";

export type SearchRow = {
  keyword: string;
  searchVolume: number | null;
  cpc: number | null;
  competition: number | null;
  difficultyScore: number | null;
  difficultyLabel: string;
  difficultyStatus: "pending" | "available" | "unavailable";
  intent: ReturnType<typeof classifyKeywordIntent>;
  clusterName: string | null;
  recommendedContentType: ReturnType<typeof recommendContentType>;
  preOpportunityScore: number;
  opportunityScore: number | null;
  opportunityKind: "preliminary" | "full" | "unavailable";
  opportunityLabel: string;
  serpFeaturesCount: number;
  serpPressure: "Low" | "Medium" | "High" | "Unknown";
  freshness: "cached" | "fresh";
};

export type KeywordSearchResponse = {
  cacheKey: string;
  cached: boolean;
  freshnessLabel: string;
  query: {
    domain: string;
    seedKeyword: string;
    countryCode: string;
    languageCode: string;
    mode: KeywordResearchMode;
    limit: number;
    offset: number;
  };
  quota: Awaited<ReturnType<typeof getKeywordQuota>>;
  budget: Awaited<ReturnType<typeof getDailyBudgetState>>;
  summary: {
    totalKeywords: number;
    avgSearchVolume: number;
    avgCpc: number;
    lowCompetitionOpportunities: number;
    analyzedKeywords: number;
  };
  topOpportunity: {
    keyword: string | null;
    score: number | null;
    label: string;
  };
  clusters: Array<{
    clusterId: string;
    clusterName: string;
    totalSearchVolume: number;
    averageDifficulty: number | null;
    topKeyword: string;
    topOpportunityScore: number | null;
  }>;
  rows: SearchRow[];
  page: {
    hasMore: boolean;
    nextOffset: number | null;
  };
  controls: {
    canRefresh: boolean;
    minRefreshAgeMinutes: number;
    autoAnalyzedCount: number;
    showingMessage: string;
  };
};

type SearchParams = {
  userId: string;
  domain: string;
  seedKeyword: string;
  countryCode: string;
  languageCode?: string;
  mode?: KeywordResearchMode;
  limit?: number;
  offset?: number;
  forceRefresh?: boolean;
  isAdmin?: boolean;
};

type DifficultyParams = {
  userId: string;
  keywords: string[];
  countryCode: string;
  languageCode?: string;
  maxAllowed: number;
};

const MIN_REFRESH_AGE_MINUTES = Number(process.env.DATAFORSEO_MIN_REFRESH_AGE_MINUTES ?? 60);

function average(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function deriveSerpPressure(count: number): "Low" | "Medium" | "High" | "Unknown" {
  if (!Number.isFinite(count)) return "Unknown";
  if (count >= 4) return "High";
  if (count >= 2) return "Medium";
  return "Low";
}

function minutesSince(value: string): number | null {
  const ts = new Date(value).getTime();
  if (!Number.isFinite(ts)) return null;
  return Math.max(0, Math.round((Date.now() - ts) / 60000));
}

function convertMetricToRow(input: {
  suggestion: CachedKeywordSuggestion;
  metric?: KeywordMetricCacheRecord;
}): SearchRow {
  const intent = (input.metric?.intent as ReturnType<typeof classifyKeywordIntent> | undefined)
    ?? (input.suggestion.intent as ReturnType<typeof classifyKeywordIntent> | null)
    ?? classifyKeywordIntent(input.suggestion.keyword);
  const recommendedContentType = recommendContentType(input.suggestion.keyword, intent);
  const pre = computePreOpportunityScore({
    volume: input.suggestion.volume,
    cpc: input.suggestion.cpc,
  });
  const full = computeFullOpportunityScore({
    volume: input.suggestion.volume,
    cpc: input.suggestion.cpc,
    difficulty: input.metric?.difficulty,
  });
  const difficultyStatus = input.metric?.difficultyStatus ?? "pending";

  return {
    keyword: input.suggestion.keyword,
    searchVolume: input.metric?.volume ?? input.suggestion.volume,
    cpc: input.metric?.cpc ?? input.suggestion.cpc,
    competition: input.metric?.competition ?? input.suggestion.competition,
    difficultyScore: input.metric?.difficulty ?? null,
    difficultyLabel:
      input.metric?.difficultyLabel ??
      (difficultyStatus === "pending" ? "Pending analysis" : "Difficulty unavailable"),
    difficultyStatus,
    intent,
    clusterName: input.suggestion.clusterName,
    recommendedContentType,
    preOpportunityScore: pre.score ?? 0,
    opportunityScore: full.score ?? pre.score,
    opportunityKind: full.kind === "full" ? "full" : pre.kind,
    opportunityLabel: full.label === "Unavailable" ? pre.label : full.label,
    serpFeaturesCount: input.metric?.serpFeaturesCount ?? 0,
    serpPressure: deriveSerpPressure(input.metric?.serpFeaturesCount ?? Number.NaN),
    freshness: input.metric ? "cached" : "fresh",
  };
}

function sortRowsByOpportunity(rows: SearchRow[]): SearchRow[] {
  return [...rows].sort((left, right) => {
    const leftScore = typeof left.opportunityScore === "number" ? left.opportunityScore : left.preOpportunityScore;
    const rightScore = typeof right.opportunityScore === "number" ? right.opportunityScore : right.preOpportunityScore;
    return rightScore - leftScore;
  });
}

async function fetchSuggestions(params: {
  userId: string;
  domain: string;
  seedKeyword: string;
  countryCode: string;
  languageCode: string;
  mode: KeywordResearchMode;
  limit: number;
  forceRefresh: boolean;
  isAdmin: boolean;
  budgetMode: Awaited<ReturnType<typeof getDailyBudgetState>>["mode"];
}) {
  const cacheKey = buildKeywordResearchCacheKey({
    domain: params.domain,
    seedKeyword: params.seedKeyword,
    countryCode: params.countryCode,
    languageCode: params.languageCode,
    mode: params.mode,
  });

  const cached = await getKeywordResearchCache(cacheKey);
  const cacheAgeMinutes = cached ? minutesSince(cached.fetchedAt) : null;

  const cachedHasRequestedCoverage = cached ? cached.keywordCount >= params.limit : false;

  if (cached && cachedHasRequestedCoverage && !params.forceRefresh) {
    await logDataForSeoUsage({
      endpoint: "keywords/search_cache",
      userId: params.userId,
      cacheHit: true,
      requestFingerprint: buildRequestFingerprint(["keywords/search_cache", cacheKey]),
      requestUnits: cached.keywordCount,
      estimatedCost: 0,
      statusCode: 200,
      durationMs: 0,
      metadata: { cacheKey },
    });
    return {
      cacheKey,
      cached,
      fromCache: true,
      cacheAgeMinutes,
    };
  }

  if (params.forceRefresh && !canForceRefresh({ isAdmin: params.isAdmin, cacheAgeMinutes })) {
    throw new Error(`Refresh is allowed only when cached data is at least ${MIN_REFRESH_AGE_MINUTES} minutes old.`);
  }

  if (params.budgetMode === "cache_only" && cached) {
    return {
      cacheKey,
      cached,
      fromCache: true,
      cacheAgeMinutes,
    };
  }

  if (params.budgetMode === "cache_only" && !cached) {
    throw new Error("Live refresh is temporarily disabled while the daily provider budget is exhausted.");
  }

  const quota = await assertKeywordSearchQuota(params.userId);
  const client = createDataForSeoClient({
    userId: params.userId,
    requestFingerprint: buildRequestFingerprint(["keywords/search", cacheKey, params.limit]),
  });
  const liveSuggestions = await client.fetchKeywordIdeas({
    seedKeyword: params.seedKeyword,
    countryCode: params.countryCode,
    languageCode: params.languageCode,
    limit: adjustFetchSizeForBudget({
      requested: params.limit,
      defaultSize: quota.initialFetchSize,
      mode: params.budgetMode,
    }),
  });

  const baseRows = liveSuggestions.map((row) => {
    const intent = classifyKeywordIntent(row.keyword);
    const pre = computePreOpportunityScore({ volume: row.volume, cpc: row.cpc });
    return {
      keyword: row.keyword,
      volume: row.volume,
      cpc: row.cpc,
      competition: row.competition,
      intent,
      clusterName: null,
      preOpportunityScore: pre.score ?? 0,
    };
  });

  const clustering = clusterKeywords(
    baseRows.map((row) => ({
      keyword: row.keyword,
      volume: row.volume,
      difficultyScore: null,
      opportunityScore: row.preOpportunityScore,
    }))
  );
  const suggestions: CachedKeywordSuggestion[] = baseRows.map((row) => ({
    ...row,
    clusterName: clustering.keywordToCluster.get(row.keyword)?.clusterName ?? null,
  }));

  await upsertKeywordResearchCache({
    cacheKey,
    domain: params.domain,
    seedKeyword: params.seedKeyword,
    countryCode: params.countryCode,
    languageCode: params.languageCode,
    mode: params.mode,
    payload: {
      suggestions,
      totalAvailable: suggestions.length,
      sourceEndpoint: "keywords_data/google_ads/keywords_for_keywords/live",
      generatedSummary: {
        avgVolume: average(suggestions.map((row) => row.volume ?? 0)),
        avgCpc: average(suggestions.map((row) => row.cpc ?? 0)),
      },
    },
    keywordCount: suggestions.length,
    estimatedCost: suggestions.length * 0.0015,
    sourceEndpoint: "keywords_data/google_ads/keywords_for_keywords/live",
    ttlDays: KEYWORD_RESEARCH_TTL_DAYS,
  });

  return {
    cacheKey,
    cached: {
      id: "",
      cacheKey,
      domain: normalizeDomain(params.domain),
      seedKeyword: normalizeKeywordSeed(params.seedKeyword),
      countryCode: params.countryCode,
      languageCode: params.languageCode,
      mode: params.mode,
      payload: {
        suggestions,
        totalAvailable: suggestions.length,
        sourceEndpoint: "keywords_data/google_ads/keywords_for_keywords/live",
        generatedSummary: {
          avgVolume: average(suggestions.map((row) => row.volume ?? 0)),
          avgCpc: average(suggestions.map((row) => row.cpc ?? 0)),
        },
      },
      keywordCount: suggestions.length,
      containsDifficulty: false,
      estimatedCost: suggestions.length * 0.0015,
      sourceEndpoint: "keywords_data/google_ads/keywords_for_keywords/live",
      fetchedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + KEYWORD_RESEARCH_TTL_DAYS * 86400000).toISOString(),
    },
    fromCache: false,
    cacheAgeMinutes: null,
  };
}

export async function analyzeKeywordDifficulty(params: DifficultyParams): Promise<Map<string, KeywordMetricCacheRecord>> {
  const languageCode = (params.languageCode || "en").toLowerCase();
  const countryCode = params.countryCode.toUpperCase();
  const normalizedKeywords = [...new Set(params.keywords.map(normalizeKeyword))].slice(0, params.maxAllowed);
  const cachedMetrics = await getKeywordMetricsCache({
    keywords: normalizedKeywords,
    countryCode,
    languageCode,
  });

  const missing = normalizedKeywords.filter((keyword) => {
    const row = cachedMetrics.get(keyword);
    return !row || row.difficultyStatus === "pending";
  });

  if (missing.length === 0) {
    await logDataForSeoUsage({
      endpoint: "keywords/difficulty_cache",
      userId: params.userId,
      cacheHit: true,
      requestFingerprint: buildRequestFingerprint(["keywords/difficulty_cache", countryCode, normalizedKeywords.join(",")]),
      requestUnits: normalizedKeywords.length,
      estimatedCost: 0,
      statusCode: 200,
      durationMs: 0,
      metadata: { keywords: normalizedKeywords.length },
    });
    return cachedMetrics;
  }

  await markKeywordMetricsPending({
    keywords: missing,
    countryCode,
    languageCode,
    sourceEndpoint: "serp/google/organic/live/regular",
  });

  const client = createDataForSeoClient({
    userId: params.userId,
    requestFingerprint: buildRequestFingerprint(["keywords/difficulty", countryCode, normalizedKeywords.join(",")]),
  });

  const analyzedRows = await Promise.all(
    missing.map(async (keyword) => {
      try {
        const serp = await client.fetchSerpSnapshot({
          keyword,
          countryCode,
          languageCode,
          depth: 10,
        });

        const authoritySignals = await Promise.all(
          serp.topDomains.map((domain) => client.fetchBacklinkSummary({ domain }))
        );

        const authorities = authoritySignals
          .map((row) => row.authority)
          .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
        const backlinks = authoritySignals
          .map((row) => row.backlinks)
          .filter((value): value is number => typeof value === "number" && Number.isFinite(value) && value > 0);

        const avgAuthority = authorities.length
          ? Math.round(authorities.reduce((sum, value) => sum + value, 0) / authorities.length)
          : null;
        const avgBacklinks = backlinks.length
          ? Math.round(backlinks.reduce((sum, value) => sum + value, 0) / backlinks.length)
          : null;

        const difficulty = computeDifficultyScore({
          searchResultsCount: serp.searchResultsCount,
          avgDomainAuthorityTop10: avgAuthority,
          avgBacklinksTop10: avgBacklinks,
        });

        return {
          keyword,
          countryCode,
          languageCode,
          difficulty,
          difficultyLabel: classifyDifficultyLabel(difficulty),
          difficultyStatus: difficulty === null ? "unavailable" as const : "available" as const,
          searchResultsCount: serp.searchResultsCount,
          serpSnapshotHash: client.hashSnapshot(serp),
          serpFeatures: serp.serpFeatures,
          serpFeaturesCount: serp.serpFeatures.length,
          avgDomainAuthorityTop10: avgAuthority,
          avgBacklinksTop10: avgBacklinks,
          sourceEndpoint: "serp/google/organic/live/regular",
          estimatedCost: serp.topDomains.length * 0.002 + 0.002,
          ttlDays: SERP_SNAPSHOT_TTL_DAYS,
        };
      } catch {
        return {
          keyword,
          countryCode,
          languageCode,
          difficulty: null,
          difficultyLabel: "Difficulty unavailable",
          difficultyStatus: "unavailable" as const,
          searchResultsCount: null,
          serpSnapshotHash: null,
          serpFeatures: [],
          serpFeaturesCount: 0,
          avgDomainAuthorityTop10: null,
          avgBacklinksTop10: null,
          sourceEndpoint: "serp/google/organic/live/regular",
          estimatedCost: 0,
          ttlDays: KEYWORD_DIFFICULTY_TTL_DAYS,
        };
      }
    })
  );

  await upsertKeywordMetricsCache(analyzedRows);

  return getKeywordMetricsCache({
    keywords: normalizedKeywords,
    countryCode,
    languageCode,
  });
}

export async function buildKeywordSearchResponse(params: SearchParams): Promise<KeywordSearchResponse> {
  const languageCode = (params.languageCode || "en").toLowerCase();
  const mode = params.mode || "preview";
  const offset = Math.max(0, params.offset ?? 0);
  const budget = await getDailyBudgetState();
  const quota = await getKeywordQuota(params.userId);
  const requestedLimit = Math.max(1, params.limit ?? quota.initialFetchSize);

  const suggestionState = await fetchSuggestions({
    userId: params.userId,
    domain: params.domain,
    seedKeyword: params.seedKeyword,
    countryCode: params.countryCode,
    languageCode,
    mode,
    limit: requestedLimit,
    forceRefresh: Boolean(params.forceRefresh),
    isAdmin: Boolean(params.isAdmin),
    budgetMode: budget.mode,
  });

  const suggestions = suggestionState.cached.payload.suggestions;
  const pagedSuggestions = suggestions.slice(offset, offset + requestedLimit);
  const metricCache = await getKeywordMetricsCache({
    keywords: pagedSuggestions.map((row) => row.keyword),
    countryCode: params.countryCode,
    languageCode,
  });

  const autoAnalyzeCount = canAutoAnalyzeDifficulty({
    mode: budget.mode,
    requestedCount: quota.autoDifficultyCount,
    planLimit: quota.maxAnalyzedKeywordsPerSearch,
  });

  const topCandidates = sortRowsByOpportunity(
    pagedSuggestions.map((suggestion) => convertMetricToRow({ suggestion, metric: metricCache.get(normalizeKeyword(suggestion.keyword)) }))
  ).slice(0, autoAnalyzeCount);

  const missingAutoDifficulty = topCandidates
    .filter((row) => row.difficultyStatus !== "available")
    .map((row) => row.keyword);

  let mergedMetrics = metricCache;
  if (missingAutoDifficulty.length > 0) {
    mergedMetrics = await analyzeKeywordDifficulty({
      userId: params.userId,
      keywords: missingAutoDifficulty,
      countryCode: params.countryCode,
      languageCode,
      maxAllowed: quota.maxAnalyzedKeywordsPerSearch,
    });
  }

  const rows = sortRowsByOpportunity(
    pagedSuggestions.map((suggestion) => convertMetricToRow({
      suggestion,
      metric: mergedMetrics.get(normalizeKeyword(suggestion.keyword)),
    }))
  );

  const clusters = clusterKeywords(
    suggestions.map((suggestion) => {
      const metric = mergedMetrics.get(normalizeKeyword(suggestion.keyword));
      const opportunity = computeFullOpportunityScore({
        volume: suggestion.volume,
        cpc: suggestion.cpc,
        difficulty: metric?.difficulty,
      });
      return {
        keyword: suggestion.keyword,
        volume: suggestion.volume,
        difficultyScore: metric?.difficulty ?? null,
        opportunityScore: opportunity.score ?? computePreOpportunityScore({ volume: suggestion.volume, cpc: suggestion.cpc }).score,
      };
    })
  ).clusters;

  const topRow = rows[0] ?? null;
  const avgVolumes = rows.map((row) => row.searchVolume ?? 0).filter((value) => value > 0);
  const avgCpcs = rows.map((row) => row.cpc ?? 0).filter((value) => value > 0);
  const analyzedKeywords = rows.filter((row) => row.difficultyStatus === "available").length;
  const lowCompetitionOpportunities = rows.filter((row) => typeof row.difficultyScore === "number" && row.difficultyScore < 40).length;

  return {
    cacheKey: suggestionState.cacheKey,
    cached: suggestionState.fromCache,
    freshnessLabel: suggestionState.fromCache ? "Cached" : "Fresh",
    query: {
      domain: normalizeDomain(params.domain),
      seedKeyword: normalizeKeywordSeed(params.seedKeyword),
      countryCode: params.countryCode.toUpperCase(),
      languageCode,
      mode,
      limit: requestedLimit,
      offset,
    },
    quota,
    budget,
    summary: {
      totalKeywords: suggestions.length,
      avgSearchVolume: average(avgVolumes),
      avgCpc: avgCpcs.length ? Number((avgCpcs.reduce((sum, value) => sum + value, 0) / avgCpcs.length).toFixed(2)) : 0,
      lowCompetitionOpportunities,
      analyzedKeywords,
    },
    topOpportunity: {
      keyword: topRow?.keyword ?? null,
      score: topRow?.opportunityScore ?? topRow?.preOpportunityScore ?? null,
      label: topRow?.opportunityLabel ?? "Unavailable",
    },
    clusters: clusters.map((cluster) => ({
      clusterId: cluster.clusterId,
      clusterName: cluster.clusterName,
      totalSearchVolume: cluster.totalSearchVolume,
      averageDifficulty: cluster.averageDifficulty,
      topKeyword: cluster.topKeyword,
      topOpportunityScore: cluster.topOpportunityScore,
    })),
    rows,
    page: {
      hasMore: offset + requestedLimit < suggestions.length,
      nextOffset: offset + requestedLimit < suggestions.length ? offset + requestedLimit : null,
    },
    controls: {
      canRefresh: canForceRefresh({
        isAdmin: Boolean(params.isAdmin),
        cacheAgeMinutes: suggestionState.cacheAgeMinutes,
      }),
      minRefreshAgeMinutes: MIN_REFRESH_AGE_MINUTES,
      autoAnalyzedCount: autoAnalyzeCount,
      showingMessage: `Showing top ${rows.length} opportunities first to reduce cost and focus on actionable ideas.`,
    },
  };
}
