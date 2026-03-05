"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, TrendingUp, FileText, Plus, ChevronRight, Sparkles } from "lucide-react";
import { MOCK_CONTENT_IDEAS } from "@/lib/mock-data";

const STATUS_COLORS = {
    idea: { color: "#8B9BB4", bg: "rgba(139,155,180,0.12)", label: "Idea" },
    brief_ready: { color: "#7B5CF5", bg: "rgba(123,92,245,0.12)", label: "Brief Ready" },
    published: { color: "#00C853", bg: "rgba(0,200,83,0.12)", label: "Published" },
};

export function ContentClient() {
    const [active, setActive] = useState<string | null>(null);

    const quickWins = MOCK_CONTENT_IDEAS.filter(c => c.difficulty < 45);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Content Ideas</h1>
                    <p className="text-sm mt-1" style={{ color: "#6B7A99" }}>AI-powered content briefs and keyword clusters</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition"
                    style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}>
                    <Sparkles size={14} /> Generate Brief
                </button>
            </div>

            {/* Quick Wins */}
            {quickWins.length > 0 && (
                <div className="rounded-xl border p-5" style={{ background: "rgba(123,92,245,0.06)", borderColor: "rgba(123,92,245,0.2)" }}>
                    <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "#9D84F7" }}>
                        <TrendingUp size={15} /> Pages to Refresh — Quick Wins
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {quickWins.map(c => (
                            <span key={c.title} className="px-3 py-1.5 rounded-lg text-xs font-medium"
                                style={{ background: "#0D1424", border: "1px solid rgba(123,92,245,0.2)", color: "#C8D0E0" }}>
                                {c.title.split(" ").slice(0, 5).join(" ")}…
                                <span className="ml-2 font-bold" style={{ color: "#9D84F7" }}>D:{c.difficulty}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Content Ideas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_CONTENT_IDEAS.map((idea, i) => {
                    const st = STATUS_COLORS[idea.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.idea;
                    const isActive = active === idea.title;
                    return (
                        <motion.div key={idea.title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            onClick={() => setActive(isActive ? null : idea.title)}
                            className="rounded-xl border p-5 cursor-pointer transition-all hover:border-[#FF642D]/30"
                            style={{ background: "#151B27", borderColor: isActive ? "rgba(255,100,45,0.3)" : "#1E2940" }}>
                            <div className="flex items-start justify-between mb-3">
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded" style={{ background: "rgba(123,92,245,0.12)", color: "#9D84F7" }}>
                                    {idea.cluster}
                                </span>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>
                                    {st.label}
                                </span>
                            </div>
                            <p className="font-semibold text-white text-sm mb-3">{idea.title}</p>
                            <div className="flex items-center gap-3 text-[11px]" style={{ color: "#6B7A99" }}>
                                <span>Vol: <strong className="text-white">{idea.volume.toLocaleString()}</strong></span>
                                <span>·</span>
                                <span>KD: <strong style={{ color: idea.difficulty < 45 ? "#00C853" : idea.difficulty < 65 ? "#FF9800" : "#FF3D3D" }}>{idea.difficulty}</strong></span>
                                <span>·</span>
                                <span>{idea.intent}</span>
                            </div>
                            {isActive && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 pt-4 border-t" style={{ borderColor: "#1E2940" }}>
                                    <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#4A5568" }}>Brief Outline</p>
                                    <div className="space-y-1.5">
                                        {["Introduction + target keyword context", "H2: What is…", "H2: Why it matters", "H2: Step-by-step guide", "H2: Common mistakes", "Conclusion + CTA"].map(s => (
                                            <div key={s} className="flex items-center gap-2 text-[12px]" style={{ color: "#C8D0E0" }}>
                                                <span className="w-1 h-1 rounded-full shrink-0" style={{ background: "#FF642D" }} />{s}
                                            </div>
                                        ))}
                                    </div>
                                    <button className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white hover:opacity-90 transition"
                                        style={{ background: "linear-gradient(135deg, #7B5CF5, #6366f1)" }}>
                                        <Sparkles size={11} /> Generate Full Brief
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
