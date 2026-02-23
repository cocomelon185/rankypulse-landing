/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextResponse } from "next/server";
import { Resend } from "resend";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Resend from address. Use RESEND_FROM when domain is verified, otherwise Resend sandbox. */
const DEFAULT_FROM = "RankyPulse <onboarding@resend.dev>";

type EmailIssue = { title: string; severity: string; eta?: string };

/** Pick first HIGH or MEDIUM issue; format "Fix next: <title> (~X min)" */
function deriveNextBestStep(issues?: EmailIssue[]): string {
  if (!issues?.length) return "Your site looks great. See improvement ideas inside.";
  const top = issues.find((i) =>
    ["high", "medium"].includes(String(i.severity).toLowerCase())
  );
  if (!top) return "Your site looks great. See improvement ideas inside.";
  const mins = top.eta?.match(/(\d+)/)?.[1] ?? "5";
  return `Fix next: ${top.title} (~${mins} min)`;
}

function buildHtmlBody(opts: {
  siteUrl: string;
  reportUrl: string;
  summary?: { score?: number; current?: number; potential?: number };
  issues?: EmailIssue[];
}) {
  const { siteUrl, reportUrl, summary, issues } = opts;
  const score = summary?.score ?? summary?.current;
  const potential = summary?.potential;
  const encodedSite = encodeURIComponent(siteUrl);
  const quickWinsUrl = `https://rankypulse.com/dashboard?action=quickwins&site=${encodedSite}`;
  const pricingUrl = "https://rankypulse.com/pricing";

  const nextBestStep = deriveNextBestStep(issues);
  const nextBestStepHtml = `
  <div style="margin:20px 0;padding:16px;background:#eff6ff;border-radius:12px;border-left:4px solid #4318ff;">
    <p style="margin:0 0 6px;font-size:0.75rem;font-weight:600;color:#4318ff;text-transform:uppercase;letter-spacing:0.05em;">🚀 Next Best Step</p>
    <p style="margin:0;font-size:1rem;font-weight:600;color:#1B2559;">${escapeHtml(nextBestStep)}</p>
  </div>`;

  const primaryCtaHtml = `
  <p style="margin:20px 0 24px;">
    <a href="${escapeHtml(quickWinsUrl)}" style="display:block;width:100%;max-width:400px;background:linear-gradient(to right,#4318ff,#7551ff);color:#fff !important;padding:16px 24px;border-radius:12px;text-decoration:none;font-weight:600;font-size:1rem;text-align:center;box-sizing:border-box;">
      Open Quick Wins
    </a>
  </p>`;

  const issuesListHtml =
    issues && issues.length > 0
      ? `
  <div style="margin:24px 0;padding-top:20px;border-top:1px solid #e5e7eb;">
    <p style="margin:0 0 12px;font-size:0.875rem;font-weight:600;color:#374151;">Issue breakdown</p>
    <ul style="margin:0;padding-left:20px;color:#4b5563;font-size:0.875rem;line-height:1.6;">
      ${issues.slice(0, 10).map((i) => `<li>${escapeHtml(i.title)}</li>`).join("")}
    </ul>
  </div>`
      : "";

  const upsellHtml = `
  <p style="margin:24px 0 0;font-size:0.8125rem;color:#6b7280;line-height:1.5;">
    <strong style="color:#374151;">Unlock AI Fixes (Pro)</strong><br>
    Get one-click fixes, rewritten metadata, and auto-generated improvements.<br>
    <a href="${escapeHtml(pricingUrl)}" style="color:#4318ff;font-weight:600;text-decoration:none;">Upgrade to Pro →</a>
  </p>
  <p style="margin:16px 0 0;font-size:0.8125rem;color:#6b7280;">
    <a href="${escapeHtml(reportUrl)}" style="color:#4318ff;">View full report</a>
  </p>`;

  const scoreSummaryHtml =
    score != null || potential != null
      ? `<p style="margin:16px 0;color:#374151;">Score: <strong>${score ?? "—"}</strong>${potential != null ? ` / Potential: <strong>${potential}</strong>` : ""}</p>`
      : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Your RankyPulse SEO Audit Report</title>
</head>
<body style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1B2559;">
  <h1 style="font-size:1.5rem;margin:0 0 16px;">Your RankyPulse SEO Audit Report</h1>
  <p style="margin:0 0 16px;color:#4b5563;">Here&apos;s your audit link and your next best step to improve SEO.</p>
  <p style="margin:16px 0;color:#374151;">Site: <strong>${escapeHtml(siteUrl)}</strong></p>
  ${scoreSummaryHtml}
  ${nextBestStepHtml}
  ${primaryCtaHtml}
  ${issuesListHtml}
  ${upsellHtml}
  <p style="margin:32px 0 0;font-size:0.75rem;color:#9ca3af;">— RankyPulse</p>
</body>
</html>
`.trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body?.email || "").trim();
    const reportUrl = (body?.reportUrl || "").trim();
    let siteUrl = (body?.siteUrl || "").trim();
    const summary = body?.summary as
      | { score?: number; current?: number; potential?: number }
      | undefined;
    const issues = body?.issues as
      | Array<{ title: string; severity: string; eta?: string }>
      | undefined;

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!reportUrl || !reportUrl.startsWith("http")) {
      return NextResponse.json(
        { success: false, error: "Invalid report URL" },
        { status: 400 }
      );
    }

    if (!siteUrl) {
      try {
        const u = new URL(reportUrl);
        siteUrl = u.searchParams.get("url") || u.href;
      } catch {
        siteUrl = reportUrl;
      }
    }

    const apiKey = process.env["RESEND_API_KEY"];
    const fromAddress = process.env.RESEND_FROM || DEFAULT_FROM;

    console.log("Resend key loaded:", !!apiKey);

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Email not configured" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [email],
      subject: "Your RankyPulse SEO Audit Report",
      html: buildHtmlBody({ siteUrl, reportUrl, summary, issues }),
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Invalid request" },
      { status: 400 }
    );
  }
}
