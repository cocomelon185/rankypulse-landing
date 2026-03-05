"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Globe, AlertTriangle, XCircle, TrendingUp, Plus, Eye, RefreshCcw,
    Activity, Zap, ArrowUpRight, ArrowDownRight, Clock, BarChart2,
    ChevronRight, Users,
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { MOCK_PROJECTS, MOCK_HEALTH_TREND, MOCK_ACTIVITY, MOCK_AUDIT_ISSUES } from "@/lib/mock-data";

// ── Small helpers ─────────────────────────────────────────────────────────────
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

// ── KPI Card ──────────────────────────────────────────────────────────────────
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

// ── Main Component ─────────────────────────────────────────────────────────────
export function AppDashboardClient({ userName }: { userName: string }) {
    const router = useRouter();
    const totalProjects = MOCK_PROJECTS.length;
    const avgHealth = Math.round(MOCK_PROJECTS.reduce((a, p) => a + p.score, 0) / totalProjects);
    const totalErrors = MOCK_PROJECTS.reduce((a, p) => a + p.errors, 0);
    const topIssues = MOCK_AUDIT_ISSUES.slice(0, 5);

    return (
        <div className="space-y-7">
            {/* ── Page Header ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Good morning, {userName.split(" ")[0]} 👋</h1>
                    <p className="text-sm mt-1" style={{ color: "#6B7A99" }}>
                        Here's your SEO mission control — {totalProjects} active projects
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

            {/* ── Global KPI Cards ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard icon={Globe} label="Total Projects" value={String(totalProjects)} sub="+1 this month" trend="up" color="#FF642D" />
                <KpiCard icon={BarChart2} label="Avg SEO Health" value={`${avgHealth}/100`} sub="+6 pts vs last month" trend="up" color="#7B5CF5" />
                <KpiCard icon={XCircle} label="Total Errors" value={String(totalErrors)} sub="12 new" trend="down" color="#FF3D3D" />
                <KpiCard icon={TrendingUp} label="Keyword Visibility" value="28%" sub="+5% this month" trend="up" color="#00C853" />
            </div>

            {/* ── Your Websites ───────────────────────────────────────────────── */}
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
                            {MOCK_PROJECTS.map((project, i) => (
                                <motion.tr
                                    key={project.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    className="border-t hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                    style={{ borderColor: "#1E2940" }}
                                    onClick={() => router.push(`/app/audit/${project.domain}`)}
                                >
                                    <td className="px-5 py-3.5 font-semibold text-white">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-white shrink-0"
                                                style={{ background: "linear-gradient(135deg, #FF642D, #E85420)" }}>
                                                {project.domain[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">{project.domain}</p>
                                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(123,92,245,0.12)", color: "#9D84F7" }}>
                                                    {project.tag}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5"><ScoreBadge score={project.score} /></td>
                                    <td className="px-5 py-3.5 font-bold" style={{ color: "#FF3D3D" }}>{project.errors}</td>
                                    <td className="px-5 py-3.5 font-bold" style={{ color: "#FF9800" }}>{project.warnings}</td>
                                    <td className="px-5 py-3.5" style={{ color: "#C8D0E0" }}>{project.pagesCrawled.toLocaleString()}</td>
                                    <td className="px-5 py-3.5" style={{ color: "#6B7A99" }}>
                                        {new Date(project.lastAuditAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition hover:bg-white/[0.06]"
                                                style={{ color: "#FF642D", background: "rgba(255,100,45,0.08)" }}
                                                onClick={() => router.push(`/app/audit/${project.domain}`)}
                                            >
                                                <Eye size={11} /> View
                                            </button>
                                            <button
                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition hover:bg-white/[0.06]"
                                                style={{ color: "#8B9BB4", background: "rgba(255,255,255,0.04)" }}
                                            >
                                                <RefreshCcw size={11} /> Re-run
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* ── 2-col: Health Trend + Priority Fixes ────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* SEO Health Trend Chart */}
                <Card className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-bold text-white">SEO Health Trend</h2>
                        <span className="text-xs px-2 py-1 rounded-lg" style={{ color: "#6B7A99", background: "#1E2940" }}>Last 6 months</span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={MOCK_HEALTH_TREND} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FF642D" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#FF642D" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E2940" vertical={false} />
                            <XAxis dataKey="month" tick={{ fill: "#4A5568", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[50, 100]} tick={{ fill: "#4A5568", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="score" stroke="#FF642D" strokeWidth={2.5} fill="url(#healthGrad)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                {/* Priority Fixes */}
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-white">Priority Fixes</h2>
                        <button
                            className="text-xs font-semibold flex items-center gap-1"
                            style={{ color: "#FF642D" }}
                            onClick={() => router.push("/app/action-center")}
                        >
                            View All <ChevronRight size={11} />
                        </button>
                    </div>
                    <div className="space-y-0">
                        {topIssues.map((issue, i) => {
                            const colors = { error: "#FF3D3D", warning: "#FF9800", notice: "#00B0FF" };
                            const c = colors[issue.severity];
                            return (
                                <div
                                    key={issue.id}
                                    className={`flex items-start gap-3 py-3 cursor-pointer hover:bg-white/[0.02] rounded-lg px-1 -mx-1 transition ${i < topIssues.length - 1 ? "border-b" : ""}`}
                                    style={i < topIssues.length - 1 ? { borderColor: "#1E2940" } : {}}
                                    onClick={() => router.push(`/app/action-center`)}
                                >
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5"
                                        style={{ background: "#1a2236", color: "#4A5568" }}>
                                        {i + 1}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[12px] font-semibold text-white truncate">{issue.title}</p>
                                        <p className="text-[10px] mt-0.5" style={{ color: "#6B7A99" }}>
                                            <span style={{ color: c }}>{issue.affectedCount}</span> pages · Impact {issue.impactScore}/100
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                                        style={{ background: `${c}18`, color: c }}>
                                        {issue.severity}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* ── Recent Activity ──────────────────────────────────────────────── */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <Activity size={15} style={{ color: "#FF642D" }} />
                        Recent Activity
                    </h2>
                </div>
                <div className="space-y-0">
                    {MOCK_ACTIVITY.map((item, i) => (
                        <div
                            key={item.id}
                            className={`flex items-center gap-3.5 py-3.5 ${i < MOCK_ACTIVITY.length - 1 ? "border-b" : ""}`}
                            style={i < MOCK_ACTIVITY.length - 1 ? { borderColor: "#1E2940" } : {}}
                        >
                            <span className="text-lg shrink-0">{item.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-white truncate">{item.message}</p>
                                <p className="text-[11px] mt-0.5" style={{ color: "#4A5568" }}>
                                    {item.domain} · {item.time}
                                </p>
                            </div>
                            <span className="flex items-center gap-1 text-[11px] shrink-0" style={{ color: "#4A5568" }}>
                                <Clock size={10} /> {item.time}
                            </span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
