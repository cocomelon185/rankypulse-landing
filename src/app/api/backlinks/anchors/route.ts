/**
 * GET /api/backlinks/anchors?domain=example.com
 *
 * Returns the top anchor text distribution for a domain using DataForSEO
 * backlinks/anchors/live endpoint. Cached once per day per domain.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { fetchDataForSeoJson, DataForSeoRequestError } from "@/lib/dataforseo";
import { getDataProviderErrorPayload } from "@/lib/data-provider";
import { logApiCost } from "@/lib/cost-engine";

export const dynamic = "force-dynamic";

interface AnchorItem {
  anchor: string | null;
  backlinks: number;
  referring_domains: number;
  first_seen: string | null;
  lost_date: string | null;
}

interface DfsAnchorsResult {
  tasks?: Array<{
    result?: Array<{
      items?: AnchorItem[];
      total_count?: number;
    }>;
  }>;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain")?.trim();
  if (!domain) {
    return NextResponse.json({ error: "domain required" }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];
  const cacheKey = `anchors_${domain}_${today}`;

  // Check Supabase cache (stored in a simple kv-style via backlink_snapshots extended data, or a dedicated cache)
  // Using a lightweight approach: store in a JSON column if available, otherwise fetch fresh each time.
  // For now we check if there's a snapshot from today with anchors embedded.
  const { data: cached } = await supabaseAdmin
    .from("backlink_snapshots")
    .select("anchor_data")
    .eq("user_id", session.user.id)
    .eq("domain", domain)
    .eq("snapshot_date", today)
    .maybeSingle();

  if (cached?.anchor_data) {
    return NextResponse.json({ anchors: cached.anchor_data, cached: true });
  }

  // Fetch from DataForSEO
  try {
    const json = await fetchDataForSeoJson<DfsAnchorsResult>({
      feature: "backlinks",
      url: "https://api.dataforseo.com/v3/backlinks/anchors/live",
      method: "POST",
      body: [
        {
          target: domain,
          limit: 20,
          order_by: ["backlinks,desc"],
          include_subdomains: true,
        },
      ],
    });

    const items = json?.tasks?.[0]?.result?.[0]?.items ?? [];
    const total = json?.tasks?.[0]?.result?.[0]?.total_count ?? 0;

    const anchors = items
      .filter((item) => item.anchor !== null && item.anchor !== undefined)
      .map((item) => ({
        anchor: item.anchor ?? "(no anchor)",
        backlinks: item.backlinks ?? 0,
        referring_domains: item.referring_domains ?? 0,
      }));

    // Cache into today's snapshot row if it exists (best-effort)
    if (anchors.length > 0) {
      await supabaseAdmin
        .from("backlink_snapshots")
        .update({ anchor_data: anchors })
        .eq("user_id", session.user.id)
        .eq("domain", domain)
        .eq("snapshot_date", today);
    }

    logApiCost({ userId: session.user.id, operation: "backlinks", units: 1 });

    return NextResponse.json({ anchors, total, cached: false });
  } catch (err) {
    if (err instanceof DataForSeoRequestError) {
      return NextResponse.json(
        getDataProviderErrorPayload("backlinks", err.availability),
        { status: 502 }
      );
    }
    console.error("[backlinks/anchors]", err);
    return NextResponse.json({ error: "Failed to fetch anchor data" }, { status: 500 });
  }
}
