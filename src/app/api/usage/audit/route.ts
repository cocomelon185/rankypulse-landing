import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

const LIMITS: Record<string, number | null> = {
  free: null,       // unlimited for free tier
  starter: 20,
  pro: 75,
};

function startOfMonth() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Anonymous users are always allowed — no DB write
    if (!session?.user?.id) {
      return NextResponse.json({ ok: true, allowed: true });
    }

    const userId = session.user.id;
    const body = await req.json().catch(() => ({}));
    const domain = typeof body.domain === "string" ? body.domain : "unknown";

    // Look up plan
    const { data: planRow } = await supabaseAdmin
      .from("user_plans")
      .select("plan")
      .eq("user_id", userId)
      .maybeSingle();

    const plan = (planRow?.plan ?? "free") as string;
    const limit = LIMITS[plan] ?? null;

    // Count audit runs this month
    const monthStart = startOfMonth();
    const { count } = await supabaseAdmin
      .from("audit_runs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", monthStart);

    const used = count ?? 0;

    if (limit !== null && used >= limit) {
      return NextResponse.json({
        ok: true,
        allowed: false,
        reason: "audit_limit",
        remaining: 0,
        limit,
        used,
      });
    }

    // Insert audit run record
    await supabaseAdmin.from("audit_runs").insert({
      user_id: userId,
      domain,
    });

    const remaining = limit !== null ? limit - used - 1 : null;
    return NextResponse.json({ ok: true, allowed: true, remaining, limit, used: used + 1 });
  } catch (err) {
    console.error("[api/usage/audit]", err);
    // On error, allow the audit (fail open)
    return NextResponse.json({ ok: true, allowed: true });
  }
}
