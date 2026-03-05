import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { calculateSeoScore } from "@/lib/seo-score";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Fetch all crawl jobs for this user (completed + in-progress)
  const { data: jobs, error } = await supabaseAdmin
    .from("crawl_jobs")
    .select("id, domain, status, created_at, updated_at, pages_crawled, current_url, last_error")
    .eq("user_id", userId)
    .in("status", ["completed", "crawling", "pending", "failed"])
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group by domain — prefer the latest completed job, fall back to in-progress
  const domainMap = new Map<string, typeof jobs[number]>();
  for (const job of jobs ?? []) {
    const existing = domainMap.get(job.domain);
    if (!existing) {
      domainMap.set(job.domain, job);
    } else if (existing.status !== "completed" && job.status === "completed") {
      // Replace in-progress with a completed job
      domainMap.set(job.domain, job);
    }
  }

  const latestJobs = Array.from(domainMap.values()).filter(j => !!j.domain);

  // For each domain, fetch score + issue counts from audit_pages
  const domains = await Promise.all(
    latestJobs.map(async (job) => {
      const { data: pages } = await supabaseAdmin
        .from("audit_pages")
        .select("score, issues")
        .eq("job_id", job.id);

      const score = calculateSeoScore(pages ?? []);
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
        currentUrl: (job as Record<string, unknown>).current_url ?? null,
        lastError: (job as Record<string, unknown>).last_error ?? null,
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
  const jobId = searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ error: "jobId required" }, { status: 400 });
  }

  const userId = session.user.id;

  // Fetch the job first to confirm ownership and get domain
  const { data: job, error: fetchError } = await supabaseAdmin
    .from("crawl_jobs")
    .select("id, domain, user_id")
    .eq("id", jobId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !job) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Delete the job (cascade deletes crawl_queue + audit_pages via FK)
  const { error: deleteError } = await supabaseAdmin
    .from("crawl_jobs")
    .delete()
    .eq("id", jobId)
    .eq("user_id", userId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // Log activity event (best-effort)
  try {
    await supabaseAdmin.from("activity_events").insert({
      user_id: userId,
      type: "project_deleted",
      domain: job.domain,
      meta: { jobId },
    });
  } catch { /* non-critical */ }

  return NextResponse.json({ success: true });
}
