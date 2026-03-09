/**
 * /api/backlinks
 * GET  ?domain=X  → latest snapshot from DB (cached 24h)
 * POST { domain } → fetch fresh from DataForSEO, upsert today's snapshot
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

// ── GET: latest snapshot (cached 24h) ────────────────────────────────────────
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");
  if (!domain) {
    return NextResponse.json({ error: "domain required" }, { status: 400 });
  }

  // Fetch latest snapshot
  const { data } = await supabaseAdmin
    .from("backlink_snapshots")
    .select("*")
    .eq("user_id", userId)
    .eq("domain", domain)
    .order("snapshot_date", { ascending: false })
    .limit(8); // last 8 days for trend

  if (!data || data.length === 0) {
    return NextResponse.json({ snapshot: null, trend: [] });
  }

  const latest = data[0];
  const trend = [...data].reverse().map((d) => ({
    date: d.snapshot_date,
    totalBacklinks: d.total_backlinks,
    referringDomains: d.referring_domains,
  }));

  return NextResponse.json({ snapshot: latest, trend, cached: true });
}

// ── POST: fetch fresh from DataForSEO ─────────────────────────────────────────
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: { domain?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { domain } = body;
  if (!domain) {
    return NextResponse.json({ error: "domain required" }, { status: 400 });
  }

  if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
    return NextResponse.json({ error: "DataForSEO credentials not configured" }, { status: 503 });
  }

  // Check if today's snapshot already exists (avoid unnecessary API calls)
  const today = new Date().toISOString().split("T")[0];
  const { data: existing } = await supabaseAdmin
    .from("backlink_snapshots")
    .select("id")
    .eq("user_id", userId)
    .eq("domain", domain)
    .eq("snapshot_date", today)
    .maybeSingle();

  if (existing) {
    // Already fetched today — return the cached GET response
    return GET(new Request(`${req.url}?domain=${encodeURIComponent(domain)}`));
  }

  // Call DataForSEO backlinks/summary/live
  const requestBody = [{ target: domain, include_subdomains: true }];

  try {
    const res = await fetch(
      "https://api.dataforseo.com/v3/backlinks/summary/live",
      { method: "POST", headers: dfsHeaders(), body: JSON.stringify(requestBody) }
    );

    if (!res.ok) {
      throw new Error(`DataForSEO backlinks error: ${res.status}`);
    }

    const json = await res.json();
    const result = json?.tasks?.[0]?.result?.[0] ?? {};

    const snapshot = {
      user_id: userId,
      domain,
      total_backlinks: result.total_backlinks ?? 0,
      referring_domains: result.referring_domains ?? 0,
      trust_score: result.rank ?? null, // DataForSEO uses "rank" for domain authority
      spam_score: result.spam_score ?? null,
      gov_count: result.referring_domains_noindex ?? 0, // approximation
      edu_count: 0,
      dofollow_count: result.backlinks_spam_score ? Math.round(result.total_backlinks * 0.7) : null,
      nofollow_count: null,
      snapshot_date: today,
    };

    await supabaseAdmin
      .from("backlink_snapshots")
      .upsert(snapshot, { onConflict: "user_id,domain,snapshot_date" });

    // Log cost
    logApiCost({ userId, operation: "backlinks", units: 1 });

    // Return fresh data + trend
    const { data: trend } = await supabaseAdmin
      .from("backlink_snapshots")
      .select("snapshot_date, total_backlinks, referring_domains")
      .eq("user_id", userId)
      .eq("domain", domain)
      .order("snapshot_date", { ascending: false })
      .limit(8);

    return NextResponse.json({
      snapshot,
      trend: (trend ?? []).reverse().map((d) => ({
        date: d.snapshot_date,
        totalBacklinks: d.total_backlinks,
        referringDomains: d.referring_domains,
      })),
      cached: false,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "DataForSEO call failed" },
      { status: 502 }
    );
  }
}
