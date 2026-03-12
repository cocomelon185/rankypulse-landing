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
import {
  getDataProviderErrorPayload,
} from "@/lib/data-provider";
import {
  DataForSeoRequestError,
  fetchDataForSeoJson,
} from "@/lib/dataforseo";

export const dynamic = "force-dynamic";

type CompetitorSnapshotRow = {
  user_id: string;
  domain: string;
  competitor_domain: string;
  intersections: number | null;
  competitor_se_type: string | null;
  avg_position: number | null;
  overlap_percent: number | null;
  snapshot_date: string;
};

const LOCATION_CODES: Record<string, number> = {
  US: 2840, GB: 2826, CA: 2124, AU: 2036, IN: 2356,
  DE: 2276, FR: 2250, BR: 2076, MX: 2484, SG: 2702,
};
function getLocationCode(country: string): number {
  return LOCATION_CODES[country.toUpperCase()] ?? 2840;
}

function withUserId(
  rows: CompetitorSnapshotRow[],
  userId: string
): CompetitorSnapshotRow[] {
  return rows.map((row) => ({ ...row, user_id: userId }));
}

async function getCachedCompetitors(params: {
  userId: string;
  domain: string;
  snapshotDate: string;
}): Promise<CompetitorSnapshotRow[]> {
  const { userId, domain, snapshotDate } = params;

  const { data: userScoped } = await supabaseAdmin
    .from("competitor_snapshots")
    .select("*")
    .eq("user_id", userId)
    .eq("domain", domain)
    .eq("snapshot_date", snapshotDate)
    .order("intersections", { ascending: false })
    .limit(10);

  if (userScoped && userScoped.length > 0) {
    return userScoped;
  }

  const { data: shared } = await supabaseAdmin
    .from("competitor_snapshots")
    .select("*")
    .eq("domain", domain)
    .eq("snapshot_date", snapshotDate)
    .order("intersections", { ascending: false })
    .limit(10);

  if (!shared || shared.length === 0) {
    return [];
  }

  const userRows = withUserId(shared, userId);
  await supabaseAdmin
    .from("competitor_snapshots")
    .upsert(userRows, { onConflict: "user_id,domain,competitor_domain,snapshot_date" });

  return userRows;
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
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];

  const todayData = await getCachedCompetitors({ userId, domain, snapshotDate: today });
  if (todayData.length > 0) {
    return NextResponse.json({ competitors: todayData, cached: true, cacheDate: today });
  }

  const yesterdayData = await getCachedCompetitors({ userId, domain, snapshotDate: yesterday });

  return NextResponse.json({
    competitors: yesterdayData ?? [],
    cached: yesterdayData.length > 0,
    cacheDate: yesterdayData.length > 0 ? yesterday : null,
  });
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

  const today = new Date().toISOString().split("T")[0];

  const cachedToday = await getCachedCompetitors({ userId, domain, snapshotDate: today });
  if (cachedToday.length > 0) {
    return NextResponse.json({ competitors: cachedToday, cached: true, cacheDate: today });
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
    const json = await fetchDataForSeoJson<{
      tasks?: Array<{
        result?: Array<{
          items?: Array<{
            domain: string;
            intersections: number;
            se_type: string;
            avg_position: number | null;
            sum_position: number | null;
            full_domain_metrics?: { organic?: { pos_1?: number } };
          }>;
        }>;
      }>;
    }>({
      feature: "competitors",
      url: "https://api.dataforseo.com/v3/dataforseo_labs/google/competitors_domain/live",
      method: "POST",
      body: requestBody,
    });
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

    const rows: CompetitorSnapshotRow[] = items.map((item) => ({
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
    if (err instanceof DataForSeoRequestError) {
      return NextResponse.json(
        getDataProviderErrorPayload("competitors", err.availability),
        { status: 502 }
      );
    }
    return NextResponse.json(
      getDataProviderErrorPayload("competitors", "provider_unavailable"),
      { status: 502 }
    );
  }
}
