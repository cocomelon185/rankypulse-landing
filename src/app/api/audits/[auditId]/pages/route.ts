import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
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
      .select("id, domain, status, pages_crawled")
      .eq("id", auditId)
      .eq("user_id", userId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    // Fetch all audit pages for this job
    const { data: rawPages, error: pagesError } = await supabaseAdmin
      .from("audit_pages")
      .select("url, score, issues")
      .eq("job_id", auditId)
      .order("score", { ascending: true }); // worst pages first

    if (pagesError) {
      throw pagesError;
    }

    const pages = (rawPages ?? []).map((p) => ({
      url: p.url,
      score: p.score ?? null,
      issueCount: Array.isArray(p.issues) ? (p.issues as unknown[]).length : 0,
    }));

    return NextResponse.json({
      domain: job.domain,
      status: job.status,
      pages,
    });
  } catch (err) {
    console.error("[/api/audits/[auditId]/pages] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
