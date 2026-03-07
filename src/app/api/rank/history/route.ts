import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/rank/history?keyword_id=X
// Returns 30-day position history for a keyword
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const keywordId = searchParams.get("keyword_id");
  if (!keywordId) {
    return NextResponse.json({ error: "keyword_id required" }, { status: 400 });
  }

  // Verify ownership
  const { data: kw } = await supabaseAdmin
    .from("rank_keywords")
    .select("id")
    .eq("id", keywordId)
    .eq("user_id", userId)
    .single();

  if (!kw) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: rows, error } = await supabaseAdmin
    .from("rank_history")
    .select("position, checked_at")
    .eq("keyword_id", keywordId)
    .gte("checked_at", thirtyDaysAgo)
    .order("checked_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // One data point per day (take latest of the day)
  const dayMap = new Map<string, number | null>();
  for (const row of rows ?? []) {
    const day = row.checked_at.split("T")[0];
    dayMap.set(day, row.position ?? null);
  }

  const history = Array.from(dayMap.entries()).map(([date, position]) => ({
    date,
    position,
  }));

  return NextResponse.json({ history });
}
