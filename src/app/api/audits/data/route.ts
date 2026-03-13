import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { ISSUE_META } from "@/lib/dashboard-data";
import { calculateSeoScore, computeSeoScore, calculateUrgencyMetrics } from "@/lib/seo-score";
import { resolveSharedAuditContext } from "@/lib/shared-audits";

interface RawIssue {
  id: string;
  sev: "LOW" | "MED" | "HIGH";
  msg: string;
}

interface PageMetadata {
  title?: string;
  meta_description?: string;
  outbound_links?: string[];
  broken_link_targets?: string[];
  depth?: number;
}

interface AuditPage {
  url: string;
  score: number | null;
  issues: RawIssue[] | null;
  metadata?: PageMetadata | null;
}

const sevToSeverity = (sev: string): "error" | "warning" | "notice" => {
  if (sev === "HIGH") return "error";
  if (sev === "MED") return "warning";
  return "notice";
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const domainParam = req.nextUrl.searchParams.get("domain");

  try {
    const { latestJob, targetDomain } = await resolveSharedAuditContext(userId, domainParam);

    if (!latestJob || !targetDomain) {
      return NextResponse.json({
        healthScore: 0,
        errors: 0,
        warnings: 0,
        notices: 0,
        domain: domainParam ?? null,
        crawledAt: null,
        totalPages: 0,
        issues: [],
      });
    }

    // ── Previous completed job for score delta ────────────────────────────────
    let previousScore: number | null = null;
    try {
      const completedJobQuery = supabaseAdmin
        .from("crawl_jobs")
        .select("id")
        .eq("domain", targetDomain)
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      const { data: prevJob } = await (
        latestJob.status === "completed"
          ? completedJobQuery.range(1, 1).maybeSingle()
          : completedJobQuery.limit(1).maybeSingle()
      );

      if (prevJob?.id) {
        const { data: prevPages } = await supabaseAdmin
          .from("audit_pages")
          .select("score")
          .eq("job_id", prevJob.id);
        if (prevPages && prevPages.length > 0) {
          previousScore = calculateSeoScore(prevPages as { score: number | null }[]);
        }
      }
    } catch { /* non-critical */ }

    // ── All audit pages for that job ──────────────────────────────────────────
    const { data: rawPages } = await supabaseAdmin
      .from("audit_pages")
      .select("url, score, issues, metadata")
      .eq("job_id", latestJob.id);

    const pages: AuditPage[] = (rawPages ?? []).map((p) => ({
      url: p.url,
      score: p.score ?? null,
      issues: Array.isArray(p.issues) ? (p.issues as RawIssue[]) : [],
      metadata: (p.metadata as PageMetadata) ?? null,
    }));

    // Exclude synthetic __site_level__ row from real-page counts
    const realPages = pages.filter(p => p.url !== "__site_level__");
    const totalPages = realPages.length;

    // ── Aggregate issues across all pages grouped by issue ID ─────────────────
    const issueMap: Record<string, { sev: string; count: number }> = {};
    const issueUrlMap: Record<string, string[]> = {};
    for (const page of pages) {
      for (const issue of page.issues ?? []) {
        if (!issueMap[issue.id]) {
          issueMap[issue.id] = { sev: issue.sev, count: 0 };
          issueUrlMap[issue.id] = [];
        }
        issueMap[issue.id].count++;
        // Don't push __site_level__ as an "affected URL" for display
        if (issueUrlMap[issue.id].length < 10 && page.url !== "__site_level__") {
          issueUrlMap[issue.id].push(page.url);
        }
      }
    }

    // ── Post-crawl analysis: duplicate titles, duplicate meta, orphan pages ──
    const titleMap: Record<string, string[]> = {};
    const metaDescMap: Record<string, string[]> = {};
    const linkedSet = new Set<string>();
    const homepage = `https://${targetDomain}`;

    for (const page of realPages) {
      const meta = page.metadata;
      const title = meta?.title?.trim();
      const desc  = meta?.meta_description?.trim();
      if (title) { titleMap[title] = [...(titleMap[title] ?? []), page.url]; }
      if (desc)  { metaDescMap[desc]  = [...(metaDescMap[desc]  ?? []), page.url]; }
      for (const lnk of meta?.outbound_links ?? []) { linkedSet.add(lnk); }
    }

    const dupTitleUrls = new Set(Object.values(titleMap).filter(u => u.length > 1).flat());
    const dupMetaUrls  = new Set(Object.values(metaDescMap).filter(u => u.length > 1).flat());
    const homepageWww  = `https://www.${targetDomain}`;
    const orphanUrls   = new Set(
      realPages.map(p => p.url).filter(
        url => url !== homepage && url !== homepageWww && !linkedSet.has(url)
      )
    );

    if (dupTitleUrls.size > 0) {
      issueMap["duplicate_title"]  = { sev: "MED", count: dupTitleUrls.size };
      issueUrlMap["duplicate_title"]  = [...dupTitleUrls].slice(0, 10);
    }
    if (dupMetaUrls.size > 0) {
      issueMap["duplicate_meta_description"]  = { sev: "MED", count: dupMetaUrls.size };
      issueUrlMap["duplicate_meta_description"]  = [...dupMetaUrls].slice(0, 10);
    }
    if (orphanUrls.size > 0) {
      issueMap["orphan_page"]  = { sev: "HIGH", count: orphanUrls.size };
      issueUrlMap["orphan_page"]  = [...orphanUrls].slice(0, 10);
    }

    // ── Post-crawl: deep page depth (URL path depth > 3) ─────────────────────
    const deepPages = realPages.filter(p => (p.metadata?.depth ?? 0) > 3);
    if (deepPages.length > 0) {
      issueMap["deep_page_depth"] = { sev: "MED", count: deepPages.length };
      issueUrlMap["deep_page_depth"] = deepPages.map(p => p.url).slice(0, 10);
    }

    // ── Post-crawl: low internal links (<2 inbound) ───────────────────────────
    const inboundCounts: Record<string, number> = {};
    for (const page of realPages) {
      for (const lnk of page.metadata?.outbound_links ?? []) {
        inboundCounts[lnk] = (inboundCounts[lnk] ?? 0) + 1;
      }
    }
    const lowInternalLinkPages = realPages.filter(
      p => p.url !== homepage && p.url !== homepageWww && (inboundCounts[p.url] ?? 0) < 2
    );
    if (lowInternalLinkPages.length > 0 && totalPages > 3) {
      issueMap["low_internal_links"] = { sev: "HIGH", count: lowInternalLinkPages.length };
      issueUrlMap["low_internal_links"] = lowInternalLinkPages.map(p => p.url).slice(0, 10);
    }

    // ── Post-crawl: keyword cannibalization (3+ pages sharing same 5-word title prefix) ──
    const titlePrefixGroups: Record<string, string[]> = {};
    for (const page of realPages) {
      const title = (page.metadata?.title ?? "").trim();
      if (!title || title.length < 10) continue;
      const prefix = title.toLowerCase().split(/\s+/).slice(0, 5).join(" ");
      if (!titlePrefixGroups[prefix]) titlePrefixGroups[prefix] = [];
      titlePrefixGroups[prefix].push(page.url);
    }
    const cannibalizationGroups = Object.values(titlePrefixGroups).filter(urls => urls.length >= 3);
    if (cannibalizationGroups.length > 0) {
      const affectedUrls = [...new Set(cannibalizationGroups.flat())];
      issueMap["keyword_cannibalization"] = { sev: "HIGH", count: affectedUrls.length };
      issueUrlMap["keyword_cannibalization"] = affectedUrls.slice(0, 10);
    }

    // ── Map to display format using ISSUE_META ────────────────────────────────
    const impactOrder: Record<string, number> = { error: 0, warning: 1, notice: 2 };
    const issues = Object.entries(issueMap)
      .map(([id, { sev, count }]) => {
        const meta = ISSUE_META[id] ?? {
          label: id.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
          impact: "low" as const,
          action: "Fix Now",
          actionHref: "/audits/issues",
          gain: null,
        };
        const severity = sevToSeverity(sev);
        return {
          id,
          severity,
          title: meta.label,
          description: meta.gain ?? "Fix this issue to improve your SEO performance",
          urlsAffected: count,
          affectedUrls: issueUrlMap[id] ?? [],
          trend: "0",
          discovered: latestJob.created_at,
        };
      })
      .sort(
        (a, b) =>
          (impactOrder[a.severity] ?? 2) - (impactOrder[b.severity] ?? 2) ||
          b.urlsAffected - a.urlsAffected
      );

    // ── Density-based scoring (Semrush-style, normalized by page count) ───────
    // Count total OCCURRENCES per severity (not just distinct issue types)
    const totalCritical = Object.entries(issueMap)
      .filter(([, v]) => v.sev === "HIGH")
      .reduce((s, [, v]) => s + v.count, 0);
    const totalWarning = Object.entries(issueMap)
      .filter(([, v]) => v.sev === "MED")
      .reduce((s, [, v]) => s + v.count, 0);
    const totalNotice = Object.entries(issueMap)
      .filter(([, v]) => v.sev === "LOW")
      .reduce((s, [, v]) => s + v.count, 0);

    const density = {
      critical: totalPages > 0 ? totalCritical / totalPages : 0,
      warning:  totalPages > 0 ? totalWarning  / totalPages : 0,
      notice:   totalPages > 0 ? totalNotice   / totalPages : 0,
    };

    const finalScore = totalPages > 0 ? computeSeoScore(density) : 0;
    const urgency = calculateUrgencyMetrics(totalCritical);

    // Legacy counts for UI display
    const errors   = issues.filter((i) => i.severity === "error").length;
    const warnings = issues.filter((i) => i.severity === "warning").length;
    const notices  = issues.filter((i) => i.severity === "notice").length;

    // ── Crawl duration (updated_at − created_at) ───────────────────────────────
    const crawlDurationSecs = latestJob.updated_at && latestJob.created_at
      ? Math.max(1, Math.round(
          (new Date(latestJob.updated_at).getTime() - new Date(latestJob.created_at).getTime()) / 1000
        ))
      : null;

    // ── Crawl stats (use realPages, not all pages including __site_level__) ────
    const depths = realPages.map(p => p.metadata?.depth ?? 0);
    const avgDepth = depths.length > 0
      ? Math.round(depths.reduce((a, b) => a + b, 0) / depths.length * 10) / 10
      : 0;
    const deepPageCount = depths.filter(d => d > 3).length;
    const depthDistribution = {
      depth1:    depths.filter(d => d === 1).length,
      depth2:    depths.filter(d => d === 2).length,
      depth3:    depths.filter(d => d === 3).length,
      depth4plus: depths.filter(d => d >= 4).length,
    };

    const rawInternalLinks = realPages.reduce(
      (sum, p) => sum + (p.metadata?.outbound_links?.length ?? 0), 0
    );
    // Fallback estimate for crawls before Phase 4.5 (no outbound_links metadata yet)
    const totalInternalLinks = rawInternalLinks === 0 && realPages.length > 0
      ? Math.round(realPages.length * 4)
      : rawInternalLinks;
    const brokenPageCount   = issueMap["broken_links"]?.count ?? 0;
    const redirectPageCount = issueMap["redirect_chain"]?.count ?? 0;

    // ── Broken link source→target report ──────────────────────────────────────
    const brokenLinksReport: { source: string; targets: string[] }[] = realPages
      .filter(p => (p.metadata?.broken_link_targets?.length ?? 0) > 0)
      .map(p => ({ source: p.url, targets: p.metadata!.broken_link_targets! }))
      .slice(0, 20);

    return NextResponse.json({
      healthScore: finalScore,
      previousScore,
      errors,
      warnings,
      notices,
      domain: targetDomain,
      crawledAt: latestJob.updated_at ?? latestJob.created_at,
      totalPages: totalPages || latestJob.pages_crawled || 0,
      status: latestJob.status,
      issues,
      brokenLinks: brokenLinksReport,
      crawlDuration: crawlDurationSecs,
      urgency,
      density,
      crawlStats: {
        avgDepth,
        deepPageCount,
        totalPages,
        depthDistribution,
        internalLinks: totalInternalLinks,
        brokenPages: brokenPageCount,
        redirectPages: redirectPageCount,
      },
    });
  } catch (err) {
    console.error("Error fetching audit issues data:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
