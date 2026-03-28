import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET  /api/rank/alerts?domain=example.com  — list alert rules
 * POST /api/rank/alerts                      — create alert rule
 * DELETE /api/rank/alerts?id=X              — delete alert rule
 *
 * Alert rules are stored as JSON in user_settings under key "rank_alerts_{domain}".
 * Each rule: { id, keyword_id, keyword, type: "drop"|"enter_top10"|"any_change", threshold?: number }
 */

export interface AlertRule {
  id: string;
  keyword_id: string;
  keyword: string;
  type: "drop" | "enter_top10" | "any_change";
  threshold?: number; // for "drop": positions dropped threshold
}

async function getAlerts(userId: string, domain: string): Promise<AlertRule[]> {
  const { data } = await supabaseAdmin
    .from("user_settings")
    .select("value")
    .eq("user_id", userId)
    .eq("key", `rank_alerts_${domain}`)
    .single();
  return (data?.value as AlertRule[]) ?? [];
}

async function saveAlerts(userId: string, domain: string, alerts: AlertRule[]) {
  await supabaseAdmin
    .from("user_settings")
    .upsert(
      { user_id: userId, key: `rank_alerts_${domain}`, value: alerts },
      { onConflict: "user_id,key" }
    );
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");
  if (!domain) return NextResponse.json({ error: "domain required" }, { status: 400 });

  const alerts = await getAlerts(session.user.id, domain);
  return NextResponse.json({ alerts });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { domain?: string; keyword_id?: string; keyword?: string; type?: string; threshold?: number };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { domain, keyword_id, keyword, type, threshold } = body;
  if (!domain || !keyword_id || !keyword || !type) {
    return NextResponse.json({ error: "domain, keyword_id, keyword, type required" }, { status: 400 });
  }
  if (!["drop", "enter_top10", "any_change"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const existing = await getAlerts(session.user.id, domain);
  // One alert per keyword per type
  const filtered = existing.filter((a) => !(a.keyword_id === keyword_id && a.type === type));
  const newRule: AlertRule = {
    id: `${keyword_id}_${type}_${Date.now()}`,
    keyword_id,
    keyword,
    type: type as AlertRule["type"],
    threshold: type === "drop" ? (threshold ?? 3) : undefined,
  };
  const updated = [...filtered, newRule];
  await saveAlerts(session.user.id, domain, updated);
  return NextResponse.json({ alert: newRule, alerts: updated });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const domain = searchParams.get("domain");
  if (!id || !domain) return NextResponse.json({ error: "id and domain required" }, { status: 400 });

  const existing = await getAlerts(session.user.id, domain);
  const updated = existing.filter((a) => a.id !== id);
  await saveAlerts(session.user.id, domain, updated);
  return NextResponse.json({ alerts: updated });
}
