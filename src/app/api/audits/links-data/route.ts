import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/audits/links-data?domain=X
 *
 * Returns internal link statistics and top discovered URLs from
 * the crawl_queue table for the domain's latest completed crawl.
 */
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const domainParam = req.nextUrl.searchParams.get("domain");

    try {
        // ── Latest completed job ─────────────────────────────────────────────
        const jobQuery = supabaseAdmin
            .from("crawl_jobs")
            .select("id, domain, pages_crawled")
            .eq("user_id", userId)
            .eq("status", "completed")
            .order("created_at", { ascending: false })
            .limit(1);

        const { data: latestJob } = await (
            domainParam
                ? jobQuery.eq("domain", domainParam).maybeSingle()
                : jobQuery.maybeSingle()
        );

        if (!latestJob) {
            return NextResponse.json({
                totalInternal: 0,
                crawled: 0,
                broken: 0,
                orphan: 0,
                domain: domainParam ?? null,
                topPages: [],
            });
        }

        // ── Get all queue items for this job ─────────────────────────────────
        const { data: queueItems } = await supabaseAdmin
            .from("crawl_queue")
            .select("url, status")
            .eq("job_id", latestJob.id)
            .order("id", { ascending: true });

        const items = queueItems ?? [];
        const totalInternal = items.length;
        const crawled = items.filter((q) => q.status === "done").length;

        // ── Count pages with broken links from audit_pages ───────────────────
        const { data: auditPages } = await supabaseAdmin
            .from("audit_pages")
            .select("issues")
            .eq("job_id", latestJob.id);

        let brokenLinkPages = 0;
        for (const page of auditPages ?? []) {
            const issues = Array.isArray(page.issues) ? page.issues as { id: string }[] : [];
            if (issues.some((i) => i.id === "broken_links")) {
                brokenLinkPages++;
            }
        }

        // ── Top pages for table display ──────────────────────────────────────
        const topPages = items.slice(0, 50).map((q) => ({
            url: q.url,
            status: q.status,
        }));

        return NextResponse.json({
            domain: latestJob.domain,
            totalInternal,
            crawled,
            broken: brokenLinkPages,
            orphan: 0, // cannot compute orphan pages without source_url tracking
            topPages,
        });
    } catch (err) {
        console.error("[links-data] Error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
