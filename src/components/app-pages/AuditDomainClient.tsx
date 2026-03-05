"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Globe, RefreshCcw, Download, Share2, AlertTriangle, XCircle,
    CheckCircle, ChevronRight, Zap, ArrowRight, AlertCircle,
    Loader2, Clock,
} from "lucide-react";

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
}

interface IssueItem {
    id: string;
    severity: "error" | "warning" | "notice";
    title: string;
    description: string;
    urlsAffected: number;
    discovered: string;
}

interface AuditData {
    healthScore: number;
    errors: number;
    warnings: number;
    notices: number;
    domain: string | null;
    crawledAt: string | null;
    totalPages: number;
    issues: IssueItem[];
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

// ── ThematicScore mini gauge ──────────────────────────────────────────────────
function ThematicScore({ label, score, color }: { label: string; score: number; color: string }) {
    const r = 28;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - score / 100);
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-16 h-16">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r={r} fill="none" stroke="#1a2236" strokeWidth="6" />
                    <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
                        strokeDasharray={`${circ}`} strokeDashoffset={offset} strokeLinecap="round"
                        style={{ filter: `drop-shadow(0 0 6px ${color}60)` }} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[13px] font-black text-white">{score}</span>
            </div>
            <span className="text-[10px] font-semibold text-center" style={{ color: "#8B9BB4" }}>{label}</span>
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

    // Poll every 6s while crawling
    useEffect(() => {
        if (!jobData) return;
        if (jobData.status !== "crawling" && jobData.status !== "pending") return;
        const id = setInterval(fetchData, 6000);
        return () => clearInterval(id);
    }, [jobData, fetchData]);

    const handleRerun = async () => {
        if (rerunning) return;
        setRerunning(true);
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
    const score = auditData?.healthScore ?? jobData.score ?? 0;
    const errors = auditData?.errors ?? jobData.errors ?? 0;
    const warnings = auditData?.warnings ?? jobData.warnings ?? 0;
    const notices = auditData?.notices ?? jobData.notices ?? 0;
    const issues = auditData?.issues ?? [];
    const thematicScores = computeThematicScores(issues);

    const scoreColor = score >= 80 ? "#00C853" : score >= 60 ? "#FF9800" : "#FF3D3D";
    const scoreLabel = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Poor";
    const r = 68;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - score / 100);

    const lastAudit = jobData.lastAuditAt
        ? new Date(jobData.lastAuditAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
        : "—";

    return (
        <div className="space-y-6">
            {/* ── Breadcrumb */}
            <nav className="flex items-center gap-2 text-[12px]" style={{ color: "#6B7A99" }}>
                <button onClick={() => router.push("/app/audit")} className="hover:text-white transition">Site Audit</button>
                <ChevronRight size={12} />
                <span className="text-white font-semibold">{domain}</span>
            </nav>

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
                <div className="rounded-xl border px-5 py-4 flex items-center gap-4"
                    style={{ background: "rgba(255,152,0,0.08)", borderColor: "rgba(255,152,0,0.2)" }}>
                    <Loader2 size={18} className="animate-spin shrink-0" style={{ color: "#FF9800" }} />
                    <div>
                        <p className="text-sm font-semibold" style={{ color: "#FF9800" }}>Audit in progress</p>
                        <p className="text-xs mt-0.5" style={{ color: "#6B7A99" }}>
                            {jobData.pagesCrawled} pages crawled so far — results update automatically every 6 seconds
                        </p>
                    </div>
                </div>
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
                                        <p className="text-sm">No issues found — great work!</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div>
                                {issues.slice(0, 8).map((issue, i) => {
                                    const colors = { error: "#FF3D3D", warning: "#FF9800", notice: "#00B0FF" };
                                    const c = colors[issue.severity];
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
                                                    <p className="text-[11px] mt-0.5" style={{ color: "#6B7A99" }}>{issue.urlsAffected} pages affected</p>
                                                </div>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                                                    style={{ background: `${c}18`, color: c }}>{issue.severity}</span>
                                                <ChevronRight size={14} style={{ color: "#4A5568" }} className={`transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                                            </div>
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                                                        <div className="px-5 py-4 border-b" style={{ background: "#0D1424", borderColor: "#1E2940" }}>
                                                            <p className="text-[13px] text-white mb-3">{issue.description}</p>
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
                                <ThematicScore key={label} label={label} score={s} color={color} />
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
                </div>
            </div>
        </div>
    );
}
