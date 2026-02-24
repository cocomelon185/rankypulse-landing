import { NextResponse } from "next/server";
import { Resend } from "resend";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_MESSAGE_LENGTH = 10;
const SUPPORT_EMAIL = "support@rankypulse.com";
const DEFAULT_FROM = "RankyPulse <onboarding@resend.dev>";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildContactEmailHtml(opts: {
  name?: string;
  email: string;
  subject?: string;
  message: string;
}) {
  const { name, email, subject, message } = opts;
  const lines: string[] = [
    `<p><strong>From:</strong> ${escapeHtml(email)}</p>`,
    name ? `<p><strong>Name:</strong> ${escapeHtml(name)}</p>` : "",
    `<p><strong>Message:</strong></p>`,
    `<p style="white-space:pre-wrap;background:#f9fafb;padding:12px;border-radius:8px;">${escapeHtml(message)}</p>`,
  ].filter(Boolean);
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Contact form</title></head>
<body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1B2559;">
  <h1 style="font-size:1.25rem;margin:0 0 16px;">Contact form submission</h1>
  ${lines.join("\n")}
  <p style="margin:24px 0 0;font-size:0.75rem;color:#9ca3af;">— RankyPulse Contact Form</p>
</body>
</html>
`.trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = (body?.name || "").trim() || undefined;
    const email = (body?.email || "").trim();
    const subject = (body?.subject || "").trim() || undefined;
    const message = (body?.message || "").trim();

    // Server-side validation
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing email address" },
        { status: 400 }
      );
    }
    if (!message || message.length < MIN_MESSAGE_LENGTH) {
      return NextResponse.json(
        { success: false, error: "Message must be at least 10 characters" },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.RESEND_FROM || DEFAULT_FROM;

    if (apiKey) {
      const resend = new Resend(apiKey);
      const emailSubject = subject ? `[Contact] ${subject}` : "[Contact] New message";
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [SUPPORT_EMAIL],
        replyTo: email,
        subject: emailSubject,
        html: buildContactEmailHtml({ name, email, subject, message }),
      });

      if (error) {
        // eslint-disable-next-line no-console
        console.error("[contact] Resend error:", error);
        return NextResponse.json(
          { success: false, error: error.message || "Failed to send email" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true }, { status: 200 });
    }

    // No Resend configured: log and return success (Cloudflare Email Routing fallback)
    // eslint-disable-next-line no-console
    console.log("[contact] Queued (no RESEND_API_KEY):", {
      email,
      name: name ?? "(none)",
      subject: subject ?? "(none)",
      messagePreview: message.slice(0, 80) + (message.length > 80 ? "…" : ""),
      at: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: true, queued: true },
      { status: 200 }
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[contact] Error:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error ? err.message : "Invalid request",
      },
      { status: 400 }
    );
  }
}
