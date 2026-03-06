import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/audits/speed-data?domain=X
 *
 * Returns PageSpeed Insights data for the root page of the domain's latest completed crawl.
 * psi_data is only stored for crawls run AFTER the 20260305160000 migration.
 * If not available, returns { hasPsiData: false } so the UI can prompt the user to re-run.
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
            .select("id, domain, pages_crawled, pages_limit")
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
            return NextResponse.json({ hasPsiData: false, reason: "No completed crawl found" });
        }

        const domain = latestJob.domain;

        // ── Find root page row ───────────────────────────────────────────────
        const { data: rootRow } = await supabaseAdmin
            .from("audit_pages")
            .select("url, psi_data")
            .eq("job_id", latestJob.id)
            .or(`url.eq.https://${domain},url.eq.https://www.${domain},url.eq.http://${domain}`)
            .maybeSingle();

        const psi = rootRow?.psi_data as Record<string, unknown> | null ?? null;

        if (!psi) {
            return NextResponse.json({
                hasPsiData: false,
                reason: "PSI data not stored for this crawl. Re-run the audit to get speed data.",
                domain,
            });
        }

        // ── Extract Lighthouse metrics ───────────────────────────────────────
        const lhr = psi?.lighthouseResult as Record<string, unknown> | undefined;
        const audits = (lhr?.audits as Record<string, unknown> | undefined) ?? {};
        const cats = (lhr?.categories as Record<string, unknown> | undefined) ?? {};

        const perfScore = Math.round(
            ((cats.performance as Record<string, unknown> | undefined)?.score as number ?? 0) * 100
        );

        const getMetric = (key: string): { displayValue: string | null; numericValue: number | null } => {
            const a = audits[key] as Record<string, unknown> | undefined;
            return {
                displayValue: (a?.displayValue as string | null) ?? null,
                numericValue: (a?.numericValue as number | null) ?? null,
            };
        };

        const fcp = getMetric("first-contentful-paint");
        const lcp = getMetric("largest-contentful-paint");
        const tti = getMetric("interactive");
        const tbt = getMetric("total-blocking-time");
        const cls = getMetric("cumulative-layout-shift");
        const si = getMetric("speed-index");

        // ── Extract diagnostics (opportunities to fix) ───────────────────────
        const diagnostics: { id: string; title: string; displayValue: string | null; savingsMs: number | null }[] = [];
        for (const [id, audit] of Object.entries(audits)) {
            const a = audit as Record<string, unknown>;
            if (a.type === "opportunity" && typeof a.score === "number" && a.score < 0.9) {
                diagnostics.push({
                    id,
                    title: (a.title as string) ?? id,
                    displayValue: (a.displayValue as string | null) ?? null,
                    savingsMs: (a.numericValue as number | null) ?? null,
                });
            }
        }

        // Count passed audits
        let passedAudits = 0;
        for (const audit of Object.values(audits)) {
            const a = audit as Record<string, unknown>;
            if (a.score === 1 || a.score === null) passedAudits++;
        }

        return NextResponse.json({
            hasPsiData: true,
            domain,
            mobile: {
                score: perfScore,
                fcp: fcp.displayValue,
                lcp: lcp.displayValue,
                tti: tti.displayValue,
                tbt: tbt.displayValue,
                cls: cls.displayValue,
                si: si.displayValue,
                fcpMs: fcp.numericValue,
                lcpMs: lcp.numericValue,
                clsValue: cls.numericValue,
            },
            desktop: null, // PSI is fetched for mobile strategy only
            diagnostics: diagnostics.slice(0, 10),
            passedAudits,
        });
    } catch (err) {
        console.error("[speed-data] Error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
