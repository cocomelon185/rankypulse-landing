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

  // ── Additional checks ───────────────────────────────────────────────

  // Title length
  if (title && title.length < 30) {
    issues.push({ id: "title_short", sev: "LOW", msg: `Title tag too short (${title.length} chars, aim for 30–60)` });
  } else if (title && title.length > 60) {
    issues.push({ id: "title_long", sev: "LOW", msg: `Title tag too long (${title.length} chars, aim for 30–60)` });
  }

  // Meta description length
  if (metaDesc && metaDesc.length < 70) {
    issues.push({ id: "meta_desc_short", sev: "LOW", msg: `Meta description too short (${metaDesc.length} chars, aim for 70–160)` });
  } else if (metaDesc && metaDesc.length > 160) {
    issues.push({ id: "meta_desc_long", sev: "LOW", msg: `Meta description too long (${metaDesc.length} chars, aim for 70–160)` });
  }

  // Multiple H1 tags
  const h1Count = countMatches(html, /<h1[\s>]/gi);
  if (h1Count > 1) {
    issues.push({ id: "multiple_h1", sev: "MED", msg: `Multiple H1 tags found (${h1Count}). Use a single H1 per page` });
  }

  // Open Graph tags
  const ogTitle = getFirstMatch(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i);
  const ogDesc = getFirstMatch(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i);
  const ogImage = getFirstMatch(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i);
  if (!ogTitle || !ogDesc || !ogImage) {
    const missing = [!ogTitle && "og:title", !ogDesc && "og:description", !ogImage && "og:image"].filter(Boolean).join(", ");
    issues.push({ id: "og_tags", sev: "LOW", msg: `Missing Open Graph tags: ${missing}` });
  }

  // Structured data (JSON-LD / schema.org)
  const hasJsonLd = /<script[^>]+type=["']application\/ld\+json["'][^>]*>/i.test(html);
  const hasSchemaOrg = /schema\.org/i.test(html);
  if (!hasJsonLd && !hasSchemaOrg) {
    issues.push({ id: "structured_data", sev: "LOW", msg: "No structured data (JSON-LD / Schema.org) detected" });
  }

  // Viewport meta tag
  const hasViewport = /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html);
  if (!hasViewport) {
    issues.push({ id: "viewport", sev: "MED", msg: "Missing viewport meta tag (hurts mobile usability)" });
  }

  // Lang attribute on <html>
  const hasLang = /<html[^>]+lang=["'][^"']+["']/i.test(html);
  if (!hasLang) {
    issues.push({ id: "html_lang", sev: "LOW", msg: "Missing lang attribute on <html> element" });
  }

  // Large page size
  const pageSizeKB = Math.round(html.length / 1024);
  if (pageSizeKB > 100) {
    issues.push({ id: "large_html", sev: "LOW", msg: `Large HTML page size (${pageSizeKB} KB). Consider reducing` });
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

  // Guardrail: cap at 95 when no issues found (matches full-crawl behaviour)
  if (issues.length === 0 && score === 100) {
    score = 95;
  }

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
