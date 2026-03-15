import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { computeSeoScore } from "@/lib/seo-score";
import {
  getAccessibleAuditDomainsForUser,
  getLatestSharedAuditJobsForDomains,
} from "@/lib/shared-audits";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const accessibleDomains = await getAccessibleAuditDomainsForUser(userId);
  const sharedJobs = await getLatestSharedAuditJobsForDomains(accessibleDomains);
  const latestJobs = accessibleDomains
    .map((domain) => sharedJobs.get(domain))
    .filter((job): job is NonNullable<typeof job> => Boolean(job));

  // For each domain, fetch score + issue counts from audit_pages
  const domains = await Promise.all(
    latestJobs.map(async (job) => {
      const { data: pages } = await supabaseAdmin
        .from("audit_pages")
        .select("score, issues")
        .eq("job_id", job.id);

      let errors = 0, warnings = 0, notices = 0;

      for (const page of pages ?? []) {
        const rawIssues: Array<{ sev?: string; priority?: string }> = Array.isArray(page.issues)
          ? page.issues
          : [];
        for (const iss of rawIssues) {
          // Support both sev (compact format) and priority (legacy action-center format)
          const sev = (iss.sev ?? "").toUpperCase();
          const priority = (iss.priority ?? "").toLowerCase();
          if (sev === "HIGH" || priority === "high" || priority === "critical") errors++;
          else if (sev === "MED" || priority === "medium") warnings++;
          else notices++;
        }
      }

      // Density-based score — same formula as audit detail page
      const totalPages = (pages ?? []).length || 1;
      const score = computeSeoScore({
        critical: errors / totalPages,
        warning: warnings / totalPages,
        notice: notices / totalPages,
      });

      return {
        domain: job.domain,
        jobId: job.id,
        score,
        errors,
        warnings,
        notices,
        pagesCrawled: job.pages_crawled ?? (pages?.length ?? 0),
        lastAuditAt: job.updated_at ?? job.created_at,
        status: job.status,
        currentUrl: job.current_url ?? null,
        lastError: job.last_error ?? null,
      };
    })
  );

  return NextResponse.json({ domains });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const rawDomain = searchParams.get("domain");
  if (!rawDomain) {
    return NextResponse.json({ error: "domain required" }, { status: 400 });
  }

  // Normalize domain to match what's stored in crawl_jobs
  const domain = rawDomain
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .toLowerCase()
    .trim();

  if (!domain || domain === "undefined") {
    return NextResponse.json({ error: "invalid domain" }, { status: 400 });
  }

  const userId = session.user.id;

  // Delete ALL crawl jobs for this domain+user (cascade deletes crawl_queue + audit_pages via FK)
  const { error: deleteError } = await supabaseAdmin
    .from("crawl_jobs")
    .delete()
    .eq("domain", domain)
    .eq("user_id", userId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // Log activity event exactly once (best-effort, upsert for idempotency)
  try {
    await supabaseAdmin.from("activity_events").upsert(
      {
        user_id: userId,
        type: "project_deleted",
        domain,
        meta: {},
      },
      { onConflict: "user_id,type,domain", ignoreDuplicates: true }
    );
  } catch { /* non-critical */ }

  return NextResponse.json({ success: true });
}
