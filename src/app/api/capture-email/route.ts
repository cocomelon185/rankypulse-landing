import { NextRequest, NextResponse } from "next/server";

interface IssuePayload {
  title?: string;
  trafficImpact?: { min?: number; max?: number };
}

interface AuditPayload {
  score?: number;
  issues?: IssuePayload[];
}

export async function POST(req: NextRequest) {
  let body: { email?: string; domain?: string; auditData?: AuditPayload };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, domain, auditData } = body;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // No key configured — silently succeed so UX isn't broken in dev
    console.warn("RESEND_API_KEY not set — email not sent");
    return NextResponse.json({ success: true, dev: true });
  }

  const safeDomain = domain ?? "your-site.com";
  const score = auditData?.score ?? 0;
  const issues = auditData?.issues ?? [];

  const issueRows = issues
    .map(
      (issue) => `
        <div style="background:#13161f;border:1px solid rgba(255,255,255,0.06);
          border-radius:12px;padding:16px;margin-bottom:12px;">
          <div style="font-size:13px;font-weight:600;color:#f1f5f9;margin-bottom:4px;">
            ${issue.title ?? "SEO issue"}
          </div>
          <div style="font-size:12px;color:#10b981;">
            Fix this → +${issue.trafficImpact?.min ?? 0}–${issue.trafficImpact?.max ?? 0} visits/mo
          </div>
        </div>
      `
    )
    .join("");

  const scoreColor = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankypulse.com";

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="background:#0d0f14;color:#f1f5f9;font-family:sans-serif;
      max-width:600px;margin:0 auto;padding:32px 24px;">

      <div style="margin-bottom:32px;">
        <span style="font-size:20px;font-weight:700;color:#f1f5f9;">⚡ RankyPulse</span>
      </div>

      <h1 style="font-size:28px;font-weight:700;margin-bottom:8px;color:#f1f5f9;">
        Your SEO Audit for ${safeDomain}
      </h1>
      <p style="color:#94a3b8;margin-bottom:32px;">
        Here's what we found and what to do next.
      </p>

      <div style="background:#13161f;border:1px solid rgba(255,255,255,0.08);
        border-radius:16px;padding:24px;margin-bottom:24px;text-align:center;">
        <div style="font-size:12px;color:#475569;letter-spacing:3px;
          font-family:monospace;margin-bottom:8px;">SEO HEALTH SCORE</div>
        <div style="font-size:64px;font-weight:700;color:${scoreColor};">
          ${score}
        </div>
        <div style="color:#94a3b8;font-size:14px;">/ 100</div>
      </div>

      <h2 style="font-size:18px;font-weight:700;margin-bottom:16px;">
        ${issues.length} issue${issues.length !== 1 ? "s" : ""} found
      </h2>
      ${issueRows}

      <div style="text-align:center;margin-top:32px;">
        <a href="${appUrl}/report/${safeDomain}"
          style="display:inline-block;background:#6366f1;color:#fff;
          padding:14px 32px;border-radius:12px;text-decoration:none;
          font-weight:700;font-size:14px;">
          View Full Report →
        </a>
      </div>

      <p style="color:#334155;font-size:12px;text-align:center;margin-top:32px;">
        RankyPulse · <a href="${appUrl}" style="color:#475569;">rankypulse.com</a>
      </p>
    </body>
    </html>
  `;

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "RankyPulse Reports <reports@rankypulse.com>",
        to: email,
        subject: `Your SEO audit for ${safeDomain} — Score: ${score}/100`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errBody = await resendRes.text();
      console.error("Resend error:", errBody);
      return NextResponse.json({ error: "Failed to send" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
