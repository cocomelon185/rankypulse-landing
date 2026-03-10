import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { ISSUE_META } from "@/lib/dashboard-data";
import { ISSUE_CONTENT } from "@/lib/issue-content";
import { computeSeoScore } from "@/lib/seo-score";

const BUILD_VERSION = "2026-03-08-v5";

// ── Enriched Task interface ─────────────────────────────────────────────────

interface Task {
  id: string;
  issueId: string;
  title: string;
  description: string;
  category: string;
  severity: "error" | "warning" | "notice";
  effort: "easy" | "medium" | "hard";
  effortMinutes: number;
  estimatedPoints: number;
  affectedPages: number;
  affectedPageUrls: string[];
  actionHref: string;
  status: "todo" | "in_progress" | "done";
  progress: number;
  // Fix guide data
  fixSteps: string[];
  exampleFix: string | null;
  templateSnippet: string | null;
  ctrImpact: string | null;
  trafficGain: string | null;
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

// ── Mappings ────────────────────────────────────────────────────────────────

const sevToSeverity = (sev: string): "error" | "warning" | "notice" => {
  if (sev === "HIGH") return "error";
  if (sev === "MED") return "warning";
  return "notice";
};

const impactToEffort: Record<string, "easy" | "medium" | "hard"> = {
  low: "easy",
  medium: "medium",
  high: "medium",
};

const basePoints: Record<string, number> = { error: 10, warning: 5, notice: 2 };

// Map ISSUE_META issue IDs to categories based on actionHref and issue type
const CATEGORY_MAP: Record<string, string> = {
  no_meta_description: "Content",
  no_title: "Content",
  no_h1: "Content",
  duplicate_title: "Content",
  duplicate_meta_description: "Content",
  title_too_long: "Content",
  title_too_short: "Content",
  meta_desc_too_long: "Content",
  meta_desc_too_short: "Content",
  low_word_count: "Content",
  keyword_cannibalization: "Content",
  no_canonical: "Technical",
  canonical_mismatch: "Technical",
  multiple_canonicals: "Technical",
  robots_noindex: "Technical",
  robots_txt_blocked: "Technical",
  redirect_chain: "Technical",
  no_og_tags: "Technical",
  no_schema: "Technical",
  broken_links: "Links",
  orphan_page: "Links",
  deep_page_depth: "Links",
  page_not_found: "Links",
  slow_page: "Performance",
  large_page_size: "Performance",
  images_missing_alt: "Content",
  multiple_h1: "Content",
};

// Effort in minutes per issue (from issueCatalog where available, fallback by effort level)
const EFFORT_MINUTES: Record<string, number> = {
  no_title: 2,
  no_meta_description: 5,
  no_h1: 3,
  no_canonical: 3,
  robots_noindex: 3,
  images_missing_alt: 10,
  broken_links: 15,
  duplicate_title: 10,
  duplicate_meta_description: 10,
  orphan_page: 15,
  low_word_count: 20,
  keyword_cannibalization: 30,
  canonical_mismatch: 5,
  redirect_chain: 10,
  multiple_canonicals: 5,
  robots_txt_blocked: 5,
  no_og_tags: 5,
  no_schema: 15,
  slow_page: 30,
  large_page_size: 15,
  page_not_found: 10,
  deep_page_depth: 20,
  title_too_long: 5,
  title_too_short: 5,
  meta_desc_too_long: 5,
  meta_desc_too_short: 5,
  multiple_h1: 5,
};

// ── Main handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const debug = req.nextUrl.searchParams.get("debug") === "true";
  const domainParam = req.nextUrl.searchParams.get("domain");

  try {
    // ── 1. Get all completed crawl jobs for domain selector ──────────────
    const { data: allJobs } = await supabaseAdmin
      .from("crawl_jobs")
      .select("id, domain, created_at, pages_crawled")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(20);

    // Deduplicate domains (latest job per domain)
    const domainJobMap = new Map<string, typeof allJobs extends (infer T)[] | null ? T : never>();
    for (const job of allJobs ?? []) {
      if (!domainJobMap.has(job.domain)) {
        domainJobMap.set(job.domain, job);
      }
    }
    const allDomains = [...domainJobMap.keys()];

    if (allDomains.length === 0) {
      return NextResponse.json({
        tasks: [], domain: null, allDomains: [],
        seoScore: 0, projectedScore: 0, totalPoints: 0, earnedPoints: 0,
        ...(debug ? { _debug: { buildVersion: BUILD_VERSION, reason: "no_completed_jobs" } } : {}),
      });
    }

    // ── 2. Select the target domain ─────────────────────────────────────
    // If domain param provided, use it; otherwise try each domain's latest job until one has pages
    let targetDomain = domainParam && allDomains.includes(domainParam) ? domainParam : null;
    let latestJob: { id: string; domain: string; created_at: string } | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let rawPages: any[] | null = null;
    const skippedJobs: string[] = [];

    if (targetDomain) {
      // Use the specific domain's latest job
      const job = domainJobMap.get(targetDomain);
      if (job) {
        const { data, error } = await supabaseAdmin
          .from("audit_pages")
          .select("url, score, issues, metadata")
          .eq("job_id", job.id);
        if (!error && data && data.length > 0) {
          latestJob = job;
          rawPages = data;
        }
      }
    }

    if (!latestJob) {
      // Try each domain's latest job until we find one with pages
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
        skippedJobs.push(`${dom}(${job.id.slice(0, 8)})`);
      }
    }

    if (!latestJob || !rawPages || rawPages.length === 0) {
      return NextResponse.json({
        tasks: [], domain: allDomains[0] ?? null, allDomains,
        seoScore: 0, projectedScore: 0, totalPoints: 0, earnedPoints: 0,
        ...(debug ? { _debug: { buildVersion: BUILD_VERSION, reason: "no_jobs_with_pages", skippedJobs } } : {}),
      });
    }

    const jobId = latestJob.id;
    const domain = latestJob.domain;

    // ── 3. Parse pages ──────────────────────────────────────────────────
    const pages = rawPages.map((p) => ({
      url: p.url as string,
      score: p.score as number,
      issues: Array.isArray(p.issues) ? (p.issues as RawIssue[]) : [],
      metadata: (p.metadata as PageMetadata) ?? null,
    }));

    // ── 4. Aggregate issues + track affected URLs per issue ─────────────
    const issueMap: Record<string, { sev: string; count: number; urls: string[] }> = {};
    for (const page of pages) {
      for (const issue of page.issues) {
        if (!issueMap[issue.id]) issueMap[issue.id] = { sev: issue.sev, count: 0, urls: [] };
        issueMap[issue.id].count++;
        if (issueMap[issue.id].urls.length < 10) issueMap[issue.id].urls.push(page.url);
      }
    }

    // ── 5. Post-crawl metadata analysis ─────────────────────────────────
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

    const dupTitleUrls = [...new Set(Object.values(titleMap).filter(u => u.length > 1).flat())];
    const dupMetaUrls = [...new Set(Object.values(metaDescMap).filter(u => u.length > 1).flat())];
    const orphanUrlsList = pages.map(p => p.url).filter(
      url => url !== homepage && url !== homepageWww && !linkedSet.has(url)
    );
    const deepPagesList = pages.filter(p => (p.metadata?.depth ?? 0) > 3).map(p => p.url);

    // Inject derived issues with URLs
    if (dupTitleUrls.length > 0) issueMap["duplicate_title"] = { sev: "MED", count: dupTitleUrls.length, urls: dupTitleUrls.slice(0, 10) };
    if (dupMetaUrls.length > 0) issueMap["duplicate_meta_description"] = { sev: "MED", count: dupMetaUrls.length, urls: dupMetaUrls.slice(0, 10) };
    if (orphanUrlsList.length > 0) issueMap["orphan_page"] = { sev: "HIGH", count: orphanUrlsList.length, urls: orphanUrlsList.slice(0, 10) };
    if (deepPagesList.length > 0) issueMap["deep_page_depth"] = { sev: "MED", count: deepPagesList.length, urls: deepPagesList.slice(0, 10) };

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
      const cannibUrls = [...new Set(cannibGroups.flat())];
      issueMap["keyword_cannibalization"] = { sev: "HIGH", count: cannibUrls.length, urls: cannibUrls.slice(0, 10) };
    }

    // ── 6. Fetch persisted task completions ──────────────────────────────
    const { data: completions } = await supabaseAdmin
      .from("task_completions")
      .select("issue_id, status, marked_at")
      .eq("user_id", userId)
      .eq("domain", domain);

    const completionMap = new Map<string, { status: string; marked_at: string }>();
    for (const c of completions ?? []) {
      completionMap.set(c.issue_id, { status: c.status, marked_at: c.marked_at });
    }

    // ── 7. Compute SEO scores ───────────────────────────────────────────
    const issueEntries = Object.entries(issueMap);
    const criticalCount = issueEntries.filter(([, v]) => v.sev === "HIGH").length;
    const warningCount = issueEntries.filter(([, v]) => v.sev === "MED").length;
    const noticeCount = issueEntries.filter(([, v]) => v.sev === "LOW").length;

    const seoScore = computeSeoScore({
      pages: pages.length,
      totalIssues: issueEntries.length,
      criticalIssues: criticalCount,
      warningIssues: warningCount,
      noticeIssues: noticeCount,
    });

    // Projected score: remove all remaining (non-done) issues
    const remainingCritical = issueEntries.filter(([id, v]) => v.sev === "HIGH" && completionMap.get(id)?.status !== "done").length;
    const remainingWarning = issueEntries.filter(([id, v]) => v.sev === "MED" && completionMap.get(id)?.status !== "done").length;
    const remainingNotice = issueEntries.filter(([id, v]) => v.sev === "LOW" && completionMap.get(id)?.status !== "done").length;

    const projectedScore = computeSeoScore({
      pages: pages.length,
      totalIssues: 0,
      criticalIssues: 0,
      warningIssues: 0,
      noticeIssues: 0,
    });

    // ── 8. Transform issueMap → enriched Task[] ─────────────────────────
    const tasks: Task[] = issueEntries.map(([id, { sev, count, urls }], index) => {
      const meta = ISSUE_META[id];
      const content = ISSUE_CONTENT[id];
      const severity = sevToSeverity(sev);
      const effort = impactToEffort[meta?.impact ?? "medium"] ?? "medium";
      const estimatedPoints = Math.round((basePoints[severity] ?? 3) * (1 + count / 100));
      const title = meta?.label ?? id.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      const description = meta?.gain
        ? `${meta.gain}. Fix this issue to improve your SEO performance.`
        : "Fixing this issue will improve your site's SEO score and search visibility.";

      // Persistence: check task_completions
      const completion = completionMap.get(id);
      const status = completion?.status === "done" ? "done" as const : "todo" as const;
      const progress = status === "done" ? 100 : 0;

      return {
        id: `${id}-${index}`,
        issueId: id,
        title,
        description,
        category: CATEGORY_MAP[id] ?? "General",
        severity,
        effort,
        effortMinutes: EFFORT_MINUTES[id] ?? (effort === "easy" ? 5 : effort === "medium" ? 15 : 30),
        estimatedPoints,
        affectedPages: count,
        affectedPageUrls: urls,
        actionHref: `/app/audit/${domain}`,
        status,
        progress,
        // Fix guide data from ISSUE_CONTENT
        fixSteps: content?.fixSteps ?? [],
        exampleFix: content?.exampleFix ?? null,
        templateSnippet: null, // Will be populated from issueCatalog in future
        ctrImpact: content?.ctrImpact ?? null,
        trafficGain: content?.trafficGain ?? null,
      };
    });

    // ── 9. Sort: error → warning → notice, then by page count ───────────
    const sevOrder: Record<string, number> = { error: 0, warning: 1, notice: 2 };
    tasks.sort((a, b) => {
      const d = (sevOrder[a.severity] ?? 2) - (sevOrder[b.severity] ?? 2);
      return d !== 0 ? d : b.affectedPages - a.affectedPages;
    });

    // ── 10. Compute aggregate stats ─────────────────────────────────────
    const totalPoints = tasks.reduce((sum, t) => sum + t.estimatedPoints, 0);
    const earnedPoints = tasks.filter(t => t.status === "done").reduce((sum, t) => sum + t.estimatedPoints, 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: Record<string, any> = {
      tasks,
      domain,
      allDomains,
      seoScore,
      projectedScore,
      totalPoints,
      earnedPoints,
    };

    if (debug) {
      response._debug = {
        buildVersion: BUILD_VERSION,
        jobId,
        jobCreatedAt: latestJob.created_at,
        skippedJobs,
        rawPagesCount: rawPages.length,
        issueCount: issueEntries.length,
        completionsCount: completions?.length ?? 0,
        totalTasks: tasks.length,
        sampleTask: tasks[0] ?? null,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in /api/action-center/tasks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
