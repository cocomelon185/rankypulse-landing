import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { getWinnersLosers } from "@/lib/rank-engine";

// GET /api/rank/overview?domain=example.com
// Returns summary stats: avg position, top 3/10 counts, visibility, winners, losers
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

  // Fetch all keywords
  const { data: keywords } = await supabaseAdmin
    .from("rank_keywords")
    .select("id")
    .eq("user_id", userId)
    .eq("domain", domain);

  if (!keywords || keywords.length === 0) {
    return NextResponse.json({
      avg_position: null,
      top3_count: 0,
      top10_count: 0,
      total_keywords: 0,
      visibility: 0,
      visibility_change: 0,
      winners: [],
      losers: [],
    });
  }

  const keywordIds = keywords.map((k) => k.id);

  // Latest position per keyword (most recent rank_history row)
  const { data: latestHistory } = await supabaseAdmin
    .from("rank_history")
    .select("keyword_id, position, checked_at")
    .in("keyword_id", keywordIds)
    .order("checked_at", { ascending: false });

  // De-duplicate: one row per keyword_id (most recent)
  const latestByKeyword = new Map<string, number | null>();
  for (const row of latestHistory ?? []) {
    if (!latestByKeyword.has(row.keyword_id)) {
      latestByKeyword.set(row.keyword_id, row.position ?? null);
    }
  }

  const positions = Array.from(latestByKeyword.values()).filter(
    (p): p is number => p !== null
  );

  const avg_position =
    positions.length > 0
      ? Math.round((positions.reduce((a, b) => a + b, 0) / positions.length) * 10) / 10
      : null;
  const top3_count = positions.filter((p) => p <= 3).length;
  const top10_count = positions.filter((p) => p <= 10).length;
  const total_keywords = keywords.length;

  // Latest + 7-day-old visibility score
  const today = new Date().toISOString().split("T")[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const { data: visSnaps } = await supabaseAdmin
    .from("visibility_snapshots")
    .select("score, snapshot_date")
    .eq("user_id", userId)
    .eq("domain", domain)
    .in("snapshot_date", [today, sevenDaysAgo])
    .order("snapshot_date", { ascending: false });

  const latestVis = Number(visSnaps?.[0]?.score ?? 0);
  const prevVis = Number(visSnaps?.[1]?.score ?? 0);
  const visibility_change = Math.round((latestVis - prevVis) * 10) / 10;

  // Winners and losers
  const { winners, losers } = await getWinnersLosers({ userId, domain });

  return NextResponse.json({
    avg_position,
    top3_count,
    top10_count,
    total_keywords,
    visibility: latestVis,
    visibility_change,
    winners,
    losers,
  });
}
