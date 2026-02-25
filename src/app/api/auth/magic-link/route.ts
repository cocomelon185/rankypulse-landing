import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const appUrl =
  process.env.NEXTAUTH_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
  "https://rankypulse.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim() : null;
    const callbackUrl = typeof body.callbackUrl === "string" ? body.callbackUrl : "/dashboard";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn("[magic-link] RESEND_API_KEY not set — simulating success");
      return NextResponse.json({ ok: true });
    }

    const token = crypto.randomUUID();
    const signInUrl = `${appUrl}/auth/verify?token=${token}&email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`;
    // TODO: Store token in DB with email and expiry; /auth/verify validates and creates session

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM ?? "RankyPulse <onboarding@resend.dev>",
      to: email,
      subject: "Sign in to RankyPulse",
      html: `
        <h2>Sign in to RankyPulse</h2>
        <p>Click the link below to sign in:</p>
        <p><a href="${signInUrl}" style="color:#6366f1;">Sign in</a></p>
        <p>This link expires in 15 minutes. If you didn't request this, you can ignore this email.</p>
        <p>— RankyPulse</p>
      `,
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
