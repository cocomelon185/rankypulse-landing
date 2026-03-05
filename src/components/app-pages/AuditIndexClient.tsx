"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Plus, Clock, Globe, Eye } from "lucide-react";
import { MOCK_PROJECTS } from "@/lib/mock-data";

export function AuditIndexClient() {
    const router = useRouter();

    return (
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

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {MOCK_PROJECTS.map((project, i) => {
                    const scoreColor = project.score >= 80 ? "#00C853" : project.score >= 60 ? "#FF9800" : "#FF3D3D";
                    return (
                        <motion.div
                            key={project.id}
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
                                <div>
                                    <p className="font-semibold text-white">{project.domain}</p>
                                    <span className="text-[10px] flex items-center gap-1" style={{ color: "#6B7A99" }}>
                                        <Globe size={9} /> {project.pagesCrawled} pages crawled
                                    </span>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="text-2xl font-black" style={{ color: scoreColor }}>{project.score}</p>
                                    <p className="text-[10px]" style={{ color: "#6B7A99" }}>/ 100</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-[11px] mb-4" style={{ color: "#6B7A99" }}>
                                <span className="flex items-center gap-1"><Clock size={10} />
                                    {new Date(project.lastAuditAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span style={{ color: "#FF3D3D" }}>{project.errors} errors</span>
                                    <span className="mx-1">·</span>
                                    <span style={{ color: "#FF9800" }}>{project.warnings} warnings</span>
                                </span>
                            </div>
                            <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition hover:opacity-80"
                                style={{ background: "rgba(255,100,45,0.12)", color: "#FF642D" }}>
                                <Eye size={12} /> View Full Audit
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
