import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/rank/competitors?domain=example.com
 * Returns saved competitor domains for a domain.
 *
 * POST /api/rank/competitors
 * Body: { domain, competitor }
 * Adds a competitor domain to track (max 5 per domain).
 *
 * DELETE /api/rank/competitors?domain=example.com&competitor=competitor.com
 * Removes a competitor domain.
 *
 * Competitors are stored in user_settings as JSON under key "rank_competitors_{domain}".
 */

async function getCompetitors(userId: string, domain: string): Promise<string[]> {
  const { data } = await supabaseAdmin
    .from("user_settings")
    .select("value")
    .eq("user_id", userId)
    .eq("key", `rank_competitors_${domain}`)
    .single();
  return (data?.value as string[]) ?? [];
}

async function saveCompetitors(userId: string, domain: string, competitors: string[]) {
  await supabaseAdmin
    .from("user_settings")
    .upsert(
      { user_id: userId, key: `rank_competitors_${domain}`, value: competitors },
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

  const competitors = await getCompetitors(session.user.id, domain);
  return NextResponse.json({ competitors });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { domain?: string; competitor?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { domain, competitor } = body;
  if (!domain || !competitor) {
    return NextResponse.json({ error: "domain and competitor required" }, { status: 400 });
  }

  const clean = competitor.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].toLowerCase();
  if (!clean || clean === domain) {
    return NextResponse.json({ error: "Invalid competitor domain" }, { status: 400 });
  }

  const existing = await getCompetitors(session.user.id, domain);
  if (existing.includes(clean)) {
    return NextResponse.json({ competitors: existing });
  }
  if (existing.length >= 5) {
    return NextResponse.json({ error: "Maximum 5 competitors per domain" }, { status: 400 });
  }

  const updated = [...existing, clean];
  await saveCompetitors(session.user.id, domain, updated);
  return NextResponse.json({ competitors: updated });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");
  const competitor = searchParams.get("competitor");
  if (!domain || !competitor) {
    return NextResponse.json({ error: "domain and competitor required" }, { status: 400 });
  }

  const existing = await getCompetitors(session.user.id, domain);
  const updated = existing.filter((c) => c !== competitor);
  await saveCompetitors(session.user.id, domain, updated);
  return NextResponse.json({ competitors: updated });
}
