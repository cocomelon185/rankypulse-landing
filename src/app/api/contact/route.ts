import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

function json(status: number, payload: any) {
  return NextResponse.json(payload, { status });
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function isResendTestModeRestriction(msg: string) {
  const m = (msg || "").toLowerCase();
  return m.includes("testing emails") || m.includes("your own email address");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));

    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const subject = String(body?.subject ?? "New contact form message").trim();
    const message = String(body?.message ?? "").trim();

    if (!email || !isEmail(email)) return json(400, { success: false, error: "Please enter a valid email address" });
    if (!message || message.length < 10) return json(400, { success: false, error: "Message must be at least 10 characters" });

    const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
    const FROM = process.env.RESEND_FROM || "";
    const TO = process.env.CONTACT_TO_EMAIL || process.env.RESEND_TO || "";

    if (!RESEND_API_KEY) {
      console.log("[contact] Queued (no RESEND_API_KEY):", { name, email, subject, messageLength: message.length });
      return json(200, { success: true, queued: true, provider: "no_provider" });
    }

    if (!TO) {
      console.log("[contact] Queued (no CONTACT_TO_EMAIL/RESEND_TO):", { name, email, subject, messageLength: message.length });
      return json(200, { success: true, queued: true, provider: "missing_to" });
    }

    const fromAddress = FROM || "onboarding@resend.dev";

    const html = `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">
        <h2>New contact form submission</h2>
        <p><b>Name:</b> ${escapeHtml(name || "—")}</p>
        <p><b>Email:</b> ${escapeHtml(email)}</p>
        <p><b>Subject:</b> ${escapeHtml(subject)}</p>
        <p><b>Message:</b></p>
        <pre style="white-space:pre-wrap;background:#f6f7f9;padding:12px;border-radius:8px">${escapeHtml(message)}</pre>
      </div>
    `;

    const payload = {
      from: fromAddress,
      to: [TO],
      reply_to: email,
      subject,
      html,
    };

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const out = await r.json().catch(() => ({} as any));

    if (!r.ok) {
      const msg = String(out?.message || out?.error || `Resend error (${r.status})`);
      if (isResendTestModeRestriction(msg)) {
        console.warn("[contact] Resend test-mode restriction (soft success):", msg);
        return json(200, { success: true, queued: true, provider: "resend_test_mode" });
      }
      console.error("[contact] Resend error:", msg, out);
      return json(500, { success: false, error: msg });
    }

    return json(200, { success: true });
  } catch (err: any) {
    console.error("[contact] Error:", err);
    return json(500, { success: false, error: err?.message ?? "Internal error" });
  }
}

function escapeHtml(s: string) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
