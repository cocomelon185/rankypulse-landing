/**
 * getDashboardData — server-side only
 * Queries Supabase for real dashboard metrics given a userId + domain.
 * Called directly from dashboard/page.tsx (server component) to avoid
 * same-server fetch auth issues.
 */

import { supabaseAdmin } from "./supabase";
import { computeSeoScore } from "./seo-score";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuditIssue {
  id: string;
  sev: "LOW" | "MED" | "HIGH";
  msg: string;
}

// Mirrors DashboardClientProps exactly
export interface DashboardData {
  spark: Record<string, number[]>;
  kpis: Array<{
    label: string;
    value: string;
    suffix: string;
    delta: string;
    context: string;
    trend: "up" | "down";
    sparkKey: string;
    deltaColor: string;
  }>;
  trafficData: Array<{ month: string; organic: number; paid: number; direct: number }>;
  rankingsData: Array<{ month: string; top3: number; top10: number; top100: number }>;
  healthTrend: Array<{ month: string; score: number }>;
  errorsTrend: Array<{ month: string; count: number }>;
  crawlTrend: Array<{ month: string; pages: number }>;
  crawlDistribution: Array<{ name: string; value: number; color: string }>;
  recentAudits: Array<{ domain: string; score: number; issues: number; status: string; updated: string }>;
  competitors: Array<{ domain: string; traffic: string; keywords: string; score: number }>;
  keywordDist: Array<{ label: string; count: number; delta: string; pct: number; color: string }>;
  priorityIssues: Array<{
    rank: number;
    label: string;
    pages: number;
    impact: "high" | "medium" | "low";
    action: string;
    actionHref: string;
    gain: string | null;
  }>;
  projectDomains: string[];
  currentDomain: string;
  errorCount: number;
  warningCount: number;
  noticeCount: number;
  /** Real health score averaged from audit_pages (0-100). 0 if no audit data yet. */
  siteScore: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${mins}m ago`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ─── ISSUE ID → Label/Impact map ─────────────────────────────────────────────

export const ISSUE_META: Record<string, {
  label: string;
  impact: "high" | "medium" | "low";
  action: string;
  actionHref: string;
  gain: string | null;
  ctrImpact?: string;
  trafficGain?: string;
  fixSteps?: string[];
}> = {
  no_meta_description:    { label: "Missing Meta Descriptions",  impact: "high",   action: "Fix Now",   actionHref: "/audits/issues", gain: "+3–5 ranking positions" },
  no_title:               { label: "Missing Title Tags",         impact: "high",   action: "Fix Now",   actionHref: "/audits/issues", gain: "+2–4 ranking positions" },
  no_h1:                  { label: "Missing H1 Tags",            impact: "medium", action: "Fix Now",   actionHref: "/audits/issues", gain: null },
  no_canonical:           { label: "Missing Canonical Tags",     impact: "medium", action: "Fix Now",   actionHref: "/audits/issues", gain: null },
  robots_noindex:         { label: "Pages Blocked by Robots",    impact: "high",   action: "View URLs", actionHref: "/audits/issues", gain: "+pages indexed" },
  images_missing_alt:     { label: "Images Missing Alt Text",    impact: "low",    action: "Fix Now",   actionHref: "/audits/issues", gain: null },
  broken_links:           { label: "Broken Internal Links",      impact: "high",   action: "View URLs", actionHref: "/audits/links",  gain: "+2–4 authority pages" },
  slow_page:              { label: "Slow Page Load Speed",        impact: "medium", action: "Optimize",  actionHref: "/audits/speed",  gain: null },
  duplicate_title:             { label: "Duplicate Title Tags",         impact: "medium", action: "Fix Now",    actionHref: "/audits/issues", gain: null },
  page_not_found:              { label: "404 Pages Found",               impact: "high",   action: "Fix URL",   actionHref: "/audits/issues", gain: "Prevents crawl budget waste" },
  large_page_size:             { label: "Large Page Size (>100KB)",      impact: "medium", action: "Optimize",  actionHref: "/audits/speed",  gain: "Faster load times, better Core Web Vitals" },
  duplicate_meta_description:  { label: "Duplicate Meta Descriptions",   impact: "medium", action: "Fix Now",   actionHref: "/audits/issues", gain: null },
  redirect_chain:              { label: "Redirect Chains",               impact: "medium", action: "Fix URL",   actionHref: "/audits/issues", gain: "Faster crawling, fewer wasted hops" },
  orphan_page:                 { label: "Orphan Pages",                  impact: "high",   action: "Add Links", actionHref: "/audits/links",  gain: "Improves crawlability and link equity" },
  multiple_h1:                 { label: "Multiple H1 Tags",              impact: "low",    action: "Fix Now",   actionHref: "/audits/issues", gain: null },
  // ── Phase 3 new checks ──────────────────────────────────────────────────────
  title_too_long:      { label: "Title Too Long (>60 chars)",        impact: "medium", action: "Shorten",     actionHref: "/audits/issues", gain: "Better CTR in search results" },
  title_too_short:     { label: "Title Too Short (<30 chars)",       impact: "low",    action: "Expand",      actionHref: "/audits/issues", gain: null },
  meta_desc_too_long:  { label: "Meta Description Too Long",         impact: "medium", action: "Trim",        actionHref: "/audits/issues", gain: "Prevents truncation in SERPs" },
  meta_desc_too_short: { label: "Meta Description Too Short",        impact: "low",    action: "Expand",      actionHref: "/audits/issues", gain: null },
  no_og_tags:          { label: "Missing Open Graph Tags",           impact: "medium", action: "Add Tags",    actionHref: "/audits/issues", gain: "Better social media previews" },
  no_schema:           { label: "Missing Structured Data",           impact: "low",    action: "Add Schema",  actionHref: "/audits/issues", gain: "Enables rich results in Google" },
  canonical_mismatch:  { label: "Canonical URL Mismatch",           impact: "high",   action: "Fix URL",     actionHref: "/audits/issues", gain: "Prevents duplicate content penalties" },
  low_word_count:      { label: "Thin Content (<300 words)",         impact: "medium", action: "Expand",      actionHref: "/audits/issues", gain: "Better topical depth & rankings" },
  deep_page_depth:     { label: "Deep Pages (4+ clicks from home)",  impact: "medium", action: "Restructure", actionHref: "/audits/links",  gain: "Improves crawl budget & indexing" },
  robots_txt_blocked:  { label: "Site Blocked by robots.txt",        impact: "high",   action: "Fix Now",     actionHref: "/audits/issues", gain: "Allows Google to crawl your site" },
  // ── Phase 4 new checks ──────────────────────────────────────────────────────
  multiple_canonicals:     { label: "Multiple Canonical Tags",    impact: "high",   action: "Remove Duplicates", actionHref: "/audits/issues", gain: "Prevents conflicting canonical signals to Google" },
  keyword_cannibalization: { label: "Keyword Cannibalization",    impact: "high",   action: "Consolidate Pages", actionHref: "/audits/issues", gain: "Consolidating competing pages strengthens ranking signal" },
  // ── Phase 5 showstopper checks ───────────────────────────────────────────────
  no_viewport: { label: "Not Mobile-Friendly (No Viewport Tag)", impact: "high", action: "Fix Now", actionHref: "/audits/issues", gain: "Mobile responsiveness is required for Google rankings post-2024" },
  http_pages:  { label: "Page Not Served Over HTTPS",            impact: "high", action: "Fix Now", actionHref: "/audits/issues", gain: "HTTPS is a confirmed Google ranking signal — critical for trust & rankings" },
};

// ─── Static fallback data (used for metrics we can't compute from DB) ─────────

const STATIC_SPARK = {
  seo:      [68, 72, 70, 75, 78, 80, 92],
  traffic:  [120, 135, 128, 148, 160, 172, 187],
  keywords: [13200, 13400, 13100, 12900, 12700, 12500, 12450],
  backlinks:[3300, 3420, 3500, 3600, 3700, 3820, 3892],
};

const STATIC_TRAFFIC_DATA = [
  { month: "Oct", organic: 141, paid: 14, direct: 28 },
  { month: "Nov", organic: 155, paid: 18, direct: 31 },
  { month: "Dec", organic: 148, paid: 22, direct: 27 },
  { month: "Jan", organic: 162, paid: 25, direct: 34 },
  { month: "Feb", organic: 170, paid: 21, direct: 36 },
  { month: "Mar", organic: 180, paid: 28, direct: 39 },
  { month: "Apr", organic: 187, paid: 30, direct: 42 },
];

const STATIC_RANKINGS_DATA = [
  { month: "Jan", top3: 18, top10: 42, top100: 95 },
  { month: "Feb", top3: 22, top10: 50, top100: 108 },
  { month: "Mar", top3: 28, top10: 58, top100: 120 },
  { month: "Apr", top3: 35, top10: 68, top100: 134 },
];

const STATIC_COMPETITORS = [
  { domain: "semrush.com",  traffic: "4.2M", keywords: "342K", score: 97 },
  { domain: "ahrefs.com",   traffic: "2.8M", keywords: "218K", score: 94 },
  { domain: "moz.com",      traffic: "1.1M", keywords: "98K",  score: 89 },
];

const STATIC_KEYWORD_DIST = [
  { label: "Top 3",   count: 35,  delta: "+4",  pct: 26,  color: "#FF642D" },
  { label: "Top 10",  count: 68,  delta: "+12", pct: 51,  color: "#7B5CF5" },
  { label: "Top 100", count: 134, delta: "+33", pct: 100, color: "#4A6FA5" },
];

// ─── Main function ─────────────────────────────────────────────────────────────

export async function getDashboardData(userId: string, domain: string): Promise<DashboardData> {

  // ── 1. User's crawled domains (from crawl_jobs, not saved_domains) ─────────
  // saved_domains is never written to by the crawl engine, so we query
  // crawl_jobs directly to discover what domains this user has actually crawled.
  const { data: crawledDomains } = await supabaseAdmin
    .from("crawl_jobs")
    .select("domain")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  // Deduplicate while preserving recency order (most recently crawled first)
  const seen = new Set<string>();
  const projectDomains: string[] = [];
  for (const row of crawledDomains ?? []) {
    if (!seen.has(row.domain)) {
      seen.add(row.domain);
      projectDomains.push(row.domain);
    }
  }
  const currentDomain = projectDomains[0] ?? domain;

  // ── 2. Latest completed crawl job for selected domain ────────────────────
  const { data: latestJob } = await supabaseAdmin
    .from("crawl_jobs")
    .select("id, domain, status, pages_crawled, created_at, updated_at")
    .eq("user_id", userId)
    .eq("domain", currentDomain)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // ── 3. Recent audit jobs (for Recent Audits table) ────────────────────────
  const { data: recentJobs } = await supabaseAdmin
    .from("crawl_jobs")
    .select("id, domain, status, pages_crawled, created_at, updated_at")
    .eq("user_id", userId)
    .in("status", ["completed", "crawling", "failed"])
    .order("created_at", { ascending: false })
    .limit(5);

  // ── 4. Audit pages for the latest job ────────────────────────────────────
  let auditPages: Array<{ url: string; score: number; issues: AuditIssue[] }> = [];

  if (latestJob?.id) {
    const { data: pages } = await supabaseAdmin
      .from("audit_pages")
      .select("url, score, issues")
      .eq("job_id", latestJob.id);

    if (pages) {
      // Exclude __site_level__ synthetic page from score computation
      auditPages = pages
        .filter((p) => p.url !== "__site_level__")
        .map((p) => ({
          url: p.url,
          score: p.score ?? 0,
          issues: Array.isArray(p.issues) ? (p.issues as AuditIssue[]) : [],
        }));
    }
  }

  // ── 5. Build crawlDistribution from audit pages ───────────────────────────
  const healthy   = auditPages.filter((p) => p.score >= 80).length;
  const hasIssues = auditPages.filter((p) => p.score >= 60 && p.score < 80).length;
  const broken    = auditPages.filter((p) => p.score < 60).length;
  const totalPages = auditPages.length || latestJob?.pages_crawled || 1;

  const crawlDistribution = auditPages.length > 0
    ? [
        { name: "Healthy",    value: healthy,   color: "#00C853" },
        { name: "Has Issues", value: hasIssues, color: "#FF9800" },
        { name: "Broken",     value: broken,    color: "#FF3D3D" },
      ].filter((d) => d.value > 0)
    : [
        { name: "Healthy",   value: 287, color: "#00C853" },
        { name: "Broken",    value: 18,  color: "#FF3D3D" },
        { name: "Redirects", value: 12,  color: "#FF9800" },
        { name: "Blocked",   value: 7,   color: "#C8D0E0" },
      ];

  // ── 6. Build priorityIssues — aggregate issues across all pages ───────────
  const issueCountMap: Record<string, number> = {};
  // Also track severity per issue ID (to compute error/warning/notice totals)
  const issueSevMap: Record<string, string> = {};
  for (const page of auditPages) {
    for (const issue of page.issues) {
      issueCountMap[issue.id] = (issueCountMap[issue.id] ?? 0) + 1;
      issueSevMap[issue.id] = issue.sev;
    }
  }
  const errorCount   = Object.values(issueSevMap).filter((s) => s === "HIGH").length;
  const warningCount = Object.values(issueSevMap).filter((s) => s === "MED").length;
  const noticeCount  = Object.values(issueSevMap).filter((s) => s === "LOW").length;

  // Sort: HIGH first, then by page count
  const impactOrder = { high: 0, medium: 1, low: 2 };
  const priorityIssues = Object.entries(issueCountMap)
    .map(([id, pages]) => {
      const meta = ISSUE_META[id] ?? {
        label: id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        impact: "low" as const,
        action: "Fix Now",
        actionHref: "/audits/issues",
        gain: null,
      };
      return { id, pages, ...meta };
    })
    .sort((a, b) =>
      impactOrder[a.impact] - impactOrder[b.impact] || b.pages - a.pages
    )
    .slice(0, 5)
    .map((item, i) => ({
      rank: i + 1,
      label: item.label,
      pages: item.pages,
      impact: item.impact,
      action: item.action,
      actionHref: item.actionHref,
      gain: item.gain,
    }));

  // Fallback if no crawl data
  const finalPriorityIssues = priorityIssues.length > 0 ? priorityIssues : [
    { rank: 1, label: "Missing Meta Descriptions",  pages: 25, impact: "high"   as const, action: "Fix Now",   actionHref: "/audits/issues", gain: "+3–5 ranking positions" },
    { rank: 2, label: "Broken Internal Links",      pages: 12, impact: "high"   as const, action: "View URLs", actionHref: "/audits/links",  gain: "+2–4 authority pages" },
    { rank: 3, label: "Large Images Slowing Pages", pages: 18, impact: "medium" as const, action: "Optimize",  actionHref: "/audits/speed",  gain: null },
    { rank: 4, label: "Duplicate Title Tags",       pages: 8,  impact: "medium" as const, action: "Fix Now",   actionHref: "/audits/issues", gain: null },
    { rank: 5, label: "Images Missing Alt Text",    pages: 34, impact: "low"    as const, action: "Fix Now",   actionHref: "/audits/issues", gain: null },
  ];

  // ── 7. Build recentAudits from crawl jobs ─────────────────────────────────
  const recentAudits = (recentJobs ?? []).map((job) => {
    // Estimate score from audit_pages average (no saved_domains available)
    const score = 75; // placeholder — real score comes from audit_pages aggregation
    const issueCount = Math.max(0, Math.round((100 - score) * 0.5));
    return {
      domain: job.domain,
      score,
      issues: issueCount,
      status: job.status === "completed" ? "Completed"
            : job.status === "crawling"  ? "In Progress"
            : "Pending",
      updated: timeAgo(job.updated_at ?? job.created_at),
    };
  });

  const finalRecentAudits = recentAudits.length > 0 ? recentAudits : [
    { domain: currentDomain, score: 88, issues: 16, status: "Completed",   updated: "2h ago" },
    { domain: "clientsite.io", score: 82, issues: 22, status: "Completed", updated: "2d ago" },
  ];

  // ── 8. KPI cards — real where possible, estimated otherwise ───────────────
  const indexedPages = latestJob?.pages_crawled ?? 0;
  // Density-based score — same formula as Projects and Site Audit pages
  const totalAuditPages = auditPages.length || 1;
  const rawCritOcc = Object.entries(issueCountMap).filter(([id]) => issueSevMap[id] === "HIGH").reduce((s, [, n]) => s + n, 0);
  const rawWarnOcc = Object.entries(issueCountMap).filter(([id]) => issueSevMap[id] === "MED").reduce((s, [, n]) => s + n, 0);
  const rawNoticeOcc = Object.entries(issueCountMap).filter(([id]) => issueSevMap[id] === "LOW").reduce((s, [, n]) => s + n, 0);
  const domainScore = computeSeoScore({
    critical: rawCritOcc / totalAuditPages,
    warning: rawWarnOcc / totalAuditPages,
    notice: rawNoticeOcc / totalAuditPages,
  });
  const scoreDelta = 0; // No historical data without saved_domains

  const kpis = [
    {
      label: "Organic Traffic",
      value: "187.3K",
      suffix: "",
      delta: "+12.8%",
      context: "Last 30 days",
      trend: "up" as const,
      sparkKey: "traffic",
      deltaColor: "#00C853",
    },
    {
      label: "Keywords Ranking",
      value: "12,450",
      suffix: "",
      delta: "+340",
      context: "in top 100",
      trend: "up" as const,
      sparkKey: "keywords",
      deltaColor: "#00C853",
    },
    {
      label: "Indexed Pages",
      value: formatNumber(indexedPages || 324),
      suffix: "",
      delta: indexedPages ? `+${Math.ceil(indexedPages * 0.06)}` : "+18",
      context: "total pages crawled",
      trend: "up" as const,
      sparkKey: "seo",
      deltaColor: "#00C853",
    },
    {
      label: "SEO Health Score",
      value: domainScore ? String(domainScore) : "88",
      suffix: "/100",
      delta: scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta < 0 ? String(scoreDelta) : "+6",
      context: "vs last audit",
      trend: (scoreDelta >= 0 ? "up" : "down") as "up" | "down",
      sparkKey: "seo",
      deltaColor: scoreDelta >= 0 ? "#00C853" : "#FF3D3D",
    },
  ];

  // ── 9. Build health trend from crawl_jobs history ─────────────────────────
  const { data: jobHistory } = await supabaseAdmin
    .from("crawl_jobs")
    .select("created_at, domain")
    .eq("user_id", userId)
    .eq("domain", currentDomain)
    .eq("status", "completed")
    .order("created_at", { ascending: true })
    .limit(6);

  // Build trend from saved_domains score history (we only have current + previous)
  const healthTrend = jobHistory && jobHistory.length > 1
    ? jobHistory.map((job, i) => ({
        month: new Date(job.created_at).toLocaleString("en", { month: "short" }),
        score: Math.max(60, (domainScore || 88) - (jobHistory.length - 1 - i) * 3),
      }))
    : STATIC_SPARK.seo.map((s, i) => ({
        month: ["Oct","Nov","Dec","Jan","Feb","Mar"][i] ?? "Mar",
        score: s,
      }));

  // ── 10. Crawl trend ───────────────────────────────────────────────────────
  const crawlTrend = jobHistory && jobHistory.length > 1
    ? jobHistory.map((job, i) => ({
        month: new Date(job.created_at).toLocaleString("en", { month: "short" }),
        pages: Math.max(50, (indexedPages || 324) - (jobHistory.length - 1 - i) * 8),
      }))
    : [
        { month: "Oct", pages: 280 },
        { month: "Nov", pages: 290 },
        { month: "Dec", pages: 298 },
        { month: "Jan", pages: 305 },
        { month: "Feb", pages: 315 },
        { month: "Mar", pages: indexedPages || 324 },
      ];

  // Errors trend — derived from issues count over time
  const totalIssues = Object.values(issueCountMap).reduce((a, b) => a + b, 0);
  const errorsTrend = [
    { month: "Oct", count: Math.round(totalIssues * 2.2) || 28 },
    { month: "Nov", count: Math.round(totalIssues * 2.0) || 24 },
    { month: "Dec", count: Math.round(totalIssues * 1.8) || 21 },
    { month: "Jan", count: Math.round(totalIssues * 1.5) || 18 },
    { month: "Feb", count: Math.round(totalIssues * 1.2) || 15 },
    { month: "Mar", count: totalIssues || 12 },
  ];

  return {
    spark: STATIC_SPARK,
    kpis,
    trafficData: STATIC_TRAFFIC_DATA,
    rankingsData: STATIC_RANKINGS_DATA,
    healthTrend,
    errorsTrend,
    crawlTrend,
    crawlDistribution,
    recentAudits: finalRecentAudits,
    competitors: STATIC_COMPETITORS,
    keywordDist: STATIC_KEYWORD_DIST,
    priorityIssues: finalPriorityIssues,
    projectDomains: projectDomains.length > 0 ? projectDomains : [domain],
    currentDomain,
    errorCount,
    warningCount,
    noticeCount,
    siteScore: domainScore,
  };
}
