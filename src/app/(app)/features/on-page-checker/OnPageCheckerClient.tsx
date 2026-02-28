"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Lightbulb,
    BarChart2,
    FileText,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Zap,
    AlertTriangle,
    PenTool,
    Network,
    Eye,
    Settings
} from "lucide-react";
import { Card } from "@/components/horizon";
import { Button } from "@/components/ui/button";

const MOCK_PAGES = [
    {
        id: 1,
        url: "/blog/seo-audit-checklist",
        keyword: "seo audit checklist",
        rank: 12, // Striking distance (page 2)
        volume: "14.5k",
        difficulty: 45,
        ideasTotal: 6,
        ideas: [
            { category: "Content", text: "Your text is 1,200 words. Top 10 rivals average 2,400 words. Expand on 'Technical SEO'.", icon: PenTool, color: "text-blue-400", bg: "bg-blue-400/10" },
            { category: "Semantics", text: "Add missing LSI keywords: 'google search console', 'core web vitals', 'xml sitemap'.", icon: FileText, color: "text-purple-400", bg: "bg-purple-400/10" },
            { category: "Strategy", text: "Move 'seo audit checklist' closer to the beginning of your <title> tag.", icon: Lightbulb, color: "text-emerald-400", bg: "bg-emerald-400/10" },
            { category: "Backlinks", text: "Your page has 2 backlinks. Rivals have an average of 18. Acquire more referring domains.", icon: Network, color: "text-amber-400", bg: "bg-amber-400/10" },
        ]
    },
    {
        id: 2,
        url: "/features/rank-tracker",
        keyword: "free rank tracker",
        rank: 24, // Page 3
        volume: "22k",
        difficulty: 68,
        ideasTotal: 4,
        ideas: [
            { category: "Content", text: "Exact keyword 'free rank tracker' is missing from H1 tag.", icon: PenTool, color: "text-blue-400", bg: "bg-blue-400/10" },
            { category: "UX", text: "Readability score is 45. Try to use shorter sentences and simpler words.", icon: Eye, color: "text-rose-400", bg: "bg-rose-400/10" },
            { category: "Technical", text: "Page load time is 3.2s. Compress images to improve Core Web Vitals.", icon: Settings, color: "text-gray-400", bg: "bg-gray-400/10" },
        ]
    },
    {
        id: 3,
        url: "/",
        keyword: "seo software",
        rank: 45,
        volume: "85k",
        difficulty: 82,
        ideasTotal: 8,
        ideas: [
            { category: "Content", text: "Increase exact keyword density. Currently at 0.5%, target is 1.2% - 2.5%.", icon: PenTool, color: "text-blue-400", bg: "bg-blue-400/10" },
            { category: "Semantics", text: "Add missing entities: 'rankings', 'analytics', 'competitor analysis'.", icon: FileText, color: "text-purple-400", bg: "bg-purple-400/10" },
        ]
    },
];

export default function OnPageCheckerClient() {
    const [expandedId, setExpandedId] = useState<number | null>(1); // Expand first by default to show AHA

    const toggleExpand = (id: number) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    return (
        <div className="flex flex-col gap-6">

            {/* ── Context & Input Hero ── */}
            <Card extra="p-6 md:p-8 bg-[#13161f] border-white/5 relative overflow-hidden" default={true}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col items-start gap-4 pointer-events-none">
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase">
                        <Zap size={14} /> The "Quick Win" Engine
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                        Jump from Page 2 to Page 1.
                    </h2>
                    <p className="text-sm text-gray-400 mb-2 leading-relaxed max-w-3xl">
                        We've scanned your pages that are currently stuck on Page 2 or 3 of Google (Positions 11–30).
                        By applying these specific, data-backed tweaks to your content, you can push them into the Top 10 and unlock immediate traffic.
                    </p>
                </div>
            </Card>

            {/* ── Summary Stats ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: "Total Optimization Ideas", value: "34", icon: Lightbulb, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: "Pages in 'Striking Distance'", value: "14", icon: BarChart2, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                    { label: "Est. Traffic Potential", value: "+12.5k", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10" },
                ].map((stat, i) => (
                    <Card key={i} extra="p-5 flex items-center gap-4 bg-[#13161f] border-white/5" default={true}>
                        <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold text-white tracking-tight">{stat.value}</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{stat.label}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* ── Idea List ── */}
            <Card extra="bg-[#13161f] border-white/5 overflow-hidden shadow-xl" default={true}>
                <div className="p-4 border-b border-white/5 bg-white/[0.01]">
                    <h3 className="text-lg font-bold text-white">Top Pages to Optimize</h3>
                </div>

                <div className="flex flex-col">
                    {MOCK_PAGES.map((page, i) => {
                        const isExpanded = expandedId === page.id;
                        return (
                            <div key={page.id} className="border-b border-white/5 last:border-0">
                                {/* Row Header */}
                                <div
                                    onClick={() => toggleExpand(page.id)}
                                    className={`flex flex-wrap md:flex-nowrap items-center justify-between p-4 cursor-pointer transition-colors ${isExpanded ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'}`}
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                                        <button className="p-1 text-gray-500 hover:text-white transition-colors">
                                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                        </button>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-200">{page.url}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-400">Target Keyword:</span>
                                                <span className="text-xs font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10">{page.keyword}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 mt-4 md:mt-0 px-10 md:px-0">
                                        <div className="flex flex-col items-end hidden sm:flex">
                                            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Search Volume</span>
                                            <span className="text-sm text-gray-300 font-mono">{page.volume}</span>
                                        </div>
                                        <div className="flex flex-col items-center min-w-[80px]">
                                            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Rank</span>
                                            <span className={`text-lg font-bold ${page.rank <= 10 ? 'text-emerald-400' : page.rank <= 20 ? 'text-amber-400' : 'text-gray-400'}`}>
                                                {page.rank}
                                            </span>
                                        </div>
                                        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold tracking-wide">
                                            {page.ideasTotal} Ideas
                                        </Button>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden bg-[#0d0f14]"
                                        >
                                            <div className="p-6 md:pl-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {page.ideas.map((idea, idx) => (
                                                    <div key={idx} className="flex flex-col gap-3 p-4 rounded-xl border border-white/5 bg-[#13161f] hover:border-white/10 transition-colors">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`p-1.5 rounded-lg ${idea.bg} ${idea.color}`}>
                                                                <idea.icon size={16} />
                                                            </div>
                                                            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{idea.category}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-300 leading-relaxed">
                                                            {idea.text}
                                                        </p>
                                                        <div className="mt-auto pt-2 flex items-center justify-end">
                                                            <button className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-emerald-400 transition-colors">
                                                                <CheckCircle size={14} /> Mark Done
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </Card>

        </div>
    );
}
