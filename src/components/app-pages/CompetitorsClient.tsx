"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, BarChart2, TrendingUp, Search, Plus } from "lucide-react";
import { MOCK_COMPETITORS, MOCK_KEYWORDS } from "@/lib/mock-data";

export function CompetitorsClient() {
    const [selected, setSelected] = useState<string | null>(null);

    const keywordGap = MOCK_KEYWORDS.slice(0, 5).map(k => ({
        keyword: k.keyword,
        you: k.position,
        competitor: k.position ? Math.max(1, k.position - Math.floor(Math.random() * 10) - 1) : Math.floor(Math.random() * 15) + 1,
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Competitors</h1>
                    <p className="text-sm mt-1" style={{ color: "#6B7A99" }}>Benchmark against your top competitors</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition"
                    style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}>
                    <Plus size={14} /> Add Competitor
                </button>
            </div>

            {/* Competitor Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {MOCK_COMPETITORS.map((comp, i) => (
                    <motion.div key={comp.domain}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        onClick={() => setSelected(comp.domain === selected ? null : comp.domain)}
                        className={`rounded-xl border p-5 cursor-pointer transition-all hover:border-[#FF642D]/30 ${selected === comp.domain ? "border-[#FF642D]/40" : ""}`}
                        style={{ background: "#151B27", borderColor: selected === comp.domain ? "rgba(255,100,45,0.4)" : "#1E2940" }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-sm"
                                style={{ background: "linear-gradient(135deg, #7B5CF5, #6366f1)" }}>
                                {comp.domain[0].toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-white text-sm">{comp.domain}</p>
                                <span className="text-[11px]" style={{ color: "#6B7A99" }}>Score: <span className="font-bold text-white">{comp.score}/100</span></span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            {[
                                { label: "Traffic", value: comp.traffic, color: "#00B0FF" },
                                { label: "Keywords", value: comp.keywords, color: "#7B5CF5" },
                                { label: "Overlap", value: comp.overlap, color: "#FF9800" },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="rounded-lg p-2" style={{ background: "#0D1424" }}>
                                    <p className="text-sm font-bold" style={{ color }}>{value}</p>
                                    <p className="text-[9px] mt-0.5" style={{ color: "#4A5568" }}>{label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Keyword Gap */}
            <div className="rounded-xl border p-5" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                <h2 className="text-sm font-bold text-white mb-4">Keyword Gap Analysis</h2>
                <div className="space-y-3">
                    {keywordGap.map(({ keyword, you, competitor }) => (
                        <div key={keyword} className="flex items-center gap-4">
                            <span className="text-[12px] text-white font-medium w-44 truncate shrink-0">{keyword}</span>
                            <div className="flex-1 flex items-center gap-3">
                                <span className="text-[11px] text-right w-8 shrink-0" style={{ color: "#FF642D" }}>#{you || "—"}</span>
                                <div className="flex-1 relative h-2 rounded-full" style={{ background: "#1E2940" }}>
                                    {you && <div className="absolute left-0 top-0 h-full rounded-full bg-[#FF642D]"
                                        style={{ width: `${Math.max(5, 100 - (you / 40) * 100)}%` }} />}
                                    <div className="absolute top-0 h-full rounded-full bg-[#7B5CF5] opacity-40"
                                        style={{ left: 0, width: `${Math.max(5, 100 - (competitor / 40) * 100)}%` }} />
                                </div>
                                <span className="text-[11px] w-8 shrink-0" style={{ color: "#7B5CF5" }}>#{competitor}</span>
                            </div>
                            <span className="text-[11px] shrink-0" style={{ color: you && you > competitor ? "#FF3D3D" : "#00C853" }}>
                                {you && you > competitor ? `${you - competitor} behind` : you ? `${competitor - (you || 0)} ahead` : "Not ranking"}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-4 mt-4 text-[11px]">
                    <div className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded" style={{ background: "#FF642D" }} /><span style={{ color: "#8B9BB4" }}>You (rankypulse.com)</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded opacity-40" style={{ background: "#7B5CF5" }} /><span style={{ color: "#8B9BB4" }}>Competitor avg</span></div>
                </div>
            </div>
        </div>
    );
}
