import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { fetchRanking, fetchSearchVolumes } from "@/lib/rank-engine";

// GET /api/rank/keywords?domain=example.com
// Returns all tracked keywords for the user+domain with latest position + change
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

  // Fetch all keywords for this user+domain
  const { data: keywords, error } = await supabaseAdmin
    .from("rank_keywords")
    .select("id, keyword, target_url, device, country, volume, cpc, created_at")
    .eq("user_id", userId)
    .eq("domain", domain)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!keywords || keywords.length === 0) {
    return NextResponse.json({ keywords: [] });
  }

  // For each keyword, fetch the two most recent rank_history rows to compute change
  const enriched = await Promise.all(
    keywords.map(async (kw) => {
      const { data: history } = await supabaseAdmin
        .from("rank_history")
        .select("position, ranked_url, checked_at")
        .eq("keyword_id", kw.id)
        .order("checked_at", { ascending: false })
        .limit(2);

      const latest = history?.[0] ?? null;
      const previous = history?.[1] ?? null;

      const position = latest?.position ?? null;
      const prevPos = previous?.position ?? null;
      const change =
        position !== null && prevPos !== null ? prevPos - position : null;

      return {
        ...kw,
        position,
        change,
        ranked_url: latest?.ranked_url ?? null,
        checked_at: latest?.checked_at ?? null,
      };
    })
  );

  return NextResponse.json({ keywords: enriched });
}

// POST /api/rank/keywords
// Body: { domain, keyword, target_url?, country?, device? }
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: {
    domain?: string;
    keyword?: string;
    target_url?: string;
    country?: string;
    device?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { domain, keyword, target_url, country = "US", device = "desktop" } = body;

  if (!domain || !keyword) {
    return NextResponse.json({ error: "domain and keyword required" }, { status: 400 });
  }

  if (device !== "desktop" && device !== "mobile") {
    return NextResponse.json({ error: "device must be desktop or mobile" }, { status: 400 });
  }

  // Insert keyword (upsert to handle duplicates gracefully)
  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("rank_keywords")
    .upsert(
      { user_id: userId, domain, keyword, target_url: target_url ?? null, country, device },
      { onConflict: "user_id,domain,keyword,device", ignoreDuplicates: false }
    )
    .select("id, keyword, target_url, device, country, volume, cpc, created_at")
    .single();

  if (insertError || !inserted) {
    return NextResponse.json(
      { error: insertError?.message ?? "Insert failed" },
      { status: 500 }
    );
  }

  // Fetch search volume from DataForSEO (best-effort — don't fail the request)
  let volume: number | null = null;
  let cpc: number | null = null;
  try {
    const volumes = await fetchSearchVolumes({ keywords: [keyword], country });
    const data = volumes[keyword];
    volume = data?.volume ?? null;
    cpc = data?.cpc ?? null;

    if (volume !== null || cpc !== null) {
      await supabaseAdmin
        .from("rank_keywords")
        .update({ volume, cpc })
        .eq("id", inserted.id);
    }
  } catch {
    // Non-critical
  }

  // Fetch initial ranking from DataForSEO (best-effort)
  let position: number | null = null;
  let ranked_url: string | null = null;
  try {
    const result = await fetchRanking({
      keyword,
      domain,
      device: device as "desktop" | "mobile",
      country,
    });
    position = result.position;
    ranked_url = result.ranked_url;

    await supabaseAdmin.from("rank_history").insert({
      keyword_id: inserted.id,
      position,
      ranked_url,
      search_engine: "google",
    });
  } catch {
    // Non-critical
  }

  return NextResponse.json({
    keyword: {
      ...inserted,
      volume,
      cpc,
      position,
      change: null,
      ranked_url,
      checked_at: new Date().toISOString(),
    },
  });
}
