import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { ISSUE_META } from "@/lib/dashboard-data";
import { calculateSeoScore } from "@/lib/seo-score";

interface RawIssue {
  id: string;
  sev: "LOW" | "MED" | "HIGH";
  msg: string;
}

interface PageMetadata {
  title?: string;
  meta_description?: string;
  outbound_links?: string[];
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
    // ── Get the latest completed crawl job (skip saved_domains entirely) ──────
    // crawl engine writes to crawl_jobs + audit_pages, never to saved_domains
    const jobQueryBase = supabaseAdmin
      .from("crawl_jobs")
      .select("id, domain, created_at, updated_at, pages_crawled")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1);

    const { data: latestJob } = await (
      domainParam
        ? jobQueryBase.eq("domain", domainParam).maybeSingle()
        : jobQueryBase.maybeSingle()
    );

    const targetDomain = latestJob?.domain ?? null;

    // No completed crawl job found at all
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
        if (issueUrlMap[issue.id].length < 10) {
          issueUrlMap[issue.id].push(page.url);
        }
      }
    }

    // ── Post-crawl analysis: duplicate titles, duplicate meta, orphan pages ──
    const titleMap: Record<string, string[]> = {};
    const metaDescMap: Record<string, string[]> = {};
    const linkedSet = new Set<string>();
    const homepage = `https://${targetDomain}`;

    for (const page of pages) {
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
      pages.map(p => p.url).filter(
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

    // ── Summary stats ─────────────────────────────────────────────────────────
    const errors   = issues.filter((i) => i.severity === "error").length;
    const warnings = issues.filter((i) => i.severity === "warning").length;
    const notices  = issues.filter((i) => i.severity === "notice").length;

    const avgScore = calculateSeoScore(pages);

    return NextResponse.json({
      healthScore: avgScore,
      errors,
      warnings,
      notices,
      domain: targetDomain,
      crawledAt: latestJob.updated_at ?? latestJob.created_at,
      totalPages: pages.length || latestJob.pages_crawled || 0,
      issues,
    });
  } catch (err) {
    console.error("Error fetching audit issues data:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
