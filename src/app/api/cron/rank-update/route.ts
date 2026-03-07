import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { refreshDomainRankings } from "@/lib/rank-engine";

// POST /api/cron/rank-update
// Daily cron: refresh SERP positions for all tracked keywords
// Scheduled: 0 6 * * * (6am UTC daily) via vercel.json
export async function POST(req: Request) {
  // Verify Vercel cron secret
  if (
    process.env.CRON_SECRET &&
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all unique user+domain pairs that have tracked keywords
  const { data: pairs, error } = await supabaseAdmin
    .from("rank_keywords")
    .select("user_id, domain")
    .order("user_id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // De-duplicate user+domain pairs
  const seen = new Set<string>();
  const unique: Array<{ user_id: string; domain: string }> = [];
  for (const row of pairs ?? []) {
    const key = `${row.user_id}::${row.domain}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push({ user_id: row.user_id, domain: row.domain });
    }
  }

  const results: Array<{
    user_id: string;
    domain: string;
    processed: number;
    errors: number;
  }> = [];

  for (const { user_id, domain } of unique) {
    const result = await refreshDomainRankings({ userId: user_id, domain });
    results.push({ user_id, domain, ...result });

    // Brief pause between domains to avoid hammering DataForSEO
    await new Promise((r) => setTimeout(r, 600));
  }

  const totalProcessed = results.reduce((s, r) => s + r.processed, 0);
  const totalErrors = results.reduce((s, r) => s + r.errors, 0);

  return NextResponse.json({
    message: "Rank update complete",
    domains: unique.length,
    processed: totalProcessed,
    errors: totalErrors,
    results,
  });
}
