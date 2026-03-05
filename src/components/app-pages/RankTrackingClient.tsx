"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Plus, Globe, Monitor, Smartphone } from "lucide-react";
import { MOCK_RANK_DATA, MOCK_RANK_VISIBILITY } from "@/lib/mock-data";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function RankTrackingClient() {
    const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

    const filtered = MOCK_RANK_DATA.filter(k => k.device === device);
    const winners = filtered.filter(k => k.change > 0);
    const losers = filtered.filter(k => k.change < 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Rank Tracking</h1>
                    <p className="text-sm mt-1" style={{ color: "#6B7A99" }}>Monitor keyword positions daily</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition"
                    style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}>
                    <Plus size={14} /> Track Keyword
                </button>
            </div>

            {/* Visibility Trend */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 rounded-xl border p-5" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-white">Visibility Score Trend</h2>
                        <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "rgba(0,200,83,0.12)", color: "#00C853" }}>+16% MoM</span>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={MOCK_RANK_VISIBILITY} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7B5CF5" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#7B5CF5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E2940" vertical={false} />
                            <XAxis dataKey="month" tick={{ fill: "#4A5568", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#4A5568", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: "#0D1424", border: "1px solid #1E2940", borderRadius: 8, fontSize: 12 }} />
                            <Area type="monotone" dataKey="visibility" stroke="#7B5CF5" strokeWidth={2.5} fill="url(#visGrad)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="grid grid-rows-2 gap-4">
                    <div className="rounded-xl border p-5 flex flex-col justify-between" style={{ background: "rgba(0,200,83,0.06)", borderColor: "rgba(0,200,83,0.2)" }}>
                        <TrendingUp size={18} style={{ color: "#00C853" }} />
                        <div>
                            <p className="text-2xl font-black" style={{ color: "#00C853" }}>{winners.length}</p>
                            <p className="text-xs font-semibold text-white mt-0.5">Winners</p>
                        </div>
                    </div>
                    <div className="rounded-xl border p-5 flex flex-col justify-between" style={{ background: "rgba(255,61,61,0.06)", borderColor: "rgba(255,61,61,0.2)" }}>
                        <TrendingDown size={18} style={{ color: "#FF3D3D" }} />
                        <div>
                            <p className="text-2xl font-black" style={{ color: "#FF3D3D" }}>{losers.length}</p>
                            <p className="text-xs font-semibold text-white mt-0.5">Losers</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Device Toggle + Table */}
            <div className="rounded-xl border overflow-hidden" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#1E2940" }}>
                    <h2 className="text-sm font-bold text-white">Tracked Keywords</h2>
                    <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "#1E2940" }}>
                        {(["desktop", "mobile"] as const).map(d => (
                            <button key={d} onClick={() => setDevice(d)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition"
                                style={{ background: device === d ? "rgba(255,100,45,0.15)" : "transparent", color: device === d ? "#FF642D" : "#8B9BB4" }}>
                                {d === "desktop" ? <Monitor size={11} /> : <Smartphone size={11} />} {d}
                            </button>
                        ))}
                    </div>
                </div>
                <table className="w-full text-[13px]">
                    <thead>
                        <tr style={{ background: "#0D1424" }}>
                            {["Keyword", "Vol", "Position", "Change", "URL"].map(h => (
                                <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#4A5568" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((kw, i) => (
                            <motion.tr key={kw.keyword} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                className="border-b hover:bg-white/[0.02] transition" style={{ borderColor: "#1E2940" }}>
                                <td className="px-5 py-3.5 font-semibold text-white">{kw.keyword}</td>
                                <td className="px-5 py-3.5" style={{ color: "#8B9BB4" }}>{kw.volume.toLocaleString()}</td>
                                <td className="px-5 py-3.5 font-bold text-white">#{kw.position}</td>
                                <td className="px-5 py-3.5">
                                    <span className="flex items-center gap-1 font-bold" style={{ color: kw.change > 0 ? "#00C853" : kw.change < 0 ? "#FF3D3D" : "#8B9BB4" }}>
                                        {kw.change > 0 ? <TrendingUp size={12} /> : kw.change < 0 ? <TrendingDown size={12} /> : null}
                                        {kw.change === 0 ? "—" : `${kw.change > 0 ? "+" : ""}${kw.change}`}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5 font-mono text-[11px]" style={{ color: "#FF642D" }}>{kw.url}</td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
