"use client";

import { motion } from "framer-motion";
import { Link as LinkIcon, TrendingUp, TrendingDown, AlertTriangle, Plus } from "lucide-react";
import { MOCK_BACKLINKS } from "@/lib/mock-data";

export function BacklinksClient() {
    const active = MOCK_BACKLINKS.filter(b => b.status === "active");
    const lost = MOCK_BACKLINKS.filter(b => b.status === "lost");
    const toxic = MOCK_BACKLINKS.filter(b => b.status === "toxic");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Backlinks</h1>
                    <p className="text-sm mt-1" style={{ color: "#6B7A99" }}>Analyze your link profile and find opportunities</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Backlinks", value: MOCK_BACKLINKS.reduce((a, b) => a + b.links, 0), color: "#C8D0E0", icon: LinkIcon },
                    { label: "New (30 days)", value: 3, color: "#00C853", icon: TrendingUp },
                    { label: "Lost (30 days)", value: lost.length, color: "#FF3D3D", icon: TrendingDown },
                    { label: "Toxic Links", value: toxic.length, color: "#FF9800", icon: AlertTriangle },
                ].map(({ label, value, color, icon: Icon }) => (
                    <div key={label} className="rounded-xl border p-5" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                        <Icon size={17} style={{ color }} className="mb-3" />
                        <p className="text-2xl font-black" style={{ color }}>{value}</p>
                        <p className="text-xs mt-1" style={{ color: "#6B7A99" }}>{label}</p>
                    </div>
                ))}
            </div>

            {/* Backlinks table */}
            <div className="rounded-xl border overflow-hidden" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                <div className="px-5 py-3.5 border-b" style={{ borderColor: "#1E2940", background: "#0D1424" }}>
                    <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#4A5568" }}>All Referring Domains</p>
                </div>
                <table className="w-full text-[13px]">
                    <thead>
                        <tr style={{ background: "#0D1424" }}>
                            {["Domain", "DR", "Links", "Type", "Status", "Anchor Text", "Discovered"].map(h => (
                                <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#4A5568" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_BACKLINKS.map((bl, i) => {
                            const STATUS_MAP = {
                                active: { color: "#00C853", bg: "rgba(0,200,83,0.12)", label: "Active" },
                                lost: { color: "#FF3D3D", bg: "rgba(255,61,61,0.12)", label: "Lost" },
                                toxic: { color: "#FF9800", bg: "rgba(255,152,0,0.12)", label: "Toxic ⚠" },
                            } as const;
                            const statusCfg = STATUS_MAP[bl.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.active;
                            return (
                                <motion.tr key={bl.domain} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                    className="border-b hover:bg-white/[0.02] transition" style={{ borderColor: "#1E2940" }}>
                                    <td className="px-5 py-3.5 font-semibold text-white">{bl.domain}</td>
                                    <td className="px-5 py-3.5">
                                        <span className="font-black tabular-nums" style={{ color: bl.dr >= 70 ? "#00C853" : bl.dr >= 40 ? "#FF9800" : "#FF3D3D" }}>{bl.dr}</span>
                                    </td>
                                    <td className="px-5 py-3.5 font-bold text-white">{bl.links}</td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-[11px] px-2 py-0.5 rounded font-semibold" style={{ background: bl.type === "dofollow" ? "rgba(0,200,83,0.1)" : "rgba(139,155,180,0.1)", color: bl.type === "dofollow" ? "#00C853" : "#8B9BB4" }}>
                                            {bl.type}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: statusCfg.bg, color: statusCfg.color }}>{statusCfg.label}</span>
                                    </td>
                                    <td className="px-5 py-3.5 italic" style={{ color: "#8B9BB4" }}>{bl.anchor}</td>
                                    <td className="px-5 py-3.5" style={{ color: "#6B7A99" }}>{new Date(bl.discovered).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
