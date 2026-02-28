"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Share2,
    Search,
    Filter,
    Download,
    AlertCircle,
    ExternalLink,
    Shield,
    Send,
    Plus,
    ArrowRight,
    TrendingUp,
    Award
} from "lucide-react";
import { Card } from "@/components/horizon";
import { Button } from "@/components/ui/button";
import { LineAreaChart } from "@/components/charts/LineAreaChart";

const MOCK_BACKLINK_DATA = [
    { domain: "techcrunch.com", as: 93, myLinks: 0, comp1Links: 14, comp2Links: 8, status: "best", match: "2/2", category: "Technology" },
    { domain: "forbes.com", as: 94, myLinks: 0, comp1Links: 3, comp2Links: 5, status: "best", match: "2/2", category: "Business" },
    { domain: "searchenginejournal.com", as: 89, myLinks: 0, comp1Links: 42, comp2Links: 0, status: "missing", match: "1/2", category: "SEO" },
    { domain: "hubspot.com", as: 92, myLinks: 2, comp1Links: 4, comp2Links: 8, status: "weak", match: "2/2", category: "Marketing" },
    { domain: "moz.com", as: 91, myLinks: 0, comp1Links: 0, comp2Links: 12, status: "missing", match: "1/2", category: "SEO" },
    { domain: "indiehackers.com", as: 78, myLinks: 5, comp1Links: 1, comp2Links: 0, status: "strong", match: "0/2", category: "Startups" },
    { domain: "producthunt.com", as: 85, myLinks: 0, comp1Links: 2, comp2Links: 2, status: "best", match: "2/2", category: "Startups" },
];

export default function BacklinkGapClient() {
    const [activeFilter, setActiveFilter] = useState("best");
    const [selectedProspects, setSelectedProspects] = useState<string[]>([]);

    const toggleProspect = (domain: string) => {
        setSelectedProspects(prev =>
            prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]
        );
    };

    const filteredData = activeFilter === "all" ? MOCK_BACKLINK_DATA : MOCK_BACKLINK_DATA.filter(d => d.status === activeFilter);

    // Stats calculation
    const totalBestOpportunities = MOCK_BACKLINK_DATA.filter(d => d.status === "best").length;
    const totalMissingLinks = MOCK_BACKLINK_DATA.filter(d => d.status === "missing" || d.status === "best").length;

    return (
        <div className="flex flex-col gap-6">

            {/* ── Context & Input Hero ── */}
            <Card extra="p-6 md:p-8 bg-[#13161f] border-white/5 relative overflow-hidden" default={true}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between pointer-events-none">
                    <div className="flex-1 max-w-2xl pointer-events-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-widest uppercase">
                            <Award size={14} /> The "Aha!" Moment
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                            Find sites dying to link to you.
                        </h2>
                        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                            If a high-authority blog links to <strong>both</strong> of your competitors but overlooks you, they are a pre-qualified lead.
                            They already write about your industry and link to your peers. Pitch them, and secure the link.
                        </p>

                        <div className="flex flex-col md:flex-row items-stretch gap-3">
                            <div className="flex-1 relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-indigo-500 text-white flex items-center justify-center font-bold text-[10px] uppercase shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                                    You
                                </div>
                                <input
                                    type="text"
                                    defaultValue="rankypulse.com"
                                    className="w-full bg-[#0d0f14] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner shadow-black/20"
                                />
                            </div>
                            <div className="flex-1 relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-rose-500 text-white flex items-center justify-center font-bold text-[10px] uppercase shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                                    C1
                                </div>
                                <input
                                    type="text"
                                    defaultValue="competitor1.com"
                                    className="w-full bg-[#0d0f14] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:border-rose-500 transition-colors shadow-inner shadow-black/20"
                                />
                            </div>
                            <div className="flex-1 relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-amber-500 text-white flex items-center justify-center font-bold text-[10px] uppercase shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                                    C2
                                </div>
                                <input
                                    type="text"
                                    defaultValue="competitor2.com"
                                    className="w-full bg-[#0d0f14] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:border-amber-500 transition-colors shadow-inner shadow-black/20"
                                />
                            </div>
                            <Button className="bg-white text-[#0d0f14] hover:bg-gray-200 rounded-xl py-3 px-8 h-auto font-bold tracking-wide">
                                Find Gaps
                            </Button>
                        </div>
                    </div>

                    <div className="hidden lg:flex w-[280px] flex-col gap-3 pointer-events-auto">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Untapped Authority</p>
                            <div className="flex items-end gap-3">
                                <span className="text-4xl font-bold text-white tracking-tighter">{totalMissingLinks}</span>
                                <span className="text-sm text-gray-400 mb-1 leading-snug">missed<br />domains</span>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">"Best" Opportunities</p>
                            <div className="flex items-end gap-3">
                                <span className="text-4xl font-bold text-indigo-300 tracking-tighter">{totalBestOpportunities}</span>
                                <span className="text-sm text-indigo-200/60 mb-1 leading-snug">link to both<br />competitors</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* ── Filters & Action Bar ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                <div className="flex bg-[#13161f] border border-white/5 rounded-lg p-1 w-full sm:w-auto overflow-x-auto scrollbar-hide">
                    <button
                        onClick={() => setActiveFilter("best")}
                        className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeFilter === "best" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-indigo-400 hover:bg-white/[0.03]"
                            }`}
                    >
                        🔥 Best Opportunities
                    </button>
                    <button
                        onClick={() => setActiveFilter("missing")}
                        className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeFilter === "missing" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
                            }`}
                    >
                        Missing
                    </button>
                    <button
                        onClick={() => setActiveFilter("weak")}
                        className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeFilter === "weak" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
                            }`}
                    >
                        Weak
                    </button>
                    <button
                        onClick={() => setActiveFilter("all")}
                        className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeFilter === "all" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
                            }`}
                    >
                        All
                    </button>
                </div>

                <AnimatePresence>
                    {selectedProspects.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg px-4 py-2"
                        >
                            <span className="text-xs font-bold text-indigo-300">{selectedProspects.length} selected</span>
                            <Button size="sm" className="h-7 text-xs bg-indigo-500 text-white hover:bg-indigo-600 px-3">
                                <Send size={12} className="mr-2" /> Start Outreach
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Data Table ── */}
            <Card extra="bg-[#13161f] border-white/5 overflow-hidden shadow-xl" default={true}>
                {/* Table Header Controls */}
                <div className="p-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 bg-white/[0.01]">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Filter domains (e.g., techcrunch)..."
                            className="w-full bg-[#0d0f14] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mr-2 border-r border-white/10 pr-4">
                            <span>Authority:</span>
                            <select className="bg-[#0d0f14] border border-white/10 rounded px-2 py-1 outline-none text-gray-300">
                                <option>Any AS</option>
                                <option>AS 50+</option>
                                <option>AS 70+</option>
                            </select>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 bg-transparent border-white/10 text-gray-300 text-xs">
                            <Download size={14} className="mr-2" /> Export CSV
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-[#0d0f14]">
                                <th className="px-6 py-4 w-10">
                                    <input type="checkbox" className="rounded border-white/20 bg-transparent text-indigo-500" />
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Referring Domain</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">Authority Score</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">Match</th>
                                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-indigo-400 text-center bg-indigo-500/[0.04]">You</th>
                                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-rose-400 text-center bg-rose-500/[0.04]">Comp 1</th>
                                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-amber-400 text-center bg-amber-500/[0.04]">Comp 2</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-gray-500 text-sm">
                                        <div className="flex flex-col items-center gap-2">
                                            <Shield size={32} className="text-gray-700 mb-2" />
                                            <p className="text-gray-400 font-medium">No domains match this criteria.</p>
                                            <p className="text-xs text-gray-600">Try changing your filter settings above.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((d, i) => {
                                    const isSelected = selectedProspects.includes(d.domain);
                                    return (
                                        <tr
                                            key={i}
                                            onClick={() => toggleProspect(d.domain)}
                                            className={`border-b border-white/5 transition-colors cursor-pointer group ${isSelected ? "bg-indigo-500/[0.03]" : "hover:bg-white/[0.02]"
                                                }`}
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => { }} // Handled by tr click
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="rounded border-white/20 bg-transparent text-indigo-500 focus:ring-0 focus:ring-offset-0"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm font-semibold transition-colors ${isSelected ? 'text-indigo-300' : 'text-gray-200 group-hover:text-white'}`}>
                                                            {d.domain}
                                                        </span>
                                                        <a href={`https://${d.domain}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                                            <ExternalLink size={12} />
                                                        </a>
                                                    </div>
                                                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-600 mt-1">{d.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded bg-white/5 border border-white/10">
                                                    <span className={`text-sm font-bold font-mono ${d.as >= 90 ? 'text-emerald-400' : d.as >= 70 ? 'text-amber-400' : 'text-gray-400'}`}>
                                                        {d.as}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-xs font-bold font-mono px-2 py-1 rounded ${d.match === "2/2" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-gray-500"
                                                    }`}>
                                                    {d.match}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center bg-indigo-500/[0.02]">
                                                <span className={`text-sm font-bold ${d.myLinks === 0 ? 'text-gray-600' : 'text-indigo-400'}`}>{d.myLinks || '-'}</span>
                                            </td>
                                            <td className="px-4 py-4 text-center bg-rose-500/[0.02]">
                                                <span className={`text-sm font-bold ${d.comp1Links === 0 ? 'text-gray-600' : 'text-rose-400'}`}>{d.comp1Links || '-'}</span>
                                            </td>
                                            <td className="px-4 py-4 text-center bg-amber-500/[0.02]">
                                                <span className={`text-sm font-bold ${d.comp2Links === 0 ? 'text-gray-600' : 'text-amber-400'}`}>{d.comp2Links || '-'}</span>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

        </div>
    );
}
