import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/rank/visibility?domain=example.com
// Returns daily visibility scores for the last 30 days (used by charts)
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

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const { data: rows, error } = await supabaseAdmin
    .from("visibility_snapshots")
    .select("score, snapshot_date")
    .eq("user_id", userId)
    .eq("domain", domain)
    .gte("snapshot_date", thirtyDaysAgo)
    .order("snapshot_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const trend = (rows ?? []).map((r) => ({
    date: r.snapshot_date,
    score: Number(r.score),
  }));

  return NextResponse.json({ trend });
}
