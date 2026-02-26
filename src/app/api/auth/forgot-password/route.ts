import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";
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
      console.warn("[forgot-password] RESEND_API_KEY not set — simulating success");
      return NextResponse.json({ ok: true });
    }

    // Check what sign-in methods the user has
    const user = await findUserByEmail(email);

    // If user exists but signed up with Google only, send a "use Google" email instead
    if (user && !user.password_hash && user.google_id) {
      await resend.emails.send({
        from: fromAddress,
        to: email,
        subject: "Sign in to RankyPulse",
        html: buildGoogleOnlyEmail(appUrl),
      });
      // Always return success to prevent email enumeration
      return NextResponse.json({ ok: true });
    }

    const resetToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // Store token in Supabase
    await supabaseAdmin.from("auth_tokens").insert({
      token: resetToken,
      email,
      type: "password_reset",
      expires_at: expiresAt,
    });

    const resetUrl = `${appUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const { error } = await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: "Reset your RankyPulse password",
      html: buildPasswordResetEmail(resetUrl),
    });

    if (error) {
      console.error("[forgot-password]", error);
      return NextResponse.json(
        { error: "Failed to send reset email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

function buildPasswordResetEmail(resetUrl: string): string {
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
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;">Reset your password</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#9ca3af;">We received a request to reset the password for your RankyPulse account.</p>
        </td></tr>
        <tr><td style="padding:0 32px 32px;text-align:center;">
          <a href="${resetUrl}" style="display:inline-block;background:#6366f1;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;margin-bottom:24px;">Reset Password</a>
          <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">This link expires in <strong style="color:#9ca3af;">1 hour</strong> and can only be used once.</p>
          <p style="margin:0;font-size:12px;color:#4b5563;">If you didn't request a password reset, you can safely ignore this email — your password will not be changed.</p>
          <hr style="margin:24px 0;border:none;border-top:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0;font-size:11px;color:#374151;">If the button doesn't work, copy and paste this URL into your browser:<br>
            <span style="color:#6366f1;word-break:break-all;">${resetUrl}</span>
          </p>
        </td></tr>
      </table>
      <p style="margin-top:24px;font-size:12px;color:#374151;">&copy; ${new Date().getFullYear()} RankyPulse. All rights reserved.</p>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildGoogleOnlyEmail(baseUrl: string): string {
  const signInUrl = `${baseUrl}/auth/signin`;
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
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;">Sign in with Google</h1>
          <p style="margin:0 0 16px;font-size:14px;color:#9ca3af;">Your RankyPulse account is linked to Google sign-in — it doesn't have a separate password.</p>
          <p style="margin:0 0 24px;font-size:14px;color:#9ca3af;">To sign in, use the <strong style="color:#e5e7eb;">Continue with Google</strong> button on the sign-in page.</p>
        </td></tr>
        <tr><td style="padding:0 32px 32px;text-align:center;">
          <a href="${signInUrl}" style="display:inline-block;background:#6366f1;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;margin-bottom:24px;">Go to Sign In</a>
          <p style="margin:0;font-size:12px;color:#4b5563;">If you didn't request this, you can safely ignore this email.</p>
        </td></tr>
      </table>
      <p style="margin-top:24px;font-size:12px;color:#374151;">&copy; ${new Date().getFullYear()} RankyPulse. All rights reserved.</p>
    </td></tr>
  </table>
</body>
</html>`;
}
