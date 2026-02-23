import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** In dev: store in memory for visibility. In production: replace with DB or external service. */
const storedEmails: Array<{ email: string; source?: string; at: string }> = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body?.email || "").trim();
    const source = (body?.source || "unknown") as string;

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    storedEmails.push({ email, source, at: new Date().toISOString() });
    // eslint-disable-next-line no-console
    console.log("[leads] Captured:", { email, source });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
