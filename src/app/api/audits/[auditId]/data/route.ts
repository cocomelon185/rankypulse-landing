import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { ISSUE_META } from "@/lib/dashboard-data";
import { computeSeoScore } from "@/lib/seo-score";

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ auditId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { auditId } = await params;

  try {
    // Verify job belongs to this user
    const { data: job, error: jobError } = await supabaseAdmin
      .from("crawl_jobs")
      .select("id, domain, created_at, updated_at, pages_crawled, status")
      .eq("id", auditId)
      .eq("user_id", userId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    // Fetch all audit pages for this job
    const { data: rawPages } = await supabaseAdmin
      .from("audit_pages")
      .select("url, score, issues")
      .eq("job_id", auditId);

    // Exclude __site_level__ synthetic page
    const pages: AuditPage[] = (rawPages ?? [])
      .filter((p) => p.url !== "__site_level__")
      .map((p) => ({
        url: p.url,
        score: p.score ?? null,
        issues: Array.isArray(p.issues) ? (p.issues as RawIssue[]) : [],
      }));

    // Aggregate issues across all pages grouped by issue ID
    const issueMap: Record<string, { sev: string; count: number }> = {};
    for (const page of pages) {
      for (const issue of page.issues ?? []) {
        if (!issueMap[issue.id]) {
          issueMap[issue.id] = { sev: issue.sev, count: 0 };
        }
        issueMap[issue.id].count++;
      }
    }

    // Map to display format using ISSUE_META
    const impactOrder: Record<string, number> = { error: 0, warning: 1, notice: 2 };
    const issues = Object.entries(issueMap)
      .map(([id, { sev, count }]) => {
        const meta = ISSUE_META[id] ?? {
          label: id.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
          impact: "low" as const,
          action: "Fix Now",
          actionHref: `/audits/${auditId}/issues`,
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
          discovered: job.created_at,
        };
      })
      .sort(
        (a, b) =>
          (impactOrder[a.severity] ?? 2) - (impactOrder[b.severity] ?? 2) ||
          b.urlsAffected - a.urlsAffected
      );

    // Summary stats
    const errors   = issues.filter((i) => i.severity === "error").length;
    const warnings = issues.filter((i) => i.severity === "warning").length;
    const notices  = issues.filter((i) => i.severity === "notice").length;

    // Density-based score — same formula as all other pages
    const issueEntries = Object.entries(issueMap);
    const totalPg = pages.length || 1;
    const healthScore = pages.length > 0 ? computeSeoScore({
      critical: issueEntries.filter(([, v]) => v.sev === "HIGH").reduce((s, [, v]) => s + v.count, 0) / totalPg,
      warning:  issueEntries.filter(([, v]) => v.sev === "MED").reduce((s, [, v]) => s + v.count, 0) / totalPg,
      notice:   issueEntries.filter(([, v]) => v.sev === "LOW").reduce((s, [, v]) => s + v.count, 0) / totalPg,
    }) : 0;

    return NextResponse.json({
      healthScore,
      errors,
      warnings,
      notices,
      domain: job.domain,
      crawledAt: job.updated_at ?? job.created_at,
      totalPages: pages.length || job.pages_crawled || 0,
      status: job.status,
      issues,
    });
  } catch (err) {
    console.error("[/api/audits/[auditId]/data] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
