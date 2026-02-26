import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { findUserByEmail } from "@/lib/db-users";

const resend = new Resend(process.env.RESEND_API_KEY);
const appUrl =
  process.env.NEXTAUTH_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
  "https://rankypulse.com";
const fromAddress = process.env.RESEND_FROM ?? "RankyPulse <onboarding@resend.dev>";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : null;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn("[forgot-username] RESEND_API_KEY not set — simulating success");
      return NextResponse.json({ ok: true });
    }

    const user = await findUserByEmail(email);

    if (user) {
      const signInUrl = `${appUrl}/auth/signin`;
      await resend.emails.send({
        from: fromAddress,
        to: email,
        subject: "Your RankyPulse username",
        html: buildForgotUsernameEmail(user.username, signInUrl),
      });
    }
    // Always return success to prevent email enumeration
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[forgot-username]", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

function buildForgotUsernameEmail(username: string, signInUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d0f14;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0f14;padding:40px 0;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#13161f;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
        <tr><td style="padding:32px 32px 0;text-align:center;">
          <div style="margin-bottom:24px;">
            <div style="width:32px;height:32px;background:linear-gradient(135deg,#6366f1,#9333ea);border-radius:8px;display:inline-block;vertical-align:middle;margin-right:8px;"></div>
            <span style="font-size:20px;font-weight:700;color:#ffffff;vertical-align:middle;">RankyPulse</span>
          </div>
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;">Your username</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#9ca3af;">Here's the username associated with your RankyPulse account.</p>
        </td></tr>
        <tr><td style="padding:0 32px 32px;text-align:center;">
          <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:16px 24px;margin-bottom:24px;display:inline-block;">
            <p style="margin:0;font-size:13px;color:#9ca3af;margin-bottom:4px;">Your username</p>
            <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">${username}</p>
          </div>
          <br>
          <a href="${signInUrl}" style="display:inline-block;background:#6366f1;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;margin-bottom:24px;">Sign In</a>
          <p style="margin:0;font-size:12px;color:#4b5563;">If you didn't request this, you can safely ignore this email.</p>
        </td></tr>
      </table>
      <p style="margin-top:24px;font-size:12px;color:#374151;">&copy; ${new Date().getFullYear()} RankyPulse. All rights reserved.</p>
    </td></tr>
  </table>
</body>
</html>`;
}
