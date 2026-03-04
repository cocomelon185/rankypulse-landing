import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { ISSUE_META } from "@/lib/dashboard-data";

interface RawIssue {
  id: string;
  sev: "LOW" | "MED" | "HIGH";
  msg: string;
}

interface AuditPage {
  url: string;
  score: number | null;
  issues: RawIssue[] | null;
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
  let targetDomain = req.nextUrl.searchParams.get("domain");

  try {
    // 1. If no domain specified, use user's primary saved domain
    if (!targetDomain) {
      const { data: primary } = await supabaseAdmin
        .from("saved_domains")
        .select("domain")
        .eq("user_id", userId)
        .order("last_scanned_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      targetDomain = primary?.domain ?? null;
    }

    // No domain at all → return empty
    if (!targetDomain) {
      return NextResponse.json({
        healthScore: 0,
        errors: 0,
        warnings: 0,
        notices: 0,
        domain: null,
        crawledAt: null,
        totalPages: 0,
        issues: [],
      });
    }

    // 2. Latest completed crawl job for that domain
    const { data: latestJob } = await supabaseAdmin
      .from("crawl_jobs")
      .select("id, domain, created_at, updated_at, pages_crawled")
      .eq("user_id", userId)
      .eq("domain", targetDomain)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestJob?.id) {
      // Crawl exists but no completed job yet
      return NextResponse.json({
        healthScore: 0,
        errors: 0,
        warnings: 0,
        notices: 0,
        domain: targetDomain,
        crawledAt: null,
        totalPages: 0,
        issues: [],
      });
    }

    // 3. All audit pages for that job
    const { data: rawPages } = await supabaseAdmin
      .from("audit_pages")
      .select("url, score, issues")
      .eq("job_id", latestJob.id);

    const pages: AuditPage[] = (rawPages ?? []).map((p) => ({
      url: p.url,
      score: p.score ?? null,
      issues: Array.isArray(p.issues) ? (p.issues as RawIssue[]) : [],
    }));

    // 4. Aggregate issues across all pages grouped by issue ID
    const issueMap: Record<string, { sev: string; count: number }> = {};
    for (const page of pages) {
      for (const issue of page.issues ?? []) {
        if (!issueMap[issue.id]) {
          issueMap[issue.id] = { sev: issue.sev, count: 0 };
        }
        issueMap[issue.id].count++;
      }
    }

    // 5. Map to display format using ISSUE_META
    const impactOrder = { error: 0, warning: 1, notice: 2 };
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
          trend: "0",
          discovered: latestJob.created_at,
        };
      })
      .sort(
        (a, b) =>
          impactOrder[a.severity] - impactOrder[b.severity] ||
          b.urlsAffected - a.urlsAffected
      );

    // 6. Compute summary stats
    const errors  = issues.filter((i) => i.severity === "error").length;
    const warnings = issues.filter((i) => i.severity === "warning").length;
    const notices  = issues.filter((i) => i.severity === "notice").length;

    const avgScore =
      pages.length > 0
        ? Math.round(
            pages.reduce((sum, p) => sum + (p.score ?? 0), 0) / pages.length
          )
        : 0;

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
