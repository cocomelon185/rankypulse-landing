/**
 * rank-engine.ts — Phase 5 Rank Intelligence
 *
 * All DataForSEO calls, trend math, and visibility computation live here.
 * Requires env vars: DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD
 */

import { supabaseAdmin } from "@/lib/supabase";

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

// ── DataForSEO auth ──────────────────────────────────────────────────────────
function dfsHeaders(): HeadersInit {
  const login = process.env.DATAFORSEO_LOGIN ?? "";
  const password = process.env.DATAFORSEO_PASSWORD ?? "";
  const token = Buffer.from(`${login}:${password}`).toString("base64");
  return {
    Authorization: `Basic ${token}`,
    "Content-Type": "application/json",
  };
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

  if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
    throw new Error("DataForSEO credentials not configured");
  }

  const body = [
    {
      keyword,
      language_code: "en",
      location_code: getLocationCode(country),
      device,
      depth: 100,
    },
  ];

  const res = await fetch(
    "https://api.dataforseo.com/v3/serp/google/organic/live/regular",
    {
      method: "POST",
      headers: dfsHeaders(),
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    throw new Error(`DataForSEO SERP error: ${res.status}`);
  }

  const json = await res.json();
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

  if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
    throw new Error("DataForSEO credentials not configured");
  }

  const body = [
    {
      keywords,
      language_code: "en",
      location_code: getLocationCode(country),
    },
  ];

  const res = await fetch(
    "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",
    {
      method: "POST",
      headers: dfsHeaders(),
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    throw new Error(`DataForSEO volume error: ${res.status}`);
  }

  const json = await res.json();
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

// ── Daily refresh: fetch all keywords for a domain, store history ─────────────
export async function refreshDomainRankings(params: {
  userId: string;
  domain: string;
}): Promise<{ processed: number; errors: number }> {
  const { userId, domain } = params;

  const { data: keywords, error } = await supabaseAdmin
    .from("rank_keywords")
    .select("id, keyword, device, country")
    .eq("user_id", userId)
    .eq("domain", domain);

  if (error || !keywords) return { processed: 0, errors: 1 };

  let processed = 0;
  let errors = 0;

  for (const kw of keywords) {
    try {
      const { position, ranked_url } = await fetchRanking({
        keyword: kw.keyword,
        domain,
        device: kw.device as "desktop" | "mobile",
        country: kw.country,
      });

      await supabaseAdmin.from("rank_history").insert({
        keyword_id: kw.id,
        position,
        ranked_url,
        checked_at: new Date().toISOString(),
        search_engine: "google",
      });

      processed++;
    } catch {
      errors++;
    }

    // Brief pause between calls to respect DataForSEO rate limits
    await new Promise((r) => setTimeout(r, 300));
  }

  // Compute and store visibility snapshot for today
  if (processed > 0) {
    try {
      // Fetch latest position + volume for each keyword
      const { data: latest } = await supabaseAdmin
        .from("rank_history")
        .select("keyword_id, position")
        .in("keyword_id", keywords.map((k) => k.id))
        .gte(
          "checked_at",
          new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        )
        .order("checked_at", { ascending: false });

      const seen = new Set<string>();
      const rankingRows: Array<{ position: number; volume: number | null }> = [];

      for (const row of latest ?? []) {
        if (seen.has(row.keyword_id) || row.position === null) continue;
        seen.add(row.keyword_id);
        const kw = keywords.find((k) => k.id === row.keyword_id);
        // Volume not stored in rank_history, fetch from rank_keywords
        const { data: kwData } = await supabaseAdmin
          .from("rank_keywords")
          .select("volume")
          .eq("id", row.keyword_id)
          .single();
        rankingRows.push({ position: row.position, volume: kwData?.volume ?? null });
      }

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
