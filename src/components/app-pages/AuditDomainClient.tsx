"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Globe, RefreshCcw, Download, Share2, AlertTriangle, XCircle,
    CheckCircle, ChevronRight, Zap, ArrowRight, AlertCircle,
    Loader2, Clock,
} from "lucide-react";
import { AuditSummaryPanel } from "./AuditSummaryPanel";
import { ISSUE_CONTENT } from "@/lib/issue-content";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProjectData {
    domain: string;
    jobId: string;
    score: number;
    errors: number;
    warnings: number;
    notices: number;
    pagesCrawled: number;
    lastAuditAt: string;
    status: string;
    currentUrl?: string | null;
    lastError?: string | null;
}

interface IssueItem {
    id: string;
    severity: "error" | "warning" | "notice";
    title: string;
    description: string;
    urlsAffected: number;
    affectedUrls?: string[];
    discovered: string;
}

interface AuditData {
    healthScore: number;
    previousScore?: number | null;
    errors: number;
    warnings: number;
    notices: number;
    domain: string | null;
    crawledAt: string | null;
    totalPages: number;
    issues: IssueItem[];
    brokenLinks?: { source: string; targets: string[] }[];
    crawlDuration?: number | null;
    crawlStats?: {
        avgDepth: number;
        deepPageCount: number;
        totalPages: number;
        depthDistribution?: {
            depth1: number;
            depth2: number;
            depth3: number;
            depth4plus: number;
        };
        internalLinks?: number;
        brokenPages?: number;
        redirectPages?: number;
    };
}

// ── Thematic score computation ────────────────────────────────────────────────
const ISSUE_CATEGORY: Record<string, string> = {
    no_title: "Technical",
    no_meta_description: "Technical",
    no_canonical: "Technical",
    no_h1: "Content",
    duplicate_title: "Content",
    images_missing_alt: "Content",
    robots_noindex: "Indexing",
    broken_links: "Links",
    slow_page: "Performance",
    page_not_found: "Indexing",
    large_page_size: "Performance",
    duplicate_meta_description: "Content",
    redirect_chain: "Technical",
    orphan_page: "Links",
    multiple_h1: "Content",
    // Phase 3
    title_too_long:      "Content",
    title_too_short:     "Content",
    meta_desc_too_long:  "Content",
    meta_desc_too_short: "Content",
    no_og_tags:          "Content",
    no_schema:           "Content",
    canonical_mismatch:  "Technical",
    low_word_count:      "Content",
    deep_page_depth:     "Links",
    robots_txt_blocked:  "Technical",
    // Phase 4
    multiple_canonicals:     "Technical",
    keyword_cannibalization: "Content",
};

const THEMATIC_COLORS: Record<string, string> = {
    Technical: "#FF642D",
    Content: "#7B5CF5",
    Performance: "#00B0FF",
    Links: "#00C853",
    Indexing: "#FF9800",
};

function computeThematicScores(issues: IssueItem[]) {
    const base: Record<string, number> = {
        Technical: 100, Content: 100, Performance: 100, Links: 100, Indexing: 100,
    };
    for (const issue of issues) {
        const cat = ISSUE_CATEGORY[issue.id] ?? "Technical";
        const penalty = issue.severity === "error" ? 15 : issue.severity === "warning" ? 8 : 3;
        base[cat] = Math.max(0, base[cat] - penalty);
    }
    return Object.entries(base).map(([label, score]) => ({
        label, score, color: THEMATIC_COLORS[label] ?? "#FF642D",
    }));
}

// ── Thematic tooltip content ───────────────────────────────────────────────────
const THEMATIC_TOOLTIP: Record<string, string> = {
    Technical:   "Canonical errors, redirect chains, robots.txt blocks, duplicate H1",
    Content:     "Missing titles, meta descriptions, duplicate content, low word count",
    Performance: "Slow page load times, large page sizes",
    Links:       "Broken links, orphan pages, excessive link depth",
    Indexing:    "Noindex directives, blocked pages, crawl errors",
};

// ── ThematicScore mini gauge ──────────────────────────────────────────────────
function ThematicScore({ label, score, color, loading }: { label: string; score: number; color: string; loading?: boolean }) {
    const r = 28;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - score / 100);
    const tip = THEMATIC_TOOLTIP[label];
    return (
        <div className="relative flex flex-col items-center gap-2 group">
            <div className="relative w-16 h-16">
                {loading ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <Loader2 size={22} className="animate-spin" style={{ color }} />
                    </div>
                ) : (
                    <>
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
                            <circle cx="36" cy="36" r={r} fill="none" stroke="#1a2236" strokeWidth="6" />
                            <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
                                strokeDasharray={`${circ}`} strokeDashoffset={offset} strokeLinecap="round"
                                style={{ filter: `drop-shadow(0 0 6px ${color}60)` }} />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[13px] font-black text-white">{score}</span>
                    </>
                )}
            </div>
            <span className="text-[10px] font-semibold text-center" style={{ color: "#8B9BB4" }}>{label}</span>
            {tip && (
                <div className="absolute bottom-[110%] left-1/2 -translate-x-1/2 z-50 pointer-events-none
                    invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-150
                    rounded-lg px-3 py-2 text-[10px] w-44 text-center leading-relaxed"
                    style={{ background: "#1a2236", border: "1px solid #1E2940", color: "#8B9BB4" }}>
                    <p className="font-bold mb-0.5 text-white">{label}</p>
                    {tip}
                </div>
            )}
        </div>
    );
}

// ── InsightCard mini summary card ─────────────────────────────────────────────
function InsightCard({ icon, color, title, value, desc }: {
    icon: string; color: string; title: string; value: string; desc: string;
}) {
    return (
        <div className="rounded-xl p-3 flex flex-col gap-1 min-w-0"
            style={{ background: "#0d1526", border: "1px solid #1E2940" }}>
            <div className="text-[10px] font-semibold uppercase tracking-wider truncate" style={{ color: "#6B7A99" }}>{title}</div>
            <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-black" style={{ color }}>{icon}</span>
                <span className="text-xl font-black text-white leading-none">{value}</span>
            </div>
            <div className="text-[10px] truncate" style={{ color: "#4A5568" }}>{desc}</div>
        </div>
    );
}

// ── Insight gain table ────────────────────────────────────────────────────────
const INSIGHT_GAIN: Record<string, number> = {
    robots_txt_blocked: 30, robots_noindex: 25, no_title: 15, broken_links: 12,
    no_meta_description: 10, canonical_mismatch: 8, duplicate_title: 8,
    orphan_page: 8, redirect_chain: 6, slow_page: 6, no_og_tags: 5,
    low_word_count: 5, meta_desc_too_long: 5, no_schema: 3, deep_page_depth: 3,
    no_h1: 3, images_missing_alt: 2,
    // Phase 4
    multiple_canonicals: 10, keyword_cannibalization: 12,
};

// ── OpportunityCard ───────────────────────────────────────────────────────────
function OpportunityCard({ topIssues }: { topIssues: IssueItem[] }) {
    if (topIssues.length === 0) {
        return (
            <div className="rounded-xl p-3 flex flex-col gap-1 min-w-0"
                style={{ background: "#0d1526", border: "1px solid #1E2940" }}>
                <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#6B7A99" }}>Opportunity</div>
                <div className="text-xl font-black" style={{ color: "#eab308" }}>🏆</div>
                <div className="text-[10px] leading-relaxed" style={{ color: "#4A5568" }}>
                    Well optimized! Keep publishing content and building internal links.
                </div>
            </div>
        );
    }
    const top3 = topIssues.slice(0, 3).map(i => i.title);
    return (
        <div className="rounded-xl p-3 flex flex-col gap-1 min-w-0"
            style={{ background: "#0d1526", border: "1px solid #1E2940" }}>
            <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#6B7A99" }}>Opportunity</div>
            <div className="text-sm font-black" style={{ color: "#eab308" }}>+15–25% traffic</div>
            <div className="text-[10px] mb-1" style={{ color: "#4A5568" }}>Fix top issues to boost rankings</div>
            {top3.map(t => (
                <div key={t} className="text-[10px] flex gap-1 items-start" style={{ color: "#6B7A99" }}>
                    <span style={{ color: "#eab308" }}>•</span>
                    <span className="truncate">{t}</span>
                </div>
            ))}
        </div>
    );
}

// ── CrawlTransparencyPanel ────────────────────────────────────────────────────
function CrawlTransparencyPanel({ pagesCrawled, internalLinks, brokenPages, redirectPages }: {
    pagesCrawled: number; internalLinks: number; brokenPages: number; redirectPages: number;
}) {
    const stats = [
        { label: "Pages Crawled",        value: pagesCrawled.toLocaleString(),   color: "#22c55e" },
        { label: "Internal Links Found", value: internalLinks.toLocaleString(),  color: "#3b82f6" },
        { label: "Broken Pages",         value: brokenPages.toLocaleString(),    color: brokenPages   > 0 ? "#ef4444" : "#22c55e" },
        { label: "Redirects Found",      value: redirectPages.toLocaleString(),  color: redirectPages > 0 ? "#eab308" : "#22c55e" },
    ];
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border p-4"
            style={{ background: "#0d1526", borderColor: "#1E2940" }}>
            {stats.map(({ label, value, color }) => (
                <div key={label} className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "#6B7A99" }}>{label}</span>
                    <span className="text-xl font-black" style={{ color }}>{value}</span>
                </div>
            ))}
        </div>
    );
}

// ── DepthDistributionWidget ───────────────────────────────────────────────────
function DepthDistributionWidget({ dist, total }: {
    dist: { depth1: number; depth2: number; depth3: number; depth4plus: number };
    total: number;
}) {
    const rows = [
        { label: "Depth 1", count: dist.depth1,    color: "#22c55e" },
        { label: "Depth 2", count: dist.depth2,    color: "#3b82f6" },
        { label: "Depth 3", count: dist.depth3,    color: "#eab308" },
        { label: "Depth 4+", count: dist.depth4plus, color: "#ef4444" },
    ];
    return (
        <div className="rounded-xl p-4 mt-4" style={{ background: "#0d1526", border: "1px solid #1E2940" }}>
            <div className="text-sm font-semibold text-white mb-1">Link Depth Structure</div>
            <p className="text-[11px] mb-3" style={{ color: "#6B7A99" }}>
                Internal links pass ranking authority across your site. Pages closer to the homepage receive stronger signals and more crawl budget.
            </p>
            {rows.map(({ label, count, color }) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                    <div key={label} className="mb-2">
                        <div className="flex justify-between text-xs mb-0.5" style={{ color: "#6B7A99" }}>
                            <span>{label}</span>
                            <span>{count} pages ({pct}%)</span>
                        </div>
                        <div className="rounded-full h-1.5 w-full" style={{ background: "#1E2940" }}>
                            <div className="rounded-full h-1.5 transition-all" style={{ width: `${pct}%`, background: color }} />
                        </div>
                    </div>
                );
            })}
            {dist.depth4plus > 0 && (
                <p className="text-[11px] mt-2" style={{ color: "#ef4444" }}>
                    ⚠ {dist.depth4plus} page{dist.depth4plus > 1 ? "s are" : " is"} buried 4+ clicks from homepage.
                    {total > 0 && (dist.depth4plus / total) > 0.2 && (
                        <span> Many pages ({Math.round((dist.depth4plus / total) * 100)}%) are buried deep — consider flattening your site structure.</span>
                    )}
                </p>
            )}
        </div>
    );
}

// ── SEOInsightPanel ───────────────────────────────────────────────────────────
function SEOInsightPanel({ auditData, crawlStats }: {
    auditData: AuditData;
    crawlStats: AuditData["crawlStats"];
}) {
    const crawlIssueIds = ["robots_txt_blocked","robots_noindex","canonical_mismatch","multiple_canonicals","redirect_chain","orphan_page"];
    const crawlIssues = auditData.issues.filter(i => crawlIssueIds.includes(i.id));
    const crawlBlocked = crawlIssues.reduce((s, i) => s + i.urlsAffected, 0);

    const contentIssueIds = ["no_title","no_meta_description","duplicate_title","duplicate_meta_description","low_word_count","keyword_cannibalization","no_og_tags"];
    const contentIssues = auditData.issues.filter(i => contentIssueIds.includes(i.id));
    const contentAffected = contentIssues.reduce((s, i) => s + i.urlsAffected, 0);

    const avgDepth = crawlStats?.avgDepth ?? 0;
    const deepCount = crawlStats?.deepPageCount ?? 0;
    const orphanIssue = auditData.issues.find(i => i.id === "orphan_page");
    const kannibalizationIssue = auditData.issues.find(i => i.id === "keyword_cannibalization");

    const panels = [
        {
            title: "Crawlability",
            icon: crawlBlocked > 0 ? "🔴" : "✅",
            color: crawlBlocked > 0 ? "#ef4444" : "#22c55e",
            body: crawlBlocked > 0
                ? `${crawlBlocked} page${crawlBlocked > 1 ? "s are" : " is"} at risk of not being indexed. ${crawlIssues[0] ? `Top issue: ${crawlIssues[0].title}.` : ""} Fix critical crawl errors first to ensure Google can reach your content.`
                : "All crawled pages appear indexable. No blocking robots.txt or noindex issues detected. Your site is fully accessible to search engines.",
        },
        {
            title: "Content Quality",
            icon: contentAffected > 5 ? "⚠️" : contentAffected > 0 ? "🟡" : "✅",
            color: contentAffected > 5 ? "#ef4444" : contentAffected > 0 ? "#eab308" : "#22c55e",
            body: contentAffected > 0
                ? `${contentAffected} page${contentAffected > 1 ? "s have" : " has"} content metadata issues. ${contentIssues[0] ? `Highest impact: ${contentIssues[0].title} (${contentIssues[0].urlsAffected} pages).` : ""}${
                    kannibalizationIssue
                        ? ` Keyword cannibalization detected on ${kannibalizationIssue.urlsAffected} pages — consolidate or differentiate competing pages to strengthen your ranking signal.`
                        : " Well-crafted titles and descriptions directly improve click-through rates."
                }`
                : "Content metadata looks healthy. All crawled pages have titles, meta descriptions, and adequate word counts.",
        },
        {
            title: "Link Architecture",
            icon: avgDepth > 3 || deepCount > 3 ? "⚠️" : "✅",
            color: avgDepth > 3 || deepCount > 3 ? "#eab308" : "#22c55e",
            body: deepCount > 0
                ? `Average page depth is ${avgDepth}. ${deepCount} page${deepCount > 1 ? "s are" : " is"} buried 4+ clicks from the homepage — these pages receive less crawl budget and link equity.${orphanIssue ? ` ${orphanIssue.urlsAffected} orphan page${orphanIssue.urlsAffected > 1 ? "s have" : " has"} no internal links — add links from related content or navigation menus to pass PageRank.` : " Consider flattening your URL structure."}`
                : `Average page depth is ${avgDepth > 0 ? avgDepth : "shallow"}. Your site structure is well-organized — all pages are reachable within a few clicks of the homepage.${orphanIssue ? ` Note: ${orphanIssue.urlsAffected} page${orphanIssue.urlsAffected > 1 ? "s lack" : " lacks"} internal links. Add links from related content pages or your site navigation.` : ""}`,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {panels.map(({ title, icon, color, body }) => (
                <div key={title} className="rounded-xl p-4" style={{ background: "#0d1526", border: "1px solid #1E2940" }}>
                    <div className="flex items-center gap-2 mb-2">
                        <span role="img" aria-label={title}>{icon}</span>
                        <span className="text-sm font-semibold" style={{ color }}>{title}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "#8892A4" }}>{body}</p>
                </div>
            ))}
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function AuditDomainClient({ domain }: { domain: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [jobData, setJobData] = useState<ProjectData | null>(null);
    const [auditData, setAuditData] = useState<AuditData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
    const [rerunning, setRerunning] = useState(false);

    // Tracks how many concurrent crawl driver workers are running.
    const activeDriversRef = useRef<number>(0);

    // Write domain to localStorage so audit sub-pages (/audits/speed, /audits/full etc.) can read it
    useEffect(() => {
        if (domain) {
            localStorage.setItem("rankypulse_last_url", domain);
            localStorage.setItem("rankypulse_audit_domain", domain);
        }
    }, [domain]);

    const fetchData = useCallback(async () => {
        try {
            const [projRes, auditRes] = await Promise.all([
                fetch("/api/projects"),
                fetch(`/api/audits/data?domain=${encodeURIComponent(domain)}`),
            ]);

            if (projRes.ok) {
                const d = await projRes.json();
                const found = (d.domains ?? []).find((p: ProjectData) => p.domain === domain) ?? null;
                setJobData(found);
            }

            if (auditRes.ok) {
                setAuditData(await auditRes.json());
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, [domain]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Poll every 6s while crawling (refreshes pages_crawled, currentUrl, lastError)
    useEffect(() => {
        if (!jobData) return;
        if (jobData.status !== "crawling" && jobData.status !== "pending") return;
        const id = setInterval(fetchData, 6000);
        return () => clearInterval(id);
    }, [jobData?.status, fetchData]);

    // ── Crawl driver (3 concurrent workers) ──────────────────────────────────
    // Three workers drive the crawl in parallel for ~3x throughput.
    useEffect(() => {
        if (!jobData?.jobId) return;
        if (jobData.status !== "crawling" && jobData.status !== "pending") return;

        const jobId = jobData.jobId;

        // Guard: don't start new workers if they're already running for this job
        if (activeDriversRef.current > 0) return;

        const CONCURRENCY = 3;
        activeDriversRef.current = CONCURRENCY;

        const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
        let jobDone = false; // shared flag so only one worker triggers fetchData

        const runWorker = async (workerIndex: number) => {
            let failCount = 0;
            const MAX_FAILS = 5;
            console.log(`[CrawlDriver] Worker ${workerIndex + 1} starting for job ${jobId}`);
            try {
                while (!jobDone && failCount < MAX_FAILS) {
                    try {
                        const res = await fetch(`/api/crawl/full/next?job_id=${jobId}`);
                        if (!res.ok) {
                            failCount++;
                            console.warn(`[CrawlDriver] W${workerIndex + 1}: HTTP ${res.status}, fail ${failCount}/${MAX_FAILS}`);
                            await sleep(3000);
                            continue;
                        }
                        const data = await res.json();
                        failCount = 0;

                        if (data.done) {
                            if (!jobDone) {
                                jobDone = true;
                                console.log(`[CrawlDriver] Job ${jobId} complete. Refreshing.`);
                                fetchData();
                            }
                            break;
                        }

                        // Brief pause between pages
                        await sleep(200);
                    } catch (e) {
                        failCount++;
                        console.error(`[CrawlDriver] W${workerIndex + 1} error:`, e);
                        await sleep(3000);
                    }
                }
            } finally {
                activeDriversRef.current = Math.max(0, activeDriversRef.current - 1);
            }
        };

        // Stagger worker starts to avoid thundering herd on the queue
        for (let i = 0; i < CONCURRENCY; i++) {
            setTimeout(() => runWorker(i), i * 400);
        }

        // No cleanup: activeDriversRef controls worker lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobData?.jobId, jobData?.status]);

    const handleRerun = async () => {
        if (rerunning) return;
        setRerunning(true);
        activeDriversRef.current = 0; // allow new workers for the new job
        try {
            await fetch("/api/crawl/full/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain }),
            });
            await fetchData();
        } finally {
            setRerunning(false);
        }
    };

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 size={28} className="animate-spin" style={{ color: "#FF642D" }} />
            </div>
        );
    }

    // ── Error ──────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="rounded-xl border p-6 flex items-center gap-3" style={{ background: "rgba(255,61,61,0.08)", borderColor: "rgba(255,61,61,0.2)" }}>
                <AlertCircle size={18} style={{ color: "#FF3D3D" }} />
                <p className="text-sm" style={{ color: "#FF3D3D" }}>{error}</p>
                <button onClick={fetchData} className="ml-auto text-xs underline" style={{ color: "#FF642D" }}>Retry</button>
            </div>
        );
    }

    // ── No project found ───────────────────────────────────────────────────────
    if (!jobData) {
        return (
            <div className="space-y-6">
                <nav className="flex items-center gap-2 text-[12px]" style={{ color: "#6B7A99" }}>
                    <button onClick={() => router.push("/app/audit")} className="hover:text-white transition">Site Audit</button>
                    <ChevronRight size={12} />
                    <span className="text-white font-semibold">{domain}</span>
                </nav>
                <div className="flex flex-col items-center justify-center py-24 rounded-xl border-2 border-dashed" style={{ borderColor: "#1E2940" }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(255,100,45,0.1)" }}>
                        <Globe size={28} style={{ color: "#FF642D" }} />
                    </div>
                    <h2 className="text-lg font-bold text-white mb-2">No audit found for {domain}</h2>
                    <p className="text-sm mb-6" style={{ color: "#6B7A99" }}>Start an audit to see your SEO health score and issues</p>
                    <button
                        onClick={handleRerun}
                        disabled={rerunning}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}
                    >
                        {rerunning ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                        {rerunning ? "Starting…" : "Start Audit"}
                    </button>
                </div>
            </div>
        );
    }

    const isCrawling = jobData.status === "crawling" || jobData.status === "pending";
    const rawScore = auditData?.healthScore ?? jobData.score ?? 0;
    const errors = auditData?.errors ?? jobData.errors ?? 0;
    const warnings = auditData?.warnings ?? jobData.warnings ?? 0;
    const notices = auditData?.notices ?? jobData.notices ?? 0;
    const issues = auditData?.issues ?? [];

    // Frontend safeScore: defensive rendering in case backend returns a stale/inconsistent score
    const totalIssueCount = errors + warnings + notices;
    const pageCount = auditData?.totalPages ?? jobData.pagesCrawled ?? 0;
    const score = (auditData && pageCount > 0 && totalIssueCount === 0 && rawScore < 90)
      ? 95
      : rawScore;
    const crawlStats = auditData?.crawlStats;
    const thematicScores = computeThematicScores(issues);

    // ── Insight card derivations ───────────────────────────────────────────────
    const contentIssueIds = ["duplicate_title","duplicate_meta_description","low_word_count","no_og_tags","meta_desc_too_long","meta_desc_too_short","no_schema"];
    const crawlIssueIds   = ["orphan_page","redirect_chain","deep_page_depth","robots_noindex","robots_txt_blocked","canonical_mismatch"];
    const contentIssues      = issues.filter(i => contentIssueIds.includes(i.id));
    const crawlabilityIssues = issues.filter(i => crawlIssueIds.includes(i.id));
    const contentPages      = contentIssues.reduce((s, i) => s + i.urlsAffected, 0);
    const crawlabilityPages = crawlabilityIssues.reduce((s, i) => s + i.urlsAffected, 0);
    const topWin = issues.find(i => INSIGHT_GAIN[i.id]);

    const scoreColor = score >= 80 ? "#00C853" : score >= 60 ? "#FF9800" : "#FF3D3D";
    const scoreLabel = score >= 95 ? "Excellent" : score >= 80 ? "Good" : score >= 60 ? "Needs Improvement" : "Poor";
    const r = 74;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - score / 100);

    const lastAudit = jobData.lastAuditAt
        ? new Date(jobData.lastAuditAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
        : "—";

    return (
        <div className="space-y-8">
            {/* ── Breadcrumb */}
            <nav className="flex items-center gap-2 text-[12px]" style={{ color: "#6B7A99" }}>
                <button onClick={() => router.push("/app/audit")} className="hover:text-white transition">Site Audit</button>
                <ChevronRight size={12} />
                <span className="text-white font-semibold">{domain}</span>
            </nav>

            {/* ── Audit Summary Panel */}
            {auditData && !isCrawling && (
                <AuditSummaryPanel
                    score={score}
                    errors={errors}
                    topIssueName={issues[0]?.title}
                    topIssuePages={issues[0]?.urlsAffected}
                    quickWinName={topWin?.title}
                    quickWinGain={topWin ? INSIGHT_GAIN[topWin.id] : undefined}
                />
            )}

            {/* ── Header Bar */}
            <div className="rounded-xl border px-5 py-4 flex flex-wrap items-center gap-3 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #151B27, #0D1424)", borderColor: "#1E2940" }}>
                <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,100,45,0.3), transparent)" }} />
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black text-white shrink-0"
                        style={{ background: "linear-gradient(135deg, #FF642D, #E85420)" }}>
                        {domain[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-white text-base truncate">{domain}</p>
                        <div className="flex items-center gap-3 text-[11px] mt-0.5" style={{ color: "#6B7A99" }}>
                            {isCrawling ? (
                                <span className="flex items-center gap-1" style={{ color: "#FF9800" }}>
                                    <Loader2 size={10} className="animate-spin" /> Crawling…
                                </span>
                            ) : (
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" />
                                    Live
                                </span>
                            )}
                            <span className="flex items-center gap-1"><Clock size={10} /> {lastAudit}</span>
                            <span>{jobData.pagesCrawled.toLocaleString()} pages</span>
                            {auditData?.crawlDuration && (
                                <span className="flex items-center gap-1">⏱ {auditData.crawlDuration}s crawl</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition hover:bg-white/[0.04] relative"
                        style={{ borderColor: "#1E2940", color: "#8B9BB4" }} title="Pro feature">
                        <Download size={12} /> Export PDF
                        <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold px-1 rounded" style={{ background: "#FF9800", color: "white" }}>PRO</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition hover:bg-white/[0.04]"
                        style={{ borderColor: "#1E2940", color: "#8B9BB4" }}>
                        <Share2 size={12} /> Share
                    </button>
                    <button onClick={handleRerun} disabled={rerunning || isCrawling}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg,#FF642D,#E85420)", boxShadow: "0 0 20px rgba(255,100,45,0.25)" }}>
                        {rerunning ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
                        {rerunning ? "Starting…" : "Re-run Audit"}
                    </button>
                </div>
            </div>

            {/* ── Crawling Banner */}
            {isCrawling && (
                <div className="rounded-xl border px-5 py-4 space-y-1"
                    style={{ background: "rgba(255,152,0,0.08)", borderColor: "rgba(255,152,0,0.2)" }}>
                    <div className="flex items-center gap-4">
                        <Loader2 size={18} className="animate-spin shrink-0" style={{ color: "#FF9800" }} />
                        <div>
                            <p className="text-sm font-semibold" style={{ color: "#FF9800" }}>Audit in progress</p>
                            <p className="text-xs mt-0.5" style={{ color: "#6B7A99" }}>
                                {jobData.pagesCrawled} page{jobData.pagesCrawled !== 1 ? "s" : ""} crawled — results update automatically
                            </p>
                        </div>
                    </div>
                    {jobData.currentUrl && (
                        <p className="text-[11px] pl-10 truncate" style={{ color: "#4A5568" }}>
                            Fetching: <span style={{ color: "#6B7A99" }}>{jobData.currentUrl}</span>
                        </p>
                    )}
                    {jobData.lastError && (
                        <p className="text-[11px] pl-10" style={{ color: "#FF9800" }}>
                            Last error: {jobData.lastError}
                        </p>
                    )}
                </div>
            )}

            {/* ── Insight Cards */}
            {auditData && !isCrawling && (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                    <InsightCard
                        icon={score >= 80 ? "✓" : score >= 60 ? "~" : "!"}
                        color={score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444"}
                        title="Site Health"
                        value={`${score}/100`}
                        desc={errors > 0 ? `${errors} critical errors` : "No critical errors"}
                    />
                    <InsightCard
                        icon={contentPages > 0 ? "!" : "✓"}
                        color={contentPages > 0 ? "#f97316" : "#22c55e"}
                        title="Content Issues"
                        value={contentPages > 0 ? `${contentPages}` : "Clean"}
                        desc={contentIssues.length > 0 ? `${contentIssues.length} issue types` : "All content healthy"}
                    />
                    <InsightCard
                        icon={crawlabilityPages > 0 ? "!" : "✓"}
                        color={crawlabilityPages > 0 ? "#f97316" : "#22c55e"}
                        title="Crawlability"
                        value={crawlabilityPages > 0 ? `${crawlabilityPages}` : "Clean"}
                        desc={crawlabilityPages > 0 ? "pages at risk" : "All pages reachable"}
                    />
                    <InsightCard
                        icon={(crawlStats?.avgDepth ?? 0) > 3 ? "!" : "✓"}
                        color={(crawlStats?.avgDepth ?? 0) > 3 ? "#f97316" : "#22c55e"}
                        title="Avg Link Depth"
                        value={crawlStats ? crawlStats.avgDepth.toFixed(1) : "–"}
                        desc={`${crawlStats?.deepPageCount ?? 0} deep pages (4+ clicks)`}
                    />
                    <InsightCard
                        icon="→"
                        color="#6366f1"
                        title="Quick Win"
                        value={topWin ? `+${INSIGHT_GAIN[topWin.id]}pts` : "🎉"}
                        desc={topWin ? topWin.title : "No critical issues!"}
                    />
                    <OpportunityCard topIssues={issues} />
                </div>
            )}

            {/* ── Crawl Transparency Panel */}
            {auditData && !isCrawling && (
                <CrawlTransparencyPanel
                    pagesCrawled={jobData.pagesCrawled}
                    internalLinks={auditData.crawlStats?.internalLinks ?? 0}
                    brokenPages={auditData.crawlStats?.brokenPages ?? 0}
                    redirectPages={auditData.crawlStats?.redirectPages ?? 0}
                />
            )}

            {/* ── SEO Insight Panel */}
            {auditData && !isCrawling && (
                <SEOInsightPanel auditData={auditData} crawlStats={auditData.crawlStats} />
            )}

            {/* ── 2-col layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                <div className="xl:col-span-2 space-y-5">
                    {/* Score + Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="rounded-xl border p-5 flex flex-col items-center" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#6B7A99" }}>SEO Health</p>
                            {isCrawling && score === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32">
                                    <Loader2 size={28} className="animate-spin mb-2" style={{ color: "#FF9800" }} />
                                    <span className="text-[11px]" style={{ color: "#6B7A99" }}>Calculating…</span>
                                </div>
                            ) : (
                                <>
                                    <div className="relative w-32 h-32">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                                            <circle cx="80" cy="80" r={r} stroke="#1a2236" strokeWidth="12" fill="none" />
                                            <motion.circle cx="80" cy="80" r={r} stroke={scoreColor} strokeWidth="12" fill="none"
                                                strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
                                                transition={{ duration: 1.4, ease: "easeOut" }} strokeLinecap="round"
                                                style={{ filter: `drop-shadow(0 0 14px ${scoreColor}90)` }} />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black text-white">{score}</span>
                                            <span className="text-[10px]" style={{ color: "#6B7A99" }}>/100</span>
                                        </div>
                                    </div>
                                    <span className="mt-2 px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${scoreColor}18`, color: scoreColor }}>
                                        {scoreLabel}
                                    </span>
                                    {auditData?.previousScore != null && (
                                        <div className="flex items-center gap-1 mt-1 text-[11px] font-bold">
                                            {auditData.healthScore >= auditData.previousScore ? (
                                                <span style={{ color: "#22c55e" }}>▲ +{auditData.healthScore - auditData.previousScore} since last audit</span>
                                            ) : (
                                                <span style={{ color: "#ef4444" }}>▼ {auditData.healthScore - auditData.previousScore} since last audit</span>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        {[
                            { label: "Errors", count: errors, color: "#FF3D3D", bg: "rgba(255,61,61,0.1)", icon: XCircle },
                            { label: "Warnings", count: warnings, color: "#FF9800", bg: "rgba(255,152,0,0.1)", icon: AlertTriangle },
                            { label: "Notices", count: notices, color: "#00B0FF", bg: "rgba(0,176,255,0.1)", icon: AlertCircle },
                        ].map(({ label, count, color, bg, icon: Icon }) => (
                            <div key={label} className="rounded-xl border p-5 flex flex-col justify-between"
                                style={{ background: bg, borderColor: `${color}30` }}>
                                <Icon size={20} style={{ color }} />
                                <div>
                                    <p className="text-3xl font-black mt-3" style={{ color }}>{count}</p>
                                    <p className="text-xs font-semibold text-white mt-0.5">{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Issues */}
                    <div className="rounded-xl border overflow-hidden" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#1E2940" }}>
                            <h2 className="text-sm font-bold text-white">Top Issues</h2>
                            <button className="text-xs font-semibold flex items-center gap-1" style={{ color: "#FF642D" }}
                                onClick={() => router.push("/app/action-center")}>
                                Fix All <ArrowRight size={11} />
                            </button>
                        </div>
                        {issues.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10" style={{ color: "#4A5568" }}>
                                {isCrawling ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin mb-2" style={{ color: "#FF9800" }} />
                                        <p className="text-sm">Issues will appear as pages are crawled</p>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={20} className="mb-2" style={{ color: "#00C853" }} />
                                        <p className="text-sm font-semibold" style={{ color: "#00C853" }}>Great work! All SEO checks passed.</p>
                                        <p className="text-xs mt-1 text-center max-w-xs" style={{ color: "#4A5568" }}>
                                            Continue monitoring your site regularly to maintain strong search visibility.
                                        </p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div>
                                {issues.slice(0, 8).map((issue, i) => {
                                    const severityBadge: Record<string, { label: string; bg: string; color: string }> = {
                                        error:   { label: "Error",   bg: "rgba(239,68,68,0.15)",  color: "#ef4444" },
                                        warning: { label: "Warning", bg: "rgba(234,179,8,0.15)",  color: "#eab308" },
                                        notice:  { label: "Notice",  bg: "rgba(59,130,246,0.15)", color: "#3b82f6" },
                                    };
                                    const badge = severityBadge[issue.severity] ?? severityBadge.notice;
                                    const isExpanded = expandedIssue === issue.id;
                                    return (
                                        <div key={issue.id}>
                                            <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition border-b"
                                                style={{ borderColor: "#1E2940" }}
                                                onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}>
                                                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
                                                    style={{ background: "#1a2236", color: "#4A5568" }}>{i + 1}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white">{issue.title}</p>
                                                    <p className="text-[11px] mt-0.5" style={{ color: "#6B7A99" }}>
                                                        {issue.urlsAffected} page{issue.urlsAffected !== 1 ? "s" : ""} affected
                                                    </p>
                                                    {issue.affectedUrls && issue.affectedUrls.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                                            {issue.affectedUrls.slice(0, 3).map((url) => {
                                                                const path = url.replace(/^https?:\/\/[^/]+/, "") || "/";
                                                                return (
                                                                    <span key={url} className="px-1.5 rounded text-[10px] font-mono truncate max-w-[160px]"
                                                                        style={{ background: "#1a2236", color: "#8B9BB4", border: "1px solid #1E2940" }}>
                                                                        {path}
                                                                    </span>
                                                                );
                                                            })}
                                                            {issue.affectedUrls.length > 3 && (
                                                                <span className="text-[10px] font-mono" style={{ color: "#4A5568" }}>
                                                                    +{issue.affectedUrls.length - 3} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wide"
                                                    style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                                                <ChevronRight size={14} style={{ color: "#4A5568" }} className={`transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                                            </div>
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.25, ease: "easeInOut" }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-5 py-4 border-b" style={{ background: "#0D1424", borderColor: "#1E2940" }}>
                                                            <p className="text-[13px] text-white mb-3">{issue.description}</p>
                                                            {(() => {
                                                                const content = ISSUE_CONTENT[issue.id];
                                                                if (!content) return null;
                                                                return (
                                                                    <>
                                                                        {(content.ctrImpact || content.trafficGain) && (
                                                                            <div className="flex flex-wrap gap-2 mb-3">
                                                                                {content.ctrImpact && (
                                                                                    <div className="rounded-lg px-3 py-1.5 text-[11px]"
                                                                                        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                                                                                        📉 {content.ctrImpact}
                                                                                    </div>
                                                                                )}
                                                                                {content.trafficGain && (
                                                                                    <div className="rounded-lg px-3 py-1.5 text-[11px]"
                                                                                        style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}>
                                                                                        📈 {content.trafficGain}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        {content.fixSteps && content.fixSteps.length > 0 && (
                                                                            <div className="mb-4">
                                                                                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#6B7A99" }}>How to Fix</p>
                                                                                <ol className="space-y-1.5">
                                                                                    {content.fixSteps.map((step, idx) => (
                                                                                        <li key={idx} className="flex gap-2 text-[12px]" style={{ color: "#8B9BB4" }}>
                                                                                            <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                                                                                                style={{ background: "#1a2236", color: "#FF642D", border: "1px solid #1E2940" }}>
                                                                                                {idx + 1}
                                                                                            </span>
                                                                                            {step}
                                                                                        </li>
                                                                                    ))}
                                                                                </ol>
                                                                            </div>
                                                                        )}
                                                                        {content.exampleFix && (
                                                                            <div className="mb-4">
                                                                                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#6B7A99" }}>Example Fix</p>
                                                                                <div className="rounded-lg p-3 relative" style={{ background: "#1a2236", border: "1px solid #1E2940" }}>
                                                                                    <p className="text-[11px] font-mono pr-14 whitespace-pre-wrap" style={{ color: "#8B9BB4" }}>{content.exampleFix}</p>
                                                                                    <button
                                                                                        onClick={() => navigator.clipboard.writeText(content.exampleFix!)}
                                                                                        className="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded transition hover:opacity-80"
                                                                                        style={{ background: "rgba(255,100,45,0.15)", color: "#FF642D" }}>
                                                                                        Copy
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                );
                                                            })()}
                                                            {issue.id === "broken_links" && auditData?.brokenLinks && auditData.brokenLinks.length > 0 && (
                                                                <div className="mb-4">
                                                                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#6B7A99" }}>Broken Link Details</p>
                                                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                                                        {auditData.brokenLinks.map(({ source, targets }) => {
                                                                            const srcPath = source.replace(/^https?:\/\/[^/]+/, "") || "/";
                                                                            return (
                                                                                <div key={source} className="rounded-lg p-2.5" style={{ background: "#1a2236", border: "1px solid #1E2940" }}>
                                                                                    <p className="text-[10px] font-mono mb-1" style={{ color: "#8B9BB4" }}>Source: {srcPath}</p>
                                                                                    {targets.map(t => (
                                                                                        <p key={t} className="text-[10px] font-mono" style={{ color: "#ef4444" }}>→ {t}</p>
                                                                                    ))}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {issue.affectedUrls && issue.affectedUrls.length > 0 && (
                                                                <div className="mb-4">
                                                                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#6B7A99" }}>
                                                                        Affected Pages
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {issue.affectedUrls.map((url) => {
                                                                            const path = url.replace(/^https?:\/\/[^/]+/, "") || "/";
                                                                            return (
                                                                                <span key={url} className="px-2 py-0.5 rounded text-[11px] font-mono truncate max-w-[280px]"
                                                                                    style={{ background: "#1a2236", color: "#8B9BB4", border: "1px solid #1E2940" }}>
                                                                                    {path}
                                                                                </span>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <button onClick={() => router.push(`/app/action-center`)}
                                                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white transition hover:opacity-90"
                                                                style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}>
                                                                <Zap size={12} /> Fix This Issue
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Thematic Analysis */}
                    <div className="rounded-xl border p-5" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                        <h2 className="text-sm font-bold text-white mb-5">Thematic Analysis</h2>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                            {thematicScores.map(({ label, score: s, color }) => (
                                <ThematicScore key={label} label={label} score={s} color={color}
                                    loading={isCrawling && issues.length === 0} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-4">
                    <div className="rounded-xl border p-5 sticky top-20" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "rgba(255,100,45,0.15)" }}>
                                <Zap size={13} style={{ color: "#FF642D" }} />
                            </div>
                            <h3 className="text-sm font-bold text-white">Current Priority Fix</h3>
                        </div>
                        {issues[0] ? (
                            <div className="rounded-lg p-4 mb-4" style={{ background: "#0D1424", border: "1px solid #1E2940" }}>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block"
                                    style={{ background: "rgba(255,61,61,0.15)", color: "#FF3D3D" }}>
                                    #1 Priority · {issues[0].severity}
                                </span>
                                <p className="text-sm font-semibold text-white mt-2 mb-1">{issues[0].title}</p>
                                <p className="text-[12px] mb-3" style={{ color: "#8B9BB4" }}>{issues[0].urlsAffected} pages affected</p>
                                <p className="text-[12px] mb-3" style={{ color: "#6B7A99" }}>{issues[0].description}</p>
                                <button onClick={() => router.push(`/app/action-center?domain=${domain}`)}
                                    className="w-full py-2.5 rounded-lg text-xs font-bold text-white transition hover:opacity-90"
                                    style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}>
                                    Fix This Issue →
                                </button>
                            </div>
                        ) : (
                            <div className="rounded-lg p-4 mb-4 text-center" style={{ background: "#0D1424", border: "1px solid #1E2940" }}>
                                {isCrawling
                                    ? <p className="text-sm" style={{ color: "#6B7A99" }}>Issues will appear as crawling progresses…</p>
                                    : <p className="text-sm" style={{ color: "#00C853" }}>No issues found!</p>
                                }
                            </div>
                        )}
                        <div className="text-center">
                            <p className="text-[11px]" style={{ color: "#4A5568" }}>{issues.length} total issues found</p>
                            <button className="text-[12px] font-semibold mt-1 hover:opacity-80 transition"
                                style={{ color: "#FF642D" }} onClick={() => router.push("/app/action-center")}>
                                View All Tasks →
                            </button>
                        </div>
                    </div>

                    {/* Depth Distribution Widget */}
                    {auditData?.crawlStats?.depthDistribution && (
                        <DepthDistributionWidget
                            dist={auditData.crawlStats.depthDistribution}
                            total={auditData.crawlStats.totalPages}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
