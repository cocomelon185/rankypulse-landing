"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, Plus, Globe, MoreVertical, ArrowRight, Clock, ShieldCheck, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export interface ProjectData {
    id: string | number;
    name: string;
    domain: string;
    score: number;
    lastRun: string;
    status: string;
}

interface ProjectsClientProps {
    projects: ProjectData[];
}

export function ProjectsClient({ projects }: ProjectsClientProps) {
    const router = useRouter();

    return (
        <div className="w-full max-w-6xl mx-auto p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#e8eaf0]">Your Projects</h1>
                    <p className="text-sm text-[#8b91a8] mt-1">Manage and track your active SEO audits and campaigns.</p>
                </div>
                <button
                    onClick={() => router.push("/audits")}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#f97316] px-5 text-sm font-bold text-white shadow-md shadow-[#f97316]/20 hover:bg-[#fb923c] transition-colors"
                >
                    <Plus size={16} />
                    New Project
                </button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={project.id}
                        className="group flex flex-col justify-between rounded-xl border border-[#1e2336] bg-[#171b26] p-5 hover:border-[#f97316]/50 hover:shadow-[0_8px_30px_rgba(249,115,22,0.1)] transition-all cursor-pointer"
                        onClick={() => router.push(`/dashboard`)}
                    >
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e2336] text-[#e8eaf0] group-hover:bg-[#f97316]/10 group-hover:text-[#f97316] transition-colors">
                                        <Globe size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-[#e8eaf0] leading-tight">{project.name}</h3>
                                        <p className="text-xs text-[#8b91a8] mt-0.5">{project.domain}</p>
                                    </div>
                                </div>
                                <button className="text-[#545a72] hover:text-[#e8eaf0] transition-colors p-1" onClick={(e) => { e.stopPropagation(); }}>
                                    <MoreVertical size={16} />
                                </button>
                            </div>

                            {/* Score / Metrics block */}
                            <div className="mt-6 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#545a72] mb-1">Health Score</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className={cn(
                                            "text-2xl font-bold tracking-tighter",
                                            project.score >= 80 ? "text-[#22c55e]" : project.score >= 60 ? "text-[#eab308]" : "text-[#ef4444]"
                                        )}>
                                            {project.score}
                                        </span>
                                        <span className="text-sm font-medium text-[#8b91a8]">/ 100</span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#545a72] mb-1">Status</p>
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold",
                                        project.status === "Healthy" || project.status === "Good" ? "bg-[#22c55e]/10 text-[#22c55e]"
                                            : project.status === "Crawling" ? "bg-[#3b82f6]/10 text-[#3b82f6]"
                                                : project.status === "Needs Attention" ? "bg-[#eab308]/10 text-[#eab308]"
                                                    : "bg-[#ef4444]/10 text-[#ef4444]"
                                    )}>
                                        {project.status === "Healthy" || project.status === "Good" ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
                                        {project.status}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 pt-4 border-t border-[#1e2336] flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-[#8b91a8]">
                                <Clock size={12} />
                                <span>Updated {project.lastRun}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#f97316] opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transform duration-300">
                                Open <ArrowRight size={14} />
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Empty state / add new card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: projects.length * 0.1 }}
                    className="group flex h-full min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-[#1e2336] bg-transparent hover:border-[#f97316]/50 hover:bg-[#171b26]/50 transition-all cursor-pointer"
                    onClick={() => router.push("/audits")}
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1e2336] text-[#8b91a8] group-hover:bg-[#f97316] group-hover:text-white transition-colors shadow-lg group-hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                        <Plus size={24} />
                    </div>
                    <p className="mt-4 font-bold text-[#e8eaf0]">Add a Project</p>
                    <p className="mt-1 text-xs text-[#8b91a8]">Track a new domain</p>
                </motion.div>

            </div>
        </div>
    );
}
