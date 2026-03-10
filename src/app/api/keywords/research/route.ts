/**
 * /api/keywords/research
 * GET  ?domain=X&seed=Y  → cached suggestions (last 7 days)
 * POST { domain, seed, country? }  → call DataForSEO, cache, return
 *
 * Caches results in keyword_suggestions table for 7 days to avoid repeat billing.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { logApiCost } from "@/lib/cost-engine";

export const dynamic = "force-dynamic";

// ── DataForSEO auth ───────────────────────────────────────────────────────────
function dfsHeaders(): HeadersInit {
  const login = process.env.DATAFORSEO_LOGIN ?? "";
  const password = process.env.DATAFORSEO_PASSWORD ?? "";
  const token = Buffer.from(`${login}:${password}`).toString("base64");
  return {
    Authorization: `Basic ${token}`,
    "Content-Type": "application/json",
  };
}

// Location code map (same as rank-engine)
const LOCATION_CODES: Record<string, number> = {
  US: 2840, GB: 2826, CA: 2124, AU: 2036, IN: 2356,
  DE: 2276, FR: 2250, BR: 2076, MX: 2484, SG: 2702,
};
function getLocationCode(country: string): number {
  return LOCATION_CODES[country.toUpperCase()] ?? 2840;
}

// ── GET: return cached suggestions ───────────────────────────────────────────
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");
  const seed = searchParams.get("seed");

  if (!domain || !seed) {
    return NextResponse.json({ error: "domain and seed required" }, { status: 400 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const seedLower = seed.toLowerCase();

  // Try user-specific cache first
  const { data: userCached } = await supabaseAdmin
    .from("keyword_suggestions")
    .select("keyword, volume, cpc, competition")
    .eq("user_id", userId)
    .eq("domain", domain)
    .eq("seed_keyword", seedLower)
    .gte("created_at", sevenDaysAgo)
    .order("volume", { ascending: false })
    .limit(50);

  if (userCached && userCached.length > 0) {
    return NextResponse.json({ suggestions: userCached, cached: true });
  }

  // Fall back to global cache (any user's results for this seed keyword)
  const { data: globalCached } = await supabaseAdmin
    .from("keyword_suggestions")
    .select("keyword, volume, cpc, competition")
    .eq("seed_keyword", seedLower)
    .gte("created_at", sevenDaysAgo)
    .order("volume", { ascending: false })
    .limit(50);

  return NextResponse.json({ suggestions: globalCached ?? [], cached: true });
}

// ── POST: fetch from DataForSEO, cache, return ────────────────────────────────
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: { domain?: string; seed?: string; country?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { domain, seed, country = "US" } = body;
  if (!domain || !seed) {
    return NextResponse.json({ error: "domain and seed required" }, { status: 400 });
  }

  if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
    return NextResponse.json({ error: "DataForSEO credentials not configured" }, { status: 503 });
  }

  const seedLower = seed.toLowerCase().trim();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // ── Global cache check: reuse any user's results for the same seed keyword ──
  // Keyword volume/CPC data is universal — no need to re-fetch if another user
  // already retrieved it within the last 7 days. This reduces DataForSEO costs ~80%.
  const { data: globalCached } = await supabaseAdmin
    .from("keyword_suggestions")
    .select("keyword, volume, cpc, competition")
    .eq("seed_keyword", seedLower)
    .gte("created_at", sevenDaysAgo)
    .order("volume", { ascending: false })
    .limit(50);

  if (globalCached && globalCached.length > 0) {
    // Copy the cached results for this user so their GET requests are fast too
    const rows = globalCached.map((s) => ({
      user_id: userId,
      domain,
      seed_keyword: seedLower,
      keyword: s.keyword,
      volume: s.volume,
      cpc: s.cpc,
      competition: s.competition,
    }));
    // Fire-and-forget — don't block the response on this write
    supabaseAdmin
      .from("keyword_suggestions")
      .upsert(rows, { onConflict: "user_id,domain,seed_keyword,keyword", ignoreDuplicates: true })
      .then(() => {});

    return NextResponse.json({ suggestions: globalCached, cached: true });
  }

  // Call DataForSEO keywords_for_keywords/live
  const requestBody = [
    {
      keywords: [seedLower],
      language_code: "en",
      location_code: getLocationCode(country),
      limit: 50,
      order_by: ["search_volume,desc"],
    },
  ];

  let suggestions: Array<{ keyword: string; volume: number | null; cpc: number | null; competition: number | null }> = [];

  try {
    const res = await fetch(
      "https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live",
      { method: "POST", headers: dfsHeaders(), body: JSON.stringify(requestBody) }
    );

    if (!res.ok) {
      throw new Error(`DataForSEO error: ${res.status}`);
    }

    const json = await res.json();
    const results: Array<{
      keyword: string;
      search_volume: number | null;
      cpc: number | null;
      competition: number | null;
    }> = json?.tasks?.[0]?.result ?? [];

    suggestions = results.map((r) => ({
      keyword: r.keyword,
      volume: r.search_volume ?? null,
      cpc: r.cpc ?? null,
      competition: r.competition ?? null,
    }));

    // Log cost: 1 unit per result (keywords_for_keywords)
    logApiCost({ userId, operation: "keyword_ideas", units: Math.max(1, suggestions.length) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "DataForSEO call failed" },
      { status: 502 }
    );
  }

  // Cache results in DB (upsert to handle re-runs)
  if (suggestions.length > 0) {
    const rows = suggestions.map((s) => ({
      user_id: userId,
      domain,
      seed_keyword: seedLower,
      keyword: s.keyword,
      volume: s.volume,
      cpc: s.cpc,
      competition: s.competition,
    }));

    await supabaseAdmin
      .from("keyword_suggestions")
      .upsert(rows, { onConflict: "user_id,domain,seed_keyword,keyword", ignoreDuplicates: false });
  }

  return NextResponse.json({ suggestions, cached: false });
}
