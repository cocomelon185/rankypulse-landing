/**
 * weekly-rank-report.ts
 * Builds and sends the weekly rank intelligence email via Resend.
 */

import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";
import { RankReportTemplate } from "@/emails/RankReportTemplate";
import { getWinnersLosers } from "@/lib/rank-engine";

const resend = new Resend(process.env.RESEND_API_KEY);

interface WeeklyRankParams {
  userId: string;
  domain: string;
  userEmail: string;
  userName: string;
}

export async function sendWeeklyRankReport(params: WeeklyRankParams): Promise<void> {
  const { userId, domain, userEmail, userName } = params;

  // Latest visibility score
  const { data: visSnaps } = await supabaseAdmin
    .from("visibility_snapshots")
    .select("score, snapshot_date")
    .eq("user_id", userId)
    .eq("domain", domain)
    .order("snapshot_date", { ascending: false })
    .limit(2);

  const latestVis = Number(visSnaps?.[0]?.score ?? 0);
  const prevVis = Number(visSnaps?.[1]?.score ?? 0);
  const visibilityChange = Math.round((latestVis - prevVis) * 10) / 10;

  // Winners and losers (last 7 days vs previous 7 days)
  const { winners, losers } = await getWinnersLosers({ userId, domain });

  // Keywords entering/leaving top 10 (compare last 2 history rows per keyword)
  const { data: keywords } = await supabaseAdmin
    .from("rank_keywords")
    .select("id, keyword")
    .eq("user_id", userId)
    .eq("domain", domain);

  const entering_top10: string[] = [];
  const leaving_top10: string[] = [];

  for (const kw of keywords ?? []) {
    const { data: history } = await supabaseAdmin
      .from("rank_history")
      .select("position")
      .eq("keyword_id", kw.id)
      .order("checked_at", { ascending: false })
      .limit(2);

    const curr = history?.[0]?.position ?? null;
    const prev = history?.[1]?.position ?? null;

    if (curr !== null && prev !== null) {
      if (curr <= 10 && prev > 10) entering_top10.push(kw.keyword);
      if (curr > 10 && prev <= 10) leaving_top10.push(kw.keyword);
    }
  }

  const from =
    process.env.RESEND_FROM ?? "RankyPulse <reports@rankypulse.com>";

  await resend.emails.send({
    from,
    to: userEmail,
    subject: `RankyPulse Weekly SEO Report — ${domain}`,
    react: RankReportTemplate({
      domain,
      userName,
      visibility: latestVis,
      visibilityChange,
      winners,
      losers,
      entering_top10,
      leaving_top10,
    }),
  });
}
