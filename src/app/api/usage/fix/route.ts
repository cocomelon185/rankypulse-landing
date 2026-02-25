import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

const FREE_FIX_LIMIT = 3;

function startOfMonth() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ ok: true, allowed: false, reason: "unauthenticated" });
    }

    const userId = session.user.id;
    const body = await req.json().catch(() => ({}));
    const domain = typeof body.domain === "string" ? body.domain : "unknown";
    const issueId = typeof body.issueId === "string" ? body.issueId : "unknown";

    // Look up plan
    const { data: planRow } = await supabaseAdmin
      .from("user_plans")
      .select("plan")
      .eq("user_id", userId)
      .maybeSingle();

    const plan = (planRow?.plan ?? "free") as string;

    // Starter and pro have unlimited fixes
    if (plan === "starter" || plan === "pro") {
      await supabaseAdmin.from("fix_events").insert({
        user_id: userId,
        domain,
        issue_id: issueId,
      });
      return NextResponse.json({ ok: true, allowed: true, remaining: null });
    }

    // Free plan: check monthly limit
    const monthStart = startOfMonth();
    const { count } = await supabaseAdmin
      .from("fix_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", monthStart);

    const used = count ?? 0;

    if (used >= FREE_FIX_LIMIT) {
      return NextResponse.json({
        ok: true,
        allowed: false,
        reason: "fix_limit",
        remaining: 0,
        limit: FREE_FIX_LIMIT,
        used,
      });
    }

    // Insert fix event
    await supabaseAdmin.from("fix_events").insert({
      user_id: userId,
      domain,
      issue_id: issueId,
    });

    const remaining = FREE_FIX_LIMIT - used - 1;
    return NextResponse.json({ ok: true, allowed: true, remaining, limit: FREE_FIX_LIMIT });
  } catch (err) {
    console.error("[api/usage/fix]", err);
    // On error, allow the action (fail open)
    return NextResponse.json({ ok: true, allowed: true });
  }
}
