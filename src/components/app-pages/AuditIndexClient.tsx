"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Clock, Globe, Eye, Loader2, AlertCircle } from "lucide-react";
import { OnboardingModal, ONBOARDING_STORAGE_KEY } from "@/components/modals/OnboardingModal";

interface Project {
    domain: string;
    jobId: string;
    score: number;
    errors: number;
    warnings: number;
    pagesCrawled: number;
    lastAuditAt: string;
    status: string;
}

export function AuditIndexClient() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);

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

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    // Show onboarding modal the first time a user has no projects
    useEffect(() => {
        if (!loading && projects.length === 0 && !error) {
            const seen = localStorage.getItem(ONBOARDING_STORAGE_KEY);
            if (!seen) setShowOnboarding(true);
        }
    }, [loading, projects.length, error]);

    return (
        <>
        <AnimatePresence>
            {showOnboarding && (
                <OnboardingModal onClose={() => setShowOnboarding(false)} />
            )}
        </AnimatePresence>
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Site Audit</h1>
                    <p className="text-sm mt-1" style={{ color: "#6B7A99" }}>View and run audits for your websites</p>
                </div>
                <button
                    onClick={() => router.push("/app/projects")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}
                >
                    <Plus size={15} /> New Audit
                </button>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={28} className="animate-spin" style={{ color: "#FF642D" }} />
                </div>
            )}

            {error && !loading && (
                <div className="rounded-xl border p-6 flex items-center gap-3" style={{ background: "rgba(255,61,61,0.08)", borderColor: "rgba(255,61,61,0.2)" }}>
                    <AlertCircle size={18} style={{ color: "#FF3D3D" }} />
                    <p className="text-sm" style={{ color: "#FF3D3D" }}>{error}</p>
                    <button onClick={fetchProjects} className="ml-auto text-xs underline" style={{ color: "#FF642D" }}>Retry</button>
                </div>
            )}

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
                    <h2 className="text-lg font-bold text-white mb-2">No audits yet</h2>
                    <p className="text-sm mb-6" style={{ color: "#6B7A99" }}>Add a project and run your first audit</p>
                    <button
                        onClick={() => router.push("/app/projects")}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
                        style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}
                    >
                        <Plus size={15} /> Add Project
                    </button>
                </motion.div>
            )}

            {!loading && projects.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {projects.map((project, i) => {
                        const isCrawling = project.status === "crawling" || project.status === "pending";
                        const scoreColor = project.score >= 80 ? "#00C853" : project.score >= 60 ? "#FF9800" : "#FF3D3D";
                        return (
                            <motion.div
                                key={project.jobId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.07 }}
                                onClick={() => router.push(`/app/audit/${project.domain}`)}
                                className="rounded-xl border p-5 cursor-pointer hover:border-[#FF642D]/30 transition-all group"
                                style={{ background: "#151B27", borderColor: "#1E2940" }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white"
                                        style={{ background: "linear-gradient(135deg,#FF642D,#E85420)" }}>
                                        {project.domain[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-white truncate">{project.domain}</p>
                                        <span className="text-[10px] flex items-center gap-1" style={{ color: "#6B7A99" }}>
                                            <Globe size={9} /> {project.pagesCrawled} pages
                                        </span>
                                    </div>
                                    <div className="text-right shrink-0">
                                        {isCrawling ? (
                                            <Loader2 size={18} className="animate-spin" style={{ color: "#FF9800" }} />
                                        ) : (
                                            <>
                                                <p className="text-2xl font-black" style={{ color: scoreColor }}>{project.score}</p>
                                                <p className="text-[10px]" style={{ color: "#6B7A99" }}>/ 100</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-[11px] mb-4" style={{ color: "#6B7A99" }}>
                                    <span className="flex items-center gap-1">
                                        <Clock size={10} />
                                        {new Date(project.lastAuditAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </span>
                                    {isCrawling
                                        ? <span style={{ color: "#FF9800" }}>Crawling…</span>
                                        : <span className="flex items-center gap-1">
                                            <span style={{ color: "#FF3D3D" }}>{project.errors} errors</span>
                                            <span className="mx-1">·</span>
                                            <span style={{ color: "#FF9800" }}>{project.warnings} warnings</span>
                                        </span>
                                    }
                                </div>
                                <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition hover:opacity-80"
                                    style={{ background: "rgba(255,100,45,0.12)", color: "#FF642D" }}>
                                    <Eye size={12} /> View Full Audit
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
        </>
    );
}
