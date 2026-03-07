import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { ISSUE_META } from "@/lib/dashboard-data";

const BUILD_VERSION = "2026-03-07-v4";

interface Task {
  id: string;
  title: string;
  description: string;
  severity: "error" | "warning" | "notice";
  effort: "easy" | "medium" | "hard";
  estimatedPoints: number;
  affectedPages: number;
  actionHref: string;
  status: "todo" | "in_progress" | "done";
  progress: number;
}

interface RawIssue {
  id: string;
  sev: "LOW" | "MED" | "HIGH";
  msg: string;
}

interface PageMetadata {
  title?: string;
  meta_description?: string;
  outbound_links?: string[];
  depth?: number;
}

const sevToSeverity = (sev: string): "error" | "warning" | "notice" => {
  if (sev === "HIGH") return "error";
  if (sev === "MED") return "warning";
  return "notice";
};

// impact → effort mapping
const impactToEffort: Record<string, "easy" | "medium" | "hard"> = {
  low: "easy",
  medium: "medium",
  high: "medium",
};

// severity → base estimated points
const basePoints: Record<string, number> = { error: 8, warning: 5, notice: 2 };

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const debug = req.nextUrl.searchParams.get("debug") === "true";

  try {
    // ── Find the best completed crawl job (one that actually has audit_pages) ──
    const { data: recentJobs } = await supabaseAdmin
      .from("crawl_jobs")
      .select("id, domain, created_at")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(5);

    console.log("[ActionCenter] userId:", userId, "recentJobs:", recentJobs?.length ?? 0);

    if (!recentJobs || recentJobs.length === 0) {
      return NextResponse.json({
        tasks: [],
        domain: null,
        ...(debug ? { _debug: { buildVersion: BUILD_VERSION, reason: "no_completed_jobs", userId } } : {}),
      });
    }

    // Try each job until we find one with actual audit_pages data
    let latestJob: typeof recentJobs[0] | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let rawPages: any[] | null = null;
    const skippedJobs: string[] = [];

    for (const job of recentJobs) {
      const { data, error } = await supabaseAdmin
        .from("audit_pages")
        .select("url, score, issues, metadata")
        .eq("job_id", job.id);

      console.log("[ActionCenter] trying job:", job.id, "domain:", job.domain, "pages:", data?.length ?? "null", "error:", error);

      if (!error && data && data.length > 0) {
        latestJob = job;
        rawPages = data;
        break;
      }
      skippedJobs.push(`${job.domain}(${job.id.slice(0, 8)})`);
    }

    if (!latestJob || !rawPages || rawPages.length === 0) {
      return NextResponse.json({
        tasks: [],
        domain: recentJobs[0]?.domain ?? null,
        ...(debug ? { _debug: { buildVersion: BUILD_VERSION, reason: "no_jobs_with_pages", skippedJobs, totalJobs: recentJobs.length } } : {}),
      });
    }

    const jobId = latestJob.id;
    const domain = latestJob.domain;

    console.log("[ActionCenter] selected job:", jobId, "domain:", domain, "pages:", rawPages.length, "skipped:", skippedJobs);

    const pages = (rawPages ?? []).map((p) => ({
      url: p.url as string,
      issues: Array.isArray(p.issues) ? (p.issues as RawIssue[]) : [],
      metadata: (p.metadata as PageMetadata) ?? null,
    }));

    // ── Aggregate stored issues (from crawler) ────────────────────────────
    const issueMap: Record<string, { sev: string; count: number }> = {};
    for (const page of pages) {
      for (const issue of page.issues) {
        if (!issueMap[issue.id]) issueMap[issue.id] = { sev: issue.sev, count: 0 };
        issueMap[issue.id].count++;
      }
    }

    console.log("[ActionCenter] pages:", pages.length, "storedIssues:", Object.keys(issueMap).length, "issueIds:", Object.keys(issueMap));

    // ── Post-crawl metadata analysis (mirrors /api/audits/data logic) ─────
    const titleMap: Record<string, string[]> = {};
    const metaDescMap: Record<string, string[]> = {};
    const linkedSet = new Set<string>();
    const homepage = `https://${domain}`;
    const homepageWww = `https://www.${domain}`;

    for (const page of pages) {
      const meta = page.metadata;
      const title = meta?.title?.trim();
      const desc = meta?.meta_description?.trim();
      if (title) titleMap[title] = [...(titleMap[title] ?? []), page.url];
      if (desc) metaDescMap[desc] = [...(metaDescMap[desc] ?? []), page.url];
      for (const lnk of meta?.outbound_links ?? []) linkedSet.add(lnk);
    }

    const dupTitleUrls = new Set(Object.values(titleMap).filter(u => u.length > 1).flat());
    const dupMetaUrls = new Set(Object.values(metaDescMap).filter(u => u.length > 1).flat());
    const orphanUrls = new Set(
      pages.map(p => p.url).filter(
        url => url !== homepage && url !== homepageWww && !linkedSet.has(url)
      )
    );
    const deepPages = pages.filter(p => (p.metadata?.depth ?? 0) > 3);

    // Inject derived issues
    if (dupTitleUrls.size > 0) issueMap["duplicate_title"] = { sev: "MED", count: dupTitleUrls.size };
    if (dupMetaUrls.size > 0) issueMap["duplicate_meta_description"] = { sev: "MED", count: dupMetaUrls.size };
    if (orphanUrls.size > 0) issueMap["orphan_page"] = { sev: "HIGH", count: orphanUrls.size };
    if (deepPages.length > 0) issueMap["deep_page_depth"] = { sev: "MED", count: deepPages.length };

    // Keyword cannibalization
    const titlePrefixGroups: Record<string, string[]> = {};
    for (const page of pages) {
      const title = (page.metadata?.title ?? "").trim();
      if (!title || title.length < 10) continue;
      const prefix = title.toLowerCase().split(/\s+/).slice(0, 5).join(" ");
      if (!titlePrefixGroups[prefix]) titlePrefixGroups[prefix] = [];
      titlePrefixGroups[prefix].push(page.url);
    }
    const cannibGroups = Object.values(titlePrefixGroups).filter(u => u.length >= 3);
    if (cannibGroups.length > 0) {
      issueMap["keyword_cannibalization"] = { sev: "HIGH", count: [...new Set(cannibGroups.flat())].length };
    }

    console.log("[ActionCenter] afterDerived:", Object.keys(issueMap).length, "keys:", Object.keys(issueMap), "dupTitles:", dupTitleUrls.size, "orphans:", orphanUrls.size, "deep:", deepPages.length);

    // ── Transform issueMap → Task[] using ISSUE_META for labels ──────────
    const tasks: Task[] = Object.entries(issueMap).map(([id, { sev, count }], index) => {
      const meta = ISSUE_META[id];
      const severity = sevToSeverity(sev);
      const effort = impactToEffort[meta?.impact ?? "medium"] ?? "medium";
      const estimatedPoints = Math.round((basePoints[severity] ?? 3) * (1 + count / 100));
      const title = meta?.label ?? id.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      const description = meta?.gain
        ? `${meta.gain}. Fix this issue to improve your SEO performance.`
        : "Fixing this issue will improve your site's SEO score and search visibility.";
      const actionHref = `/app/audit/${domain}`;

      return {
        id: `${id}-${index}`,
        title,
        description,
        severity,
        effort,
        estimatedPoints,
        affectedPages: count,
        actionHref,
        status: "todo" as const,
        progress: 0,
      };
    });

    // ── Sort: error → warning → notice, then by page count ───────────────
    const sevOrder: Record<string, number> = { error: 0, warning: 1, notice: 2 };
    tasks.sort((a, b) => {
      const d = (sevOrder[a.severity] ?? 2) - (sevOrder[b.severity] ?? 2);
      return d !== 0 ? d : b.affectedPages - a.affectedPages;
    });

    console.log("[ActionCenter] totalTasks:", tasks.length);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: Record<string, any> = { tasks, domain };

    if (debug) {
      const derivedIds = ["duplicate_title", "duplicate_meta_description", "orphan_page", "deep_page_depth", "keyword_cannibalization"];
      response._debug = {
        buildVersion: BUILD_VERSION,
        jobId,
        jobDomain: domain,
        jobCreatedAt: latestJob.created_at,
        skippedJobs,
        rawPagesCount: rawPages?.length ?? 0,
        pagesWithIssues: pages.filter(p => p.issues.length > 0).length,
        pagesWithMetadata: pages.filter(p => p.metadata && Object.keys(p.metadata).length > 0).length,
        storedIssueIds: Object.keys(issueMap).filter(id => !derivedIds.includes(id)),
        derivedIssueIds: Object.keys(issueMap).filter(id => derivedIds.includes(id)),
        issueMap,
        dupTitleCount: dupTitleUrls.size,
        dupMetaCount: dupMetaUrls.size,
        orphanCount: orphanUrls.size,
        deepPageCount: deepPages.length,
        linkedSetSize: linkedSet.size,
        totalTasks: tasks.length,
        samplePage: pages.length > 0 ? {
          url: pages[0].url,
          issuesCount: pages[0].issues.length,
          issueIds: pages[0].issues.map(i => i.id),
          hasMetadata: !!pages[0].metadata,
          metadataKeys: pages[0].metadata ? Object.keys(pages[0].metadata) : [],
          metadataTitle: pages[0].metadata?.title ?? null,
        } : null,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in /api/action-center/tasks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
