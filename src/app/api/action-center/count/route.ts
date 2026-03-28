import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import {
  getAccessibleAuditDomainsForUser,
  getLatestSharedAuditJobsForDomains,
} from "@/lib/shared-audits";

/**
 * GET /api/action-center/count
 * Lightweight endpoint for the sidebar badge — returns the count of
 * unresolved HIGH-severity issues from the latest completed crawl job.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }

  try {
    const domains = await getAccessibleAuditDomainsForUser(session.user.id);
    const sharedJobs = await getLatestSharedAuditJobsForDomains(domains, ["completed"]);
    const jobs = domains
      .map((domain) => sharedJobs.get(domain))
      .filter((job): job is NonNullable<typeof job> => Boolean(job))
      .slice(0, 5);

    if (!jobs?.length) return NextResponse.json({ count: 0 });

    for (const job of jobs) {
      const { data: pages } = await supabaseAdmin
        .from("audit_pages")
        .select("issues")
        .eq("job_id", job.id);

      if (!pages || pages.length === 0) continue;

      // Count distinct HIGH-severity issue IDs
      const highIssueIds = new Set<string>();
      for (const page of pages) {
        if (Array.isArray(page.issues)) {
          for (const issue of page.issues as { id: string; sev: string }[]) {
            if (issue.sev === "HIGH") highIssueIds.add(issue.id);
          }
        }
      }

      // Subtract already-completed tasks
      const { data: completions } = await supabaseAdmin
        .from("task_completions")
        .select("issue_id")
        .eq("user_id", session.user.id)
        .eq("domain", job.domain)
        .eq("status", "done");

      const doneIds = new Set((completions ?? []).map((c) => c.issue_id));
      const remaining = [...highIssueIds].filter((id) => !doneIds.has(id)).length;

      return NextResponse.json({ count: remaining });
    }

    return NextResponse.json({ count: 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
