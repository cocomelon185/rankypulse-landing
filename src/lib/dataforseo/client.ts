import { createHash } from "node:crypto";
import {
  fetchDataForSeoJson,
  DataForSeoRequestError,
} from "../dataforseo";
import {
  buildRequestFingerprint,
  logDataForSeoUsage,
} from "./usage-log";
import { withRequestDedupe } from "./request-dedupe";
import { supabaseAdmin } from "../supabase";

type ClientContext = {
  userId?: string | null;
  requestFingerprint: string;
};

export type KeywordIdeaRow = {
  keyword: string;
  volume: number | null;
  cpc: number | null;
  competition: number | null;
};

export type SerpSnapshot = {
  searchResultsCount: number | null;
  serpFeatures: string[];
  topDomains: string[];
};

export type BacklinkAuthoritySnapshot = {
  authority: number | null;
  backlinks: number | null;
};

const DEFAULT_TIMEOUT_MS = 15000;

const ENDPOINT_COSTS = {
  "keywords/search_live": 0.0015,
  "keywords/difficulty_serp": 0.0020,
  "keywords/domain_authority": 0.0020,
} as const;

function getLocationCode(country: string): number {
  const map: Record<string, number> = {
    US: 2840,
    GB: 2826,
    CA: 2124,
    AU: 2036,
    IN: 2356,
    DE: 2276,
    FR: 2250,
    BR: 2076,
    MX: 2484,
    SG: 2702,
  };
  return map[country.toUpperCase()] ?? 2840;
}

function normalizeNumber(value: number | string | null | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function normalizeCompetition(value: number | string | null | undefined): number | null {
  if (typeof value === "string") {
    const upper = value.trim().toUpperCase();
    if (upper === "LOW") return 0.2;
    if (upper === "MEDIUM") return 0.5;
    if (upper === "HIGH") return 0.8;
  }
  const normalized = normalizeNumber(value);
  if (normalized === null) return null;
  return normalized > 1 ? Math.max(0, Math.min(1, normalized / 100)) : Math.max(0, Math.min(1, normalized));
}

function normalizeDomain(value: string): string {
  return value
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .toLowerCase()
    .trim();
}

function hashSnapshot(input: unknown): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

async function executeRequest<T>(params: {
  endpoint: keyof typeof ENDPOINT_COSTS;
  context: ClientContext;
  run: () => Promise<T>;
  requestUnits?: number;
  metadata?: Record<string, unknown>;
}): Promise<T> {
  const startedAt = Date.now();
  try {
    const data = await params.run();
    await logDataForSeoUsage({
      endpoint: params.endpoint,
      userId: params.context.userId ?? null,
      cacheHit: false,
      requestFingerprint: params.context.requestFingerprint,
      requestUnits: params.requestUnits ?? 1,
      estimatedCost: (params.requestUnits ?? 1) * ENDPOINT_COSTS[params.endpoint],
      statusCode: 200,
      durationMs: Date.now() - startedAt,
      metadata: params.metadata,
    });
    return data;
  } catch (error) {
    await logDataForSeoUsage({
      endpoint: params.endpoint,
      userId: params.context.userId ?? null,
      cacheHit: false,
      requestFingerprint: params.context.requestFingerprint,
      requestUnits: params.requestUnits ?? 1,
      estimatedCost: (params.requestUnits ?? 1) * ENDPOINT_COSTS[params.endpoint],
      statusCode: error instanceof DataForSeoRequestError ? error.httpStatus : 500,
      durationMs: Date.now() - startedAt,
      metadata: {
        ...(params.metadata ?? {}),
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}

export function createDataForSeoClient(context: ClientContext) {
  return {
    async fetchKeywordIdeas(input: {
      seedKeyword: string;
      countryCode: string;
      languageCode?: string;
      limit: number;
    }): Promise<KeywordIdeaRow[]> {
      const requestFingerprint = buildRequestFingerprint([
        "keywords/search_live",
        input.seedKeyword,
        input.countryCode,
        input.languageCode || "en",
        input.limit,
      ]);

      return withRequestDedupe(requestFingerprint, () =>
        executeRequest({
          endpoint: "keywords/search_live",
          context: { ...context, requestFingerprint },
          requestUnits: input.limit,
          metadata: { seedKeyword: input.seedKeyword, countryCode: input.countryCode, limit: input.limit },
          run: () =>
            fetchDataForSeoJson<{
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
                  keywords: [input.seedKeyword],
                  language_code: input.languageCode || "en",
                  location_code: getLocationCode(input.countryCode),
                  limit: input.limit,
                  order_by: ["search_volume,desc"],
                },
              ],
            }).then((payload) =>
              (payload.tasks?.[0]?.result ?? []).map((row) => ({
                keyword: row.keyword,
                volume: normalizeNumber(row.search_volume),
                cpc: normalizeNumber(row.cpc),
                competition: normalizeCompetition(row.competition),
              }))
            ),
        })
      );
    },

    async fetchSerpSnapshot(input: {
      keyword: string;
      countryCode: string;
      languageCode?: string;
      depth?: number;
    }): Promise<SerpSnapshot> {
      const requestFingerprint = buildRequestFingerprint([
        "keywords/difficulty_serp",
        input.keyword,
        input.countryCode,
        input.languageCode || "en",
        input.depth || 10,
      ]);

      return withRequestDedupe(requestFingerprint, () =>
        executeRequest({
          endpoint: "keywords/difficulty_serp",
          context: { ...context, requestFingerprint },
          metadata: { keyword: input.keyword, countryCode: input.countryCode },
          run: () =>
            fetchDataForSeoJson<{
              tasks?: Array<{
                result?: Array<{
                  se_results_count?: number | null;
                  items?: Array<{ type?: string; domain?: string; url?: string }>;
                }>;
              }>;
            }>({
              feature: "rankings",
              url: "https://api.dataforseo.com/v3/serp/google/organic/live/regular",
              method: "POST",
              body: [
                {
                  keyword: input.keyword,
                  language_code: input.languageCode || "en",
                  location_code: getLocationCode(input.countryCode),
                  depth: input.depth || 10,
                  device: "desktop",
                },
              ],
            }).then((payload) => {
              const result = payload.tasks?.[0]?.result?.[0];
              const items = result?.items ?? [];
              const topDomains = [
                ...new Set(
                  items
                    .filter((item) => item.type === "organic")
                    .map((item) => normalizeDomain(item.domain ?? item.url ?? ""))
                    .filter(Boolean)
                    .slice(0, input.depth || 10)
                ),
              ];
              const serpFeatures = [
                ...new Set(
                  items
                    .map((item) => item.type ?? "")
                    .filter((type) => Boolean(type) && type !== "organic")
                ),
              ];
              return {
                searchResultsCount: normalizeNumber(result?.se_results_count),
                serpFeatures,
                topDomains,
              };
            }),
        })
      );
    },

    async fetchBacklinkSummary(input: { domain: string }): Promise<BacklinkAuthoritySnapshot> {
      const normalizedDomain = normalizeDomain(input.domain);
      const requestFingerprint = buildRequestFingerprint([
        "keywords/domain_authority",
        normalizedDomain,
      ]);

      return withRequestDedupe(requestFingerprint, async () => {
        const { data: cached } = await supabaseAdmin
          .from("backlink_snapshots")
          .select("trust_score,total_backlinks,snapshot_date")
          .eq("domain", normalizedDomain)
          .order("snapshot_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (cached) {
          await logDataForSeoUsage({
            endpoint: "keywords/domain_authority",
            userId: context.userId ?? null,
            cacheHit: true,
            requestFingerprint,
            requestUnits: 1,
            estimatedCost: 0,
            statusCode: 200,
            durationMs: 0,
            metadata: { domain: normalizedDomain, source: "backlink_snapshots" },
          });
          return {
            authority: normalizeNumber(cached.trust_score),
            backlinks: normalizeNumber(cached.total_backlinks),
          };
        }

        const snapshot = await executeRequest({
          endpoint: "keywords/domain_authority",
          context: { ...context, requestFingerprint },
          requestUnits: 1,
          metadata: { domain: normalizedDomain },
          run: () =>
            fetchDataForSeoJson<{
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
              body: [{ target: normalizedDomain, include_subdomains: true }],
            }).then((payload) => {
              const result = payload.tasks?.[0]?.result?.[0];
              return {
                authority: normalizeNumber(result?.rank),
                backlinks: normalizeNumber(result?.total_backlinks),
              };
            }),
        });

        await supabaseAdmin.from("backlink_snapshots").upsert({
          user_id: context.userId ?? null,
          domain: normalizedDomain,
          trust_score: snapshot.authority,
          total_backlinks: snapshot.backlinks,
          snapshot_date: new Date().toISOString().slice(0, 10),
        }, { onConflict: "user_id,domain,snapshot_date" });

        return snapshot;
      });
    },

    hashSnapshot,
  };
}

export type DataForSeoClient = ReturnType<typeof createDataForSeoClient>;

export { DEFAULT_TIMEOUT_MS };
