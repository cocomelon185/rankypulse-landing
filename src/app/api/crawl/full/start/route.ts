import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { getBillingState, getAuditCap } from "@/lib/billing-store";

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

        const { domain, plan } = await req.json();
        if (!domain) {
            return NextResponse.json({ error: "Domain required" }, { status: 400 });
        }

        const cleanDomain = normalizeDomain(domain);

        // Set page limit based on plan
        const limit = plan === "pro" ? 200 : plan === "starter" ? 50 : 10;

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
                // First audit = project creation
                await supabaseAdmin.from("activity_events").insert({
                    user_id: session.user.id,
                    type: "project_created",
                    domain: cleanDomain,
                    meta: { jobId: job.id },
                });
            }
            await supabaseAdmin.from("activity_events").insert({
                user_id: session.user.id,
                type: "audit_started",
                domain: cleanDomain,
                meta: { jobId: job.id },
            });
        } catch { /* activity_events table may not exist yet */ }

        return NextResponse.json({ jobId: job.id, message: "Crawl started" });

    } catch (error) {
        console.error("[Crawl Start] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
