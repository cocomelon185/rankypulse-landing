import { createHash } from "node:crypto";
import { supabaseAdmin } from "../supabase";

export const KEYWORD_RESEARCH_TTL_DAYS = 30;
export const KEYWORD_DIFFICULTY_TTL_DAYS = 21;
export const SERP_SNAPSHOT_TTL_DAYS = 10;

export type KeywordResearchMode = "preview" | "expanded";

export type CachedKeywordSuggestion = {
  keyword: string;
  volume: number | null;
  cpc: number | null;
  competition: number | null;
  intent: string | null;
  clusterName: string | null;
  preOpportunityScore: number;
};

export type KeywordResearchCachePayload = {
  suggestions: CachedKeywordSuggestion[];
  totalAvailable: number;
  sourceEndpoint: string;
  generatedSummary?: {
    avgVolume: number;
    avgCpc: number;
  };
};

export type KeywordResearchCacheRecord = {
  id: string;
  cacheKey: string;
  domain: string;
  seedKeyword: string;
  countryCode: string;
  languageCode: string;
  mode: KeywordResearchMode;
  payload: KeywordResearchCachePayload;
  keywordCount: number;
  containsDifficulty: boolean;
  estimatedCost: number;
  sourceEndpoint: string | null;
  fetchedAt: string;
  expiresAt: string;
};

export type KeywordMetricCacheRecord = {
  keyword: string;
  countryCode: string;
  languageCode: string;
  volume: number | null;
  cpc: number | null;
  competition: number | null;
  difficulty: number | null;
  difficultyLabel: string | null;
  difficultyStatus: "pending" | "available" | "unavailable";
  intent: string;
  searchResultsCount: number | null;
  serpSnapshotHash: string | null;
  serpFeatures: string[];
  serpFeaturesCount: number;
  avgDomainAuthorityTop10: number | null;
  avgBacklinksTop10: number | null;
  sourceEndpoint: string | null;
  estimatedCost: number;
  fetchedAt: string;
  expiresAt: string;
};

function toIso(date: Date): string {
  return date.toISOString();
}

function plusDays(days: number): string {
  return toIso(new Date(Date.now() + days * 24 * 60 * 60 * 1000));
}

export function normalizeKeywordSeed(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

export function normalizeKeyword(value: string): string {
  return normalizeKeywordSeed(value);
}

export function normalizeDomain(value: string): string {
  return value
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .toLowerCase()
    .trim();
}

export function buildKeywordResearchCacheKey(input: {
  domain: string;
  seedKeyword: string;
  countryCode: string;
  languageCode?: string;
  mode?: KeywordResearchMode;
}): string {
  const normalized = [
    normalizeDomain(input.domain),
    normalizeKeywordSeed(input.seedKeyword),
    (input.countryCode || "US").toUpperCase(),
    (input.languageCode || "en").toLowerCase(),
    input.mode || "preview",
  ].join("|");
  return createHash("sha256").update(normalized).digest("hex");
}

export function buildKeywordMetricKey(input: {
  keyword: string;
  countryCode: string;
  languageCode?: string;
}): string {
  return [
    normalizeKeyword(input.keyword),
    (input.countryCode || "US").toUpperCase(),
    (input.languageCode || "en").toLowerCase(),
  ].join("|");
}

function isFresh(expiresAt: string): boolean {
  const expires = new Date(expiresAt).getTime();
  return Number.isFinite(expires) && expires > Date.now();
}

export async function getKeywordResearchCache(cacheKey: string): Promise<KeywordResearchCacheRecord | null> {
  const { data, error } = await supabaseAdmin
    .from("keyword_research_cache")
    .select("*")
    .eq("cache_key", cacheKey)
    .maybeSingle();

  if (error || !data || !isFresh(data.expires_at)) return null;

  return {
    id: data.id,
    cacheKey: data.cache_key,
    domain: data.domain,
    seedKeyword: data.seed_keyword,
    countryCode: data.country_code,
    languageCode: data.language_code,
    mode: data.mode,
    payload: data.payload_json as KeywordResearchCachePayload,
    keywordCount: data.keyword_count ?? 0,
    containsDifficulty: Boolean(data.contains_difficulty),
    estimatedCost: Number(data.estimated_cost ?? 0),
    sourceEndpoint: data.source_endpoint,
    fetchedAt: data.fetched_at,
    expiresAt: data.expires_at,
  };
}

export async function upsertKeywordResearchCache(input: {
  cacheKey: string;
  domain: string;
  seedKeyword: string;
  countryCode: string;
  languageCode?: string;
  mode?: KeywordResearchMode;
  payload: KeywordResearchCachePayload;
  keywordCount: number;
  containsDifficulty?: boolean;
  estimatedCost?: number;
  sourceEndpoint?: string | null;
  ttlDays?: number;
}): Promise<void> {
  await supabaseAdmin.from("keyword_research_cache").upsert({
    cache_key: input.cacheKey,
    domain: normalizeDomain(input.domain),
    seed_keyword: normalizeKeywordSeed(input.seedKeyword),
    country_code: input.countryCode.toUpperCase(),
    language_code: (input.languageCode || "en").toLowerCase(),
    mode: input.mode || "preview",
    payload_json: input.payload,
    keyword_count: input.keywordCount,
    contains_difficulty: Boolean(input.containsDifficulty),
    estimated_cost: Number(input.estimatedCost ?? 0),
    source_endpoint: input.sourceEndpoint ?? null,
    fetched_at: toIso(new Date()),
    expires_at: plusDays(input.ttlDays ?? KEYWORD_RESEARCH_TTL_DAYS),
    updated_at: toIso(new Date()),
  }, { onConflict: "cache_key" });
}

export async function getKeywordMetricsCache(input: {
  keywords: string[];
  countryCode: string;
  languageCode?: string;
}): Promise<Map<string, KeywordMetricCacheRecord>> {
  const normalizedKeywords = input.keywords.map(normalizeKeyword);
  if (normalizedKeywords.length === 0) return new Map();

  const { data, error } = await supabaseAdmin
    .from("keyword_metrics_cache")
    .select("*")
    .in("keyword", normalizedKeywords)
    .eq("country_code", input.countryCode.toUpperCase())
    .eq("language_code", (input.languageCode || "en").toLowerCase());

  if (error || !data) return new Map();

  const map = new Map<string, KeywordMetricCacheRecord>();
  for (const row of data) {
    if (!isFresh(row.expires_at)) continue;
    map.set(normalizeKeyword(row.keyword), {
      keyword: row.keyword,
      countryCode: row.country_code,
      languageCode: row.language_code,
      volume: row.volume,
      cpc: row.cpc,
      competition: row.competition,
      difficulty: row.difficulty,
      difficultyLabel: row.difficulty_label,
      difficultyStatus: row.difficulty_status,
      intent: row.intent,
      searchResultsCount: row.search_results_count,
      serpSnapshotHash: row.serp_snapshot_hash,
      serpFeatures: Array.isArray(row.serp_features) ? row.serp_features : [],
      serpFeaturesCount: row.serp_features_count ?? 0,
      avgDomainAuthorityTop10: row.avg_domain_authority_top10,
      avgBacklinksTop10: row.avg_backlinks_top10,
      sourceEndpoint: row.source_endpoint,
      estimatedCost: Number(row.estimated_cost ?? 0),
      fetchedAt: row.fetched_at,
      expiresAt: row.expires_at,
    });
  }
  return map;
}

export async function upsertKeywordMetricsCache(rows: Array<{
  keyword: string;
  countryCode: string;
  languageCode?: string;
  volume?: number | null;
  cpc?: number | null;
  competition?: number | null;
  difficulty?: number | null;
  difficultyLabel?: string | null;
  difficultyStatus: "pending" | "available" | "unavailable";
  intent?: string;
  searchResultsCount?: number | null;
  serpSnapshotHash?: string | null;
  serpFeatures?: string[];
  serpFeaturesCount?: number;
  avgDomainAuthorityTop10?: number | null;
  avgBacklinksTop10?: number | null;
  sourceEndpoint?: string | null;
  estimatedCost?: number;
  ttlDays?: number;
}>): Promise<void> {
  if (rows.length === 0) return;
  const now = toIso(new Date());

  await supabaseAdmin.from("keyword_metrics_cache").upsert(
    rows.map((row) => ({
      keyword: normalizeKeyword(row.keyword),
      country_code: row.countryCode.toUpperCase(),
      language_code: (row.languageCode || "en").toLowerCase(),
      volume: row.volume ?? null,
      cpc: row.cpc ?? null,
      competition: row.competition ?? null,
      difficulty: row.difficulty ?? null,
      difficulty_label: row.difficultyLabel ?? null,
      difficulty_status: row.difficultyStatus,
      intent: row.intent ?? "unknown",
      search_results_count: row.searchResultsCount ?? null,
      serp_snapshot_hash: row.serpSnapshotHash ?? null,
      serp_features: row.serpFeatures ?? [],
      serp_features_count: row.serpFeaturesCount ?? 0,
      avg_domain_authority_top10: row.avgDomainAuthorityTop10 ?? null,
      avg_backlinks_top10: row.avgBacklinksTop10 ?? null,
      source_endpoint: row.sourceEndpoint ?? null,
      estimated_cost: Number(row.estimatedCost ?? 0),
      fetched_at: now,
      expires_at: plusDays(row.ttlDays ?? KEYWORD_DIFFICULTY_TTL_DAYS),
      updated_at: now,
    })),
    { onConflict: "keyword,country_code,language_code" }
  );
}

export async function markKeywordMetricsPending(input: {
  keywords: string[];
  countryCode: string;
  languageCode?: string;
  sourceEndpoint?: string | null;
}): Promise<void> {
  if (input.keywords.length === 0) return;
  await upsertKeywordMetricsCache(
    input.keywords.map((keyword) => ({
      keyword,
      countryCode: input.countryCode,
      languageCode: input.languageCode,
      difficultyStatus: "pending" as const,
      sourceEndpoint: input.sourceEndpoint ?? null,
      ttlDays: SERP_SNAPSHOT_TTL_DAYS,
    }))
  );
}
