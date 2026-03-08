"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Globe, AlertTriangle, XCircle, TrendingUp, Plus, Eye, RefreshCcw,
    Activity, ArrowUpRight, ArrowDownRight, Clock, BarChart2,
    ChevronRight, Loader2, AlertCircle, CheckCircle, Zap,
    Target, Search, Users, Sparkles, X,
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Project {
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

interface ActivityEvent {
    id: string;
    type: string;
    domain?: string;
    meta: Record<string, unknown>;
    created_at: string;
}

interface Task {
    id: string;
    issueId: string;
    title: string;
    description: string;
    category: string;
    severity: "error" | "warning" | "notice";
    effort: "easy" | "medium" | "hard";
    estimatedPoints: number;
    affectedPages: number;
    affectedPageUrls: string[];
    actionHref: string;
    status: "todo" | "in_progress" | "done";
}

interface TasksResponse {
    tasks: Task[];
    domain: string | null;
    allDomains: string[];
    seoScore: number;
    projectedScore: number;
    totalPoints: number;
    earnedPoints: number;
}

interface RankedKeyword {
    id: string;
    keyword: string;
    volume: number | null;
    position: number | null;
    change: number | null;
    ranked_url: string | null;
}

interface RankWinner {
    keyword: string;
    change: number;
    position: number | null;
}

interface RankOverview {
    avg_position: number | null;
    top3_count: number;
    top10_count: number;
    total_keywords: number;
    visibility: number;
    visibility_change: number;
    winners: RankWinner[];
    losers: RankWinner[];
}

interface DashboardOpportunity {
    id: string;
    keyword: string;
    domain: string;
    current_position: number;
    search_volume: number;
    estimated_traffic_gain: number;
    status: "open" | "dismissed" | "completed";
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CARD_BG = "#151B27";
const BORDER = "#1E2940";
const ACCENT = "#FF642D";
const TEXT_MUTED = "#6B7A99";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

const ACTIVITY_ICONS: Record<string, string> = {
    project_created: "🌐",
    audit_started: "🔍",
    audit_completed: "✅",
    project_deleted: "🗑️",
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

// ── Shared UI primitives ──────────────────────────────────────────────────────

function Card({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
    return (
        <div
            className={`rounded-xl border ${className ?? ""}`}
            style={{ background: CARD_BG, borderColor: BORDER, boxShadow: "0 1px 2px rgba(0,0,0,0.4)", ...style }}
        >
            {children}
        </div>
    );
}

function ScoreBadge({ score }: { score: number }) {
    const color = score >= 80 ? "#00C853" : score >= 60 ? "#FF9800" : "#FF3D3D";
    const bg = score >= 80 ? "rgba(0,200,83,0.12)" : score >= 60 ? "rgba(255,152,0,0.12)" : "rgba(255,61,61,0.12)";
    const label = score >= 80 ? "Good" : score >= 60 ? "Fair" : "Poor";
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: bg, color }}>
            {score} · {label}
        </span>
    );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; value: number }>; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border px-3 py-2 text-xs shadow-2xl" style={{ background: "#0D1424", borderColor: BORDER }}>
            <p className="font-semibold mb-1" style={{ color: "#8B9BB4" }}>{label}</p>
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="font-bold text-white">{p.value}/100</span>
                </div>
            ))}
        </div>
    );
}

function KpiCard({ icon: Icon, label, value, sub, trend, color }: {
    icon: React.ElementType; label: string; value: string; sub?: string; trend?: "up" | "down"; color: string;
}) {
    return (
        <Card className="p-4">
            <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                    <Icon size={15} style={{ color }} />
                </div>
                {trend && (
                    <span className="flex items-center gap-0.5 text-[11px] font-semibold" style={{ color: trend === "up" ? "#00C853" : "#FF3D3D" }}>
                        {trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    </span>
                )}
            </div>
            <p className="text-xl font-black text-white tabular-nums">{value}</p>
            <p className="text-xs mt-0.5 font-medium" style={{ color: TEXT_MUTED }}>{label}</p>
            {sub && <p className="text-[11px] mt-0.5" style={{ color: "#4A5568" }}>{sub}</p>}
        </Card>
    );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, linkLabel, linkHref, color = ACCENT }: {
    icon: React.ElementType; title: string; linkLabel?: string; linkHref?: string; color?: string;
}) {
    const router = useRouter();
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                    <Icon size={14} style={{ color }} />
                </div>
                <h2 className="text-sm font-bold text-white">{title}</h2>
            </div>
            {linkLabel && linkHref && (
                <button
                    onClick={() => router.push(linkHref)}
                    className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
                    style={{ color }}
                >
                    {linkLabel} <ChevronRight size={12} />
                </button>
            )}
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function AppDashboardClient({ userName }: { userName: string }) {
    const router = useRouter();

    // ── Core state ────────────────────────────────────────────────────────────

    const [projects, setProjects] = useState<Project[]>([]);
    const [activity, setActivity] = useState<ActivityEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [runningAudit, setRunningAudit] = useState<string | null>(null);

    // Rank + tasks state
    const [tasksData, setTasksData] = useState<TasksResponse | null>(null);
    const [rankOverview, setRankOverview] = useState<RankOverview | null>(null);
    const [rankKeywords, setRankKeywords] = useState<RankedKeyword[]>([]);
    const [markingFixed, setMarkingFixed] = useState<string | null>(null);

    // SEO Opportunities (Phase 5.2 — from seo_opportunities table)
    const [dashOpps, setDashOpps] = useState<DashboardOpportunity[]>([]);
    const [oppPotential, setOppPotential] = useState<number>(0);
    const [dismissingOpp, setDismissingOpp] = useState<string | null>(null);

    // ── Domain resolution ─────────────────────────────────────────────────────

    const resolveDomain = useCallback((proj: Project[]): string | null => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("rankypulse_last_url");
            if (stored) return stored;
        }
        return proj.find((p) => p.status === "completed")?.domain ?? null;
    }, []);

    // ── Fetch rank data once domain is known ──────────────────────────────────

    const fetchRankData = useCallback(async (domain: string) => {
        const [overviewRes, keywordsRes] = await Promise.all([
            fetch(`/api/rank/overview?domain=${encodeURIComponent(domain)}`).catch(() => null),
            fetch(`/api/rank/keywords?domain=${encodeURIComponent(domain)}`).catch(() => null),
        ]);
        if (overviewRes?.ok) {
            setRankOverview(await overviewRes.json());
        }
        if (keywordsRes?.ok) {
            const d = await keywordsRes.json();
            setRankKeywords(d.keywords ?? []);
        }
    }, []);

    // ── Initial fetch ─────────────────────────────────────────────────────────

    const fetchData = useCallback(async () => {
        const [projRes, actRes, tasksRes, oppsRes] = await Promise.all([
            fetch("/api/projects").catch(() => null),
            fetch("/api/activity").catch(() => null),
            fetch("/api/action-center/tasks").catch(() => null),
            fetch("/api/opportunities").catch(() => null),
        ]);

        let loadedProjects: Project[] = [];

        if (projRes?.ok) {
            const d = await projRes.json();
            loadedProjects = d.domains ?? [];
            setProjects(loadedProjects);
        }
        if (actRes?.ok) {
            const d = await actRes.json();
            setActivity(
                (d.events ?? []).filter(
                    (e: ActivityEvent) => e.domain && e.domain !== "undefined" && e.domain.trim() !== ""
                )
            );
        }
        if (tasksRes?.ok) {
            setTasksData(await tasksRes.json());
        }
        if (oppsRes?.ok) {
            const d = await oppsRes.json();
            setDashOpps(d.opportunities ?? []);
            setOppPotential(d.totalTrafficPotential ?? 0);
        }

        setLoading(false);

        // Fetch rank data after we know the domain
        const domain = resolveDomain(loadedProjects);
        if (domain) fetchRankData(domain);
    }, [resolveDomain, fetchRankData]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Re-fetch rank data when projects change (in case domain resolved after initial load)
    useEffect(() => {
        const domain = resolveDomain(projects);
        if (domain && !rankOverview && rankKeywords.length === 0) {
            fetchRankData(domain);
        }
    }, [projects, rankOverview, rankKeywords.length, resolveDomain, fetchRankData]);

    // Poll if crawling
    useEffect(() => {
        const hasCrawling = projects.some((p) => p.status === "crawling" || p.status === "pending");
        if (!hasCrawling) return;
        const id = setInterval(fetchData, 8000);
        return () => clearInterval(id);
    }, [projects, fetchData]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleRerun = async (domain: string) => {
        if (runningAudit) return;
        setRunningAudit(domain);
        try {
            await fetch("/api/crawl/full/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain }),
            });
            await fetchData();
        } finally {
            setRunningAudit(null);
        }
    };

    const markFixed = async (issueId: string) => {
        const domain = tasksData?.domain;
        if (!domain) return;
        setMarkingFixed(issueId);
        try {
            await fetch("/api/action-center/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain, issueId, status: "done" }),
            });
            setTasksData((prev) =>
                prev
                    ? {
                          ...prev,
                          tasks: prev.tasks.map((t) =>
                              t.issueId === issueId ? { ...t, status: "done" } : t
                          ),
                      }
                    : prev
            );
        } finally {
            setMarkingFixed(null);
        }
    };

    const dismissOpportunity = async (id: string) => {
        setDismissingOpp(id);
        // Optimistic remove
        setDashOpps((prev) => prev.map((o) => o.id === id ? { ...o, status: "dismissed" } : o));
        try {
            await fetch(`/api/opportunities/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "dismissed" }),
            });
        } catch {
            // Revert on failure
            setDashOpps((prev) => prev.map((o) => o.id === id ? { ...o, status: "open" } : o));
        } finally {
            setDismissingOpp(null);
        }
    };

    // ── Derived values ────────────────────────────────────────────────────────

    const totalProjects = projects.length;
    const completedProjects = projects.filter((p) => p.status === "completed");
    const totalErrors = projects.reduce((a, p) => a + p.errors, 0);

    const healthTrend = completedProjects
        .slice(0, 6)
        .map((p) => ({
            month: new Date(p.lastAuditAt).toLocaleDateString("en-US", { month: "short" }),
            score: p.score,
        }))
        .reverse();

    const todoTasks = (tasksData?.tasks ?? []).filter((t) => t.status !== "done");
    // Use opportunities from API (seo_opportunities table) — open status only
    const opportunities = dashOpps.filter((o) => o.status === "open");
    const totalTrafficPotential = oppPotential;
    const currentDomain = tasksData?.domain ?? completedProjects[0]?.domain ?? null;

    // Best/top keywords for quick insights
    const topKeyword = [...rankKeywords].sort((a, b) => (a.position ?? 999) - (b.position ?? 999))[0] ?? null;
    const topOpportunity = [...opportunities].sort((a, b) => b.estimated_traffic_gain - a.estimated_traffic_gain)[0] ?? null;
    const urgentTask = todoTasks.find((t) => t.severity === "error") ?? null;
    const firstProject = completedProjects[0] ?? null;

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-7">

            {/* ── Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">
                        Good morning, {userName.split(" ")[0]} 👋
                    </h1>
                    <p className="text-sm mt-1" style={{ color: TEXT_MUTED }}>
                        {loading
                            ? "Loading your SEO command center…"
                            : totalProjects === 0
                                ? "Add your first project to get started"
                                : `Here's your SEO growth overview — ${totalProjects} project${totalProjects !== 1 ? "s" : ""}`}
                    </p>
                </div>
                <button
                    onClick={() => router.push("/app/projects")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${ACCENT}, #E8541F)`, boxShadow: "0 4px 16px rgba(255,100,45,0.25)" }}
                >
                    <Plus size={15} /> Add Project
                </button>
            </div>

            {/* ── Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={28} className="animate-spin" style={{ color: ACCENT }} />
                </div>
            )}

            {!loading && (
                <>
                    {/* ── Empty state */}
                    {totalProjects === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-24 rounded-xl border-2 border-dashed"
                            style={{ borderColor: BORDER }}
                        >
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(255,100,45,0.1)" }}>
                                <Globe size={28} style={{ color: ACCENT }} />
                            </div>
                            <h2 className="text-lg font-bold text-white mb-2">No projects yet</h2>
                            <p className="text-sm mb-6" style={{ color: TEXT_MUTED }}>Add your first website to start tracking SEO health</p>
                            <button
                                onClick={() => router.push("/app/projects")}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
                                style={{ background: `linear-gradient(135deg, ${ACCENT}, #E8541F)` }}
                            >
                                <Plus size={15} /> Add Project
                            </button>
                        </motion.div>
                    )}

                    {totalProjects > 0 && (
                        <>
                            {/* ═══════════════════════════════════════════════════
                                SECTION 1 — SEO COMMAND CENTER
                            ════════════════════════════════════════════════════ */}
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                                    <KpiCard
                                        icon={BarChart2}
                                        label="SEO Score"
                                        value={tasksData ? String(tasksData.seoScore) : "—"}
                                        sub="current score"
                                        color={ACCENT}
                                    />
                                    <KpiCard
                                        icon={TrendingUp}
                                        label="Potential Score"
                                        value={tasksData ? String(tasksData.projectedScore) : "—"}
                                        sub="if all fixed"
                                        color="#00C853"
                                        trend="up"
                                    />
                                    <KpiCard
                                        icon={Target}
                                        label="SEO Opportunities"
                                        value={String(opportunities.length)}
                                        sub="page-2 keywords"
                                        color="#7B5CF5"
                                    />
                                    <KpiCard
                                        icon={Zap}
                                        label="Tasks Remaining"
                                        value={String(todoTasks.length)}
                                        sub="fixes pending"
                                        color="#FF9800"
                                    />
                                    <KpiCard
                                        icon={Search}
                                        label="Keywords Tracked"
                                        value={rankKeywords.length > 0 ? String(rankKeywords.length) : "—"}
                                        sub="total keywords"
                                        color="#00B0FF"
                                    />
                                    <KpiCard
                                        icon={Users}
                                        label="Competitors"
                                        value="—"
                                        sub="set up monitoring"
                                        color="#64748B"
                                    />
                                    <KpiCard
                                        icon={ArrowUpRight}
                                        label="Traffic Potential"
                                        value={totalTrafficPotential > 0 ? `+${formatNumber(totalTrafficPotential)}` : "—"}
                                        sub="est. monthly visits"
                                        color="#00C853"
                                        trend={totalTrafficPotential > 0 ? "up" : undefined}
                                    />
                                </div>
                            </motion.div>

                            {/* ═══════════════════════════════════════════════════
                                SECTION 2 — SEO OPPORTUNITIES
                            ════════════════════════════════════════════════════ */}
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
                                <Card className="!p-0 overflow-hidden">
                                    <div className="px-5 py-4 border-b" style={{ borderColor: BORDER }}>
                                        <SectionHeader
                                            icon={Target}
                                            title={`SEO Opportunities${opportunities.length > 0 ? ` (${opportunities.length})` : ""}`}
                                            linkLabel="View all"
                                            linkHref="/app/opportunities"
                                            color="#7B5CF5"
                                        />
                                        <p className="text-xs" style={{ color: TEXT_MUTED }}>
                                            Keywords in position 11–20 ready to break onto page 1
                                        </p>
                                    </div>

                                    {opportunities.length === 0 ? (
                                        <div className="px-5 py-8 flex items-center gap-4">
                                            <AlertCircle size={18} style={{ color: "#4A5568" }} />
                                            <div>
                                                <p className="text-sm text-white font-medium">No page-2 keywords detected</p>
                                                <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
                                                    {rankKeywords.length === 0
                                                        ? "Set up rank tracking to start monitoring keyword positions."
                                                        : "None of your tracked keywords are currently in position 11–20."}
                                                    {" "}
                                                    <button className="underline" style={{ color: "#7B5CF5" }} onClick={() => router.push("/app/rank-tracking")}>
                                                        {rankKeywords.length === 0 ? "Start tracking →" : "View all keywords →"}
                                                    </button>
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="divide-y" style={{ borderColor: BORDER }}>
                                            {[...opportunities]
                                                .sort((a, b) => b.estimated_traffic_gain - a.estimated_traffic_gain)
                                                .slice(0, 5)
                                                .map((opp, i) => {
                                                    const pos = opp.current_position;
                                                    const posColor = pos <= 13 ? "#FF9800" : pos <= 17 ? ACCENT : "#64748B";
                                                    const posBg = pos <= 13 ? "rgba(255,152,0,0.15)" : pos <= 17 ? "rgba(255,100,45,0.15)" : "rgba(100,116,139,0.15)";
                                                    return (
                                                        <div
                                                            key={opp.id}
                                                            className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors"
                                                        >
                                                            <span className="text-xs font-mono" style={{ color: "#4A5568", minWidth: 20 }}>{i + 1}</span>
                                                            <span className="flex-1 text-sm font-medium text-white truncate">{opp.keyword}</span>
                                                            <span
                                                                className="text-xs font-black px-2 py-0.5 rounded shrink-0"
                                                                style={{ background: posBg, color: posColor }}
                                                            >
                                                                #{pos}
                                                            </span>
                                                            <span className="text-xs hidden sm:block shrink-0" style={{ color: TEXT_MUTED }}>
                                                                {formatNumber(opp.search_volume)}/mo
                                                            </span>
                                                            {opp.estimated_traffic_gain > 0 && (
                                                                <span
                                                                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 hidden md:block"
                                                                    style={{ background: "rgba(0,200,83,0.12)", color: "#00C853" }}
                                                                >
                                                                    +{formatNumber(opp.estimated_traffic_gain)}/mo
                                                                </span>
                                                            )}
                                                            <button
                                                                onClick={() => router.push(`/app/audit/${opp.domain}`)}
                                                                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition hover:opacity-80 shrink-0"
                                                                style={{ background: "rgba(123,92,245,0.12)", color: "#7B5CF5" }}
                                                            >
                                                                Optimize →
                                                            </button>
                                                            <button
                                                                onClick={() => dismissOpportunity(opp.id)}
                                                                disabled={dismissingOpp === opp.id}
                                                                title="Dismiss"
                                                                className="p-1 rounded transition hover:opacity-70 disabled:opacity-40 shrink-0"
                                                                style={{ color: "#4A5568" }}
                                                            >
                                                                {dismissingOpp === opp.id
                                                                    ? <Loader2 size={13} className="animate-spin" />
                                                                    : <X size={13} />}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    )}
                                </Card>
                            </motion.div>

                            {/* ═══════════════════════════════════════════════════
                                SECTION 3 — ACTION CENTER
                            ════════════════════════════════════════════════════ */}
                            {tasksData && (
                                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 }}>
                                    <Card className="!p-0 overflow-hidden">
                                        <div className="px-5 py-4 border-b" style={{ borderColor: BORDER }}>
                                            <SectionHeader
                                                icon={Zap}
                                                title="Action Center"
                                                linkLabel="View All"
                                                linkHref="/app/action-center"
                                                color={ACCENT}
                                            />

                                            {/* Score strip */}
                                            {tasksData.seoScore > 0 && (
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span
                                                        className="text-xs px-2.5 py-1 rounded-full font-semibold"
                                                        style={{ background: "rgba(255,100,45,0.1)", color: ACCENT }}
                                                    >
                                                        Score: {tasksData.seoScore} → {tasksData.projectedScore} possible
                                                    </span>
                                                </div>
                                            )}

                                            {/* Progress bar */}
                                            {tasksData.totalPoints > 0 && (
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: BORDER }}>
                                                        <div
                                                            className="h-full rounded-full transition-all"
                                                            style={{
                                                                width: `${Math.min((tasksData.earnedPoints / tasksData.totalPoints) * 100, 100)}%`,
                                                                background: `linear-gradient(90deg, ${ACCENT}, #FF8C5A)`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-xs shrink-0" style={{ color: TEXT_MUTED }}>
                                                        {tasksData.tasks.filter((t) => t.status === "done").length} of {tasksData.tasks.length} fixed
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {todoTasks.length === 0 ? (
                                            <div className="px-5 py-8 flex items-center gap-3">
                                                <CheckCircle size={20} className="text-green-400" />
                                                <p className="text-sm font-semibold text-white">All issues resolved! Great work.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y" style={{ borderColor: BORDER }}>
                                                {todoTasks.slice(0, 5).map((task) => {
                                                    const sevColor = task.severity === "error" ? "#FF3D3D" : task.severity === "warning" ? "#FF9800" : "#00B0FF";
                                                    const effortLabel = task.effort === "easy" ? "Easy" : task.effort === "medium" ? "Medium" : "Complex";
                                                    return (
                                                        <div key={task.id} className="px-5 py-3">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: sevColor }} />
                                                                <span className="text-sm font-medium text-white flex-1 truncate">{task.title}</span>
                                                                <span
                                                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
                                                                    style={{ background: `${sevColor}18`, color: sevColor }}
                                                                >
                                                                    {task.severity}
                                                                </span>
                                                                <span className="text-[10px] font-medium shrink-0 hidden sm:block" style={{ color: TEXT_MUTED }}>
                                                                    {effortLabel} · {task.affectedPages}p
                                                                </span>
                                                                <span
                                                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                                                                    style={{ background: "rgba(255,100,45,0.1)", color: ACCENT }}
                                                                >
                                                                    +{task.estimatedPoints}pts
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 pl-5">
                                                                <button
                                                                    onClick={() => router.push("/app/action-center")}
                                                                    className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition hover:opacity-80"
                                                                    style={{ background: "rgba(255,255,255,0.04)", color: "#8B9BB4" }}
                                                                >
                                                                    <Eye size={11} /> View Issue
                                                                </button>
                                                                <button
                                                                    onClick={() => router.push("/app/action-center")}
                                                                    className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition hover:opacity-80"
                                                                    style={{ background: "rgba(139,92,246,0.1)", color: "#A78BFA" }}
                                                                >
                                                                    <Sparkles size={11} /> AI Fix
                                                                </button>
                                                                <button
                                                                    onClick={() => markFixed(task.issueId)}
                                                                    disabled={markingFixed === task.issueId}
                                                                    className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition hover:opacity-80 disabled:opacity-50"
                                                                    style={{ background: "rgba(0,200,83,0.1)", color: "#00C853" }}
                                                                >
                                                                    {markingFixed === task.issueId
                                                                        ? <Loader2 size={11} className="animate-spin" />
                                                                        : <CheckCircle size={11} />}
                                                                    Mark Fixed
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </Card>
                                </motion.div>
                            )}

                            {/* ═══════════════════════════════════════════════════
                                SECTION 4 — RANK TRACKING OVERVIEW
                            ════════════════════════════════════════════════════ */}
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Winners & Losers */}
                                    <Card className="p-5">
                                        <SectionHeader
                                            icon={TrendingUp}
                                            title={`Rank Movement${rankOverview ? ` · Visibility ${rankOverview.visibility}` : ""}`}
                                            linkLabel="Rank Tracking"
                                            linkHref="/app/rank-tracking"
                                            color="#7B5CF5"
                                        />
                                        {!rankOverview || (rankOverview.winners.length === 0 && rankOverview.losers.length === 0) ? (
                                            <div className="flex flex-col items-center py-8 gap-2 text-center">
                                                <TrendingUp size={20} style={{ color: "#4A5568" }} />
                                                <p className="text-sm font-medium text-white">No rank movement data</p>
                                                <p className="text-xs" style={{ color: TEXT_MUTED }}>
                                                    Track keywords to monitor position changes.{" "}
                                                    <button className="underline" style={{ color: "#7B5CF5" }} onClick={() => router.push("/app/rank-tracking")}>
                                                        Set up →
                                                    </button>
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {rankOverview.winners.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#00C853" }}>🏆 Winners</p>
                                                        <div className="space-y-1.5">
                                                            {rankOverview.winners.slice(0, 3).map((w, i) => (
                                                                <div key={i} className="flex items-center gap-3">
                                                                    <span className="flex items-center gap-0.5 text-xs font-bold shrink-0" style={{ color: "#00C853", minWidth: 36 }}>
                                                                        <ArrowUpRight size={12} />+{w.change}
                                                                    </span>
                                                                    <span className="text-xs text-white flex-1 truncate">{w.keyword}</span>
                                                                    {w.position && (
                                                                        <span className="text-[11px] font-bold" style={{ color: "#64748B" }}>#{w.position}</span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {rankOverview.losers.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#FF3D3D" }}>↓ Losers</p>
                                                        <div className="space-y-1.5">
                                                            {rankOverview.losers.slice(0, 3).map((l, i) => (
                                                                <div key={i} className="flex items-center gap-3">
                                                                    <span className="flex items-center gap-0.5 text-xs font-bold shrink-0" style={{ color: "#FF3D3D", minWidth: 36 }}>
                                                                        <ArrowDownRight size={12} />{l.change}
                                                                    </span>
                                                                    <span className="text-xs text-white flex-1 truncate">{l.keyword}</span>
                                                                    {l.position && (
                                                                        <span className="text-[11px] font-bold" style={{ color: "#64748B" }}>#{l.position}</span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Card>

                                    {/* Top Keywords */}
                                    <Card className="p-5">
                                        <SectionHeader
                                            icon={BarChart2}
                                            title="Top Keywords"
                                            linkLabel="View all"
                                            linkHref="/app/rank-tracking"
                                            color="#00B0FF"
                                        />
                                        {rankKeywords.length === 0 ? (
                                            <div className="flex flex-col items-center py-8 gap-2 text-center">
                                                <Search size={20} style={{ color: "#4A5568" }} />
                                                <p className="text-sm font-medium text-white">No keywords tracked</p>
                                                <p className="text-xs" style={{ color: TEXT_MUTED }}>
                                                    <button className="underline" style={{ color: "#00B0FF" }} onClick={() => router.push("/app/rank-tracking")}>
                                                        Add your first keyword →
                                                    </button>
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {[...rankKeywords]
                                                    .sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
                                                    .slice(0, 5)
                                                    .map((kw, i) => {
                                                        const change = kw.change ?? 0;
                                                        return (
                                                            <div key={kw.id} className="flex items-center gap-3">
                                                                <span className="text-xs font-mono shrink-0" style={{ color: "#4A5568", minWidth: 16 }}>{i + 1}</span>
                                                                <span className="text-xs text-white flex-1 truncate">{kw.keyword}</span>
                                                                {kw.volume != null && (
                                                                    <span className="text-[11px] shrink-0 hidden md:block" style={{ color: "#64748B" }}>
                                                                        {formatNumber(kw.volume)}
                                                                    </span>
                                                                )}
                                                                {change !== 0 && (
                                                                    <span
                                                                        className="text-[11px] font-semibold shrink-0"
                                                                        style={{ color: change > 0 ? "#00C853" : "#FF3D3D" }}
                                                                    >
                                                                        {change > 0 ? "▲" : "▼"}{Math.abs(change)}
                                                                    </span>
                                                                )}
                                                                <span
                                                                    className="text-xs font-black px-2 py-0.5 rounded shrink-0"
                                                                    style={{
                                                                        background: kw.position != null ? "rgba(0,176,255,0.12)" : "rgba(100,116,139,0.12)",
                                                                        color: kw.position != null ? "#00B0FF" : "#64748B",
                                                                    }}
                                                                >
                                                                    {kw.position != null ? `#${kw.position}` : "—"}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        )}
                                    </Card>
                                </div>
                            </motion.div>

                            {/* ═══════════════════════════════════════════════════
                                SECTION 5 — SITE HEALTH SUMMARY + WEBSITES TABLE
                            ════════════════════════════════════════════════════ */}
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.12 }}>
                                {/* Compact health cards */}
                                {firstProject && (
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                                        <KpiCard icon={Globe} label="Pages Crawled" value={firstProject.pagesCrawled.toLocaleString()} color={ACCENT} />
                                        <KpiCard icon={XCircle} label="Critical Issues" value={String(firstProject.errors)} color="#FF3D3D" />
                                        <KpiCard icon={AlertTriangle} label="Warnings" value={String(firstProject.warnings)} color="#FF9800" />
                                        <KpiCard icon={BarChart2} label="Tech SEO Score" value={`${firstProject.score}/100`} color="#7B5CF5" />
                                    </div>
                                )}

                                {/* Websites table */}
                                <Card className="!p-0 overflow-hidden">
                                    <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: BORDER }}>
                                        <h2 className="text-sm font-bold text-white">Your Websites</h2>
                                        <button
                                            onClick={() => router.push("/app/projects")}
                                            className="flex items-center gap-1 text-xs font-semibold"
                                            style={{ color: ACCENT }}
                                        >
                                            Manage Projects <ChevronRight size={12} />
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-[13px]">
                                            <thead>
                                                <tr style={{ background: "#0D1424" }}>
                                                    {["Domain", "SEO Score", "Errors", "Warnings", "Pages", "Last Audit", "Actions"].map((h) => (
                                                        <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#4A5568" }}>
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {projects.map((project, i) => {
                                                    const isCrawling = project.status === "crawling" || project.status === "pending";
                                                    return (
                                                        <motion.tr
                                                            key={project.jobId}
                                                            initial={{ opacity: 0, y: 8 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: i * 0.05 }}
                                                            className="border-t hover:bg-white/[0.02] transition-colors cursor-pointer"
                                                            style={{ borderColor: BORDER }}
                                                            onClick={() => router.push(`/app/audit/${project.domain}`)}
                                                        >
                                                            <td className="px-5 py-3.5">
                                                                <div className="flex items-center gap-2.5">
                                                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-white shrink-0"
                                                                        style={{ background: `linear-gradient(135deg, ${ACCENT}, #E85420)` }}>
                                                                        {project.domain[0].toUpperCase()}
                                                                    </div>
                                                                    <p className="font-semibold text-white">{project.domain}</p>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-3.5">
                                                                {isCrawling
                                                                    ? <span className="text-[11px] flex items-center gap-1" style={{ color: "#FF9800" }}>
                                                                        <Loader2 size={11} className="animate-spin" /> Crawling…
                                                                    </span>
                                                                    : <ScoreBadge score={project.score} />}
                                                            </td>
                                                            <td className="px-5 py-3.5 font-bold" style={{ color: "#FF3D3D" }}>{project.errors}</td>
                                                            <td className="px-5 py-3.5 font-bold" style={{ color: "#FF9800" }}>{project.warnings}</td>
                                                            <td className="px-5 py-3.5" style={{ color: "#C8D0E0" }}>{project.pagesCrawled.toLocaleString()}</td>
                                                            <td className="px-5 py-3.5" style={{ color: TEXT_MUTED }}>
                                                                {new Date(project.lastAuditAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                            </td>
                                                            <td className="px-5 py-3.5">
                                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                                    <button
                                                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition hover:opacity-80"
                                                                        style={{ color: ACCENT, background: "rgba(255,100,45,0.08)" }}
                                                                        onClick={() => router.push(`/app/audit/${project.domain}`)}
                                                                    >
                                                                        <Eye size={11} /> View
                                                                    </button>
                                                                    <button
                                                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition hover:opacity-80 disabled:opacity-40"
                                                                        style={{ color: "#8B9BB4", background: "rgba(255,255,255,0.04)" }}
                                                                        disabled={runningAudit === project.domain || isCrawling}
                                                                        onClick={() => handleRerun(project.domain)}
                                                                    >
                                                                        {runningAudit === project.domain
                                                                            ? <Loader2 size={11} className="animate-spin" />
                                                                            : <RefreshCcw size={11} />}
                                                                        Re-run
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </motion.div>

                            {/* ═══════════════════════════════════════════════════
                                SECTION 6 — QUICK INSIGHTS + RECENT ACTIVITY
                            ════════════════════════════════════════════════════ */}
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Quick Insights */}
                                    <Card className="p-5">
                                        <SectionHeader
                                            icon={Zap}
                                            title="Quick Insights"
                                            color="#7B5CF5"
                                        />
                                        <div className="space-y-3">
                                            {/* Biggest rank gain */}
                                            <div
                                                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white/[0.03] transition"
                                                style={{ background: "rgba(0,200,83,0.04)", border: "1px solid rgba(0,200,83,0.1)" }}
                                                onClick={() => router.push("/app/rank-tracking")}
                                            >
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(0,200,83,0.12)" }}>
                                                    <TrendingUp size={14} className="text-green-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#4A5568" }}>Biggest Rank Gain</p>
                                                    <p className="text-sm font-semibold text-white truncate">
                                                        {rankOverview?.winners?.[0]?.keyword ?? "No data yet"}
                                                    </p>
                                                </div>
                                                {rankOverview?.winners?.[0] && (
                                                    <span className="text-xs font-bold shrink-0" style={{ color: "#00C853" }}>
                                                        +{rankOverview.winners[0].change}
                                                    </span>
                                                )}
                                                <ChevronRight size={13} style={{ color: "#4A5568" }} />
                                            </div>

                                            {/* Top traffic opportunity */}
                                            <div
                                                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white/[0.03] transition"
                                                style={{ background: "rgba(123,92,245,0.04)", border: "1px solid rgba(123,92,245,0.1)" }}
                                                onClick={() => router.push("/app/opportunities")}
                                            >
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(123,92,245,0.12)" }}>
                                                    <Target size={14} style={{ color: "#7B5CF5" }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#4A5568" }}>Top Traffic Opportunity</p>
                                                    <p className="text-sm font-semibold text-white truncate">
                                                        {topOpportunity?.keyword ?? "No page-2 keywords"}
                                                    </p>
                                                </div>
                                                {topOpportunity?.current_position && (
                                                    <span className="text-xs font-bold shrink-0" style={{ color: "#7B5CF5" }}>
                                                        #{topOpportunity.current_position}
                                                    </span>
                                                )}
                                                <ChevronRight size={13} style={{ color: "#4A5568" }} />
                                            </div>

                                            {/* Urgent issue */}
                                            <div
                                                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white/[0.03] transition"
                                                style={{ background: "rgba(255,61,61,0.04)", border: "1px solid rgba(255,61,61,0.1)" }}
                                                onClick={() => router.push("/app/action-center")}
                                            >
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,61,61,0.12)" }}>
                                                    <AlertTriangle size={14} className="text-red-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#4A5568" }}>Urgent Issue</p>
                                                    <p className="text-sm font-semibold text-white truncate">
                                                        {urgentTask?.title ?? "No critical issues"}
                                                    </p>
                                                </div>
                                                {urgentTask && (
                                                    <span className="text-xs font-bold shrink-0" style={{ color: "#FF3D3D" }}>
                                                        {urgentTask.affectedPages}p
                                                    </span>
                                                )}
                                                <ChevronRight size={13} style={{ color: "#4A5568" }} />
                                            </div>

                                            {/* Top keyword */}
                                            <div
                                                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white/[0.03] transition"
                                                style={{ background: "rgba(0,176,255,0.04)", border: "1px solid rgba(0,176,255,0.1)" }}
                                                onClick={() => router.push("/app/rank-tracking")}
                                            >
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(0,176,255,0.12)" }}>
                                                    <Search size={14} className="text-blue-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#4A5568" }}>Top Performing Keyword</p>
                                                    <p className="text-sm font-semibold text-white truncate">
                                                        {topKeyword?.keyword ?? "No keywords tracked"}
                                                    </p>
                                                </div>
                                                {topKeyword?.position && (
                                                    <span className="text-xs font-bold shrink-0" style={{ color: "#00B0FF" }}>
                                                        #{topKeyword.position}
                                                    </span>
                                                )}
                                                <ChevronRight size={13} style={{ color: "#4A5568" }} />
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Recent Activity */}
                                    <Card className="p-5">
                                        <SectionHeader
                                            icon={Activity}
                                            title="Recent Activity"
                                            color={ACCENT}
                                        />
                                        {activity.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-8" style={{ color: "#4A5568" }}>
                                                <AlertCircle size={20} className="mb-2" />
                                                <p className="text-sm">No activity yet — add a project to get started</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-0">
                                                {activity.slice(0, 8).map((item, i) => (
                                                    <div
                                                        key={item.id}
                                                        className={`flex items-center gap-3.5 py-3.5 ${i < Math.min(activity.length, 8) - 1 ? "border-b" : ""}`}
                                                        style={{ borderColor: BORDER }}
                                                    >
                                                        <span className="text-lg shrink-0">{ACTIVITY_ICONS[item.type] ?? "📋"}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[13px] font-medium text-white truncate">
                                                                {item.type === "project_created" && `Project added: ${item.domain}`}
                                                                {item.type === "audit_started" && `Audit started: ${item.domain}`}
                                                                {item.type === "audit_completed" && `Audit completed: ${item.domain}`}
                                                                {item.type === "project_deleted" && `Project removed: ${item.domain}`}
                                                            </p>
                                                            <p className="text-[11px] mt-0.5" style={{ color: "#4A5568" }}>
                                                                {item.domain} · {timeAgo(item.created_at)}
                                                            </p>
                                                        </div>
                                                        <span className="flex items-center gap-1 text-[11px] shrink-0" style={{ color: "#4A5568" }}>
                                                            <Clock size={10} /> {timeAgo(item.created_at)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Card>
                                </div>
                            </motion.div>

                            {/* ── Health Trend Chart (supplemental, when data available) */}
                            {completedProjects.length > 0 && healthTrend.length > 1 && (
                                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.18 }}>
                                    <Card className="p-5">
                                        <div className="flex items-center justify-between mb-5">
                                            <h2 className="text-sm font-bold text-white">SEO Health Trend</h2>
                                            <span className="text-xs px-2 py-1 rounded-lg" style={{ color: TEXT_MUTED, background: BORDER }}>
                                                Recent audits
                                            </span>
                                        </div>
                                        <ResponsiveContainer width="100%" height={180}>
                                            <AreaChart data={healthTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={ACCENT} stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                                                <XAxis dataKey="month" tick={{ fill: "#4A5568", fontSize: 11 }} axisLine={false} tickLine={false} />
                                                <YAxis domain={[0, 100]} tick={{ fill: "#4A5568", fontSize: 11 }} axisLine={false} tickLine={false} />
                                                <Tooltip content={<ChartTooltip />} />
                                                <Area type="monotone" dataKey="score" stroke={ACCENT} strokeWidth={2.5} fill="url(#healthGrad)" dot={false} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </Card>
                                </motion.div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}
