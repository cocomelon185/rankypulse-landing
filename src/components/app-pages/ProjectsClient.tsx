"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Globe, Trash2, RefreshCcw, Eye, Clock,
    AlertTriangle, XCircle, CheckCircle, Loader2, AlertCircle,
} from "lucide-react";

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

// ── ScoreBadge ────────────────────────────────────────────────────────────────
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

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const isCrawling = status === "crawling" || status === "pending";
    const color = isCrawling ? "#FF9800" : "#00C853";
    return (
        <div className="flex items-center gap-1.5">
            {isCrawling
                ? <Loader2 size={10} className="animate-spin" style={{ color }} />
                : <span className="w-2 h-2 rounded-full" style={{ background: color }} />}
            <span className="text-[10px]" style={{ color }}>
                {isCrawling ? "Crawling…" : "live"}
            </span>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function ProjectsClient() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [newDomain, setNewDomain] = useState("");
    const [adding, setAdding] = useState(false);
    const [runningAudit, setRunningAudit] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // ── Fetch projects from real API ─────────────────────────────────────────
    const fetchProjects = useCallback(async () => {
        try {
            const res = await fetch("/api/projects");
            if (!res.ok) throw new Error("Failed to load projects");
            const data = await res.json();
            setProjects(data.domains ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // Poll every 8s if any project is still crawling
    useEffect(() => {
        const hasCrawling = projects.some(p => p.status === "crawling" || p.status === "pending");
        if (!hasCrawling) return;
        const id = setInterval(fetchProjects, 8000);
        return () => clearInterval(id);
    }, [projects, fetchProjects]);

    // ── Add new project ──────────────────────────────────────────────────────
    const handleAdd = async () => {
        if (!newDomain.trim() || adding) return;
        setAdding(true);
        const domain = newDomain.replace(/^https?:\/\//, "").replace(/\/$/, "").trim();
        try {
            const res = await fetch("/api/crawl/full/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to start audit");
            setNewDomain("");
            setShowAdd(false);
            router.push(`/app/audit/${domain}`);
        } catch (e) {
            alert(e instanceof Error ? e.message : "Failed to add project");
        } finally {
            setAdding(false);
        }
    };

    // ── Re-run audit ─────────────────────────────────────────────────────────
    const handleRerun = async (domain: string) => {
        if (runningAudit) return;
        setRunningAudit(domain);
        try {
            const res = await fetch("/api/crawl/full/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain }),
            });
            if (!res.ok) throw new Error("Failed to start re-run");
            await fetchProjects();
        } catch (e) {
            alert(e instanceof Error ? e.message : "Failed to start audit");
        } finally {
            setRunningAudit(null);
        }
    };

    // ── Delete project ───────────────────────────────────────────────────────
    const handleDelete = async (jobId: string, domain: string) => {
        if (!confirm(`Delete project "${domain}"? This will remove all audit data.`)) return;
        setDeletingId(jobId);
        try {
            const res = await fetch(`/api/projects?jobId=${jobId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete project");
            setProjects(prev => prev.filter(p => p.jobId !== jobId));
        } catch (e) {
            alert(e instanceof Error ? e.message : "Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
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
                                    disabled={adding}
                                />
                            </div>
                            <button
                                onClick={handleAdd}
                                disabled={adding || !newDomain.trim()}
                                className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                                style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}
                            >
                                {adding ? <Loader2 size={13} className="animate-spin" /> : null}
                                {adding ? "Starting…" : "Start Audit"}
                            </button>
                            <button
                                onClick={() => { setShowAdd(false); setNewDomain(""); }}
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

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={28} className="animate-spin" style={{ color: "#FF642D" }} />
                </div>
            )}

            {/* Error */}
            {error && !loading && (
                <div className="rounded-xl border p-6 flex items-center gap-3" style={{ background: "rgba(255,61,61,0.08)", borderColor: "rgba(255,61,61,0.2)" }}>
                    <AlertCircle size={18} style={{ color: "#FF3D3D" }} />
                    <p className="text-sm" style={{ color: "#FF3D3D" }}>{error}</p>
                    <button onClick={fetchProjects} className="ml-auto text-xs underline" style={{ color: "#FF642D" }}>Retry</button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && projects.length === 0 && (
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
                        onClick={() => setShowAdd(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
                        style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}
                    >
                        <Plus size={15} /> Add Project
                    </button>
                </motion.div>
            )}

            {/* Projects Grid */}
            {!loading && projects.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {projects.map((project, i) => {
                        const isCrawling = project.status === "crawling" || project.status === "pending";
                        return (
                            <motion.div
                                key={project.jobId}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
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
                                            <p className="text-[10px]" style={{ color: "#6B7A99" }}>
                                                {project.pagesCrawled} pages crawled
                                            </p>
                                        </div>
                                    </div>
                                    <StatusBadge status={project.status} />
                                </div>

                                {/* Score */}
                                <div className="mb-4">
                                    {isCrawling
                                        ? <div className="flex items-center gap-2 text-sm" style={{ color: "#FF9800" }}>
                                            <Loader2 size={14} className="animate-spin" />
                                            <span>Crawling in progress…</span>
                                        </div>
                                        : <ScoreBadge score={project.score} />
                                    }
                                </div>

                                {/* Issue counts */}
                                {!isCrawling && (
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
                                )}

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
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition hover:bg-white/[0.06] disabled:opacity-50"
                                        style={{ color: "#8B9BB4", background: "rgba(255,255,255,0.04)" }}
                                        onClick={() => handleRerun(project.domain)}
                                        disabled={runningAudit === project.domain || isCrawling}
                                    >
                                        {runningAudit === project.domain
                                            ? <Loader2 size={12} className="animate-spin" />
                                            : <RefreshCcw size={12} />}
                                        Re-run
                                    </button>
                                    <button
                                        className="flex items-center gap-1.5 px-2 py-2 rounded-lg text-xs transition hover:bg-red-500/10 disabled:opacity-40"
                                        style={{ color: "#8B9BB4" }}
                                        onClick={() => handleDelete(project.jobId, project.domain)}
                                        disabled={deletingId === project.jobId}
                                    >
                                        {deletingId === project.jobId
                                            ? <Loader2 size={12} className="animate-spin" />
                                            : <Trash2 size={12} />}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Add project tile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: projects.length * 0.05 }}
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
            )}
        </div>
    );
}
