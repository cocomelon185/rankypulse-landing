"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Globe, AlertTriangle, XCircle, TrendingUp, Plus, Eye, RefreshCcw,
    Activity, ArrowUpRight, ArrowDownRight, Clock, BarChart2,
    ChevronRight, Loader2, AlertCircle, CheckCircle,
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function Card({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
    return (
        <div
            className={`rounded-xl border p-5 ${className || ""}`}
            style={{ background: "#151B27", borderColor: "#1E2940", boxShadow: "0 1px 2px rgba(0,0,0,0.4)", ...style }}
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

function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border px-3 py-2 text-xs shadow-2xl" style={{ background: "#0D1424", borderColor: "#1E2940" }}>
            <p className="font-semibold mb-1" style={{ color: "#8B9BB4" }}>{label}</p>
            {payload.map((p: any) => (
                <div key={p.dataKey} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="font-bold text-white">{p.value}/100</span>
                </div>
            ))}
        </div>
    );
}

function KpiCard({ icon: Icon, label, value, sub, trend, color }: {
    icon: React.ElementType; label: string; value: string; sub: string; trend?: "up" | "down"; color: string;
}) {
    return (
        <Card>
            <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                    <Icon size={17} style={{ color }} />
                </div>
                {trend && (
                    <span className="flex items-center gap-0.5 text-[11px] font-semibold" style={{ color: trend === "up" ? "#00C853" : "#FF3D3D" }}>
                        {trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {sub}
                    </span>
                )}
            </div>
            <p className="text-2xl font-black text-white tabular-nums">{value}</p>
            <p className="text-xs mt-1 font-medium" style={{ color: "#6B7A99" }}>{label}</p>
        </Card>
    );
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

// ── Main Component ─────────────────────────────────────────────────────────────
export function AppDashboardClient({ userName }: { userName: string }) {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [activity, setActivity] = useState<ActivityEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [runningAudit, setRunningAudit] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        const [projRes, actRes] = await Promise.all([
            fetch("/api/projects").catch(() => null),
            fetch("/api/activity").catch(() => null),
        ]);
        if (projRes?.ok) {
            const d = await projRes.json();
            setProjects(d.domains ?? []);
        }
        if (actRes?.ok) {
            const d = await actRes.json();
            // Filter out events with invalid/missing domains
            const validEvents = (d.events ?? []).filter(
                (e: ActivityEvent) => e.domain && e.domain !== "undefined" && e.domain.trim() !== ""
            );
            setActivity(validEvents);
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Poll if any project is crawling
    useEffect(() => {
        const hasCrawling = projects.some(p => p.status === "crawling" || p.status === "pending");
        if (!hasCrawling) return;
        const id = setInterval(fetchData, 8000);
        return () => clearInterval(id);
    }, [projects, fetchData]);

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

    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === "completed");
    const avgHealth = completedProjects.length > 0
        ? Math.round(completedProjects.reduce((a, p) => a + p.score, 0) / completedProjects.length)
        : 0;
    const totalErrors = projects.reduce((a, p) => a + p.errors, 0);

    // Build a mini health trend from projects (last audit dates + scores)
    const healthTrend = completedProjects
        .slice(0, 6)
        .map(p => ({
            month: new Date(p.lastAuditAt).toLocaleDateString("en-US", { month: "short" }),
            score: p.score,
        }))
        .reverse();

    return (
        <div className="space-y-7">
            {/* ── Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">
                        Good morning, {userName.split(" ")[0]} 👋
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "#6B7A99" }}>
                        {loading
                            ? "Loading your projects…"
                            : totalProjects === 0
                                ? "Add your first project to get started"
                                : `Here's your SEO mission control — ${totalProjects} active project${totalProjects !== 1 ? "s" : ""}`}
                    </p>
                </div>
                <button
                    onClick={() => router.push("/app/projects")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)", boxShadow: "0 4px 16px rgba(255,100,45,0.25)" }}
                >
                    <Plus size={15} /> Add Project
                </button>
            </div>

            {/* ── Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={28} className="animate-spin" style={{ color: "#FF642D" }} />
                </div>
            )}

            {!loading && (
                <>
                    {/* ── KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <KpiCard icon={Globe} label="Total Projects" value={String(totalProjects)} sub="" color="#FF642D" />
                        <KpiCard icon={BarChart2} label="Avg SEO Health" value={avgHealth > 0 ? `${avgHealth}/100` : "—"} sub="" color="#7B5CF5" />
                        <KpiCard icon={XCircle} label="Total Errors" value={String(totalErrors)} sub="" color="#FF3D3D" />
                        <KpiCard icon={TrendingUp} label="Projects Crawled" value={String(completedProjects.length)} sub="" color="#00C853" />
                    </div>

                    {/* ── Empty state if no projects */}
                    {totalProjects === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-24 rounded-xl border-2 border-dashed"
                            style={{ borderColor: "#1E2940" }}
                        >
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(255,100,45,0.1)" }}>
                                <Globe size={28} style={{ color: "#FF642D" }} />
                            </div>
                            <h2 className="text-lg font-bold text-white mb-2">No projects yet</h2>
                            <p className="text-sm mb-6" style={{ color: "#6B7A99" }}>Add your first website to start tracking SEO health</p>
                            <button
                                onClick={() => router.push("/app/projects")}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
                                style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}
                            >
                                <Plus size={15} /> Add Project
                            </button>
                        </motion.div>
                    )}

                    {/* ── Websites Table */}
                    {totalProjects > 0 && (
                        <Card className="!p-0 overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#1E2940" }}>
                                <h2 className="text-sm font-bold text-white">Your Websites</h2>
                                <button
                                    onClick={() => router.push("/app/projects")}
                                    className="flex items-center gap-1 text-xs font-semibold"
                                    style={{ color: "#FF642D" }}
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
                                                    style={{ borderColor: "#1E2940" }}
                                                    onClick={() => router.push(`/app/audit/${project.domain}`)}
                                                >
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-white shrink-0"
                                                                style={{ background: "linear-gradient(135deg, #FF642D, #E85420)" }}>
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
                                                    <td className="px-5 py-3.5" style={{ color: "#6B7A99" }}>
                                                        {new Date(project.lastAuditAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                            <button
                                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition hover:opacity-80"
                                                                style={{ color: "#FF642D", background: "rgba(255,100,45,0.08)" }}
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
                    )}

                    {/* ── Health Trend Chart (only if there are projects) */}
                    {completedProjects.length > 0 && healthTrend.length > 0 && (
                        <Card>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-sm font-bold text-white">SEO Health Trend</h2>
                                <span className="text-xs px-2 py-1 rounded-lg" style={{ color: "#6B7A99", background: "#1E2940" }}>
                                    Recent audits
                                </span>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={healthTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FF642D" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#FF642D" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2940" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fill: "#4A5568", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fill: "#4A5568", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Area type="monotone" dataKey="score" stroke="#FF642D" strokeWidth={2.5} fill="url(#healthGrad)" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Card>
                    )}

                    {/* ── Recent Activity */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                <Activity size={15} style={{ color: "#FF642D" }} />
                                Recent Activity
                            </h2>
                        </div>
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
                                        style={{ borderColor: "#1E2940" }}
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
                </>
            )}
        </div>
    );
}
