import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { ISSUE_META } from "@/lib/dashboard-data";
import { calculateSeoScore } from "@/lib/seo-score";

type IssueSeverity = "error" | "warning" | "notice";
type BotStatus = "ok" | "blocked";

// Compact issue format from the crawler
interface CompactIssue {
    id: string;
    sev: "LOW" | "MED" | "HIGH";
    msg: string;
}

interface AggregatedIssue {
    id: string;
    title: string;
    severity: IssueSeverity;
    affectedPages: number;
    category: string;
}

// Map compact sev to display severity
const sevToSeverity = (sev: string): IssueSeverity => {
    if (sev === "HIGH") return "error";
    if (sev === "MED") return "warning";
    return "notice";
};

// Map issue ID → thematic category
const ISSUE_CATEGORY: Record<string, string> = {
    no_title: "markup",
    no_meta_description: "markup",
    no_canonical: "markup",
    no_h1: "markup",
    duplicate_title: "markup",
    images_missing_alt: "markup",
    robots_noindex: "crawlability",
    broken_links: "internalLinking",
    slow_page: "sitePerformance",
    page_not_found: "crawlability",
    large_page_size: "sitePerformance",
};

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const domainParam = searchParams.get("domain")?.trim().toLowerCase();

        // ── Latest completed job ─────────────────────────────────────────────
        const jobQuery = supabaseAdmin
            .from("crawl_jobs")
            .select("id, domain, status, pages_limit, pages_crawled, created_at, updated_at")
            .eq("user_id", session.user.id)
            .eq("status", "completed")
            .order("created_at", { ascending: false })
            .limit(1);

        const { data: job } = await (
            domainParam
                ? jobQuery.eq("domain", domainParam).maybeSingle()
                : jobQuery.maybeSingle()
        );

        if (!job) {
            return NextResponse.json({ noData: true, domain: domainParam ?? null });
        }

        const domain = job.domain;

        // ── All audit pages ──────────────────────────────────────────────────
        const { data: rawPages } = await supabaseAdmin
            .from("audit_pages")
            .select("url, score, issues")
            .eq("job_id", job.id);

        const pages = (rawPages ?? []).map((p) => ({
            url: p.url as string,
            score: p.score as number | null,
            issues: Array.isArray(p.issues) ? (p.issues as CompactIssue[]) : [],
        }));

        if (pages.length === 0) {
            return NextResponse.json({ noData: true, domain });
        }

        // ── Site Health Score ────────────────────────────────────────────────
        const avgScore = calculateSeoScore(pages);

        // ── Page breakdown ───────────────────────────────────────────────────
        const pageBreakdown = { healthy: 0, broken: 0, hasIssues: 0, redirects: 0, blocked: 0 };
        for (const page of pages) {
            const hasHighIssue = page.issues.some((i) => i.sev === "HIGH");
            if (page.issues.length === 0) pageBreakdown.healthy++;
            else if (hasHighIssue) pageBreakdown.broken++;
            else pageBreakdown.hasIssues++;
        }

        // ── Aggregate issues by ID ──────────────────────────────────────────
        const issueMap = new Map<string, AggregatedIssue>();
        let errors = 0;
        let warnings = 0;

        for (const page of pages) {
            for (const issue of page.issues) {
                const severity = sevToSeverity(issue.sev);
                if (severity === "error") errors++;
                else if (severity === "warning") warnings++;

                const existing = issueMap.get(issue.id);
                if (existing) {
                    existing.affectedPages++;
                } else {
                    const meta = ISSUE_META[issue.id] ?? {
                        label: issue.id.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
                        impact: "low" as const,
                    };
                    issueMap.set(issue.id, {
                        id: issue.id,
                        title: meta.label,
                        severity,
                        affectedPages: 1,
                        category: ISSUE_CATEGORY[issue.id] ?? "markup",
                    });
                }
            }
        }

        const severityOrder: Record<IssueSeverity, number> = { error: 0, warning: 1, notice: 2 };
        const topIssues = Array.from(issueMap.values())
            .sort(
                (a, b) =>
                    severityOrder[a.severity] - severityOrder[b.severity] ||
                    b.affectedPages - a.affectedPages
            )
            .slice(0, 12);

        // ── Thematic scores from issue map ───────────────────────────────────
        const thematicBase: Record<string, number> = {
            markup: 100, crawlability: 100, sitePerformance: 100, internalLinking: 100,
        };
        for (const issue of topIssues) {
            const cat = ISSUE_CATEGORY[issue.id] ?? "markup";
            const penalty = issue.severity === "error" ? 15 : issue.severity === "warning" ? 8 : 3;
            thematicBase[cat] = Math.max(0, thematicBase[cat] - penalty);
        }

        // ── PSI score from root page ─────────────────────────────────────────
        const { data: rootPageRow } = await supabaseAdmin
            .from("audit_pages")
            .select("psi_data")
            .eq("job_id", job.id)
            .or(`url.eq.https://${domain},url.eq.https://www.${domain},url.eq.http://${domain}`)
            .maybeSingle();

        let psiPerfScore = thematicBase.sitePerformance;
        if (rootPageRow?.psi_data) {
            const psi = rootPageRow.psi_data as Record<string, unknown>;
            const lhr = psi?.lighthouseResult as Record<string, unknown> | undefined;
            const cats = (lhr?.categories as Record<string, unknown> | undefined) ?? {};
            const perf = (cats.performance as Record<string, unknown> | undefined)?.score as number | undefined;
            if (perf !== undefined) psiPerfScore = Math.round(perf * 100);
        }

        // ── Robots.txt: real bot blocking check ──────────────────────────────
        let robotsTxtContent = "";
        try {
            const r = await fetch(`https://${domain}/robots.txt`, {
                signal: AbortSignal.timeout(3000),
                headers: { "User-Agent": "RankyPulse-Bot/1.0" },
            });
            if (r.ok) robotsTxtContent = (await r.text()).toLowerCase();
        } catch { /* robots.txt unreachable — assume accessible */ }

        const AI_BOTS = [
            { name: "ChatGPT-User", agent: "chatgpt-user" },
            { name: "OAI-SearchBot", agent: "oai-searchbot" },
            { name: "Googlebot", agent: "googlebot" },
            { name: "Google-Extended", agent: "google-extended" },
            { name: "Bingbot", agent: "bingbot" },
        ];

        const isBlockedByRobots = (agent: string): boolean => {
            const lines = robotsTxtContent.split("\n");
            let inBlock = false;
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith("user-agent:")) {
                    const ua = trimmed.replace("user-agent:", "").trim();
                    inBlock = ua === agent || ua === "*";
                }
                if (inBlock && trimmed.startsWith("disallow: /") && trimmed !== "disallow: /\r") {
                    return true;
                }
            }
            return false;
        };

        const bots = AI_BOTS.map((b) => ({
            name: b.name,
            status: (isBlockedByRobots(b.agent) ? "blocked" : "ok") as BotStatus,
        }));

        const blockedBotCount = bots.filter((b) => b.status === "blocked").length;
        const aiScore = Math.max(20, 100 - blockedBotCount * 12);
        const aiMessage =
            aiScore >= 80
                ? "Your site is accessible to most AI crawlers"
                : aiScore >= 60
                    ? "Some AI crawlers are blocked — check robots.txt"
                    : "Multiple AI crawlers blocked — AI search visibility impacted";

        return NextResponse.json({
            domain: job.domain,
            crawledAt: job.updated_at ?? job.created_at,
            pagesLimit: job.pages_limit ?? 10,
            pagesCrawled: job.pages_crawled ?? pages.length,
            siteHealthScore: avgScore,
            previousScore: null,
            pageBreakdown,
            errors,
            warnings,
            topIssues,
            thematic: {
                robotsTxt: {
                    score: 100,
                    status: "ok" as const,
                },
                crawlability: thematicBase.crawlability ?? 100,
                https: 100, // all crawled URLs are https
                internationalSeo: "not_implemented" as const,
                coreWebVitals: psiPerfScore,
                sitePerformance: psiPerfScore,
                internalLinking: thematicBase.internalLinking ?? 100,
                markup: thematicBase.markup ?? 100,
            },
            aiSearchHealth: {
                score: aiScore,
                message: aiMessage,
                issues: blockedBotCount,
                bots,
            },
            noData: false,
        });
    } catch (err) {
        console.error("[api/audits/full-report]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
