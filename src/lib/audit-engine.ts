/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

export type IssueSeverity = "LOW" | "MED" | "HIGH";

export type AuditIssue = {
  id: string;
  sev: IssueSeverity;
  msg: string;
};

export type AuditChecks = {
  fetch_ok: boolean;
  https: boolean;
  title_present: boolean;
  meta_description_present: boolean;
  h1_present: boolean;
  canonical_present: boolean;
  robots_noindex: boolean;
  images_missing_alt: number;
};

export type AuditResult = {
  url: string;
  fetchedAt: string;
  durationMs: number;
  status: number;
  score: number;
  checks: AuditChecks;
  issues: AuditIssue[];
};

function stripTags(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getFirstMatch(html: string, re: RegExp) {
  const m = html.match(re);
  return m && m[1] ? m[1].trim() : "";
}

function countMatches(html: string, re: RegExp) {
  const m = html.match(re);
  return m ? m.length : 0;
}

async function fetchHtml(url: string, timeoutMs = 15000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(new Error("Fetch timeout")), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: ac.signal,
      headers: {
        "user-agent":
          "RankyPulseAuditBot/1.0 (+https://rankypulse.com) Mozilla/5.0",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const status = res.status;
    const ct = res.headers.get("content-type") || "";
    const text = await res.text();

    return { status, contentType: ct, html: text };
  } catch (e: any) {
    const msg =
      e?.name === "AbortError"
        ? "fetch timeout"
        : e?.cause?.message || e?.message || String(e);
    throw new Error(`fetch failed: ${msg}`);
  } finally {
    clearTimeout(t);
  }
}

export async function runAudit(url: string): Promise<AuditResult> {
  const started = Date.now();
  const issues: AuditIssue[] = [];

  const https = /^https:\/\//i.test(url);

  if (!https) {
    issues.push({ id: "https", sev: "MED", msg: "URL is not HTTPS" });
  }

  const { status, contentType, html } = await fetchHtml(url, 15000);

  if (status < 200 || status >= 400) {
    issues.push({
      id: "http_status",
      sev: "HIGH",
      msg: `Non-success HTTP status: ${status}`,
    });
  }

  if (!/text\/html/i.test(contentType) && html.length < 50) {
    issues.push({
      id: "not_html",
      sev: "MED",
      msg: "Response does not look like HTML content",
    });
  }

  const title = getFirstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDesc = getFirstMatch(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i
  );
  const h1 = getFirstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const canonical = getFirstMatch(
    html,
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i
  );
  const robots = getFirstMatch(
    html,
    /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["'][^>]*>/i
  );

  const imagesMissingAlt = (() => {
    const imgTags = html.match(/<img\b[^>]*>/gi) || [];
    let missing = 0;
    for (const tag of imgTags) {
      if (!/\balt\s*=\s*["'][^"']*["']/i.test(tag)) missing += 1;
    }
    return missing;
  })();

  if (!title) issues.push({ id: "title", sev: "HIGH", msg: "Missing <title>" });
  if (!metaDesc)
    issues.push({
      id: "meta_description",
      sev: "MED",
      msg: 'Missing meta description: <meta name="description">',
    });
  if (!h1) issues.push({ id: "h1", sev: "MED", msg: "Missing <h1>" });
  if (!canonical)
    issues.push({
      id: "canonical",
      sev: "MED",
      msg: "Missing canonical link tag",
    });

  const robotsNoindex = /noindex/i.test(robots || "");
  if (robotsNoindex) {
    issues.push({
      id: "noindex",
      sev: "HIGH",
      msg: "Page is set to noindex in robots meta",
    });
  }

  if (imagesMissingAlt > 0) {
    issues.push({
      id: "img_alt",
      sev: "LOW",
      msg: `${imagesMissingAlt} image(s) missing alt attribute`,
    });
  }

  const text = stripTags(html);
  const wordCount = text ? text.split(" ").filter(Boolean).length : 0;
  if (wordCount < 150) {
    issues.push({
      id: "thin_content",
      sev: "LOW",
      msg: `Thin content detected (~${wordCount} words)`,
    });
  }

  const checks: AuditChecks = {
    fetch_ok: true,
    https,
    title_present: !!title,
    meta_description_present: !!metaDesc,
    h1_present: !!h1,
    canonical_present: !!canonical,
    robots_noindex: robotsNoindex,
    images_missing_alt: imagesMissingAlt,
  };

  let score = 100;
  for (const it of issues) {
    if (it.sev === "HIGH") score -= 20;
    if (it.sev === "MED") score -= 10;
    if (it.sev === "LOW") score -= 5;
  }
  if (score < 0) score = 0;

  return {
    url,
    fetchedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    status,
    score,
    checks,
    issues,
  };
}
