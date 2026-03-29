/**
 * GET /api/audit/score-history?domain=example.com
 *
 * Returns the last 6 completed audit scores for a domain as a time-series,
 * so the dashboard can show a real "SEO Health Trend" chart instead of
 * fabricated data.
 *
 * Each point: { date, month, score, jobId }
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { computeSeoScore } from "@/lib/seo-score";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain")?.trim();
  if (!domain) {
    return NextResponse.json({ error: "domain required" }, { status: 400 });
  }

  // Fetch last 6 completed crawl jobs for this domain (oldest first for chart)
  const { data: jobs, error: jobError } = await supabaseAdmin
    .from("crawl_jobs")
    .select("id, domain, created_at, updated_at")
    .eq("user_id", session.user.id)
    .eq("domain", domain)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(6);

  if (jobError || !jobs || jobs.length === 0) {
    return NextResponse.json({ history: [] });
  }

  // For each job compute its SEO score from audit_pages
  const history = await Promise.all(
    jobs.map(async (job) => {
      const { data: pages } = await supabaseAdmin
        .from("audit_pages")
        .select("issues")
        .eq("job_id", job.id)
        .neq("url", "__site_level__");

      let errors = 0, warnings = 0, notices = 0;
      const pageList = pages ?? [];

      for (const page of pageList) {
        const rawIssues: Array<{ sev?: string; priority?: string }> = Array.isArray(page.issues) ? page.issues : [];
        for (const iss of rawIssues) {
          const sev = (iss.sev ?? "").toUpperCase();
          const priority = (iss.priority ?? "").toLowerCase();
          if (sev === "HIGH" || priority === "high" || priority === "critical") errors++;
          else if (sev === "MED" || priority === "medium") warnings++;
          else notices++;
        }
      }

      const totalPages = pageList.length || 1;
      const score = computeSeoScore({
        critical: errors / totalPages,
        warning: warnings / totalPages,
        notice: notices / totalPages,
      });

      const date = job.updated_at ?? job.created_at;
      return {
        jobId: job.id,
        date,
        month: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        score,
      };
    })
  );

  // Return oldest → newest (chart left-to-right)
  return NextResponse.json({ history: history.reverse() });
}
