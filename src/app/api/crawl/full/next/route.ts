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
} from "@/app/api/crawl/route";

export const maxDuration = 45;

// ── Compact issue format (matches ISSUE_META IDs in dashboard-data.ts) ──────────
interface CompactIssue {
    id: string;
    sev: "LOW" | "MED" | "HIGH";
    msg: string;
}

function auditPageCompact(
    domain: string,
    html: string,
    psi: Record<string, unknown> | null,
    brokenLinks: string[]
): { score: number; issues: CompactIssue[] } {
    const issues: CompactIssue[] = [];
    let score = 100;

    if (!html) {
        // Can't audit — return minimal score with no issues if PSI failed too
        return { score: psi ? 50 : 30, issues };
    }

    // Meta description
    const hasMeta = /<meta\s+name=["']description["']/i.test(html) ||
        /<meta\s+content=["'][^"']+["']\s+name=["']description["']/i.test(html);
    if (!hasMeta) {
        score -= 10;
        issues.push({ id: "no_meta_description", sev: "HIGH", msg: "Missing meta description" });
    }

    // Title tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const hasTitle = !!(titleMatch?.[1]?.trim());
    if (!hasTitle) {
        score -= 10;
        issues.push({ id: "no_title", sev: "HIGH", msg: "Missing title tag" });
    }

    // H1
    const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;
    if (h1Count === 0) {
        score -= 5;
        issues.push({ id: "no_h1", sev: "MED", msg: "Missing H1 heading" });
    } else if (h1Count > 1) {
        score -= 3;
        issues.push({ id: "duplicate_title", sev: "LOW", msg: `${h1Count} H1 tags found (should be 1)` });
    }

    // Canonical
    const hasCanonical = /<link\s[^>]*rel=["']canonical["']/i.test(html);
    if (!hasCanonical) {
        score -= 3;
        issues.push({ id: "no_canonical", sev: "LOW", msg: "Missing canonical tag" });
    }

    // Robots noindex
    const isNoindex = /content=["'][^"']*noindex/i.test(html) ||
        /<meta\s[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
    if (isNoindex) {
        score -= 15;
        issues.push({ id: "robots_noindex", sev: "HIGH", msg: "Page set to noindex" });
    }

    // Images missing alt
    const imgsTotal = (html.match(/<img[\s>]/gi) ?? []).length;
    const imgsWithAlt = (html.match(/<img[^>]+alt=["'][^"']+["']/gi) ?? []).length;
    const missingAlt = imgsTotal - imgsWithAlt;
    if (missingAlt > 0) {
        score -= Math.min(5, missingAlt);
        issues.push({ id: "images_missing_alt", sev: "LOW", msg: `${missingAlt} image(s) missing alt text` });
    }

    // Large page size (>100KB HTML)
    const htmlBytes = new TextEncoder().encode(html).length;
    if (htmlBytes > 100_000) {
        score -= 5;
        issues.push({ id: "large_page_size", sev: "MED", msg: `HTML size ${Math.round(htmlBytes / 1024)}KB (>100KB)` });
    }

    // Broken links
    if (brokenLinks.length > 0) {
        score -= Math.min(15, brokenLinks.length * 5);
        issues.push({ id: "broken_links", sev: "HIGH", msg: `${brokenLinks.length} broken link(s) found` });
    }

    // Page speed (from PSI)
    if (psi) {
        const lhr = psi?.lighthouseResult as Record<string, unknown> | undefined;
        const cats = (lhr?.categories as Record<string, unknown> | undefined) ?? {};
        const perfScore = Math.round(
            ((cats.performance as Record<string, unknown> | undefined)?.score as number ?? 0.5) * 100
        );
        if (perfScore < 50) {
            score -= 8;
            issues.push({ id: "slow_page", sev: "MED", msg: `Performance score ${perfScore}/100` });
        }
    }

    return { score: Math.max(20, score), issues };
}

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
            await supabaseAdmin.from("crawl_jobs")
                .update({ status: "completed", current_url: null, last_error: null })
                .eq("id", jobId);
            try {
                await supabaseAdmin.from("activity_events").upsert(
                    {
                        user_id: session.user.id,
                        type: "audit_completed",
                        domain: job.domain,
                        meta: { jobId, pages_crawled: job.pages_crawled },
                    },
                    { onConflict: "user_id,type,domain", ignoreDuplicates: true }
                );
            } catch { /* non-critical */ }
            return NextResponse.json({ done: true, message: "Reached page limit", progress: 100, crawled: job.pages_crawled });
        }

        // 2. Fetch the next pending URL
        const { data: queueItems } = await supabaseAdmin
            .from("crawl_queue")
            .select("*")
            .eq("job_id", jobId)
            .eq("status", "pending")
            .order("id", { ascending: true })
            .limit(1);

        if (!queueItems || queueItems.length === 0) {
            await supabaseAdmin.from("crawl_jobs")
                .update({ status: "completed", current_url: null, last_error: null })
                .eq("id", jobId);
            try {
                await supabaseAdmin.from("activity_events").upsert(
                    {
                        user_id: session.user.id,
                        type: "audit_completed",
                        domain: job.domain,
                        meta: { jobId, pages_crawled: job.pages_crawled },
                    },
                    { onConflict: "user_id,type,domain", ignoreDuplicates: true }
                );
            } catch { /* non-critical */ }
            return NextResponse.json({ done: true, message: "Crawl complete", progress: 100, crawled: job.pages_crawled });
        }

        const queueItem = queueItems[0];
        const targetUrl = queueItem.url;
        const cleanDomain = job.domain;

        // Update visibility: mark what we're fetching right now
        await supabaseAdmin.from("crawl_jobs").update({
            status: "crawling",
            current_url: targetUrl,
            last_heartbeat_at: new Date().toISOString(),
            last_error: null,
        }).eq("id", jobId);

        // Mark queue item as processing
        await supabaseAdmin.from("crawl_queue").update({ status: "processing" }).eq("id", queueItem.id);

        // 3. Fetch HTML (and PSI only on root page)
        const isRoot = targetUrl === `https://${cleanDomain}` || targetUrl === `https://www.${cleanDomain}`;

        let html = "";
        let psi: Record<string, unknown> | null = null;
        let fetchError: string | null = null;
        let httpStatus = 200;

        try {
            // Fetch the specific targetUrl (not just the root domain)
            const fetchHTMLPromise = async () => {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 10000);
                try {
                    const res = await fetch(targetUrl, {
                        signal: controller.signal,
                        headers: { "User-Agent": "Mozilla/5.0 (compatible; RankyPulse/1.0)" },
                    });
                    clearTimeout(timer);
                    httpStatus = res.status;
                    if (!res.ok) return "";
                    return await res.text();
                } catch {
                    clearTimeout(timer);
                    return "";
                }
            };

            [html, psi] = await Promise.all([
                withTimeout(fetchHTMLPromise(), 10000, ""),
                isRoot ? withTimeout(fetchPSI(cleanDomain), 15000, null) : Promise.resolve(null),
            ]);
        } catch (e) {
            fetchError = e instanceof Error ? e.message : "Fetch failed";
            console.error(`[Crawl] fetch error for ${targetUrl}:`, fetchError);
        }

        // Handle HTTP error pages (404, 5xx) — save them as issues so they appear in the audit
        if (!html && !psi && !fetchError && httpStatus >= 400) {
            const issueId = httpStatus === 404 ? "page_not_found" : "page_error";
            const pageIssues: CompactIssue[] = [{ id: issueId, sev: "HIGH", msg: `Page returns HTTP ${httpStatus}` }];
            await supabaseAdmin.from("audit_pages").upsert({
                job_id: jobId,
                url: targetUrl,
                score: 10,
                issues: pageIssues,
                psi_data: null,
                metadata: { title: "", is_root: isRoot, psi_available: false },
            }, { onConflict: "job_id,url", ignoreDuplicates: false });
            await supabaseAdmin.from("crawl_queue").update({ status: "done" }).eq("id", queueItem.id);
            const newCrawled = job.pages_crawled + 1;
            await supabaseAdmin.from("crawl_jobs").update({
                pages_crawled: newCrawled,
                last_heartbeat_at: new Date().toISOString(),
                current_url: null,
            }).eq("id", jobId);
            return NextResponse.json({
                done: false,
                progress: Math.min(99, Math.round((newCrawled / job.pages_limit) * 100)),
                crawled: newCrawled,
                url: targetUrl,
                score: 10,
                issuesFound: pageIssues.length,
                issues: pageIssues,
            });
        }

        if (fetchError || (!html && !psi)) {
            const errMsg = fetchError ?? `Could not reach ${targetUrl}`;
            // Still count as crawled (avoid getting stuck), but log error
            await supabaseAdmin.from("crawl_jobs").update({
                last_error: errMsg,
                last_heartbeat_at: new Date().toISOString(),
                pages_crawled: job.pages_crawled + 1,
            }).eq("id", jobId);
            await supabaseAdmin.from("crawl_queue").update({ status: "done" }).eq("id", queueItem.id);
            console.warn(`[Crawl] Skipping ${targetUrl}: ${errMsg}`);
            return NextResponse.json({
                done: false,
                progress: Math.min(99, Math.round(((job.pages_crawled + 1) / job.pages_limit) * 100)),
                crawled: job.pages_crawled + 1,
                url: targetUrl,
                score: 0,
                issuesFound: 0,
                issues: [],
                warning: errMsg,
            });
        }

        // 4. Discover internal links
        let internalLinks: string[] = [];
        let brokenLinks: string[] = [];
        if (html) {
            internalLinks = extractInternalLinks(html, cleanDomain);
            brokenLinks = await withTimeout(checkBrokenLinks(internalLinks.slice(0, 5)), 4000, []);
        }

        // 5. Run compact audit
        const { score, issues } = auditPageCompact(cleanDomain, html, psi, brokenLinks);

        // 6. Save to audit_pages (upsert in case URL is revisited)
        await supabaseAdmin.from("audit_pages").upsert({
            job_id: jobId,
            url: targetUrl,
            score,
            issues,
            psi_data: isRoot ? psi : null,
            metadata: {
                title: html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? "",
                is_root: isRoot,
                psi_available: !!psi,
            },
        }, { onConflict: "job_id,url", ignoreDuplicates: false });

        // 7. Add new links to queue (upsert to skip duplicates)
        if (internalLinks.length > 0) {
            const linksToInsert = internalLinks.slice(0, 50).map((l) => ({
                job_id: jobId,
                url: l,
                status: "pending",
            }));
            await supabaseAdmin.from("crawl_queue").upsert(linksToInsert, {
                onConflict: "job_id,url",
                ignoreDuplicates: true,
            });
        }

        // 8. Mark done, increment counter
        await supabaseAdmin.from("crawl_queue").update({ status: "done" }).eq("id", queueItem.id);
        const newCrawled = job.pages_crawled + 1;
        await supabaseAdmin.from("crawl_jobs").update({
            pages_crawled: newCrawled,
            last_heartbeat_at: new Date().toISOString(),
            current_url: null,
        }).eq("id", jobId);

        // 9. Progress
        const { count: pendingCount } = await supabaseAdmin
            .from("crawl_queue")
            .select("*", { count: "exact", head: true })
            .eq("job_id", jobId)
            .eq("status", "pending");

        const total = newCrawled + (pendingCount ?? 0);
        const progress = Math.min(99, Math.round((newCrawled / Math.min(total, job.pages_limit)) * 100));

        console.log(`[Crawl] ${cleanDomain} page ${newCrawled}/${job.pages_limit}: ${targetUrl} score=${score} issues=${issues.length}`);

        return NextResponse.json({
            done: false,
            progress,
            crawled: newCrawled,
            url: targetUrl,
            score,
            issuesFound: issues.length,
            issues,
        });

    } catch (error) {
        console.error("[Crawl Next] Unexpected error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
