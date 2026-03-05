"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Search, BarChart2, TrendingUp, Bookmark, Download, Filter, Plus, ChevronDown,
} from "lucide-react";
import { MOCK_KEYWORDS } from "@/lib/mock-data";

function DifficultyBar({ val }: { val: number }) {
    const color = val < 40 ? "#00C853" : val < 65 ? "#FF9800" : "#FF3D3D";
    return (
        <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "#1E2940" }}>
                <div className="h-full rounded-full" style={{ width: `${val}%`, background: color }} />
            </div>
            <span className="text-[11px] font-bold tabular-nums" style={{ color }}>{val}</span>
        </div>
    );
}

const INTENT_COLORS: Record<string, { color: string; bg: string }> = {
    Commercial: { color: "#FF642D", bg: "rgba(255,100,45,0.12)" },
    Informational: { color: "#00B0FF", bg: "rgba(0,176,255,0.12)" },
    Transactional: { color: "#00C853", bg: "rgba(0,200,83,0.12)" },
    Navigational: { color: "#7B5CF5", bg: "rgba(123,92,245,0.12)" },
};

export function KeywordsClient() {
    const [query, setQuery] = useState("");
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

    const filtered = query ? MOCK_KEYWORDS.filter(k => k.keyword.includes(query.toLowerCase())) : MOCK_KEYWORDS;
    const opportunities = MOCK_KEYWORDS.filter(k => k.difficulty < 50 && k.intent === "Commercial");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Keyword Research</h1>
                    <p className="text-sm mt-1" style={{ color: "#6B7A99" }}>Discover keywords, analyze difficulty, and track opportunities</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition hover:opacity-90"
                    style={{ color: "#8B9BB4", border: "1px solid #1E2940", background: "rgba(255,255,255,0.04)" }}>
                    <Download size={14} /> Export
                </button>
            </div>

            {/* Keyword search box */}
            <div className="rounded-xl border p-5" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#4A5568" }} />
                        <input
                            type="text"
                            placeholder="Search keywords, e.g. 'seo audit tool'..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-lg text-sm outline-none"
                            style={{ background: "#0D1424", border: "1px solid #1E2940", color: "#C8D0E0" }}
                            onFocus={e => (e.currentTarget.style.borderColor = "#FF642D")}
                            onBlur={e => (e.currentTarget.style.borderColor = "#1E2940")}
                        />
                    </div>
                    <button className="px-6 py-2.5 rounded-lg text-sm font-bold text-white transition hover:opacity-90"
                        style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}>
                        Analyze
                    </button>
                </div>
            </div>

            {/* Opportunities */}
            {opportunities.length > 0 && (
                <div className="rounded-xl border p-5" style={{ background: "rgba(0,200,83,0.04)", borderColor: "rgba(0,200,83,0.2)" }}>
                    <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "#00C853" }}>
                        <TrendingUp size={15} /> Quick Win Opportunities
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1" style={{ background: "rgba(0,200,83,0.15)", color: "#00C853" }}>
                            {opportunities.length} found
                        </span>
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {opportunities.map(k => (
                            <span key={k.keyword} className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer hover:opacity-80 transition"
                                style={{ background: "#0D1424", border: "1px solid rgba(0,200,83,0.2)", color: "#C8D0E0" }}
                                onClick={() => setQuery(k.keyword)}>
                                {k.keyword} <span className="ml-1 font-bold" style={{ color: "#00C853" }}>D:{k.difficulty}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Keywords table */}
            <div className="rounded-xl border overflow-hidden" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "#1E2940", background: "#0D1424" }}>
                    <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#4A5568" }}>
                        {filtered.length} Keywords
                    </p>
                </div>
                <table className="w-full text-[13px]">
                    <thead>
                        <tr style={{ background: "#0D1424", borderBottom: "1px solid #1E2940" }}>
                            {["Keyword", "Volume", "Difficulty", "Intent", "Position", "CPC", ""].map(h => (
                                <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#4A5568" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((kw, i) => {
                            const intentCfg = INTENT_COLORS[kw.intent] || INTENT_COLORS.Informational;
                            const isSaved = savedIds.has(kw.keyword);
                            return (
                                <motion.tr key={kw.keyword}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="border-b hover:bg-white/[0.02] transition"
                                    style={{ borderColor: "#1E2940" }}>
                                    <td className="px-5 py-3.5 font-semibold text-white">{kw.keyword}</td>
                                    <td className="px-5 py-3.5" style={{ color: "#C8D0E0" }}>{kw.volume.toLocaleString()}</td>
                                    <td className="px-5 py-3.5"><DifficultyBar val={kw.difficulty} /></td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: intentCfg.bg, color: intentCfg.color }}>
                                            {kw.intent}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5" style={{ color: kw.position ? "#C8D0E0" : "#4A5568" }}>
                                        {kw.position ? `#${kw.position}` : "—"}
                                        {kw.change !== 0 && kw.position && (
                                            <span className="ml-1.5 text-[10px]" style={{ color: kw.change > 0 ? "#00C853" : "#FF3D3D" }}>
                                                {kw.change > 0 ? "▲" : "▼"}{Math.abs(kw.change)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5" style={{ color: "#8B9BB4" }}>{kw.cpc}</td>
                                    <td className="px-5 py-3.5">
                                        <button
                                            onClick={() => setSavedIds(prev => { const n = new Set(prev); isSaved ? n.delete(kw.keyword) : n.add(kw.keyword); return n; })}
                                            className="p-1.5 rounded transition hover:bg-white/[0.06]"
                                            style={{ color: isSaved ? "#FF642D" : "#4A5568" }}
                                        >
                                            <Bookmark size={13} fill={isSaved ? "#FF642D" : "none"} />
                                        </button>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
