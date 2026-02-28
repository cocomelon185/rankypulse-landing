"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle,
    AlertCircle,
    Type,
    AlignLeft,
    Volume2,
    FileSearch,
    Settings,
    Download,
    Copy,
    Layout,
    MessageSquare,
    Sparkles,
    Search,
    List
} from "lucide-react";
import { Card } from "@/components/horizon";
import { Button } from "@/components/ui/button";

const MOCK_KEYWORDS = [
    { term: "seo strategy", count: 2, required: 3 },
    { term: "keyword research", count: 4, required: 2 },
    { term: "search engine optimization", count: 0, required: 1 },
    { term: "organic traffic", count: 1, required: 2 },
    { term: "backlink profile", count: 0, required: 1 },
];

export default function WritingAssistantClient() {
    const [content, setContent] = useState(
        "Developing a solid seo strategy is essential for modern businesses. If you want to rank higher, you need to understand how keyword research works. Many people ignore search intent, focusing entirely on backlinks. But keyword research is truly the foundation. \n\nWe will discuss how to improve your organic traffic through consistent effort..."
    );

    const [activeTab, setActiveTab] = useState("seo");

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[600px]">

            {/* ── Editor (Left) ── */}
            <Card extra="flex-1 flex flex-col bg-[#13161f] border-white/5 overflow-hidden" default={true}>
                {/* Editor Toolbar */}
                <div className="p-3 border-b border-white/5 flex flex-wrap items-center gap-2 bg-white/[0.01]">
                    <div className="flex items-center gap-1 pr-3 border-r border-white/10">
                        <select className="bg-transparent text-sm text-gray-300 outline-none cursor-pointer">
                            <option>Paragraph</option>
                            <option>Heading 1</option>
                            <option>Heading 2</option>
                            <option>Heading 3</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1 px-3 border-r border-white/10 text-gray-400">
                        <button className="p-1.5 hover:bg-white/10 rounded font-serif font-bold transition-colors">B</button>
                        <button className="p-1.5 hover:bg-white/10 rounded font-serif italic transition-colors">I</button>
                        <button className="p-1.5 hover:bg-white/10 rounded font-serif underline transition-colors">U</button>
                    </div>

                    <div className="flex items-center gap-1 px-3 border-r border-white/10 text-gray-400">
                        <button className="p-1.5 hover:bg-white/10 rounded transition-colors"><AlignLeft size={16} /></button>
                        <button className="p-1.5 hover:bg-white/10 rounded transition-colors"><List size={16} /></button>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20">
                            <Sparkles size={14} className="mr-1.5" /> AI Rewrite
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 bg-transparent border-white/10 text-gray-400 hover:text-white">
                            <Copy size={14} />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 bg-transparent border-white/10 text-gray-400 hover:text-white">
                            <Download size={14} />
                        </Button>
                    </div>
                </div>

                {/* Text Area */}
                <div className="flex-1 p-6 lg:p-10 bg-[#0d0f14] overflow-y-auto">
                    <input
                        type="text"
                        placeholder="Document Title (H1)"
                        className="w-full bg-transparent text-3xl font-bold text-white mb-6 outline-none placeholder:text-gray-700 font-display tracking-tight"
                        defaultValue="The Ultimate Guide to SEO Strategy"
                    />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-full bg-transparent text-lg text-gray-300 leading-relaxed outline-none resize-none placeholder:text-gray-700"
                        placeholder="Start writing or paste your content here..."
                    />
                </div>

                {/* Editor Footer / Word Count */}
                <div className="p-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500 bg-white/[0.01]">
                    <div className="flex gap-4">
                        <span><strong className="text-gray-300">42</strong> Words</span>
                        <span><strong className="text-gray-300">328</strong> Characters</span>
                        <span><strong className="text-gray-300">3</strong> Paragraphs</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Saved.
                    </div>
                </div>
            </Card>

            {/* ── Sidebar (Right) ── */}
            <div className="w-full lg:w-[360px] flex flex-col gap-4">

                {/* Overall Score Card */}
                <Card extra="p-6 bg-[#13161f] border-white/5 relative overflow-hidden" default={true}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none" />

                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white">Quality Score</h3>
                        <div className="relative w-14 h-14 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-white/10"
                                    strokeWidth="3"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="text-amber-400"
                                    strokeWidth="3"
                                    strokeDasharray={`${78}, 100`}
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <span className="absolute text-lg font-bold text-white">78</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex flex-wrap items-center justify-between gap-1">
                                <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><Search size={12} /> SEO</span>
                                <span className="text-xs font-bold text-amber-400">6.5/10</span>
                            </div>
                            <div className="w-full h-1 bg-white/10 rounded-full mt-1"><div className="w-[65%] h-full bg-amber-400 rounded-full"></div></div>
                        </div>
                        <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex flex-wrap items-center justify-between gap-1">
                                <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><AlignLeft size={12} /> Readability</span>
                                <span className="text-xs font-bold text-emerald-400">9.2/10</span>
                            </div>
                            <div className="w-full h-1 bg-white/10 rounded-full mt-1"><div className="w-[92%] h-full bg-emerald-400 rounded-full"></div></div>
                        </div>
                        <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex flex-wrap items-center justify-between gap-1">
                                <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><Volume2 size={12} /> Tone</span>
                                <span className="text-[10px] font-bold text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-500/10">Formal</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex flex-wrap items-center justify-between gap-1">
                                <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><FileSearch size={12} /> Originality</span>
                                <span className="text-[10px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10">100% Unique</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Tab Links */}
                <div className="flex bg-[#13161f] border border-white/5 rounded-lg p-1">
                    <button onClick={() => setActiveTab("seo")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === "seo" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}>SEO Stats</button>
                    <button onClick={() => setActiveTab("readability")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === "readability" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}>Readability</button>
                    <button onClick={() => setActiveTab("competitors")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === "competitors" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}>Competitors</button>
                </div>

                {/* Details Card */}
                <Card extra="flex-1 bg-[#13161f] border-white/5 p-0 overflow-hidden" default={true}>
                    <div className="p-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Layout size={16} className="text-indigo-400" />
                            {activeTab === "seo" ? "Semantic Keywords" : activeTab === "readability" ? "Content Structure" : "Top 10 Analysis"}
                        </h4>
                        {activeTab === "seo" && <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Recommended</span>}
                    </div>

                    <div className="p-4 flex flex-col gap-2 overflow-y-auto max-h-[350px]">
                        {activeTab === "seo" && (
                            <>
                                {MOCK_KEYWORDS.map((kw, i) => {
                                    const isMet = kw.count >= kw.required;
                                    const isOver = kw.count > kw.required + 3;
                                    return (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#0d0f14] border border-white/5 group hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1 rounded-full ${isMet && !isOver ? 'bg-emerald-500/20 text-emerald-400' : isOver ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-500'}`}>
                                                    {isMet && !isOver ? <CheckCircle size={14} /> : isOver ? <AlertCircle size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-current"></div>}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-sm ${isMet && !isOver ? 'text-gray-300' : 'text-gray-400'}`}>{kw.term}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                                                <span className={isMet && !isOver ? 'text-emerald-400' : isOver ? 'text-amber-400' : 'text-gray-500'}>{kw.count}</span>
                                                <span className="text-gray-600">/</span>
                                                <span className="text-gray-500">{kw.required}</span>
                                            </div>
                                        </div>
                                    )
                                })}

                                <div className="mt-4 p-3 rounded-lg border border-amber-500/20 bg-amber-500/10">
                                    <p className="text-xs font-medium text-amber-400 flex items-start gap-2">
                                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                        <span>You are missing the primary keyword <strong>"search engine optimization"</strong>. Try to include it at least once in the first paragraph.</span>
                                    </p>
                                </div>
                            </>
                        )}

                        {activeTab === "readability" && (
                            <div className="flex flex-col gap-4 text-sm text-gray-400">
                                <p>Your content is currently very easy to read. It scores a 9.2/10 on the Flesch-Kincaid scale.</p>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span>Paragraphs too long</span>
                                        <span className="text-emerald-400">0</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Hard to read sentences</span>
                                        <span className="text-amber-400">1</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Passive voice</span>
                                        <span className="text-emerald-400">0%</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

        </div>
    );
}
