import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import {
    withTimeout,
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

// ── URL depth helper (0 = homepage, 1 = /blog, 2 = /blog/post, etc.) ──────────
function getUrlDepth(url: string): number {
    try {
        const segments = new URL(url).pathname.split("/").filter(Boolean);
        return segments.length;
    } catch { return 0; }
}

// ── Tech stack detection ──────────────────────────────────────────────────────
function getTechStackHint(html: string): string {
    const h = html.toLowerCase();
    if (h.includes("wp-content") || h.includes("wp-includes")) return "WordPress";
    if (h.includes("_next/static") || h.includes("__next_data__")) return "Next.js";
    if (h.includes("react-root") || h.includes("react-dom")) return "React";
    if (h.includes("shopify")) return "Shopify";
    if (h.includes("<table") && (h.includes("bgcolor") || h.includes("cellpadding"))) {
        return "Legacy HTML (Table-based)";
    }
    return "Standard HTML/CSS";
}

function auditPageCompact(
    domain: string,
    pageUrl: string,
    html: string,
    psi: Record<string, unknown> | null,
    brokenLinks: string[]
): { score: number; issues: CompactIssue[]; techStack: string; extraMeta: { canonical_url: string | null; h1_text: string | null; robots_directive: string; word_count: number; html_size_kb: number } } {
    const issues: CompactIssue[] = [];
    let score = 100;

    if (!html) {
        // Can't audit — return minimal score with no issues if PSI failed too
        return { score: psi ? 50 : 30, issues, techStack: "Standard HTML/CSS", extraMeta: { canonical_url: null, h1_text: null, robots_directive: "index", word_count: 0, html_size_kb: 0 } };
    }

    // Meta description
    const hasMeta = /<meta\s+name=["']description["']/i.test(html) ||
        /<meta\s+content=["'][^"']+["']\s+name=["']description["']/i.test(html);
    if (!hasMeta) {
        score -= 10;
        issues.push({ id: "no_meta_description", sev: "HIGH", msg: "Missing meta description" });
    } else {
        // Meta description length checks
        const metaDescContent =
            html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1]?.trim() ??
            html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i)?.[1]?.trim();
        if (metaDescContent) {
            if (metaDescContent.length > 160) {
                score -= 5;
                issues.push({ id: "meta_desc_too_long", sev: "MED", msg: `Meta description is ${metaDescContent.length} chars (max 160)` });
            } else if (metaDescContent.length < 70) {
                score -= 3;
                issues.push({ id: "meta_desc_too_short", sev: "LOW", msg: `Meta description is ${metaDescContent.length} chars (min 70)` });
            }
        }
    }

    // Title tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const hasTitle = !!(titleMatch?.[1]?.trim());
    if (!hasTitle) {
        score -= 10;
        issues.push({ id: "no_title", sev: "HIGH", msg: "Missing title tag" });
    } else {
        // Title length checks
        const titleText = titleMatch![1].trim();
        if (titleText.length > 60) {
            score -= 5;
            issues.push({ id: "title_too_long", sev: "MED", msg: `Title is ${titleText.length} chars (max 60)` });
        } else if (titleText.length < 30) {
            score -= 3;
            issues.push({ id: "title_too_short", sev: "LOW", msg: `Title is ${titleText.length} chars (min 30)` });
        }
    }

    // H1
    const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;
    const h1Text = html.match(/<h1[^>]*>([^<]+)/i)?.[1]?.trim() ?? null;
    if (h1Count === 0) {
        score -= 5;
        issues.push({ id: "no_h1", sev: "MED", msg: "Missing H1 heading" });
    } else if (h1Count > 1) {
        score -= 3;
        issues.push({ id: "multiple_h1", sev: "LOW", msg: `${h1Count} H1 tags found (should be 1)` });
    }

    // Canonical
    const hasCanonical = /<link\s[^>]*rel=["']canonical["']/i.test(html);
    let canonHref: string | null = null;
    if (!hasCanonical) {
        score -= 3;
        issues.push({ id: "no_canonical", sev: "LOW", msg: "Missing canonical tag" });
    } else {
        // Canonical mismatch — canonical exists but points to a different URL
        canonHref = (
            html.match(/<link\s[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ??
            html.match(/<link\s[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i)
        )?.[1]?.trim() ?? null;
        if (canonHref) {
            const norm = (u: string) => u.replace(/\/$/, "");
            if (norm(canonHref) !== norm(pageUrl)) {
                score -= 8;
                issues.push({ id: "canonical_mismatch", sev: "HIGH", msg: `Canonical → ${canonHref}` });
            }
        }

        // Multiple canonical tags (only when at least one canonical exists)
        const canonicalTagCount = (html.match(/<link\s[^>]*rel=["']canonical["']/gi) ?? []).length;
        if (canonicalTagCount > 1) {
            score -= 10;
            issues.push({ id: "multiple_canonicals", sev: "HIGH", msg: `${canonicalTagCount} canonical tags found (should be exactly 1)` });
        }
    }

    // Robots noindex — check <head> ONLY to avoid false positives from
    // blog post content examples like `<meta name="robots" content="noindex">`
    // rendered as escaped text inside <code> blocks.
    const headHtml = html.match(/<head[\s>][\s\S]*?<\/head>/i)?.[0] ?? "";
    const isNoindex = /<meta\s[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(headHtml);
    if (isNoindex) {
        score -= 15;
        issues.push({ id: "robots_noindex", sev: "HIGH", msg: "Page set to noindex" });
    }

    // Open Graph tags
    const hasOgTitle = /<meta\s[^>]*property=["']og:title["']/i.test(html);
    const hasOgDesc  = /<meta\s[^>]*property=["']og:description["']/i.test(html);
    if (!hasOgTitle || !hasOgDesc) {
        score -= 5;
        issues.push({ id: "no_og_tags", sev: "MED", msg: "Missing og:title or og:description" });
    }

    // Structured data / Schema.org
    const hasSchema =
        /<script\s[^>]*type=["']application\/ld\+json["']/i.test(html) ||
        /\bitemscope\b/i.test(html);
    if (!hasSchema) {
        score -= 3;
        issues.push({ id: "no_schema", sev: "LOW", msg: "No structured data (JSON-LD / Schema.org)" });
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

    // Low word count (<300 words of visible text)
    const textOnly = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    const wordCount = textOnly.split(" ").filter(w => w.length > 2).length;
    if (wordCount < 300) {
        score -= 5;
        issues.push({ id: "low_word_count", sev: "MED", msg: `Only ${wordCount} words (300+ recommended)` });
    }

    // Broken links
    if (brokenLinks.length > 0) {
        score -= Math.min(15, brokenLinks.length * 5);
        issues.push({ id: "broken_links", sev: "HIGH", msg: `${brokenLinks.length} broken link(s) found` });
    }

    // Viewport meta tag (mobile-friendliness) — requires width=device-width to be valid
    const hasViewport = /<meta\s+name=["']viewport["']\s+content=["'][^"']*width=device-width[^"']*["']/i.test(html);
    if (!hasViewport) {
        score -= 15;
        issues.push({ id: "no_viewport", sev: "HIGH", msg: "Missing viewport meta tag — site is not mobile-friendly" });
    }

    // HTTP (not HTTPS) URL — showstopper for trust and Google ranking
    if (pageUrl.startsWith("http:")) {
        score -= 20;
        issues.push({ id: "http_pages", sev: "HIGH", msg: "Page served over HTTP (not HTTPS)" });
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

    const techStack = getTechStackHint(html);
    return {
        score: Math.max(20, score),
        issues,
        techStack,
        extraMeta: {
            canonical_url: canonHref,
            h1_text: h1Text,
            robots_directive: isNoindex ? "noindex" : "index",
            word_count: wordCount,
            html_size_kb: Math.round(htmlBytes / 1024),
        },
    };
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
        let redirectChain: string[] = [];

        try {
            // Fetch with manual redirect tracking so we can detect redirect chains
            const fetchHTMLPromise = async (): Promise<string> => {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 12000);
                let currentUrl = targetUrl;
                redirectChain = [targetUrl];
                try {
                    for (let hop = 0; hop < 10; hop++) {
                        const res = await fetch(currentUrl, {
                            signal: controller.signal,
                            redirect: "manual",
                            headers: { "User-Agent": "Mozilla/5.0 (compatible; RankyPulse/1.0)" },
                        });
                        if (res.status >= 300 && res.status < 400) {
                            const loc = res.headers.get("location");
                            if (!loc) break;
                            currentUrl = loc.startsWith("http") ? loc : new URL(loc, currentUrl).toString();
                            redirectChain.push(currentUrl);
                            continue;
                        }
                        clearTimeout(timer);
                        httpStatus = res.status;
                        if (!res.ok) return "";
                        return await res.text();
                    }
                } catch {
                    // timeout or network error
                }
                clearTimeout(timer);
                return "";
            };

            [html, psi] = await Promise.all([
                withTimeout(fetchHTMLPromise(), 13000, ""),
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
        const { score, issues, techStack, extraMeta } = auditPageCompact(cleanDomain, targetUrl, html, psi, brokenLinks);

        // 5b. Detect redirect chain (≥2 hops = chain of 3+ URLs)
        if (redirectChain.length >= 3) {
            issues.push({
                id: "redirect_chain",
                sev: "MED",
                msg: `Redirect chain: ${redirectChain.length - 1} hops`,
            });
        }

        // 5c. Robots.txt site-level blocking check (root page only)
        if (isRoot) {
            try {
                const robotsText = await withTimeout(
                    fetch(`https://${cleanDomain}/robots.txt`, {
                        headers: { "User-Agent": "Mozilla/5.0 (compatible; RankyPulse/1.0)" },
                    }).then(r => r.ok ? r.text() : ""),
                    3000,
                    ""
                );
                if (robotsText) {
                    // Detect "User-agent: *" followed by "Disallow: /"
                    const isBlocked = /User-agent:\s*\*[\s\S]*?Disallow:\s*\/(\s|$)/i.test(robotsText);
                    if (isBlocked) {
                        issues.push({ id: "robots_txt_blocked", sev: "HIGH", msg: "robots.txt blocks all crawlers (Disallow: /)" });
                    }
                }
            } catch { /* non-critical */ }
        }

        // Extract meta_description for duplicate detection at read time
        const metaDescription =
            html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1]?.trim() ??
            html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i)?.[1]?.trim() ??
            "";

        // 6. Save to audit_pages (upsert in case URL is revisited)
        await supabaseAdmin.from("audit_pages").upsert({
            job_id: jobId,
            url: targetUrl,
            score,
            issues,
            psi_data: isRoot ? psi : null,
            metadata: {
                title: html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? "",
                meta_description: metaDescription,
                outbound_links: internalLinks,
                broken_link_targets: brokenLinks.slice(0, 10),
                depth: getUrlDepth(targetUrl),
                is_root: isRoot,
                psi_available: !!psi,
                tech_stack: techStack,
                ...extraMeta,
            },
        }, { onConflict: "job_id,url", ignoreDuplicates: false });

        // 7. Add new links to queue (upsert to skip duplicates)
        // Skip auth-required paths (/app/*, /api/*) — the crawler can't authenticate,
        // so these pages redirect to /auth/signin causing false canonical mismatch,
        // keyword cannibalization, and blocked-by-robots issues.
        const SKIP_CRAWL_PREFIXES = ["/app/", "/api/"];
        if (internalLinks.length > 0) {
            const crawlableLinks = internalLinks.filter(link => {
                try {
                    const pathname = new URL(link).pathname;
                    return !SKIP_CRAWL_PREFIXES.some(p => pathname.startsWith(p));
                } catch { return true; }
            });
            if (crawlableLinks.length > 0) {
                const linksToInsert = crawlableLinks.slice(0, 50).map((l) => ({
                    job_id: jobId,
                    url: l,
                    status: "pending",
                }));
                await supabaseAdmin.from("crawl_queue").upsert(linksToInsert, {
                    onConflict: "job_id,url",
                    ignoreDuplicates: true,
                });
            }
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
