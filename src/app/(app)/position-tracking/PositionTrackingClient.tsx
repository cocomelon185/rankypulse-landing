"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Activity,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    Globe,
    Plus,
    Filter,
    Download,
    MoreHorizontal,
    Info
} from "lucide-react";
import { Card } from "@/components/horizon";
import { LineAreaChart } from "@/components/charts/LineAreaChart";
import { Button } from "@/components/ui/button";
import { TrackKeywordModal } from "@/components/modals/TrackKeywordModal";
import type { RankKeyword } from "@/lib/rank-engine";

interface Overview {
    avg_position: number | null;
    top3_count: number;
    top10_count: number;
    total_keywords: number;
    visibility: number;
    visibility_change: number;
}

interface VisibilityTrendPoint {
    date: string;
    score: number;
}

export default function PositionTrackingClient() {
    const [keywords, setKeywords] = useState<RankKeyword[]>([]);
    const [overview, setOverview] = useState<Overview | null>(null);
    const [trend, setTrend] = useState<VisibilityTrendPoint[]>([]);
    const [domain, setDomain] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const raw = localStorage.getItem("rankypulse_last_url") ?? "";
        const cleaned = raw
            .replace(/^https?:\/\//, "")
            .replace(/^www\./, "")
            .split("/")[0]
            .toLowerCase()
            .trim();
        setDomain(cleaned || "");
    }, []);

    const fetchData = useCallback(async () => {
        if (!domain) return;
        setLoading(true);

        const [kwRes, ovRes, visRes] = await Promise.all([
            fetch(`/api/rank/keywords?domain=${encodeURIComponent(domain)}`),
            fetch(`/api/rank/overview?domain=${encodeURIComponent(domain)}`),
            fetch(`/api/rank/visibility?domain=${encodeURIComponent(domain)}`),
        ]);

        if (kwRes.ok) {
            const { keywords: kws } = await kwRes.json();
            setKeywords(kws ?? []);
        }
        if (ovRes.ok) {
            const data = await ovRes.json();
            setOverview(data);
        }
        if (visRes.ok) {
            const { trend: t } = await visRes.json();
            setTrend(t ?? []);
        }

        setLoading(false);
    }, [domain]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Summary stat cards derived from real overview data
    const visChange = overview?.visibility_change ?? 0;
    const stats = [
        {
            label: "Visibility",
            value: overview ? `${overview.visibility.toFixed(1)}` : "—",
            diff: visChange >= 0 ? `+${visChange.toFixed(1)}` : `${visChange.toFixed(1)}`,
            trend: visChange >= 0 ? "up" : "down",
        },
        {
            label: "Keywords Tracked",
            value: overview ? String(overview.total_keywords) : "—",
            diff: "",
            trend: "up",
        },
        {
            label: "Avg. Position",
            value: overview?.avg_position != null ? String(overview.avg_position) : "—",
            diff: "",
            trend: "up",
        },
        {
            label: "Keywords in Top 3",
            value: overview ? String(overview.top3_count) : "—",
            diff: "",
            trend: "up",
        },
    ];

    // Chart data: scores as array for LineAreaChart
    const chartData = trend.map((t) => t.score);
    const chartCategories = trend.map((t) =>
        new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    );

    return (
        <div className="flex flex-col gap-6">
            {/* ── Summary Stats ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} extra="p-5 flex flex-col gap-2 bg-[#13161f] border-white/5" default={true}>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</span>
                        <div className="flex items-end justify-between">
                            <span className="text-2xl font-bold text-white tracking-tight">{stat.value}</span>
                            {stat.diff && (
                                <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
                                    {stat.trend === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {stat.diff}
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {/* ── Main Chart ── */}
            <Card extra="p-6 md:p-8 bg-[#13161f] border-white/5" default={true}>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-400" />
                            Visibility Trend
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Daily visibility index tracking over the last 30 days</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="bg-white/5 border-white/5 text-gray-300 text-xs h-8">
                            <Filter size={12} className="mr-2" /> Filter
                        </Button>
                        <Button variant="outline" size="sm" className="bg-white/5 border-white/5 text-gray-300 text-xs h-8">
                            <Download size={12} className="mr-2" /> Export
                        </Button>
                    </div>
                </div>

                <div className="h-[240px] w-full">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-gray-600">
                            No visibility data yet. Add keywords and run a rank update.
                        </div>
                    ) : (
                        <LineAreaChart
                            series={[{ name: "Visibility Index", data: chartData }]}
                            categories={chartCategories}
                        />
                    )}
                </div>
            </Card>

            {/* ── Keyword Table ── */}
            <Card extra="bg-[#13161f] border-white/5 overflow-hidden" default={true}>
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-md font-bold text-white">Tracked Keywords</h3>
                    <Button
                        size="sm"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs h-8"
                        onClick={() => setModalOpen(true)}
                        disabled={!domain}
                    >
                        <Plus size={14} className="mr-2" /> Add Keywords
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="px-6 py-8 flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                        </div>
                    ) : keywords.length === 0 ? (
                        <div className="px-6 py-8 text-center text-xs text-gray-600">
                            No keywords tracked yet. Click &quot;Add Keywords&quot; to get started.
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Keyword</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">Position</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">Diff</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Volume</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">CPC (USD)</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Target URL</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {keywords.map((kw, i) => (
                                    <motion.tr
                                        key={kw.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-200">{kw.keyword}</span>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Globe size={10} className="text-gray-600" />
                                                    <span className="text-[10px] text-gray-600">
                                                        Google / {kw.country} / {kw.device}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-sm font-bold ${(kw.position ?? 999) <= 3 ? "text-emerald-400" : "text-gray-300"}`}>
                                                {kw.position ?? "—"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className={`inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded ${
                                                (kw.change ?? 0) > 0
                                                    ? "text-emerald-400 bg-emerald-400/10"
                                                    : (kw.change ?? 0) < 0
                                                    ? "text-red-400 bg-red-400/10"
                                                    : "text-gray-500 bg-white/5"
                                            }`}>
                                                {(kw.change ?? 0) > 0 ? "+" : ""}
                                                {kw.change == null ? "-" : kw.change === 0 ? "-" : kw.change}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400 tabular-nums">
                                            {kw.volume != null ? kw.volume.toLocaleString() : "—"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400 tabular-nums">
                                            {kw.cpc != null ? `$${Number(kw.cpc).toFixed(2)}` : "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-gray-500 hover:text-indigo-400 transition-colors">
                                                <span className="text-xs truncate max-w-[150px]">
                                                    {kw.ranked_url ?? kw.target_url ?? "—"}
                                                </span>
                                                {(kw.ranked_url ?? kw.target_url) && (
                                                    <ArrowUpRight size={12} className="shrink-0" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-1.5 text-gray-600 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                                                <MoreHorizontal size={14} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {keywords.length > 0 && (
                    <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-center">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                            {keywords.length} keyword{keywords.length !== 1 ? "s" : ""} tracked
                        </span>
                    </div>
                )}
            </Card>

            {/* ── Help / Info ── */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 text-gray-400 text-xs">
                <Info size={14} className="text-indigo-400 shrink-0" />
                <p>Position tracking updates every 24 hours. Rankings are fetched from Google via DataForSEO.</p>
            </div>

            {/* Track Keyword Modal */}
            {domain && (
                <TrackKeywordModal
                    domain={domain}
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onAdded={(newKw) => {
                        setKeywords((prev) => [...prev, newKw]);
                        setModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}
