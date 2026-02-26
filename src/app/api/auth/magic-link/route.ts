import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);
const appUrl =
  process.env.NEXTAUTH_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
  "https://rankypulse.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : null;
    const callbackUrl = typeof body.callbackUrl === "string" ? body.callbackUrl : "/dashboard";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn("[magic-link] RESEND_API_KEY not set — simulating success");
      return NextResponse.json({ ok: true });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // Store token in DB so /auth/verify can validate it
    const { error: dbError } = await supabaseAdmin.from("auth_tokens").insert({
      token,
      email,
      type: "magic_link",
      expires_at: expiresAt,
    });

    if (dbError) {
      console.error("[magic-link] DB insert error:", dbError);
      return NextResponse.json({ error: "Failed to generate sign-in link" }, { status: 500 });
    }

    const signInUrl = `${appUrl}/auth/verify?token=${token}&email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`;

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM ?? "RankyPulse <onboarding@resend.dev>",
      to: email,
      subject: "Your RankyPulse sign-in link",
      html: buildMagicLinkEmail(signInUrl),
    });

    if (error) {
      console.error("[magic-link]", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[magic-link]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

function buildMagicLinkEmail(signInUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d0f14;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0f14;padding:40px 0;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#13161f;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
        <tr><td style="padding:32px 32px 0;text-align:center;">
          <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:24px;">
            <div style="width:32px;height:32px;background:linear-gradient(135deg,#6366f1,#9333ea);border-radius:8px;display:inline-block;vertical-align:middle;"></div>
            <span style="font-size:20px;font-weight:700;color:#ffffff;vertical-align:middle;">RankyPulse</span>
          </div>
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;">Sign in to RankyPulse</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#9ca3af;">Click the button below to sign in — no password needed.</p>
        </td></tr>
        <tr><td style="padding:0 32px 32px;text-align:center;">
          <a href="${signInUrl}" style="display:inline-block;background:#6366f1;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;margin-bottom:24px;">Sign in to RankyPulse</a>
          <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">This link expires in <strong style="color:#9ca3af;">15 minutes</strong>.</p>
          <p style="margin:0;font-size:12px;color:#4b5563;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="margin:24px 0;border:none;border-top:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0;font-size:11px;color:#374151;">If the button doesn't work, copy and paste this URL into your browser:<br>
            <span style="color:#6366f1;word-break:break-all;">${signInUrl}</span>
          </p>
        </td></tr>
      </table>
      <p style="margin-top:24px;font-size:12px;color:#374151;">&copy; ${new Date().getFullYear()} RankyPulse. All rights reserved.</p>
    </td></tr>
  </table>
</body>
</html>`;
}
