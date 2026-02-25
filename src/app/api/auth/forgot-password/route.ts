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
    const email = typeof body.email === "string" ? body.email.trim() : null;
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

    const resetToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // +1 hour

    // Store token in Supabase
    await supabaseAdmin.from("auth_tokens").insert({
      token: resetToken,
      email,
      type: "password_reset",
      expires_at: expiresAt,
    });

    const resetUrl = `${appUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM ?? "RankyPulse <onboarding@resend.dev>",
      to: email,
      subject: "Reset your RankyPulse password",
      html: `
        <h2>Reset your password</h2>
        <p>Click the link below to reset your RankyPulse password:</p>
        <p><a href="${resetUrl}" style="color:#6366f1;">Reset password</a></p>
        <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
        <p>— RankyPulse</p>
      `,
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
