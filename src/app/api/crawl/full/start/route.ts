import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { withTimeout } from "@/app/api/crawl/route";

// Helper to normalize domain
function normalizeDomain(rawDomain: string): string {
    return rawDomain
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0]
        .toLowerCase()
        .trim();
}

/**
 * POST /api/crawl/full/start
 * Initializes a full site crawl job.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { domain } = await req.json();
        if (!domain) {
            return NextResponse.json({ error: "Domain required" }, { status: 400 });
        }

        const cleanDomain = normalizeDomain(domain);

        // Read the user's plan from the database (server-authoritative — never trust client)
        const { data: userData } = await supabaseAdmin
            .from("users")
            .select("plan")
            .eq("id", session.user.id)
            .single();
        const userPlan = (userData?.plan as string) ?? "free";

        // Set page limit based on server-verified plan
        const limit = userPlan === "pro" ? 1000 : userPlan === "starter" ? 100 : 50;

        // 1. Create the job record
        const { data: job, error: jobError } = await supabaseAdmin
            .from("crawl_jobs")
            .insert({
                user_id: session.user.id,
                domain: cleanDomain,
                status: "pending",
                pages_limit: limit,
            })
            .select()
            .single();

        if (jobError || !job) {
            console.error("Crawl Job Error:", jobError);
            return NextResponse.json({ error: "Failed to create crawl job" }, { status: 500 });
        }

        // 2. Seed the queue with the homepage
        await supabaseAdmin.from("crawl_queue").insert({
            job_id: job.id,
            url: `https://${cleanDomain}`,
            status: "pending",
        });

        // 3. Sitemap seeding — parse sitemap.xml and seed discovered URLs (best-effort, 3s timeout)
        try {
            const sitemapXml = await withTimeout(
                fetch(`https://${cleanDomain}/sitemap.xml`, {
                    headers: { "User-Agent": "Mozilla/5.0 (compatible; RankyPulse/1.0)" },
                }).then(r => r.ok ? r.text() : ""),
                3000,
                ""
            );
            if (sitemapXml) {
                const domainRoot = cleanDomain.replace(/^www\./, "");
                const locs = [...sitemapXml.matchAll(/<loc>\s*(https?:\/\/[^\s<]+)\s*<\/loc>/gi)]
                    .map(m => m[1].trim())
                    .filter(u => {
                        try { return new URL(u).hostname.replace(/^www\./, "") === domainRoot; }
                        catch { return false; }
                    })
                    .filter(u => u !== `https://${cleanDomain}` && u !== `https://www.${cleanDomain}`);

                if (locs.length > 0) {
                    const sitemapUrls = locs.slice(0, 50).map(u => ({
                        job_id: job.id,
                        url: u,
                        status: "pending",
                    }));
                    await supabaseAdmin.from("crawl_queue").upsert(sitemapUrls, {
                        onConflict: "job_id,url",
                        ignoreDuplicates: true,
                    });
                    console.log(`[Crawl Start] Seeded ${locs.length} URLs from sitemap.xml for ${cleanDomain}`);
                }
            }
        } catch { /* sitemap is optional — continue without it */ }

        // Update job status to crawling
        await supabaseAdmin
            .from("crawl_jobs")
            .update({ status: "crawling" })
            .eq("id", job.id);

        // Log activity events (best-effort — ignore if activity_events table not yet created)
        try {
            // Check if this is the first job for this domain by this user
            const { count } = await supabaseAdmin
                .from("crawl_jobs")
                .select("id", { count: "exact", head: true })
                .eq("user_id", session.user.id)
                .eq("domain", cleanDomain);

            if ((count ?? 0) <= 1) {
                // First audit = project creation (upsert for idempotency)
                await supabaseAdmin.from("activity_events").upsert(
                    {
                        user_id: session.user.id,
                        type: "project_created",
                        domain: cleanDomain,
                        meta: { jobId: job.id },
                    },
                    { onConflict: "user_id,type,domain", ignoreDuplicates: true }
                );
            }
            // Audit started (upsert for idempotency)
            await supabaseAdmin.from("activity_events").upsert(
                {
                    user_id: session.user.id,
                    type: "audit_started",
                    domain: cleanDomain,
                    meta: { jobId: job.id },
                },
                { onConflict: "user_id,type,domain", ignoreDuplicates: true }
            );
        } catch { /* activity_events table may not exist yet */ }

        return NextResponse.json({ jobId: job.id, message: "Crawl started" });

    } catch (error) {
        console.error("[Crawl Start] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
