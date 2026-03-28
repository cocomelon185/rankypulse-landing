import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/rank/sparklines?domain=example.com
 *
 * Returns the last 14 days of position data for all keywords of a domain
 * in a single DB query. Used to render per-row sparklines in the keyword
 * table without N individual /api/rank/history calls.
 *
 * Response:
 * {
 *   sparklines: {
 *     "<keyword_id>": (number | null)[]   // 14 slots, index 0 = oldest
 *   }
 * }
 */
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

  // Fetch keyword IDs for this user+domain
  const { data: keywords } = await supabaseAdmin
    .from("rank_keywords")
    .select("id")
    .eq("user_id", userId)
    .eq("domain", domain);

  if (!keywords || keywords.length === 0) {
    return NextResponse.json({ sparklines: {} });
  }

  const keywordIds = keywords.map((k) => k.id);

  // Build 14-day slot array
  const DAYS = 14;
  const now = new Date();
  const cutoff = new Date(now.getTime() - DAYS * 24 * 60 * 60 * 1000);

  // Generate ordered date strings for the last 14 days (oldest first)
  const dateSlots: string[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dateSlots.push(d.toISOString().split("T")[0]);
  }

  // Single query: fetch all history rows across all keywords
  const { data: rows } = await supabaseAdmin
    .from("rank_history")
    .select("keyword_id, position, checked_at")
    .in("keyword_id", keywordIds)
    .gte("checked_at", cutoff.toISOString())
    .order("checked_at", { ascending: true });

  // Group by keyword_id, then by date (keep latest position per day per keyword)
  const grouped: Record<string, Record<string, number | null>> = {};
  for (const row of rows ?? []) {
    const kwId = row.keyword_id;
    const day = (row.checked_at as string).split("T")[0];
    if (!grouped[kwId]) grouped[kwId] = {};
    grouped[kwId][day] = row.position ?? null;
  }

  // Build the final sparkline arrays
  const sparklines: Record<string, (number | null)[]> = {};
  for (const kwId of keywordIds) {
    const byDay = grouped[kwId] ?? {};
    sparklines[kwId] = dateSlots.map((date) => byDay[date] ?? null);
  }

  return NextResponse.json({ sparklines });
}
