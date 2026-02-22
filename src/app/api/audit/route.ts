import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { isUrlBlocked } from "@/lib/ssrf-guard";
import { runAudit } from "@/lib/audit-engine";
import { isValidAuditUrl, normalizeUrl } from "@/lib/url-validation";

export async function POST(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request));
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const rawUrl = (body?.url as string)?.trim();
    if (!rawUrl) {
      return NextResponse.json(
        { ok: false, error: "URL is required." },
        { status: 400 }
      );
    }

    const url = normalizeUrl(rawUrl);
    if (!isValidAuditUrl(url)) {
      return NextResponse.json(
        { ok: false, error: "Invalid URL. Must be http:// or https://." },
        { status: 400 }
      );
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid URL format." },
        { status: 400 }
      );
    }

    parsed.hash = "";
    const finalUrl = parsed.toString();

    if (isUrlBlocked(parsed)) {
      return NextResponse.json(
        { ok: false, error: "This URL is not allowed for security reasons." },
        { status: 400 }
      );
    }

    const data = await runAudit(finalUrl);

    return NextResponse.json({
      ok: true,
      data: {
        summary: data.summary,
        scores: data.scores,
        issues: data.issues,
        url: data.url,
        hostname: data.hostname,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error";
    if (msg.startsWith("HTTP ") || msg.includes("too large") || msg.includes("HTML")) {
      return NextResponse.json(
        { ok: false, error: msg },
        { status: 400 }
      );
    }
    console.error("[api/audit]", e);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
