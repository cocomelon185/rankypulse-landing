import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { getKeywordCap } from "@/lib/cost-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/plan
 * Returns the authenticated user's current plan from the database.
 * This is the authoritative source — do NOT rely on localStorage.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("plan, plan_started_at, plan_expires_at")
    .eq("id", session.user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ plan: "free", keywordsUsed: 0, keywordCap: 10 });
  }

  const plan = data.plan ?? "free";
  const keywordCap = getKeywordCap(plan);

  // Count tracked keywords for this user
  const { count: keywordsUsed } = await supabaseAdmin
    .from("rank_keywords")
    .select("id", { count: "exact", head: true })
    .eq("user_id", session.user.id);

  return NextResponse.json({
    plan,
    planStartedAt: data.plan_started_at,
    planExpiresAt: data.plan_expires_at,
    keywordsUsed: keywordsUsed ?? 0,
    keywordCap,
  });
}
