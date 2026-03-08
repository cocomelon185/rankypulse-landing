import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/opportunities?domain=&showAll=true
 *
 * Returns SEO opportunities (keywords in pos 11–20, vol ≥ 1000) for the user.
 * Opportunities are persisted in seo_opportunities by the detection engine
 * (called after each daily rank refresh).
 *
 * ?domain=   — filter by domain (optional; picks best domain if omitted)
 * ?showAll=  — include dismissed opportunities (default: exclude)
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const domainParam = req.nextUrl.searchParams.get("domain");
  const showAll = req.nextUrl.searchParams.get("showAll") === "true";

  try {
    // 1. Fetch all opportunities for user, joined with rank_keywords for trend data
    let query = supabaseAdmin
      .from("seo_opportunities")
      .select(`
        id,
        domain,
        keyword,
        keyword_id,
        current_position,
        target_position,
        search_volume,
        estimated_traffic_gain,
        recommended_actions,
        status,
        created_at,
        updated_at
      `)
      .eq("user_id", userId)
      .order("estimated_traffic_gain", { ascending: false });

    // Filter by status: default excludes dismissed
    if (!showAll) {
      query = query.neq("status", "dismissed");
    }

    // Filter by domain if provided
    if (domainParam) {
      query = query.eq("domain", domainParam);
    }

    const { data: opps, error } = await query;
    if (error) throw error;

    // 2. Get latest position trend (change) for each keyword from rank_keywords
    const keywordIds = (opps ?? []).map(o => o.keyword_id);
    let changeMap = new Map<string, { change: number | null; ranked_url: string | null }>();

    if (keywordIds.length > 0) {
      // Fetch latest rank_history entries for these keywords
      const { data: historyRows } = await supabaseAdmin
        .from("rank_history")
        .select("keyword_id, position, checked_at")
        .in("keyword_id", keywordIds)
        .order("checked_at", { ascending: false });

      // Build: keyword_id → [latest, prev] positions
      const posHistory = new Map<string, number[]>();
      for (const row of historyRows ?? []) {
        if (!posHistory.has(row.keyword_id)) posHistory.set(row.keyword_id, []);
        const arr = posHistory.get(row.keyword_id)!;
        if (arr.length < 2 && row.position !== null) arr.push(row.position);
      }

      // Also fetch ranked_url from rank_keywords
      const { data: kwRows } = await supabaseAdmin
        .from("rank_keywords")
        .select("id, target_url")
        .in("id", keywordIds);

      const urlMap = new Map((kwRows ?? []).map(k => [k.id, k.target_url as string | null]));

      for (const [kwId, positions] of posHistory) {
        const change = positions.length >= 2
          ? positions[1] - positions[0]  // positive = improving (prev higher # than current)
          : null;
        changeMap.set(kwId, {
          change,
          ranked_url: urlMap.get(kwId) ?? null,
        });
      }
    }

    // 3. Enrich opportunities with trend data
    const enriched = (opps ?? []).map(opp => ({
      id: opp.id,
      keyword: opp.keyword,
      current_position: opp.current_position,
      target_position: opp.target_position,
      search_volume: opp.search_volume,
      estimated_traffic_gain: opp.estimated_traffic_gain,
      recommended_actions: Array.isArray(opp.recommended_actions) ? opp.recommended_actions : [],
      status: opp.status as "open" | "dismissed" | "completed",
      ranked_url: changeMap.get(opp.keyword_id)?.ranked_url ?? null,
      change: changeMap.get(opp.keyword_id)?.change ?? null,
      domain: opp.domain,
      created_at: opp.created_at,
    }));

    // 4. Compute allDomains from all user opportunities
    const { data: allOppDomains } = await supabaseAdmin
      .from("seo_opportunities")
      .select("domain")
      .eq("user_id", userId);

    const allDomains = [...new Set((allOppDomains ?? []).map(o => o.domain))];

    // 5. Determine target domain (param → best by gain → first)
    const activeDomain = domainParam ??
      enriched.find(o => o.status === "open")?.domain ??
      allDomains[0] ?? null;

    // 6. Total traffic potential for open opportunities (in the current domain view)
    const totalTrafficPotential = enriched
      .filter(o => o.status === "open")
      .reduce((sum, o) => sum + o.estimated_traffic_gain, 0);

    return NextResponse.json({
      opportunities: enriched,
      domain: activeDomain,
      allDomains,
      totalTrafficPotential,
    });
  } catch (err) {
    console.error("GET /api/opportunities error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
