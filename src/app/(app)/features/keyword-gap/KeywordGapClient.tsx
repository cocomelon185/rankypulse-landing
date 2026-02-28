"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    GitCompare,
    Search,
    Filter,
    Download,
    AlertCircle,
    Plus,
    Target,
    Globe,
    X
} from "lucide-react";
import { Card } from "@/components/horizon";
import { Button } from "@/components/ui/button";

const MOCK_GAP_DATA = [
    { keyword: "best seo audit tool", vol: "8.1k", kd: 64, cpc: "4.50", myPos: "-", comp1: 2, comp2: 5, status: "missing" },
    { keyword: "free rank tracker", vol: "22k", kd: 81, cpc: "2.10", myPos: 15, comp1: 4, comp2: "-", status: "weak" },
    { keyword: "core web vitals checklist", vol: "3.2k", kd: 45, cpc: "0.00", myPos: "-", comp1: "-", comp2: 1, status: "untapped" },
    { keyword: "how to rank higher on google", vol: "14k", kd: 72, cpc: "5.80", myPos: 35, comp1: 12, comp2: 9, status: "weak" },
    { keyword: "seo tools 2026", vol: "5.5k", kd: 55, cpc: "1.20", myPos: "-", comp1: 8, comp2: 3, status: "missing" },
    { keyword: "backlink gap analysis", vol: "1.8k", kd: 60, cpc: "3.40", myPos: 2, comp1: 15, comp2: 24, status: "strong" },
];

export default function KeywordGapClient() {
    const [activeTab, setActiveTab] = useState("missing");

    const tabs = [
        { id: "all", label: "All Keywords", count: 1245 },
        { id: "missing", label: "Missing", count: 850 },
        { id: "weak", label: "Weak", count: 215 },
        { id: "strong", label: "Strong", count: 120 },
        { id: "untapped", label: "Untapped", count: 60 }
    ];

    const filteredData = activeTab === "all" ? MOCK_GAP_DATA : MOCK_GAP_DATA.filter(k => k.status === activeTab);

    return (
        <div className="flex flex-col gap-6">

            {/* ── Domain Inputs ── */}
            <Card extra="p-6 bg-[#13161f] border-white/5" default={true}>
                <div className="flex flex-col md:flex-row items-stretch gap-4">
                    <div className="flex-1 relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
                            You
                        </div>
                        <input
                            type="text"
                            defaultValue="rankypulse.com"
                            className="w-full bg-[#0d0f14] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex items-center justify-center -mx-2 z-10 hidden md:flex">
                        <div className="h-8 w-8 rounded-full bg-[#1a1e2e] border border-white/10 flex items-center justify-center text-gray-500">
                            <span className="text-xs font-mono font-bold">VS</span>
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs uppercase">
                            C1
                        </div>
                        <input
                            type="text"
                            defaultValue="competitor1.com"
                            className="w-full bg-[#0d0f14] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-rose-500"
                        />
                    </div>
                    <div className="flex items-center justify-center -mx-2 z-10 hidden md:flex">
                        <div className="h-8 w-8 rounded-full bg-[#1a1e2e] border border-white/10 flex items-center justify-center text-gray-500">
                            <span className="text-xs font-mono font-bold">VS</span>
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs uppercase">
                            C2
                        </div>
                        <input
                            type="text"
                            defaultValue="competitor2.com"
                            className="w-full bg-[#0d0f14] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                    </div>
                    <Button className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl py-3 px-6 h-auto">
                        Compare
                    </Button>
                </div>
            </Card>

            {/* ── Summary & Interaction ── */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Tabs */}
                <div className="flex bg-[#13161f] border border-white/5 rounded-lg p-1 overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? "bg-indigo-500/10 text-indigo-400"
                                    : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
                                }`}
                        >
                            {tab.label}
                            <span className={`text-[10px] py-0.5 px-1.5 rounded-full ${activeTab === tab.id ? "bg-indigo-500/20 text-indigo-300" : "bg-white/5 text-gray-500"
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="bg-[#13161f] border-white/5 text-gray-300 text-xs h-9">
                        <Filter size={14} className="mr-2" /> Advanced Filters
                    </Button>
                    <Button variant="outline" size="sm" className="bg-[#13161f] border-white/5 text-gray-300 text-xs h-9">
                        <Download size={14} className="mr-2" /> Export
                    </Button>
                </div>
            </div>

            {/* ── Data Table ── */}
            <Card extra="bg-[#13161f] border-white/5 overflow-hidden" default={true}>
                <div className="p-4 border-b border-white/5 flex flex-wrap items-center gap-4 bg-white/[0.01]">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Filter by keyword..."
                            className="w-full bg-[#0d0f14] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 ml-auto">
                        <span>Volume:</span>
                        <select className="bg-[#0d0f14] border border-white/10 rounded px-2 py-1 outline-none text-gray-300">
                            <option>Any</option>
                            <option>1k - 10k</option>
                            <option>10k+</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Keyword</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Volume</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">KD %</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">CPC</th>
                                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-indigo-400 text-center bg-indigo-500/[0.03]">You</th>
                                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-rose-400 text-center bg-rose-500/[0.03]">Comp 1</th>
                                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-amber-400 text-center bg-amber-500/[0.03]">Comp 2</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500 text-sm">
                                        No keywords match this filter criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((kw, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-200">{kw.keyword}</span>
                                                {kw.status === "missing" && <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-400/10 text-red-400 font-bold">Missing</span>}
                                                {kw.status === "weak" && <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 font-bold">Weak</span>}
                                                {kw.status === "strong" && <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-400 font-bold">Strong</span>}
                                                {kw.status === "untapped" && <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-400/10 text-blue-400 font-bold">Untapped</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400 tabular-nums">{kw.vol}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-400 tabular-nums w-6">{kw.kd}</span>
                                                <div className="w-10 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${kw.kd > 70 ? 'bg-red-500' : kw.kd > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                        style={{ width: `${kw.kd}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400 tabular-nums">${kw.cpc}</td>
                                        <td className="px-4 py-4 text-center bg-indigo-500/[0.01]">
                                            <span className={`text-sm font-bold ${kw.myPos === '-' ? 'text-gray-600' : 'text-indigo-400'}`}>{kw.myPos}</span>
                                        </td>
                                        <td className="px-4 py-4 text-center bg-rose-500/[0.01]">
                                            <span className={`text-sm font-bold ${kw.comp1 === '-' ? 'text-gray-600' : 'text-rose-400'}`}>{kw.comp1}</span>
                                        </td>
                                        <td className="px-4 py-4 text-center bg-amber-500/[0.01]">
                                            <span className={`text-sm font-bold ${kw.comp2 === '-' ? 'text-gray-600' : 'text-amber-400'}`}>{kw.comp2}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end">
                                            <Button size="sm" variant="ghost" className="h-7 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 px-2">
                                                <Plus size={14} className="mr-1" /> Add to Tracker
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                    <span>Showing 1 to 6 of {tabs.find(t => t.id === activeTab)?.count || 0} results</span>
                    <div className="flex gap-1 items-center">
                        <Button size="sm" variant="outline" className="h-7 px-3 bg-transparent border-white/10 text-gray-400">Prev</Button>
                        <Button size="sm" variant="outline" className="h-7 px-3 bg-white/5 border-white/10 text-white">1</Button>
                        <Button size="sm" variant="outline" className="h-7 px-3 bg-transparent border-white/10 text-gray-400">2</Button>
                        <Button size="sm" variant="outline" className="h-7 px-3 bg-transparent border-white/10 text-gray-400">Next</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
