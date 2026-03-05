"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Globe, Trash2, RefreshCcw, Eye, Search, ChevronRight,
    AlertTriangle, XCircle, CheckCircle, Clock, MoreHorizontal, Tag,
} from "lucide-react";
import { MOCK_PROJECTS } from "@/lib/mock-data";

function ScoreBadge({ score }: { score: number }) {
    const color = score >= 80 ? "#00C853" : score >= 60 ? "#FF9800" : "#FF3D3D";
    const bg = score >= 80 ? "rgba(0,200,83,0.12)" : score >= 60 ? "rgba(255,152,0,0.12)" : "rgba(255,61,61,0.12)";
    const label = score >= 80 ? "Good" : score >= 60 ? "Fair" : "Poor";
    return (
        <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#1a2236" strokeWidth="4" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke={color} strokeWidth="4"
                        strokeDasharray={`${(score / 100) * 87.96} 87.96`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black" style={{ color }}>{score}</span>
            </div>
            <span className="text-[11px] font-semibold" style={{ color }}>{label}</span>
        </div>
    );
}

export function ProjectsClient() {
    const router = useRouter();
    const [projects, setProjects] = useState(MOCK_PROJECTS);
    const [showAdd, setShowAdd] = useState(false);
    const [newDomain, setNewDomain] = useState("");
    const [tagFilter, setTagFilter] = useState("All");

    const tags = ["All", ...Array.from(new Set(MOCK_PROJECTS.map(p => p.tag)))];
    const filtered = tagFilter === "All" ? projects : projects.filter(p => p.tag === tagFilter);

    const handleAdd = () => {
        if (!newDomain.trim()) return;
        const domain = newDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
        setProjects(prev => [...prev, {
            id: String(prev.length + 1),
            domain,
            createdAt: new Date().toISOString(),
            lastAuditAt: new Date().toISOString(),
            pagesCrawled: 0,
            score: 0,
            errors: 0,
            warnings: 0,
            notices: 0,
            status: "live" as const,
            tag: "New",
        }]);
        setNewDomain("");
        setShowAdd(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Projects</h1>
                    <p className="text-sm mt-1" style={{ color: "#6B7A99" }}>
                        Manage your websites and SEO projects
                    </p>
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)", boxShadow: "0 4px 16px rgba(255,100,45,0.25)" }}
                >
                    <Plus size={15} /> Add Project
                </button>
            </div>

            {/* Add Project Modal */}
            <AnimatePresence>
                {showAdd && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="rounded-xl border p-5"
                        style={{ background: "#151B27", borderColor: "#FF642D", boxShadow: "0 0 40px rgba(255,100,45,0.1)" }}
                    >
                        <h3 className="text-sm font-bold text-white mb-4">Add New Project</h3>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#4A5568" }} />
                                <input
                                    type="text"
                                    placeholder="yourwebsite.com"
                                    value={newDomain}
                                    onChange={e => setNewDomain(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleAdd()}
                                    className="w-full h-10 pl-9 pr-4 rounded-lg text-sm outline-none"
                                    style={{ background: "#0D1424", border: "1px solid #1E2940", color: "#C8D0E0" }}
                                    autoFocus
                                />
                            </div>
                            <button
                                onClick={handleAdd}
                                className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
                                style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}
                            >
                                Start Audit
                            </button>
                            <button
                                onClick={() => setShowAdd(false)}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-white/[0.04]"
                                style={{ color: "#8B9BB4", border: "1px solid #1E2940" }}
                            >
                                Cancel
                            </button>
                        </div>
                        <p className="text-[11px] mt-2" style={{ color: "#4A5568" }}>
                            We'll crawl up to 500 pages and return a full SEO health report.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tag Filter */}
            <div className="flex items-center gap-2 flex-wrap">
                {tags.map(t => (
                    <button
                        key={t}
                        onClick={() => setTagFilter(t)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                        style={{
                            background: tagFilter === t ? "rgba(255,100,45,0.15)" : "rgba(255,255,255,0.04)",
                            color: tagFilter === t ? "#FF642D" : "#8B9BB4",
                            border: `1px solid ${tagFilter === t ? "rgba(255,100,45,0.3)" : "#1E2940"}`,
                        }}
                    >
                        <Tag size={10} className="inline mr-1" />{t}
                    </button>
                ))}
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((project, i) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="rounded-xl border p-5 cursor-pointer group hover:border-[#FF642D]/30 transition-all"
                        style={{ background: "#151B27", borderColor: "#1E2940" }}
                        onClick={() => router.push(`/app/audit/${project.domain}`)}
                    >
                        {/* Domain header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black text-white shrink-0"
                                    style={{ background: "linear-gradient(135deg, #FF642D, #E85420)" }}>
                                    {project.domain[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-white text-sm">{project.domain}</p>
                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(123,92,245,0.12)", color: "#9D84F7" }}>
                                        {project.tag}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full" style={{ background: project.status === "live" ? "#00C853" : "#FF9800" }} />
                                <span className="text-[10px]" style={{ color: "#6B7A99" }}>{project.status}</span>
                            </div>
                        </div>

                        {/* Score */}
                        <div className="mb-4">
                            <ScoreBadge score={project.score} />
                        </div>

                        {/* Issue counts */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {[
                                { label: "Errors", count: project.errors, color: "#FF3D3D", icon: XCircle },
                                { label: "Warnings", count: project.warnings, color: "#FF9800", icon: AlertTriangle },
                                { label: "Notices", count: project.notices, color: "#00B0FF", icon: CheckCircle },
                            ].map(({ label, count, color, icon: Icon }) => (
                                <div key={label} className="rounded-lg p-2 text-center" style={{ background: "#0D1424" }}>
                                    <Icon size={12} style={{ color }} className="mx-auto mb-1" />
                                    <p className="text-sm font-black" style={{ color }}>{count}</p>
                                    <p className="text-[9px]" style={{ color: "#4A5568" }}>{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Meta */}
                        <div className="flex items-center justify-between text-[11px] mb-4" style={{ color: "#6B7A99" }}>
                            <span className="flex items-center gap-1">
                                <Globe size={10} /> {project.pagesCrawled.toLocaleString()} pages
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock size={10} /> {new Date(project.lastAuditAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                            <button
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition hover:opacity-80"
                                style={{ background: "rgba(255,100,45,0.12)", color: "#FF642D" }}
                                onClick={() => router.push(`/app/audit/${project.domain}`)}
                            >
                                <Eye size={12} /> View Audit
                            </button>
                            <button
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition hover:bg-white/[0.06]"
                                style={{ color: "#8B9BB4", background: "rgba(255,255,255,0.04)" }}
                            >
                                <RefreshCcw size={12} /> Re-run
                            </button>
                            <button
                                className="flex items-center gap-1.5 px-2 py-2 rounded-lg text-xs transition hover:bg-red-500/10"
                                style={{ color: "#8B9BB4" }}
                                onClick={() => setProjects(p => p.filter(pr => pr.id !== project.id))}
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </motion.div>
                ))}

                {/* Add project tile */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: filtered.length * 0.06 }}
                    className="rounded-xl border-2 border-dashed p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF642D]/50 transition-all group"
                    style={{ borderColor: "#1E2940", minHeight: 280 }}
                    onClick={() => setShowAdd(true)}
                >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition group-hover:bg-[rgba(255,100,45,0.12)]"
                        style={{ background: "#1E2940" }}>
                        <Plus size={20} style={{ color: "#4A5568" }} className="group-hover:text-[#FF642D] transition-colors" />
                    </div>
                    <p className="text-sm font-semibold text-[#8B9BB4] group-hover:text-white transition-colors">Add Project</p>
                    <p className="text-[11px] mt-1 text-center" style={{ color: "#4A5568" }}>Track a new website</p>
                </motion.div>
            </div>
        </div>
    );
}
