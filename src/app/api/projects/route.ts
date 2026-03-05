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

  // Fetch all crawl jobs for this user
  const { data: jobs, error } = await supabaseAdmin
    .from("crawl_jobs")
    .select("id, domain, status, created_at, updated_at, pages_crawled")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group by domain — keep only the latest job per domain
  const domainMap = new Map<string, typeof jobs[number]>();
  for (const job of jobs ?? []) {
    if (!domainMap.has(job.domain)) {
      domainMap.set(job.domain, job);
    }
  }

  const latestJobs = Array.from(domainMap.values());

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
        const rawIssues: Array<{ sev?: string }> = Array.isArray(page.issues)
          ? page.issues
          : [];
        for (const iss of rawIssues) {
          const sev = (iss.sev ?? "").toUpperCase();
          if (sev === "HIGH" || sev === "CRITICAL") errors++;
          else if (sev === "MED" || sev === "MEDIUM") warnings++;
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
      };
    })
  );

  return NextResponse.json({ domains });
}
