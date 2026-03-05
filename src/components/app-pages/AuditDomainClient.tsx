"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Globe, RefreshCcw, Calendar, Download, Share2, AlertTriangle, XCircle,
    CheckCircle, ChevronRight, Zap, Shield, BarChart2, FileText, Link as LinkIcon,
    Layout, Database, ArrowRight, AlertCircle,
} from "lucide-react";
import { MOCK_PROJECTS, MOCK_AUDIT_ISSUES, MOCK_THEMATIC_SCORES } from "@/lib/mock-data";

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

export function AuditDomainClient({ domain }: { domain: string }) {
    const router = useRouter();
    const project = MOCK_PROJECTS.find(p => p.domain === domain) || MOCK_PROJECTS[0];
    const issues = MOCK_AUDIT_ISSUES.filter(i => i.domain === (project?.domain || MOCK_PROJECTS[0].domain));
    const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

    const scoreColor = project.score >= 80 ? "#00C853" : project.score >= 60 ? "#FF9800" : "#FF3D3D";
    const scoreLabel = project.score >= 80 ? "Excellent" : project.score >= 60 ? "Good" : "Poor";

    const r = 68;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - project.score / 100);

    return (
        <div className="space-y-6">
            {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
            <nav className="flex items-center gap-2 text-[12px]" style={{ color: "#6B7A99" }}>
                <button onClick={() => router.push("/app/audit")} className="hover:text-white transition">Site Audit</button>
                <ChevronRight size={12} />
                <span className="text-white font-semibold">{domain}</span>
            </nav>

            {/* ── Header Bar ─────────────────────────────────────────────────── */}
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
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" />
                                Live
                            </span>
                            <span>Last audit: 2 hours ago</span>
                            <span>{project.pagesCrawled.toLocaleString()} pages</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition hover:bg-white/[0.04]"
                        style={{ borderColor: "#1E2940", color: "#8B9BB4" }}>
                        <Calendar size={12} /> Schedule
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition hover:bg-white/[0.04] relative"
                        style={{ borderColor: "#1E2940", color: "#8B9BB4" }}
                        title="Export PDF — Pro feature">
                        <Download size={12} /> Export PDF
                        <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold px-1 rounded"
                            style={{ background: "#FF9800", color: "white" }}>PRO</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition hover:bg-white/[0.04]"
                        style={{ borderColor: "#1E2940", color: "#8B9BB4" }}>
                        <Share2 size={12} /> Share
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#FF642D,#E85420)", boxShadow: "0 0 20px rgba(255,100,45,0.25)" }}>
                        <RefreshCcw size={12} /> Re-run Audit
                    </button>
                </div>
            </div>

            {/* ── 2-col layout: Score + Right Sidebar ────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Left: Main Content */}
                <div className="xl:col-span-2 space-y-5">
                    {/* Score + Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        {/* Score Gauge */}
                        <div className="rounded-xl border p-5 flex flex-col items-center"
                            style={{ background: "#151B27", borderColor: "#1E2940" }}>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#6B7A99" }}>SEO Health</p>
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                                    <circle cx="80" cy="80" r={r} stroke="#1a2236" strokeWidth="12" fill="none" />
                                    <motion.circle cx="80" cy="80" r={r} stroke={scoreColor} strokeWidth="12" fill="none"
                                        strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
                                        transition={{ duration: 1.4, ease: "easeOut" }} strokeLinecap="round"
                                        style={{ filter: `drop-shadow(0 0 14px ${scoreColor}90)` }} />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black text-white">{project.score}</span>
                                    <span className="text-[10px]" style={{ color: "#6B7A99" }}>/100</span>
                                </div>
                            </div>
                            <span className="mt-2 px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${scoreColor}18`, color: scoreColor }}>
                                {scoreLabel}
                            </span>
                        </div>

                        {/* Errors / Warnings / Notices */}
                        {[
                            { label: "Errors", count: project.errors, color: "#FF3D3D", bg: "rgba(255,61,61,0.1)", icon: XCircle },
                            { label: "Warnings", count: project.warnings, color: "#FF9800", bg: "rgba(255,152,0,0.1)", icon: AlertTriangle },
                            { label: "Notices", count: project.notices, color: "#00B0FF", bg: "rgba(0,176,255,0.1)", icon: AlertCircle },
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

                    {/* Top Issues List */}
                    <div className="rounded-xl border overflow-hidden" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#1E2940" }}>
                            <h2 className="text-sm font-bold text-white">Top Issues</h2>
                            <button className="text-xs font-semibold flex items-center gap-1" style={{ color: "#FF642D" }}
                                onClick={() => router.push("/app/action-center")}>
                                Fix All <ArrowRight size={11} />
                            </button>
                        </div>
                        <div>
                            {issues.map((issue, i) => {
                                const colors = { error: "#FF3D3D", warning: "#FF9800", notice: "#00B0FF" };
                                const c = colors[issue.severity];
                                const isExpanded = expandedIssue === issue.id;
                                return (
                                    <div key={issue.id}>
                                        <div
                                            className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition border-b"
                                            style={{ borderColor: "#1E2940" }}
                                            onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}
                                        >
                                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
                                                style={{ background: "#1a2236", color: "#4A5568" }}>{i + 1}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white">{issue.title}</p>
                                                <p className="text-[11px] mt-0.5" style={{ color: "#6B7A99" }}>
                                                    {issue.affectedCount} pages affected · Category: {issue.category}
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                                                style={{ background: `${c}18`, color: c }}>{issue.severity}</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded shrink-0" style={{ background: "#1E2940", color: "#8B9BB4" }}>
                                                Impact {issue.impactScore}
                                            </span>
                                            <ChevronRight size={14} style={{ color: "#4A5568" }} className={`transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                                        </div>
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                                                    <div className="px-5 py-4 border-b" style={{ background: "#0D1424", borderColor: "#1E2940" }}>
                                                        <p className="text-[13px] text-white mb-3">{issue.description}</p>
                                                        <div className="mb-3">
                                                            <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#4A5568" }}>Affected URLs</p>
                                                            <div className="space-y-1">
                                                                {issue.affectedUrls.map(url => (
                                                                    <p key={url} className="text-[12px] font-mono" style={{ color: "#FF642D" }}>{url}</p>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => router.push(`/app/action-center`)}
                                                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white transition hover:opacity-90"
                                                            style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}
                                                        >
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
                    </div>

                    {/* Thematic Scores */}
                    <div className="rounded-xl border p-5" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                        <h2 className="text-sm font-bold text-white mb-5">Thematic Analysis</h2>
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-4">
                            {MOCK_THEMATIC_SCORES.map(({ label, score, color }) => (
                                <ThematicScore key={label} label={label} score={score} color={color} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Current Task Preview */}
                <div className="space-y-4">
                    <div className="rounded-xl border p-5 sticky top-20" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "rgba(255,100,45,0.15)" }}>
                                <Zap size={13} style={{ color: "#FF642D" }} />
                            </div>
                            <h3 className="text-sm font-bold text-white">Current Priority Fix</h3>
                        </div>

                        {issues[0] && (
                            <div className="rounded-lg p-4 mb-4" style={{ background: "#0D1424", border: "1px solid #1E2940" }}>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block"
                                    style={{ background: "rgba(255,61,61,0.15)", color: "#FF3D3D" }}>
                                    #1 Priority · Error
                                </span>
                                <p className="text-sm font-semibold text-white mt-2 mb-1">{issues[0].title}</p>
                                <p className="text-[12px] mb-3" style={{ color: "#8B9BB4" }}>
                                    {issues[0].affectedCount} pages affected · Impact score: {issues[0].impactScore}/100
                                </p>
                                <div className="text-[11px] mb-3" style={{ color: "#6B7A99" }}>
                                    <p className="font-semibold text-[#4A5568] mb-1">Before</p>
                                    <p className="line-through">No meta description</p>
                                    <p className="font-semibold text-[#4A5568] mt-2 mb-1">After fix</p>
                                    <p style={{ color: "#00C853" }}>Unique, keyword-rich description for each page</p>
                                </div>
                                <button
                                    onClick={() => router.push(`/app/action-center?domain=${domain}&issue=${issues[0].id}`)}
                                    className="w-full py-2.5 rounded-lg text-xs font-bold text-white transition hover:opacity-90"
                                    style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}
                                >
                                    Continue Fix →
                                </button>
                            </div>
                        )}

                        <div className="text-center">
                            <p className="text-[11px]" style={{ color: "#4A5568" }}>
                                {issues.length} total issues to fix
                            </p>
                            <button
                                className="text-[12px] font-semibold mt-1 hover:opacity-80 transition"
                                style={{ color: "#FF642D" }}
                                onClick={() => router.push("/app/action-center")}
                            >
                                View All Tasks →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
