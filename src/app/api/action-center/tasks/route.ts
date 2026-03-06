import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { ISSUE_META } from "@/lib/dashboard-data";

// Estimated SEO point gain + effort level per issue type
const TASK_GAIN: Record<string, { points: number; effort: "easy" | "medium" | "hard" }> = {
    robots_txt_blocked:         { points: 30, effort: "medium" },
    robots_noindex:             { points: 25, effort: "easy" },
    no_title:                   { points: 15, effort: "easy" },
    broken_links:               { points: 12, effort: "medium" },
    no_meta_description:        { points: 10, effort: "easy" },
    canonical_mismatch:         { points: 8,  effort: "easy" },
    duplicate_title:            { points: 8,  effort: "medium" },
    orphan_page:                { points: 8,  effort: "medium" },
    redirect_chain:             { points: 6,  effort: "easy" },
    slow_page:                  { points: 6,  effort: "hard" },
    no_og_tags:                 { points: 5,  effort: "easy" },
    low_word_count:             { points: 5,  effort: "medium" },
    meta_desc_too_long:         { points: 5,  effort: "easy" },
    duplicate_meta_description: { points: 4,  effort: "medium" },
    no_schema:                  { points: 3,  effort: "easy" },
    no_h1:                      { points: 3,  effort: "easy" },
    deep_page_depth:            { points: 3,  effort: "hard" },
    title_too_long:             { points: 3,  effort: "easy" },
    images_missing_alt:         { points: 2,  effort: "easy" },
    multiple_h1:                { points: 2,  effort: "easy" },
    no_canonical:               { points: 2,  effort: "easy" },
    title_too_short:            { points: 2,  effort: "easy" },
    meta_desc_too_short:        { points: 2,  effort: "easy" },
    large_page_size:            { points: 2,  effort: "medium" },
    // Phase 4
    multiple_canonicals:        { points: 10, effort: "easy" },
    keyword_cannibalization:    { points: 12, effort: "hard" },
};

/**
 * GET /api/action-center/tasks
 * Returns actionable tasks generated from the latest completed crawl.
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get the latest completed crawl job
        const { data: latestJob } = await supabaseAdmin
            .from("crawl_jobs")
            .select("id, domain")
            .eq("user_id", session.user.id)
            .eq("status", "completed")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!latestJob) {
            return NextResponse.json({ tasks: [], domain: null });
        }

        // Aggregate issues across all pages for this job
        const { data: rawPages } = await supabaseAdmin
            .from("audit_pages")
            .select("issues")
            .eq("job_id", latestJob.id);

        const issueMap: Record<string, { sev: string; count: number }> = {};
        for (const page of rawPages ?? []) {
            for (const issue of (page.issues ?? []) as { id: string; sev: string }[]) {
                if (!issueMap[issue.id]) {
                    issueMap[issue.id] = { sev: issue.sev, count: 0 };
                }
                issueMap[issue.id].count++;
            }
        }

        // Weighted priority: sevWeight * pageCount * (points / 5)
        const sevWeight: Record<string, number> = { HIGH: 3, MED: 2, LOW: 1 };

        const tasks = Object.entries(issueMap)
            .map(([id, { sev, count }]) => {
                const points = TASK_GAIN[id]?.points ?? 2;
                const weight = sevWeight[sev] ?? 1;
                return { id, sev, count, priorityScore: weight * count * (points / 5) };
            })
            .sort((a, b) => b.priorityScore - a.priorityScore)
            .slice(0, 12)
            .map(({ id, sev, count }) => {
                const meta = ISSUE_META[id];
                const gain = TASK_GAIN[id];
                return {
                    id,
                    title: meta
                        ? `Fix: ${meta.label}`
                        : `Fix: ${id.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}`,
                    description: meta?.gain ?? "Fixing this issue will improve your SEO performance.",
                    severity: sev === "HIGH" ? "error" : sev === "MED" ? "warning" : "notice",
                    effort: gain?.effort ?? "medium",
                    estimatedPoints: gain?.points ?? 2,
                    affectedPages: count,
                    actionHref: meta?.actionHref ?? "/audits/issues",
                    status: "todo" as const,
                    progress: 0,
                };
            });

        return NextResponse.json({ tasks, domain: latestJob.domain });
    } catch (err) {
        console.error("[action-center/tasks] Error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
