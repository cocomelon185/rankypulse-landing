/**
 * /api/competitors
 * GET  ?domain=X&country=US  → latest snapshot (cached 24h)
 * POST { domain, country? }  → fetch from DataForSEO, upsert today's snapshot
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

const LOCATION_CODES: Record<string, number> = {
  US: 2840, GB: 2826, CA: 2124, AU: 2036, IN: 2356,
  DE: 2276, FR: 2250, BR: 2076, MX: 2484, SG: 2702,
};
function getLocationCode(country: string): number {
  return LOCATION_CODES[country.toUpperCase()] ?? 2840;
}

// ── GET: latest cached snapshot ───────────────────────────────────────────────
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

  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabaseAdmin
    .from("competitor_snapshots")
    .select("*")
    .eq("user_id", userId)
    .eq("domain", domain)
    .eq("snapshot_date", today)
    .order("intersections", { ascending: false })
    .limit(10);

  return NextResponse.json({ competitors: data ?? [], cached: (data?.length ?? 0) > 0 });
}

// ── POST: fetch from DataForSEO ────────────────────────────────────────────────
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: { domain?: string; country?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { domain, country = "US" } = body;
  if (!domain) {
    return NextResponse.json({ error: "domain required" }, { status: 400 });
  }

  if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
    return NextResponse.json({ error: "DataForSEO credentials not configured" }, { status: 503 });
  }

  const today = new Date().toISOString().split("T")[0];

  // Check if today's data already exists
  const { data: existing } = await supabaseAdmin
    .from("competitor_snapshots")
    .select("id")
    .eq("user_id", userId)
    .eq("domain", domain)
    .eq("snapshot_date", today)
    .limit(1);

  if (existing && existing.length > 0) {
    return GET(new Request(`${req.url}?domain=${encodeURIComponent(domain)}&country=${country}`));
  }

  // Call DataForSEO competitors_domain/live
  const requestBody = [
    {
      target: domain,
      location_code: getLocationCode(country),
      language_code: "en",
      limit: 10,
      exclude_top_domains: false,
    },
  ];

  try {
    const res = await fetch(
      "https://api.dataforseo.com/v3/dataforseo_labs/google/competitors_domain/live",
      { method: "POST", headers: dfsHeaders(), body: JSON.stringify(requestBody) }
    );

    if (!res.ok) {
      throw new Error(`DataForSEO competitors error: ${res.status}`);
    }

    const json = await res.json();
    const items: Array<{
      domain: string;
      intersections: number;
      se_type: string;
      avg_position: number | null;
      sum_position: number | null;
      full_domain_metrics?: { organic?: { pos_1?: number } };
    }> = json?.tasks?.[0]?.result?.[0]?.items ?? [];

    // Compute overlap percent based on intersection vs our total keywords (estimate)
    const maxIntersections = items.reduce((max, item) => Math.max(max, item.intersections ?? 0), 1);

    const rows = items.map((item) => ({
      user_id: userId,
      domain,
      competitor_domain: item.domain,
      intersections: item.intersections ?? 0,
      competitor_se_type: item.se_type ?? "organic",
      avg_position: item.avg_position ?? null,
      overlap_percent: maxIntersections > 0
        ? Math.round((item.intersections / maxIntersections) * 100 * 100) / 100
        : null,
      snapshot_date: today,
    }));

    if (rows.length > 0) {
      await supabaseAdmin
        .from("competitor_snapshots")
        .upsert(rows, { onConflict: "user_id,domain,competitor_domain,snapshot_date" });
    }

    // Log cost
    logApiCost({ userId, operation: "competitors", units: 1 });

    return NextResponse.json({ competitors: rows, cached: false });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "DataForSEO call failed" },
      { status: 502 }
    );
  }
}
