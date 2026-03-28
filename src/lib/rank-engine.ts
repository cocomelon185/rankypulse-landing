/**
 * rank-engine.ts — Phase 5 Rank Intelligence
 *
 * All DataForSEO calls, trend math, and visibility computation live here.
 * Requires env vars: DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD
 */

import { supabaseAdmin } from "@/lib/supabase";
import {
  fetchDataForSeoJson,
} from "@/lib/dataforseo";

// ── Country → DataForSEO location_code map ───────────────────────────────────
const LOCATION_CODES: Record<string, number> = {
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

function getLocationCode(country: string): number {
  return LOCATION_CODES[country.toUpperCase()] ?? 2840; // default US
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface RankKeyword {
  id: string;
  user_id: string;
  domain: string;
  keyword: string;
  target_url: string | null;
  country: string;
  device: "desktop" | "mobile";
  volume: number | null;
  cpc: number | null;
  created_at: string;
  // Computed from rank_history
  position: number | null;
  change: number | null;
  ranked_url: string | null;
  checked_at: string | null;
}

export interface KeywordTrend {
  current: number | null;
  previous: number | null;
  change: number | null;
}

export interface WinnersLosers {
  winners: Array<{ keyword: string; change: number; position: number }>;
  losers: Array<{ keyword: string; change: number; position: number }>;
}

// ── SERP: fetch ranking position ─────────────────────────────────────────────
export async function fetchRanking(params: {
  keyword: string;
  domain: string;
  device: "desktop" | "mobile";
  country: string;
}): Promise<{ position: number | null; ranked_url: string | null }> {
  const { keyword, domain, device, country } = params;

  const body = [
    {
      keyword,
      language_code: "en",
      location_code: getLocationCode(country),
      device,
      depth: 100,
    },
  ];

  const json = await fetchDataForSeoJson<{
    tasks?: Array<{
      result?: Array<{
        items?: Array<{
          type: string;
          rank_absolute: number;
          url: string;
          domain: string;
        }>;
      }>;
    }>;
  }>({
    feature: "rankings",
    url: "https://api.dataforseo.com/v3/serp/google/organic/live/regular",
    method: "POST",
    body,
  });
  const items: Array<{
    type: string;
    rank_absolute: number;
    url: string;
    domain: string;
  }> = json?.tasks?.[0]?.result?.[0]?.items ?? [];

  // Normalize domain for comparison (strip www., protocol)
  const cleanDomain = domain
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .toLowerCase();

  const match = items.find((item) => {
    if (item.type !== "organic") return false;
    const itemDomain = (item.domain ?? item.url ?? "")
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .toLowerCase();
    return itemDomain === cleanDomain;
  });

  return {
    position: match ? match.rank_absolute : null,
    ranked_url: match ? match.url : null,
  };
}

// ── Keywords API: fetch search volume in batch ────────────────────────────────
export async function fetchSearchVolumes(params: {
  keywords: string[];
  country: string;
}): Promise<Record<string, { volume: number | null; cpc: number | null }>> {
  const { keywords, country } = params;

  const body = [
    {
      keywords,
      language_code: "en",
      location_code: getLocationCode(country),
    },
  ];

  const json = await fetchDataForSeoJson<{
    tasks?: Array<{
      result?: Array<{
        keyword: string;
        search_volume: number | null;
        cpc: number | null;
      }>;
    }>;
  }>({
    feature: "keywords",
    url: "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",
    method: "POST",
    body,
  });
  const results: Array<{
    keyword: string;
    search_volume: number | null;
    cpc: number | null;
  }> = json?.tasks?.[0]?.result ?? [];

  const map: Record<string, { volume: number | null; cpc: number | null }> = {};
  for (const r of results) {
    map[r.keyword] = { volume: r.search_volume ?? null, cpc: r.cpc ?? null };
  }
  return map;
}

// ── Visibility score computation ─────────────────────────────────────────────
/**
 * Weighted visibility formula:
 *   raw = Σ (101 - position) * ln(volume + 1)
 *   normalized to 0–100 against theoretical max (all at #1 with max volume)
 */
export function computeVisibilityScore(
  rankings: Array<{ position: number; volume: number | null }>
): number {
  if (rankings.length === 0) return 0;

  const maxVolume = Math.max(...rankings.map((r) => r.volume ?? 0), 1);
  const maxPerKeyword = 100 * Math.log(maxVolume + 1); // position 1, max volume

  let raw = 0;
  for (const r of rankings) {
    raw += (101 - r.position) * Math.log((r.volume ?? 0) + 1);
  }

  const theoretical = rankings.length * maxPerKeyword;
  if (theoretical === 0) return 0;

  return Math.min(100, Math.round((raw / theoretical) * 100 * 10) / 10);
}

// ── Trend: current vs previous position ─────────────────────────────────────
export async function getKeywordTrend(keywordId: string): Promise<KeywordTrend> {
  const { data } = await supabaseAdmin
    .from("rank_history")
    .select("position, checked_at")
    .eq("keyword_id", keywordId)
    .order("checked_at", { ascending: false })
    .limit(2);

  if (!data || data.length === 0) {
    return { current: null, previous: null, change: null };
  }

  const current = data[0].position ?? null;
  const previous = data[1]?.position ?? null;

  let change: number | null = null;
  if (current !== null && previous !== null) {
    // Positive change = improved (lower position number is better)
    change = previous - current;
  }

  return { current, previous, change };
}

// ── Winners / Losers ─────────────────────────────────────────────────────────
export async function getWinnersLosers(params: {
  userId: string;
  domain: string;
}): Promise<WinnersLosers> {
  const { userId, domain } = params;

  // Fetch all keywords for this user+domain
  const { data: keywords } = await supabaseAdmin
    .from("rank_keywords")
    .select("id, keyword")
    .eq("user_id", userId)
    .eq("domain", domain);

  if (!keywords || keywords.length === 0) {
    return { winners: [], losers: [] };
  }

  const keywordIds = keywords.map((k) => k.id);
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Fetch last 7 days and previous 7 days history
  const { data: recentHistory } = await supabaseAdmin
    .from("rank_history")
    .select("keyword_id, position, checked_at")
    .in("keyword_id", keywordIds)
    .gte("checked_at", sevenDaysAgo.toISOString())
    .order("checked_at", { ascending: false });

  const { data: prevHistory } = await supabaseAdmin
    .from("rank_history")
    .select("keyword_id, position, checked_at")
    .in("keyword_id", keywordIds)
    .gte("checked_at", fourteenDaysAgo.toISOString())
    .lt("checked_at", sevenDaysAgo.toISOString())
    .order("checked_at", { ascending: false });

  // Best position in each period per keyword
  const recentBest = new Map<string, number>();
  for (const h of recentHistory ?? []) {
    if (h.position === null) continue;
    const cur = recentBest.get(h.keyword_id);
    if (cur === undefined || h.position < cur) recentBest.set(h.keyword_id, h.position);
  }

  const prevBest = new Map<string, number>();
  for (const h of prevHistory ?? []) {
    if (h.position === null) continue;
    const cur = prevBest.get(h.keyword_id);
    if (cur === undefined || h.position < cur) prevBest.set(h.keyword_id, h.position);
  }

  const kwMap = new Map(keywords.map((k) => [k.id, k.keyword]));

  type Entry = { keyword: string; change: number; position: number };
  const winners: Entry[] = [];
  const losers: Entry[] = [];

  for (const [kwId, currPos] of recentBest) {
    const prevPos = prevBest.get(kwId);
    if (prevPos === undefined) continue;
    const change = prevPos - currPos; // positive = improved
    if (change >= 3) {
      winners.push({ keyword: kwMap.get(kwId) ?? "", change, position: currPos });
    } else if (change <= -3) {
      losers.push({ keyword: kwMap.get(kwId) ?? "", change, position: currPos });
    }
  }

  winners.sort((a, b) => b.change - a.change);
  losers.sort((a, b) => a.change - b.change);

  return { winners: winners.slice(0, 5), losers: losers.slice(0, 5) };
}

// ── SERP batch: fetch rankings for up to 50 keywords in one API call ──────────
/**
 * Fetches SERP rankings for multiple keywords in a single DataForSEO request.
 * DataForSEO accepts an array of tasks; we map results back by index.
 * Returns a map of keywordId → { position, ranked_url }.
 */
export async function fetchRankingsBatch(params: {
  items: Array<{ keywordId: string; keyword: string; device: string; country: string }>;
  domain: string;
}): Promise<Record<string, { position: number | null; ranked_url: string | null }>> {
  const { items, domain } = params;
  if (items.length === 0) return {};

  const body = items.map((item) => ({
    keyword: item.keyword,
    language_code: "en",
    location_code: getLocationCode(item.country),
    device: item.device,
    depth: 100,
  }));

  const json = await fetchDataForSeoJson<{
    tasks?: Array<{
      result?: Array<{
        items?: Array<{ type: string; rank_absolute: number; url: string; domain: string }>;
      }>;
    }>;
  }>({
    feature: "rankings",
    url: "https://api.dataforseo.com/v3/serp/google/organic/live/regular",
    method: "POST",
    body,
  });
  const cleanDomain = domain
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .toLowerCase();

  const results: Record<string, { position: number | null; ranked_url: string | null }> = {};

  (
    (json.tasks ?? []) as Array<{
      result?: Array<{
        items?: Array<{ type: string; rank_absolute: number; url: string; domain: string }>;
      }>;
    }>
  ).forEach((task, idx: number) => {
    const item = items[idx];
    if (!item) return;
    const organicItems: Array<{ type: string; rank_absolute: number; url: string; domain: string }> =
      task?.result?.[0]?.items ?? [];
    const match = organicItems.find((r) => {
      if (r.type !== "organic") return false;
      const d = (r.domain ?? r.url ?? "")
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0]
        .toLowerCase();
      return d === cleanDomain;
    });
    results[item.keywordId] = {
      position: match ? match.rank_absolute : null,
      ranked_url: match ? match.url : null,
    };
  });

  return results;
}

// ── Daily refresh: fetch all keywords for a domain, store history ─────────────
/**
 * Refreshes rankings for all keywords of a user+domain pair.
 * Uses batch SERP calls (50 keywords per request) instead of sequential calls.
 * Bulk-inserts all rank_history rows in one DB call.
 * ~90% fewer API calls vs the old sequential approach.
 */
export async function refreshDomainRankings(params: {
  userId: string;
  domain: string;
}): Promise<{ processed: number; errors: number }> {
  const { userId, domain } = params;

  const { data: keywords, error } = await supabaseAdmin
    .from("rank_keywords")
    .select("id, keyword, device, country, volume")
    .eq("user_id", userId)
    .eq("domain", domain);

  if (error || !keywords || keywords.length === 0) return { processed: 0, errors: error ? 1 : 0 };

  const BATCH_SIZE = 50;
  const allRankings: Record<string, { position: number | null; ranked_url: string | null }> = {};
  let errors = 0;

  // Process in batches of 50 — each batch = 1 DataForSEO API call
  for (let i = 0; i < keywords.length; i += BATCH_SIZE) {
    const batch = keywords.slice(i, i + BATCH_SIZE);
    try {
      const batchResults = await fetchRankingsBatch({
        items: batch.map((k) => ({
          keywordId: k.id,
          keyword: k.keyword,
          device: k.device,
          country: k.country,
        })),
        domain,
      });
      Object.assign(allRankings, batchResults);
    } catch {
      errors += batch.length;
    }
    // 500ms pause between batches (not between individual keywords)
    if (i + BATCH_SIZE < keywords.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // Bulk insert all rank_history rows in a single DB call
  const checkedAt = new Date().toISOString();
  const historyRows = keywords
    .filter((kw) => allRankings[kw.id] !== undefined)
    .map((kw) => ({
      keyword_id: kw.id,
      position: allRankings[kw.id]?.position ?? null,
      ranked_url: allRankings[kw.id]?.ranked_url ?? null,
      checked_at: checkedAt,
      search_engine: "google",
    }));

  if (historyRows.length > 0) {
    await supabaseAdmin.from("rank_history").insert(historyRows);
  }

  const processed = historyRows.length;

  // Compute and store visibility snapshot for today
  if (processed > 0) {
    try {
      const rankingRows = keywords
        .filter((kw) => allRankings[kw.id]?.position !== null)
        .map((kw) => ({
          position: allRankings[kw.id]!.position!,
          volume: kw.volume ?? null,
        }));

      const score = computeVisibilityScore(rankingRows);
      const today = new Date().toISOString().split("T")[0];

      await supabaseAdmin.from("visibility_snapshots").upsert(
        { user_id: userId, domain, score, snapshot_date: today },
        { onConflict: "user_id,domain,snapshot_date" }
      );
    } catch {
      // Non-critical — visibility snapshot failure doesn't fail the refresh
    }
  }

  return { processed, errors };
}
