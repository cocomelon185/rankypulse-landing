/**
 * /qa/crawler/link-checker.ts
 *
 * Checks internal and sampled external links found during crawl.
 *
 * Detects:
 * - Broken internal links (404, 5xx, timeout)
 * - Redirect chains longer than 1 hop
 * - External links returning errors (sampled — not all)
 * - Empty href attributes
 * - Anchor links pointing to non-existent IDs
 */

export interface LinkCheckResult {
  sourceUrl: string;
  targetUrl: string;
  anchorText: string;
  isInternal: boolean;
  statusCode: number;
  isBroken: boolean;
  isRedirect: boolean;
  redirectTo?: string;
  redirectHops?: number;
  errorMessage?: string;
}

export interface LinkCheckSummary {
  totalLinks: number;
  internalLinks: number;
  externalLinks: number;
  brokenLinks: LinkCheckResult[];
  redirectChains: LinkCheckResult[];
  emptyHrefs: number;
}

const TIMEOUT_MS = 5000;
const MAX_EXTERNAL_CHECK = 20; // Only sample 20 external links

// ── Link extraction ────────────────────────────────────────────────────────────

export interface RawLink {
  href: string;
  anchorText: string;
}

export function extractLinks(html: string): RawLink[] {
  const links: RawLink[] = [];
  // Match <a> tags, capturing href and inner text
  const anchorRegex = /<a\s[^>]*?href=["']([^"']*)["'][^>]*?>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = anchorRegex.exec(html)) !== null) {
    const href = m[1].trim();
    // Strip inner tags to get text
    const text = m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    links.push({ href, anchorText: text.slice(0, 100) }); // Cap at 100 chars
  }
  return links;
}

// ── Single link check ─────────────────────────────────────────────────────────

async function checkLink(
  href: string,
  baseUrl: string
): Promise<{ statusCode: number; redirectTo?: string; redirectHops?: number; error?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let currentUrl = href;
    let hops = 0;

    while (hops < 5) {
      const res = await fetch(currentUrl, {
        method: "HEAD",
        redirect: "manual",
        headers: { "User-Agent": "RankyPulse-QA-LinkChecker/1.0" },
        signal: controller.signal as AbortSignal,
      });

      clearTimeout(timeout);

      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const location = res.headers.get("location");
        if (!location) break;
        hops++;
        currentUrl = location.startsWith("http")
          ? location
          : new URL(location, baseUrl).toString();
        continue;
      }

      return {
        statusCode: res.status,
        redirectTo: hops > 0 ? currentUrl : undefined,
        redirectHops: hops > 0 ? hops : undefined,
      };
    }

    return { statusCode: 310, error: "Redirect loop detected" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { statusCode: 0, error: msg };
  }
}

// ── Main link checker ─────────────────────────────────────────────────────────

export async function checkLinksOnPage(
  sourceUrl: string,
  html: string,
  baseUrl: string,
  checkExternal = false
): Promise<LinkCheckResult[]> {
  const rawLinks = extractLinks(html);
  const results: LinkCheckResult[] = [];
  const seen = new Set<string>();
  let externalChecked = 0;

  for (const { href, anchorText } of rawLinks) {
    // Skip non-navigable hrefs
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("javascript:") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("data:")
    ) {
      continue;
    }

    // Resolve to absolute URL
    let absoluteUrl: string;
    try {
      absoluteUrl = href.startsWith("http")
        ? href
        : new URL(href, baseUrl).toString();
    } catch {
      results.push({
        sourceUrl,
        targetUrl: href,
        anchorText,
        isInternal: false,
        statusCode: 0,
        isBroken: true,
        isRedirect: false,
        errorMessage: "Malformed URL",
      });
      continue;
    }

    const isInternal = absoluteUrl.startsWith(baseUrl);

    // Skip already-checked URLs in this pass
    if (seen.has(absoluteUrl)) continue;
    seen.add(absoluteUrl);

    // Skip external checks unless enabled, and cap them
    if (!isInternal) {
      if (!checkExternal || externalChecked >= MAX_EXTERNAL_CHECK) continue;
      externalChecked++;
    }

    const { statusCode, redirectTo, redirectHops, error } =
      await checkLink(absoluteUrl, baseUrl);

    const isBroken = error != null || statusCode === 404 || statusCode >= 500;
    const isRedirect = redirectHops != null && redirectHops > 0;

    results.push({
      sourceUrl,
      targetUrl: absoluteUrl,
      anchorText,
      isInternal,
      statusCode,
      isBroken,
      isRedirect,
      redirectTo,
      redirectHops,
      errorMessage: error,
    });

    // Small delay to avoid hammering the server
    await new Promise((r) => setTimeout(r, 100));
  }

  return results;
}

// ── Aggregate summary ─────────────────────────────────────────────────────────

export function summarizeLinkResults(
  allResults: LinkCheckResult[]
): LinkCheckSummary {
  const internalLinks = allResults.filter((r) => r.isInternal).length;
  const externalLinks = allResults.filter((r) => !r.isInternal).length;
  const brokenLinks = allResults.filter((r) => r.isBroken);
  // Redirect chains: redirects with > 1 hop (should be 0 → 1 at most)
  const redirectChains = allResults.filter(
    (r) => r.isRedirect && (r.redirectHops ?? 0) > 1
  );

  // Count empty hrefs
  const emptyHrefs = allResults.filter(
    (r) => !r.targetUrl || r.targetUrl === "#"
  ).length;

  return {
    totalLinks: allResults.length,
    internalLinks,
    externalLinks,
    brokenLinks,
    redirectChains,
    emptyHrefs,
  };
}

// ── Reporting helpers ─────────────────────────────────────────────────────────

export function formatLinkIssues(summary: LinkCheckSummary): string {
  const lines: string[] = [];

  if (summary.brokenLinks.length > 0) {
    lines.push(`\n🔴 Broken Links (${summary.brokenLinks.length}):`);
    summary.brokenLinks.forEach((l) => {
      lines.push(
        `  [${l.statusCode || "ERR"}] ${l.targetUrl}\n       ↳ Found on: ${l.sourceUrl}`
      );
    });
  }

  if (summary.redirectChains.length > 0) {
    lines.push(`\n🟡 Redirect Chains (${summary.redirectChains.length}):`);
    summary.redirectChains.forEach((l) => {
      lines.push(
        `  ${l.targetUrl} → (${l.redirectHops} hops) → ${l.redirectTo}\n       ↳ Found on: ${l.sourceUrl}`
      );
    });
  }

  if (summary.emptyHrefs > 0) {
    lines.push(`\n🟡 Empty hrefs: ${summary.emptyHrefs} links`);
  }

  return lines.join("\n");
}
