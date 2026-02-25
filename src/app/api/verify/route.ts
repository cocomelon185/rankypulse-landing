export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const FETCH_TIMEOUT_MS = 10_000;
const USER_AGENT =
  "RankyPulseBot/1.0 (+https://rankypulse.com) Mozilla/5.0";

const CMS_SIGNATURES: { cms: string; pattern: RegExp }[] = [
  { cms: "WordPress", pattern: /wp-content|wp-includes|wordpress/i },
  { cms: "Shopify", pattern: /cdn\.shopify\.com|Shopify\.theme/i },
  { cms: "Webflow", pattern: /webflow\.com|data-wf-/i },
  { cms: "Wix", pattern: /wix\.com|wixsite\.com|X-Wix-/i },
  { cms: "Squarespace", pattern: /squarespace\.com|sqsp\.net/i },
];

function detectCms(html: string): string | null {
  for (const sig of CMS_SIGNATURES) {
    if (sig.pattern.test(html)) return sig.cms;
  }
  return null;
}

function getFirstMatch(html: string, re: RegExp): string {
  const m = html.match(re);
  return m?.[1]?.trim() ?? "";
}

type VerifyIssue = { code: string; message: string };

function analyzeHtml(
  html: string,
  issueId: string,
): {
  currentTitle: string;
  currentDescription: string;
  hasMetaDescription: boolean;
  length: number;
  issues: VerifyIssue[];
} {
  const title = getFirstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDesc = getFirstMatch(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  );

  const issues: VerifyIssue[] = [];

  if (issueId.includes("meta_description") || issueId.includes("meta_desc")) {
    if (!metaDesc) {
      issues.push({ code: "meta_description_missing", message: "Meta description is still missing" });
    } else if (metaDesc.length < 140) {
      issues.push({ code: "meta_description_short", message: `Meta description is too short (${metaDesc.length} chars)` });
    } else if (metaDesc.length > 160) {
      issues.push({ code: "meta_description_long", message: `Meta description may be truncated (${metaDesc.length} chars)` });
    }
  }

  if (issueId.includes("title")) {
    if (!title) {
      issues.push({ code: "title_missing", message: "Title tag is still missing" });
    } else if (title.length > 60) {
      issues.push({ code: "title_long", message: `Title is still too long (${title.length} chars)` });
    }
  }

  if (issueId.includes("canonical")) {
    const canonical = getFirstMatch(
      html,
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i,
    );
    if (!canonical) {
      issues.push({ code: "canonical_missing", message: "Canonical link tag is still missing" });
    }
  }

  if (issueId.includes("h1") || issueId.includes("heading")) {
    const h1 = getFirstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (!h1) {
      issues.push({ code: "h1_missing", message: "H1 heading is still missing" });
    }
  }

  return {
    currentTitle: title,
    currentDescription: metaDesc,
    hasMetaDescription: !!metaDesc,
    length: metaDesc.length,
    issues,
  };
}

function isAllowedUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

type ErrorCode =
  | "TIMEOUT"
  | "DNS"
  | "TLS"
  | "CONN_REFUSED"
  | "BLOCKED"
  | "FETCH_FAILED";

function classifyError(err: unknown): { code: ErrorCode; message: string } {
  if (!(err instanceof Error)) {
    return { code: "FETCH_FAILED", message: String(err) };
  }

  const msg = err.message.toLowerCase();
  const causMsg =
    err.cause instanceof Error ? err.cause.message.toLowerCase() : "";
  const combined = `${msg} ${causMsg} ${err.name.toLowerCase()}`;

  if (err.name === "AbortError" || combined.includes("abort") || combined.includes("timeout")) {
    return { code: "TIMEOUT", message: `Request timed out after ${FETCH_TIMEOUT_MS / 1000}s` };
  }
  if (combined.includes("enotfound") || combined.includes("getaddrinfo")) {
    return { code: "DNS", message: "DNS lookup failed — hostname not found" };
  }
  if (combined.includes("cert") || combined.includes("tls") || combined.includes("ssl") || combined.includes("unable to verify")) {
    return { code: "TLS", message: "TLS/SSL handshake failed" };
  }
  if (combined.includes("econnrefused") || combined.includes("econnreset")) {
    return { code: "CONN_REFUSED", message: "Connection refused or reset by the server" };
  }

  return { code: "FETCH_FAILED", message: err.message || "Unknown fetch error" };
}

function hintForStatus(status: number): string | null {
  if (status === 403) return "Site may block automated checks; try manual verification or verify fewer pages.";
  if (status === 429) return "Rate-limited by the server; wait a moment and try again.";
  if (status >= 500) return "The target server returned a server error; it may be temporarily down.";
  return null;
}

async function fetchPage(url: string): Promise<{ html: string; status: number }> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: ac.signal,
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
      },
    });
    const html = await res.text();
    return { html, status: res.status };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithHttpFallback(
  url: string,
): Promise<{ html: string; status: number; usedUrl: string }> {
  try {
    const result = await fetchPage(url);
    return { ...result, usedUrl: url };
  } catch (primaryErr) {
    // Only attempt http fallback for example.com (known to have flaky https in some runtimes)
    try {
      const parsed = new URL(url);
      if (parsed.protocol === "https:" && parsed.hostname === "example.com") {
        const httpUrl = url.replace(/^https:/, "http:");
        const result = await fetchPage(httpUrl);
        return { ...result, usedUrl: httpUrl };
      }
    } catch {
      // fallback also failed; throw original error
    }
    throw primaryErr;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pageUrl = searchParams.get("url");
  const issueId = searchParams.get("issueId") ?? "";

  if (!pageUrl) {
    return NextResponse.json(
      { ok: false, error: "Missing url parameter", code: "BAD_REQUEST" },
      { status: 400 },
    );
  }

  if (!isAllowedUrl(pageUrl)) {
    return NextResponse.json(
      { ok: false, error: "Invalid URL — only http/https allowed", code: "BAD_REQUEST", url: pageUrl },
      { status: 400 },
    );
  }

  try {
    const { html, status, usedUrl } = await fetchWithHttpFallback(pageUrl);

    const statusHint = hintForStatus(status);
    if (status >= 400) {
      return NextResponse.json(
        {
          ok: false,
          error: `Page returned HTTP ${status}`,
          code: "BLOCKED",
          hint: statusHint,
          url: usedUrl,
          issues: [],
          cmsDetected: null,
        },
        { status: 502 },
      );
    }

    const result = analyzeHtml(html, issueId);
    const cmsDetected = detectCms(html);

    return NextResponse.json({
      ok: result.issues.length === 0,
      ...result,
      cmsDetected,
      url: usedUrl,
    });
  } catch (err) {
    const { code, message } = classifyError(err);
    const hint =
      code === "TIMEOUT"
        ? "The page took too long to respond. Try again or verify manually."
        : code === "DNS"
          ? "Could not resolve the hostname. Check the URL for typos."
          : code === "TLS"
            ? "TLS handshake failed. The site may have certificate issues."
            : code === "CONN_REFUSED"
              ? "The server refused the connection. It may be down or blocking requests."
              : "Fetch failed unexpectedly. Try again or verify the page manually.";

    return NextResponse.json(
      { ok: false, error: message, code, hint, url: pageUrl, issues: [], cmsDetected: null },
      { status: 502 },
    );
  }
}
