import { supabaseAdmin } from "@/lib/supabase";
import { logApiCost } from "@/lib/cost-engine";
import { fetchDataForSeoJson } from "@/lib/dataforseo";
import {
  classifyDifficultyLabel,
  estimateFallbackDifficulty,
  fetchKeywordDifficultySignals,
  type DifficultyLabel,
  type DifficultyStatus,
} from "@/lib/keyword-difficulty-engine";
import { classifyKeywordIntent, type KeywordIntent } from "@/lib/keyword-intent";
import {
  computeOpportunityScore,
  type OpportunityRating,
  type OpportunityStatus,
} from "@/lib/keyword-opportunity-score";
import {
  recommendContentType,
  type RecommendedContentType,
} from "@/lib/keyword-content-recommendation";
import { estimateTrafficPotential } from "@/lib/keyword-traffic-potential";
import { clusterKeywords, type KeywordCluster } from "@/lib/keyword-clustering";

type RawSuggestion = {
  keyword: string;
  volume: number | null;
  cpc: number | null;
  competition: number | string | null;
};

export type KeywordIntelligenceRow = {
  keyword: string;
  searchVolume: number | null;
  cpc: number | null;
  adsCompetition: number | null;
  searchResultsCount: number | null;
  serpFeaturesCount: number;
  serpFeatures: string[];
  avgDomainAuthorityTop10: number | null;
  avgBacklinksTop10: number | null;
  difficultyScore: number | null;
  difficultyLabel: DifficultyLabel;
  difficultyStatus: DifficultyStatus;
  intent: KeywordIntent;
  recommendedContentType: RecommendedContentType;
  estimatedTrafficLow: number | null;
  estimatedTrafficHigh: number | null;
  opportunityScore: number | null;
  opportunityRating: OpportunityRating;
  opportunityStatus: OpportunityStatus;
  clusterId: string | null;
  clusterName: string | null;
  topOpportunityInCluster: boolean;
  serpPressure: "Low" | "Medium" | "High";
};

export type KeywordResearchPayload = {
  run: {
    id: string;
    seed: string;
    country: string;
    cached: boolean;
    generatedAt: string;
    status: "completed" | "failed";
  };
  summary: {
    totalKeywords: number;
    topOpportunityScore: number | null;
    bestKeyword: string | null;
    bestKeywordDifficulty: number | null;
    bestKeywordDifficultyLabel: DifficultyLabel;
    bestKeywordOpportunityScore: number | null;
    bestKeywordTrafficLow: number | null;
    bestKeywordTrafficHigh: number | null;
    bestKeywordRecommendedContentType: RecommendedContentType | null;
    lowCompetitionCount: number;
    quickWinsCount: number;
  };
  quickWins: KeywordIntelligenceRow[];
  clusters: KeywordCluster[];
  keywords: KeywordIntelligenceRow[];
  suggestions: KeywordIntelligenceRow[];
  cached: boolean;
};

const CACHE_TTL_HOURS = 24;
const LANGUAGE_CODE = "en";

const LOCATION_CODES: Record<string, number> = {
  US: 2840, GB: 2826, CA: 2124, AU: 2036, IN: 2356,
  DE: 2276, FR: 2250, BR: 2076, MX: 2484, SG: 2702,
};

function getLocationCode(country: string): number {
  return LOCATION_CODES[country.toUpperCase()] ?? 2840;
}

function normalizeSeed(seed: string): string {
  return seed.trim().toLowerCase();
}

function normalizeDomain(domain: string): string {
  return domain
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .toLowerCase()
    .trim();
}

function buildRunId(seed: string, country: string): string {
  const normalizedSeed = normalizeSeed(seed).replace(/[^a-z0-9]+/g, "-").slice(0, 60);
  return `${country.toLowerCase()}-${normalizedSeed}`;
}

function isFresh(generatedAt: string): boolean {
  const generated = new Date(generatedAt).getTime();
  if (!Number.isFinite(generated)) return false;
  return Date.now() - generated < CACHE_TTL_HOURS * 60 * 60 * 1000;
}

function computeSerpPressure(serpFeaturesCount: number): "Low" | "Medium" | "High" {
  if (serpFeaturesCount >= 4) return "High";
  if (serpFeaturesCount >= 2) return "Medium";
  return "Low";
}

function normalizeAdsCompetitionScore(value: number | string | null | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value <= 1) return Math.round(value * 100);
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase();
    if (normalized === "LOW") return 20;
    if (normalized === "MEDIUM") return 50;
    if (normalized === "HIGH") return 80;
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return Math.max(0, Math.min(100, Math.round(parsed)));
  }

  return null;
}

function normalizeAdsCompetitionValue(value: number | string | null | undefined): number | null {
  const score = normalizeAdsCompetitionScore(value);
  if (score === null) return null;
  return Number((score / 100).toFixed(3));
}

async function getSharedAuthoritySignal(domain: string): Promise<{ authority: number | null; backlinks: number | null }> {
  try {
    const { data: cached } = await supabaseAdmin
      .from("backlink_snapshots")
      .select("trust_score, total_backlinks")
      .eq("domain", domain)
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cached) {
      return {
        authority: typeof cached.trust_score === "number" ? cached.trust_score : null,
        backlinks: typeof cached.total_backlinks === "number" ? cached.total_backlinks : null,
      };
    }
  } catch {
    // Fall through to live fetch.
  }

  try {
    const json = await fetchDataForSeoJson<{
      tasks?: Array<{
        result?: Array<{
          rank?: number | null;
          total_backlinks?: number | null;
        }>;
      }>;
    }>({
      feature: "backlinks",
      url: "https://api.dataforseo.com/v3/backlinks/summary/live",
      method: "POST",
      body: [{ target: domain, include_subdomains: true }],
    });
    const result = json?.tasks?.[0]?.result?.[0];
    return {
      authority: typeof result?.rank === "number" ? result.rank : null,
      backlinks: typeof result?.total_backlinks === "number" ? result.total_backlinks : null,
    };
  } catch {
    return { authority: null, backlinks: null };
  }
}

async function getRawSuggestions(params: {
  userId: string;
  domain: string;
  seed: string;
  country: string;
}): Promise<{ suggestions: RawSuggestion[]; cached: boolean }> {
  const { userId, domain, seed, country } = params;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const seedLower = normalizeSeed(seed);

  const { data: globalCached } = await supabaseAdmin
    .from("keyword_suggestions")
    .select("keyword, volume, cpc, competition")
    .eq("seed_keyword", seedLower)
    .gte("created_at", sevenDaysAgo)
    .order("volume", { ascending: false })
    .limit(50);

  if (globalCached && globalCached.length > 0) {
    return { suggestions: globalCached as RawSuggestion[], cached: true };
  }

  const json = await fetchDataForSeoJson<{
    tasks?: Array<{
      result?: Array<{
        keyword: string;
        search_volume: number | null;
        cpc: number | null;
        competition: number | string | null;
      }>;
    }>;
  }>({
    feature: "keywords",
    url: "https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live",
    method: "POST",
    body: [
      {
        keywords: [seedLower],
        language_code: LANGUAGE_CODE,
        location_code: getLocationCode(country),
        limit: 50,
        order_by: ["search_volume,desc"],
      },
    ],
  });

  const suggestions = (json?.tasks?.[0]?.result ?? []).map((row) => ({
    keyword: row.keyword,
    volume: row.search_volume ?? null,
    cpc: row.cpc ?? null,
    competition: row.competition ?? null,
  }));

  if (suggestions.length > 0) {
    await supabaseAdmin
      .from("keyword_suggestions")
      .upsert(
        suggestions.map((row) => ({
          user_id: userId,
          domain,
          seed_keyword: seedLower,
          keyword: row.keyword,
          volume: row.volume,
          cpc: row.cpc,
          competition: row.competition,
        })),
        { onConflict: "user_id,domain,seed_keyword,keyword", ignoreDuplicates: false }
      );
  }

  logApiCost({ userId, operation: "keyword_ideas", units: Math.max(1, suggestions.length) });
  return { suggestions, cached: false };
}

function buildSummary(rows: KeywordIntelligenceRow[], quickWins: KeywordIntelligenceRow[]) {
  const ranked = [...rows]
    .filter((row) => typeof row.opportunityScore === "number")
    .sort((left, right) => (right.opportunityScore ?? -1) - (left.opportunityScore ?? -1));
  const best = ranked[0];

  return {
    totalKeywords: rows.length,
    topOpportunityScore: best?.opportunityScore ?? null,
    bestKeyword: best?.keyword ?? null,
    bestKeywordDifficulty: best?.difficultyScore ?? null,
    bestKeywordDifficultyLabel: best?.difficultyLabel ?? "Difficulty unavailable",
    bestKeywordOpportunityScore: best?.opportunityScore ?? null,
    bestKeywordTrafficLow: best?.estimatedTrafficLow ?? null,
    bestKeywordTrafficHigh: best?.estimatedTrafficHigh ?? null,
    bestKeywordRecommendedContentType: best?.recommendedContentType ?? null,
    lowCompetitionCount: rows.filter((row) => typeof row.difficultyScore === "number" && row.difficultyScore < 40).length,
    quickWinsCount: quickWins.length,
  };
}

async function persistResearchRun(params: {
  runId: string;
  seed: string;
  country: string;
  rows: KeywordIntelligenceRow[];
  clusters: KeywordCluster[];
  }): Promise<void> {
  try {
    const generatedAt = new Date().toISOString();
    await supabaseAdmin.from("keyword_research_runs").upsert({
      id: params.runId,
      seed_keyword: normalizeSeed(params.seed),
      country: params.country,
      language_code: LANGUAGE_CODE,
      status: "completed",
      generated_at: generatedAt,
    });

    await supabaseAdmin.from("keyword_intelligence").delete().eq("run_id", params.runId);
    await supabaseAdmin.from("keyword_clusters").delete().eq("run_id", params.runId);

    if (params.rows.length > 0) {
      await supabaseAdmin.from("keyword_intelligence").insert(
        params.rows.map((row) => ({
          run_id: params.runId,
          keyword: row.keyword,
          search_volume: row.searchVolume,
          cpc: row.cpc,
          ads_competition: row.adsCompetition,
          search_results_count: row.searchResultsCount,
          serp_features_count: row.serpFeaturesCount,
          serp_features: row.serpFeatures,
          avg_domain_authority_top10: row.avgDomainAuthorityTop10,
          avg_backlinks_top10: row.avgBacklinksTop10,
          difficulty_score: row.difficultyScore,
          difficulty_label: row.difficultyLabel,
          difficulty_status: row.difficultyStatus,
          intent: row.intent,
          recommended_content_type: row.recommendedContentType,
          estimated_traffic_low: row.estimatedTrafficLow,
          estimated_traffic_high: row.estimatedTrafficHigh,
          opportunity_score: row.opportunityScore,
          opportunity_rating: row.opportunityRating,
          opportunity_status: row.opportunityStatus,
          cluster_id: row.clusterId,
          cluster_name: row.clusterName,
          top_opportunity_in_cluster: row.topOpportunityInCluster,
          serp_pressure: row.serpPressure,
        }))
      );
    }

    if (params.clusters.length > 0) {
      await supabaseAdmin.from("keyword_clusters").insert(
        params.clusters.map((cluster) => ({
          run_id: params.runId,
          cluster_id: cluster.clusterId,
          cluster_name: cluster.clusterName,
          total_search_volume: cluster.totalSearchVolume,
          average_difficulty: cluster.averageDifficulty,
          top_keyword: cluster.topKeyword,
          top_opportunity_score: cluster.topOpportunityScore,
        }))
      );
    }
  } catch (error) {
    // Persistence is best-effort so the feature still works before migrations land.
    console.warn("[keyword-intelligence] Failed to persist shared cache:", error);
  }
}

async function getCachedPayload(seed: string, country: string): Promise<KeywordResearchPayload | null> {
  const runId = buildRunId(seed, country);

  try {
    const { data: run } = await supabaseAdmin
      .from("keyword_research_runs")
      .select("id, seed_keyword, country, generated_at, status")
      .eq("id", runId)
      .maybeSingle();

    if (!run?.generated_at || !isFresh(run.generated_at)) return null;

    const { data: keywords } = await supabaseAdmin
      .from("keyword_intelligence")
      .select("*")
      .eq("run_id", runId)
      .order("opportunity_score", { ascending: false, nullsFirst: false });

    const { data: clusters } = await supabaseAdmin
      .from("keyword_clusters")
      .select("*")
      .eq("run_id", runId)
      .order("total_search_volume", { ascending: false });

    if (!keywords?.length) return null;

    const rows: KeywordIntelligenceRow[] = keywords.map((row) => ({
      keyword: row.keyword,
      searchVolume: row.search_volume,
      cpc: row.cpc,
      adsCompetition: row.ads_competition,
      searchResultsCount: row.search_results_count,
      serpFeaturesCount: row.serp_features_count ?? 0,
      serpFeatures: Array.isArray(row.serp_features) ? row.serp_features : [],
      avgDomainAuthorityTop10: row.avg_domain_authority_top10,
      avgBacklinksTop10: row.avg_backlinks_top10,
      difficultyScore: row.difficulty_score,
      difficultyLabel: row.difficulty_label,
      difficultyStatus: row.difficulty_status,
      intent: row.intent,
      recommendedContentType: row.recommended_content_type,
      estimatedTrafficLow: row.estimated_traffic_low,
      estimatedTrafficHigh: row.estimated_traffic_high,
      opportunityScore: row.opportunity_score,
      opportunityRating: row.opportunity_rating,
      opportunityStatus: row.opportunity_status,
      clusterId: row.cluster_id,
      clusterName: row.cluster_name,
      topOpportunityInCluster: Boolean(row.top_opportunity_in_cluster),
      serpPressure: row.serp_pressure ?? "Low",
    }));
    const clusterRows: KeywordCluster[] = (clusters ?? []).map((row) => ({
      clusterId: row.cluster_id,
      clusterName: row.cluster_name,
      totalSearchVolume: row.total_search_volume ?? 0,
      averageDifficulty: row.average_difficulty,
      topKeyword: row.top_keyword,
      topOpportunityScore: row.top_opportunity_score,
      keywords: rows.filter((item) => item.clusterId === row.cluster_id).map((item) => item.keyword),
    }));
    const quickWins = rows.filter((row) => (row.searchVolume ?? 0) > 50 && (row.difficultyScore ?? 999) < 40 && (row.opportunityScore ?? -1) > 70);

    return {
      run: {
        id: run.id,
        seed: run.seed_keyword,
        country: run.country,
        cached: true,
        generatedAt: run.generated_at,
        status: "completed",
      },
      summary: buildSummary(rows, quickWins),
      quickWins,
      clusters: clusterRows,
      keywords: rows,
      suggestions: rows,
      cached: true,
    };
  } catch {
    return null;
  }
}

export async function buildKeywordResearchPayload(params: {
  userId: string;
  domain: string;
  seed: string;
  country: string;
  forceRefresh?: boolean;
}): Promise<KeywordResearchPayload> {
  const normalizedDomain = normalizeDomain(params.domain);
  const normalizedSeed = normalizeSeed(params.seed);
  const runId = buildRunId(normalizedSeed, params.country);

  if (!params.forceRefresh) {
    const cached = await getCachedPayload(normalizedSeed, params.country);
    if (cached) return cached;
  }

  const { suggestions, cached: rawCached } = await getRawSuggestions({
    userId: params.userId,
    domain: normalizedDomain,
    seed: normalizedSeed,
    country: params.country,
  });

  const authorityCache = new Map<string, Promise<{ authority: number | null; backlinks: number | null }>>();
  const getAuthoritySignal = (domain: string) => {
    if (!authorityCache.has(domain)) {
      authorityCache.set(domain, getSharedAuthoritySignal(domain));
    }
    return authorityCache.get(domain)!;
  };

  const locationCode = getLocationCode(params.country);
  const enriched = await Promise.all(
    suggestions.map(async (suggestion) => {
      const difficulty = await fetchKeywordDifficultySignals({
        keyword: suggestion.keyword,
        country: params.country,
        languageCode: LANGUAGE_CODE,
        locationCode,
        getAuthoritySignal,
      });
      const adsCompetitionScore = normalizeAdsCompetitionScore(suggestion.competition);
      const adsCompetition = normalizeAdsCompetitionValue(suggestion.competition);
      const difficultyScore =
        difficulty.difficultyScore ??
        estimateFallbackDifficulty({
          searchResultsCount: difficulty.searchResultsCount,
          serpFeaturesCount: difficulty.serpFeaturesCount,
          adsCompetitionScore,
        });
      const difficultyStatus: DifficultyStatus =
        difficultyScore === null ? "unavailable" : "available";
      const difficultyLabel: DifficultyLabel = classifyDifficultyLabel(difficultyScore);

      const intent = classifyKeywordIntent(suggestion.keyword);
      const recommendedContentType = recommendContentType(suggestion.keyword, intent);
      const opportunity = computeOpportunityScore({
        volume: suggestion.volume,
        cpc: suggestion.cpc,
        difficultyScore,
      });
      const trafficPotential = estimateTrafficPotential({
        volume: suggestion.volume,
        difficultyScore,
        contentType: recommendedContentType,
      });

      return {
        keyword: suggestion.keyword,
        searchVolume: suggestion.volume,
        cpc: suggestion.cpc,
        adsCompetition,
        searchResultsCount: difficulty.searchResultsCount,
        serpFeaturesCount: difficulty.serpFeaturesCount,
        serpFeatures: difficulty.serpFeatures,
        avgDomainAuthorityTop10: difficulty.avgDomainAuthorityTop10,
        avgBacklinksTop10: difficulty.avgBacklinksTop10,
        difficultyScore,
        difficultyLabel,
        difficultyStatus,
        intent,
        recommendedContentType,
        estimatedTrafficLow: trafficPotential.low,
        estimatedTrafficHigh: trafficPotential.high,
        opportunityScore: opportunity.opportunityScore,
        opportunityRating: opportunity.opportunityRating,
        opportunityStatus: opportunity.opportunityStatus,
        clusterId: null,
        clusterName: null,
        topOpportunityInCluster: false,
        serpPressure: computeSerpPressure(difficulty.serpFeaturesCount),
      } satisfies KeywordIntelligenceRow;
    })
  );

  const { clusters, keywordToCluster } = clusterKeywords(
    enriched.map((row) => ({
      keyword: row.keyword,
      volume: row.searchVolume,
      difficultyScore: row.difficultyScore,
      opportunityScore: row.opportunityScore,
    }))
  );

  const topKeywordsByCluster = new Map<string, string>(
    clusters.map((cluster) => [cluster.clusterId, cluster.topKeyword])
  );

  const rows = enriched
    .map((row) => {
      const cluster = keywordToCluster.get(row.keyword);
      return {
        ...row,
        clusterId: cluster?.clusterId ?? null,
        clusterName: cluster?.clusterName ?? null,
        topOpportunityInCluster: cluster ? topKeywordsByCluster.get(cluster.clusterId) === row.keyword : false,
      };
    })
    .sort((left, right) => (right.opportunityScore ?? -1) - (left.opportunityScore ?? -1));

  const quickWins = rows.filter((row) => (row.searchVolume ?? 0) > 50 && (row.difficultyScore ?? 999) < 40 && (row.opportunityScore ?? -1) > 70);

  logApiCost({ userId: params.userId, operation: "serp_query", units: suggestions.length });
  logApiCost({ userId: params.userId, operation: "backlinks", units: authorityCache.size });

  await persistResearchRun({
    runId,
    seed: normalizedSeed,
    country: params.country,
    rows,
    clusters,
  });

  return {
    run: {
      id: runId,
      seed: normalizedSeed,
      country: params.country,
      cached: rawCached,
      generatedAt: new Date().toISOString(),
      status: "completed",
    },
    summary: buildSummary(rows, quickWins),
    quickWins,
    clusters,
    keywords: rows,
    suggestions: rows,
    cached: false,
  };
}
