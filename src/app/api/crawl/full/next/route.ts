import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import {
    withTimeout,
    fetchHTML,
    fetchPSI,
    extractInternalLinks,
    checkBrokenLinks,
    buildAuditData,
} from "@/app/api/crawl/route";

export const maxDuration = 45; // allows longer execution in Vercel if needed, though we still boundary-enforce it

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const urlParams = new URL(req.url);
        const jobId = urlParams.searchParams.get("job_id");

        if (!jobId) {
            return NextResponse.json({ error: "Job ID required" }, { status: 400 });
        }

        // 1. Fetch job
        const { data: job, error: jobError } = await supabaseAdmin
            .from("crawl_jobs")
            .select("*")
            .eq("id", jobId)
            .eq("user_id", session.user.id)
            .single();

        if (jobError || !job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        if (job.status === "completed" || job.status === "failed") {
            return NextResponse.json({
                done: true,
                message: "Job already finished",
                progress: 100,
                crawled: job.pages_crawled,
            });
        }

        if (job.pages_crawled >= job.pages_limit) {
            // Mark as completed
            await supabaseAdmin.from("crawl_jobs").update({ status: "completed" }).eq("id", jobId);
            return NextResponse.json({
                done: true,
                message: "Reached page limit",
                progress: 100,
                crawled: job.pages_crawled,
            });
        }

        // 2. Fetch the next pending URL from the queue
        const { data: queueItems } = await supabaseAdmin
            .from("crawl_queue")
            .select("*")
            .eq("job_id", jobId)
            .eq("status", "pending")
            .order("id", { ascending: true })
            .limit(1);

        if (!queueItems || queueItems.length === 0) {
            // No more pages to crawl
            await supabaseAdmin.from("crawl_jobs").update({ status: "completed" }).eq("id", jobId);
            return NextResponse.json({
                done: true,
                message: "Crawl complete",
                progress: 100,
                crawled: job.pages_crawled,
            });
        }

        const queueItem = queueItems[0];
        const targetUrl = queueItem.url;

        // Mark as processing
        await supabaseAdmin
            .from("crawl_queue")
            .update({ status: "processing" })
            .eq("id", queueItem.id);

        // 3. Perform Audit
        const cleanDomain = job.domain;
        // We only run PSI on the homepage to save time/API quota, but for a deep crawl we might skip PSI on subpages
        // Let's skip PSI on subpages to avoid 20s timeouts per page, unless it's the exact domain root
        const isRoot = targetUrl === `https://${cleanDomain}` || targetUrl === `https://www.${cleanDomain}`;

        const [html, psi] = await Promise.all([
            withTimeout(fetchHTML(cleanDomain), 8000, ""),
            isRoot ? withTimeout(fetchPSI(cleanDomain), 15000, null) : null,
        ]);

        let brokenLinks: string[] = [];
        let internalLinks: string[] = [];

        if (html) {
            internalLinks = extractInternalLinks(html, cleanDomain);
            // Small timeout for broken links on a background job
            brokenLinks = await withTimeout(checkBrokenLinks(internalLinks.slice(0, 5)), 4000, []);
        }

        const auditData = buildAuditData(cleanDomain, html, psi, brokenLinks);

        // 4. Save results to audit_pages
        await supabaseAdmin.from("audit_pages").insert({
            job_id: jobId,
            url: targetUrl,
            score: auditData.score || 0,
            issues: auditData.issues || [],
            metadata: {
                title: auditData._raw?.pageTitle || "",
                lcp: auditData._raw?.lcpSeconds || null,
                psiAvailable: auditData._raw?.psiAvailable || false,
            },
        });

        // 5. Add new internal links to the queue (Ignore duplicates via UNIQUE constraint or ON CONFLICT in SQL, 
        // but in Supabase JS we can just upsert or handle errors gracefully)
        if (internalLinks.length > 0) {
            // Limit to max 50 new links per page so we don't spam the DB
            const linksToInsert = internalLinks.slice(0, 50).map((l) => ({
                job_id: jobId,
                url: l,
                status: "pending",
            }));
            // UPSERT to ignore conflicts on (job_id, url)
            await supabaseAdmin.from("crawl_queue").upsert(linksToInsert, { onConflict: 'job_id,url', ignoreDuplicates: true });
        }

        // 6. Update queue item to done, increment crawled pages
        await supabaseAdmin.from("crawl_queue").update({ status: "done" }).eq("id", queueItem.id);
        const _crawled = job.pages_crawled + 1;
        await supabaseAdmin.from("crawl_jobs").update({ pages_crawled: _crawled }).eq("id", jobId);

        // 7. Calculate queue size for progress
        const { count: pendingCount } = await supabaseAdmin
            .from("crawl_queue")
            .select("*", { count: 'exact', head: true })
            .eq("job_id", jobId)
            .eq("status", "pending");

        const totalDiscovered = _crawled + (pendingCount || 0);
        const progress = Math.min(100, Math.round((_crawled / Math.min(totalDiscovered, job.pages_limit)) * 100));

        return NextResponse.json({
            done: false,
            progress: progress,
            crawled: _crawled,
            url: targetUrl,
            score: auditData.score || 0,
            issuesFound: auditData.issues?.length || 0,
            issues: auditData.issues || [],
        });

    } catch (error) {
        console.error("[Crawl Next] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
