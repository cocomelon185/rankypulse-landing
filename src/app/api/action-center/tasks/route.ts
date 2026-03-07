import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

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

// Severity mapping
const sevToSeverity = (sev: string): "error" | "warning" | "notice" => {
  if (sev === "HIGH") return "error";
  if (sev === "MED") return "warning";
  return "notice";
};

// Issue type → effort mapping
const issueTypeEffort: Record<string, "easy" | "medium" | "hard"> = {
  "orphan-pages": "easy",
  "missing-meta-descriptions": "easy",
  "duplicate-titles": "easy",
  "missing-h1": "easy",
  "missing-canonical": "medium",
  "missing-alt-text": "medium",
  "broken-internal-links": "medium",
};

// Issue type → base description mapping
const issueDescriptions: Record<string, string> = {
  "orphan-pages": "Pages that are not linked from any other page. These pages waste crawl budget and are harder for search engines to discover.",
  "missing-meta-descriptions": "Pages without meta descriptions miss out on click-through rate optimization. Search engines may auto-generate poor snippets.",
  "broken-internal-links": "Internal links returning 404 damage crawl budget and user experience. Fix or redirect these URLs immediately.",
  "duplicate-titles": "Duplicate or missing title tags reduce click-through rates and confuse search engines about page topics.",
  "missing-h1": "Each page should have exactly one H1 tag that clearly describes the page content for both users and search engines.",
  "missing-alt-text": "Images without alt text are not accessible to users with screen readers and provide no SEO value.",
  "missing-canonical": "Missing canonical tags can lead to duplicate content issues and diluted ranking power across multiple URLs.",
};

// Points scoring
const basePoints = {
  "error": 8,
  "warning": 5,
  "notice": 2,
};

// Calculate estimated points based on severity and affected page count
function calculateEstimatedPoints(
  severity: "error" | "warning" | "notice",
  affectedCount: number
): number {
  const base = basePoints[severity];
  return Math.round(base * (1 + affectedCount / 100));
}

// Get issue title (from mapping or use msg)
function getIssueTitle(issueId: string, msg: string): string {
  const titleMap: Record<string, string> = {
    "orphan-pages": "Orphan Pages",
    "missing-meta-descriptions": "Missing Meta Descriptions",
    "broken-internal-links": "Broken Internal Links",
    "duplicate-titles": "Duplicate Title Tags",
    "missing-h1": "Missing H1 Tags",
    "missing-alt-text": "Images Missing Alt Text",
    "missing-canonical": "Missing Canonical Tags",
  };
  return titleMap[issueId] || msg;
}

// Get description for issue
function getIssueDescription(issueId: string): string {
  return issueDescriptions[issueId] || "Fixing this issue will improve your site's SEO score and search visibility.";
}

// Get effort level
function getEffortLevel(issueId: string): "easy" | "medium" | "hard" {
  return issueTypeEffort[issueId] || "medium";
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // ── Get the latest completed crawl job ────────────────────────────────
    const { data: latestJob } = await supabaseAdmin
      .from("crawl_jobs")
      .select("id, domain, created_at")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // No completed crawl job found
    if (!latestJob) {
      return NextResponse.json({
        tasks: [],
        domain: null,
      });
    }

    const jobId = latestJob.id;
    const domain = latestJob.domain;

    // ── Get all audit pages for this job ──────────────────────────────────
    const { data: auditPages, error: auditError } = await supabaseAdmin
      .from("audit_pages")
      .select("url, score, issues")
      .eq("job_id", jobId);

    if (auditError) {
      console.error("Error fetching audit pages:", auditError);
      return NextResponse.json({
        tasks: [],
        domain,
      });
    }

    // ── Extract and flatten all issues ────────────────────────────────────
    const issueMap = new Map<string, { count: number; severity: "error" | "warning" | "notice"; pages: string[] }>();

    for (const page of auditPages || []) {
      if (!Array.isArray(page.issues)) continue;

      const issues = page.issues as RawIssue[];
      for (const issue of issues) {
        const key = issue.id;
        const severity = sevToSeverity(issue.sev);

        if (!issueMap.has(key)) {
          issueMap.set(key, {
            count: 0,
            severity,
            pages: [],
          });
        }

        const entry = issueMap.get(key)!;
        entry.count += 1;
        if (!entry.pages.includes(page.url)) {
          entry.pages.push(page.url);
        }
      }
    }

    // ── Transform issues to tasks ────────────────────────────────────────────
    const tasks: Task[] = Array.from(issueMap.entries()).map(([issueId, { count, severity, pages }], index) => {
      const effort = getEffortLevel(issueId);
      const estimatedPoints = calculateEstimatedPoints(severity, count);

      return {
        id: `${issueId}-${index}`,
        title: getIssueTitle(issueId, issueId),
        description: getIssueDescription(issueId),
        severity,
        effort,
        estimatedPoints,
        affectedPages: count,
        actionHref: `/app/audit/${domain}`,
        status: "todo" as const,
        progress: 0,
      };
    });

    // ── Sort by priority: ERROR → WARNING → NOTICE, then by page count ───
    const severityOrder = { "error": 0, "warning": 1, "notice": 2 };
    tasks.sort((a, b) => {
      const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (sevDiff !== 0) return sevDiff;
      return b.affectedPages - a.affectedPages;
    });

    return NextResponse.json({
      tasks,
      domain,
    });
  } catch (error) {
    console.error("Error in /api/action-center/tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
