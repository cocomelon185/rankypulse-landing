import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

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
    return NextResponse.json({ plan: "free" });
  }

  return NextResponse.json({
    plan: data.plan ?? "free",
    planStartedAt: data.plan_started_at,
    planExpiresAt: data.plan_expires_at,
  });
}
