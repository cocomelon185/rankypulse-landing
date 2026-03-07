import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendWeeklyRankReport } from "@/lib/reports/weekly-rank-report";

// POST /api/cron/rank-report
// Weekly cron: send rank summary emails to all users with tracked keywords
// Scheduled: 0 8 * * 1 (8am UTC every Monday) via vercel.json
export async function POST(req: Request) {
  // Verify Vercel cron secret
  if (
    process.env.CRON_SECRET &&
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all unique user+domain pairs
  const { data: pairs, error } = await supabaseAdmin
    .from("rank_keywords")
    .select("user_id, domain")
    .order("user_id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // De-duplicate
  const seen = new Set<string>();
  const unique: Array<{ user_id: string; domain: string }> = [];
  for (const row of pairs ?? []) {
    const key = `${row.user_id}::${row.domain}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push({ user_id: row.user_id, domain: row.domain });
    }
  }

  let sent = 0;
  let failed = 0;

  for (const { user_id, domain } of unique) {
    try {
      // Fetch user email + name
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("email, name")
        .eq("id", user_id)
        .single();

      if (!user?.email) {
        failed++;
        continue;
      }

      await sendWeeklyRankReport({
        userId: user_id,
        domain,
        userEmail: user.email,
        userName: user.name ?? "there",
      });

      sent++;
    } catch {
      failed++;
    }

    // Small delay between emails
    await new Promise((r) => setTimeout(r, 200));
  }

  return NextResponse.json({
    message: "Weekly rank report complete",
    sent,
    failed,
  });
}
