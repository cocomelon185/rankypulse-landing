import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// ── Types ────────────────────────────────────────────────────────────────────

interface RawIssue {
  id: string;
  sev: "LOW" | "MED" | "HIGH";
  msg: string;
}

interface PageMetadata {
  title?: string;
  outbound_links?: string[];
  depth?: number;
}

interface PageData {
  url: string;
  score: number;
  issues: RawIssue[];
  metadata: PageMetadata;
}

interface PageNode {
  url: string;
  inboundCount: number;
  outboundCount: number;
  depth: number;
  issues: string[];
  suggestedLinks: string[];
}

interface LinkOpportunity {
  sourcePage: string;
  targetPage: string;
  reason: string;
}

interface AnchorEntry {
  text: string;
  count: number;
  targetPage: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Extract path segment from URL for use as proxy anchor text */
function urlToAnchorText(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/$/, "").replace(/^\//, "");
    if (!path) return u.hostname;
    // e.g. /blog/my-seo-guide → "my seo guide"
    const last = path.split("/").pop() ?? path;
    return last.replace(/[-_]/g, " ").replace(/\.[a-z]{2,5}$/i, "").trim() || u.hostname;
  } catch {
    return url;
  }
}

/** Normalise a URL: strip trailing slash, enforce https scheme, lowercase */
function normaliseUrl(url: string, domain: string): string {
  // Handle relative URLs
  if (url.startsWith("/")) {
    return `https://${domain}${url}`.replace(/\/$/, "");
  }
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}${u.pathname}`.replace(/\/$/, "");
  } catch {
    return url;
  }
}

// ── Main handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const domainParam = req.nextUrl.searchParams.get("domain");

  try {
    // ── 1. Find latest completed crawl jobs ──────────────────────────────
    const { data: allJobs } = await supabaseAdmin
      .from("crawl_jobs")
      .select("id, domain, created_at, pages_crawled")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(20);

    // Deduplicate: one job per domain (latest)
    const domainJobMap = new Map<string, { id: string; domain: string; created_at: string }>();
    for (const job of allJobs ?? []) {
      if (!domainJobMap.has(job.domain)) domainJobMap.set(job.domain, job);
    }

    const allDomains = [...domainJobMap.keys()];

    if (allDomains.length === 0) {
      return NextResponse.json({ domain: null, allDomains: [], overview: null, pages: [], linkOpportunities: [], anchorSummary: null });
    }

    // ── 2. Select target domain + job ────────────────────────────────────
    let targetDomain: string | null =
      domainParam && allDomains.includes(domainParam) ? domainParam : null;
    let latestJob: { id: string; domain: string; created_at: string } | null = null;
    let rawPages: Array<{ url: string; score: number; issues: unknown; metadata: unknown }> | null = null;

    if (targetDomain) {
      const job = domainJobMap.get(targetDomain)!;
      const { data, error } = await supabaseAdmin
        .from("audit_pages")
        .select("url, score, issues, metadata")
        .eq("job_id", job.id);
      if (!error && data && data.length > 0) {
        latestJob = job;
        rawPages = data;
      }
    }

    if (!latestJob) {
      for (const [dom, job] of domainJobMap) {
        const { data, error } = await supabaseAdmin
          .from("audit_pages")
          .select("url, score, issues, metadata")
          .eq("job_id", job.id);
        if (!error && data && data.length > 0) {
          latestJob = job;
          rawPages = data;
          targetDomain = dom;
          break;
        }
      }
    }

    if (!latestJob || !rawPages || rawPages.length === 0) {
      return NextResponse.json({
        domain: allDomains[0] ?? null,
        allDomains,
        overview: null,
        pages: [],
        linkOpportunities: [],
        anchorSummary: null,
      });
    }

    const domain = latestJob.domain;

    // ── 3. Parse pages ───────────────────────────────────────────────────
    const pages: PageData[] = rawPages.map((p) => ({
      url: p.url as string,
      score: p.score as number,
      issues: Array.isArray(p.issues) ? (p.issues as RawIssue[]) : [],
      metadata: ((p.metadata as PageMetadata) ?? {}),
    }));

    // ── 4. Build link graph ──────────────────────────────────────────────
    // inboundMap[url] = list of source URLs that link to url
    const inboundMap = new Map<string, string[]>();
    const allCrawledUrls = new Set(pages.map((p) => p.url));

    // Initialise every page with empty inbound list
    for (const url of allCrawledUrls) inboundMap.set(url, []);

    // Track all linked-to URLs (for orphan detection)
    const allLinkedUrls = new Set<string>();

    for (const page of pages) {
      const outboundLinks = page.metadata?.outbound_links ?? [];
      for (const rawLink of outboundLinks) {
        const norm = normaliseUrl(rawLink, domain);
        allLinkedUrls.add(norm);
        // Only count inbound within the crawled set
        if (allCrawledUrls.has(norm)) {
          const arr = inboundMap.get(norm) ?? [];
          if (!arr.includes(page.url)) arr.push(page.url);
          inboundMap.set(norm, arr);
        }
      }
    }

    // ── 5. Compute overview metrics ──────────────────────────────────────
    const rootUrl = `https://${domain}`;
    const rootUrlWww = `https://www.${domain}`;

    const totalInternalLinks = pages.reduce(
      (sum, p) => sum + (p.metadata?.outbound_links?.length ?? 0),
      0
    );
    const avgLinksPerPage = pages.length > 0
      ? Math.round((totalInternalLinks / pages.length) * 10) / 10
      : 0;

    const orphanPages = [...allCrawledUrls].filter(
      (url) =>
        url !== rootUrl &&
        url !== rootUrlWww &&
        !allLinkedUrls.has(url) &&
        !allLinkedUrls.has(url.replace(/\/$/, ""))
    );

    const heavyPages = pages
      .filter((p) => (p.metadata?.outbound_links?.length ?? 0) > 80)
      .map((p) => p.url);

    const brokenLinkPages = pages.filter((p) =>
      p.issues.some((i) => i.id === "broken_links")
    ).length;

    // ── 6. Build PageNode array ──────────────────────────────────────────
    // For "suggested links": pages at similar depth that don't already link to each other
    const MAX_SUGGESTIONS = 3;
    const MAX_OPPORTUNITIES = 30;

    const pageNodes: PageNode[] = pages.map((page) => {
      const outboundLinks = new Set(
        (page.metadata?.outbound_links ?? []).map((l) => normaliseUrl(l, domain))
      );
      const inboundSources = inboundMap.get(page.url) ?? [];
      const depth = page.metadata?.depth ?? 0;

      // Suggested links: pages at similar depth (±1) that this page doesn't link to yet
      const suggested = pages
        .filter((other) => {
          if (other.url === page.url) return false;
          if (outboundLinks.has(other.url)) return false;
          const otherDepth = other.metadata?.depth ?? 0;
          return Math.abs(otherDepth - depth) <= 1;
        })
        .slice(0, MAX_SUGGESTIONS)
        .map((o) => o.url);

      return {
        url: page.url,
        inboundCount: inboundSources.length,
        outboundCount: page.metadata?.outbound_links?.length ?? 0,
        depth,
        issues: page.issues.map((i) => i.id),
        suggestedLinks: suggested,
      };
    });

    // Sort by inbound (most linked first)
    pageNodes.sort((a, b) => b.inboundCount - a.inboundCount);

    // ── 7. Link opportunities ────────────────────────────────────────────
    const linkOpportunities: LinkOpportunity[] = [];

    outer: for (const page of pages) {
      const outboundLinks = new Set(
        (page.metadata?.outbound_links ?? []).map((l) => normaliseUrl(l, domain))
      );
      const depth = page.metadata?.depth ?? 0;

      for (const other of pages) {
        if (other.url === page.url) continue;
        if (outboundLinks.has(other.url)) continue;

        const otherDepth = other.metadata?.depth ?? 0;
        if (Math.abs(otherDepth - depth) > 1) continue;

        linkOpportunities.push({
          sourcePage: page.url,
          targetPage: other.url,
          reason: otherDepth === depth ? "same depth" : "adjacent depth",
        });

        if (linkOpportunities.length >= MAX_OPPORTUNITIES) break outer;
      }
    }

    // ── 8. Anchor text analysis ──────────────────────────────────────────
    // Since outbound_links are URL arrays (no anchor text stored),
    // use URL path as proxy anchor text
    const anchorCounts = new Map<string, { count: number; targetPage: string }>();

    for (const page of pages) {
      for (const rawLink of page.metadata?.outbound_links ?? []) {
        const norm = normaliseUrl(rawLink, domain);
        if (!allCrawledUrls.has(norm)) continue; // internal only
        const anchor = urlToAnchorText(norm);
        const existing = anchorCounts.get(anchor);
        if (existing) {
          existing.count++;
        } else {
          anchorCounts.set(anchor, { count: 1, targetPage: norm });
        }
      }
    }

    const topAnchors: AnchorEntry[] = [...anchorCounts.entries()]
      .map(([text, { count, targetPage }]) => ({ text, count, targetPage }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    const totalAnchors = [...anchorCounts.values()].reduce((s, v) => s + v.count, 0);
    const uniqueAnchors = anchorCounts.size;

    // ── 9. Return response ───────────────────────────────────────────────
    return NextResponse.json({
      domain,
      allDomains,
      overview: {
        totalInternalLinks,
        avgLinksPerPage,
        orphanPages,
        heavyPages,
        brokenLinkPages,
      },
      pages: pageNodes,
      linkOpportunities,
      anchorSummary: {
        totalAnchors,
        uniqueAnchors,
        topAnchors,
      },
    });
  } catch (error) {
    console.error("Error in /api/internal-links:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
