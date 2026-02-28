"use client";

import { motion } from "framer-motion";
import {
    Activity,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    Globe,
    Search,
    Plus,
    Filter,
    Download,
    MoreHorizontal,
    Info
} from "lucide-react";
import { Card } from "@/components/horizon";
import { LineAreaChart } from "@/components/charts/LineAreaChart";
import { Button } from "@/components/ui/button";

const MOCK_KEYWORDS = [
    { keyword: "seo audit tool", pos: 3, prev: 5, diff: 2, vol: "12.4k", cpc: "2.45", url: "/blog/seo-audit" },
    { keyword: "rank tracker online", pos: 12, prev: 18, diff: 6, vol: "5.2k", cpc: "1.80", url: "/features/rank-tracker" },
    { keyword: "free site audit", pos: 1, prev: 1, diff: 0, vol: "45k", cpc: "5.10", url: "/" },
    { keyword: "core web vitals fix", pos: 8, prev: 7, diff: -1, vol: "1.2k", cpc: "0.95", url: "/blog/cwv-fix" },
    { keyword: "competitor analysis", pos: 24, prev: 32, diff: 8, vol: "8.1k", cpc: "3.20", url: "/features/competitors" },
];

export default function PositionTrackingClient() {
    return (
        <div className="flex flex-col gap-6">
            {/* ── Summary Stats ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Visibility", value: "64.2%", diff: "+2.4%", trend: "up", color: "text-emerald-400" },
                    { label: "Estimated Traffic", value: "24.5k", diff: "+1.2k", trend: "up", color: "text-indigo-400" },
                    { label: "Avg. Position", value: "14.2", diff: "-2.1", trend: "up", color: "text-emerald-400" },
                    { label: "Keywords in Top 3", value: "42", diff: "+5", trend: "up", color: "text-indigo-400" },
                ].map((stat, i) => (
                    <Card key={i} extra="p-5 flex flex-col gap-2 bg-[#13161f] border-white/5" default={true}>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</span>
                        <div className="flex items-end justify-between">
                            <span className="text-2xl font-bold text-white tracking-tight">{stat.value}</span>
                            <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {stat.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {stat.diff}
                            </div>
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
                    <LineAreaChart
                        series={[
                            { name: "Visibility Index", data: [42, 45, 43, 48, 52, 55, 54, 58, 62, 65, 63, 64] }
                        ]}
                        categories={["Jan 01", "04", "07", "10", "13", "16", "19", "22", "25", "28", "31", "Feb 03"]}
                    />
                </div>
            </Card>

            {/* ── Keyword Table ── */}
            <Card extra="bg-[#13161f] border-white/5 overflow-hidden" default={true}>
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-md font-bold text-white">Tracked Keywords</h3>
                    <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs h-8">
                        <Plus size={14} className="mr-2" /> Add Keywords
                    </Button>
                </div>

                <div className="overflow-x-auto">
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
                            {MOCK_KEYWORDS.map((kw, i) => (
                                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-200">{kw.keyword}</span>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Globe size={10} className="text-gray-600" />
                                                <span className="text-[10px] text-gray-600">Google / US / Desktop</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-sm font-bold ${kw.pos <= 3 ? 'text-emerald-400' : 'text-gray-300'}`}>
                                            {kw.pos}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className={`inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded ${kw.diff > 0 ? 'text-emerald-400 bg-emerald-400/10' :
                                                kw.diff < 0 ? 'text-red-400 bg-red-400/10' :
                                                    'text-gray-500 bg-white/5'
                                            }`}>
                                            {kw.diff > 0 ? '+' : ''}{kw.diff === 0 ? '-' : kw.diff}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400 tabular-nums">{kw.vol}</td>
                                    <td className="px-6 py-4 text-sm text-gray-400 tabular-nums">${kw.cpc}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-gray-500 hover:text-indigo-400 transition-colors">
                                            <span className="text-xs truncate max-w-[150px]">{kw.url}</span>
                                            <ArrowUpRight size={12} className="shrink-0" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-1.5 text-gray-600 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                                            <MoreHorizontal size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-center">
                    <button className="text-[11px] font-bold text-gray-500 hover:text-indigo-400 uppercase tracking-widest transition-colors">
                        View All 124 Keywords
                    </button>
                </div>
            </Card>

            {/* ── Help / Info ── */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 text-gray-400 text-xs">
                <Info size={14} className="text-indigo-400 shrink-0" />
                <p>Position tracking updates every 24 hours. Your ranking data is compared against Google's US Desktop index by default.</p>
            </div>
        </div>
    );
}
