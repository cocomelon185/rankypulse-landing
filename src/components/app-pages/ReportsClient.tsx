"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Calendar, Share2, Lock, Plus } from "lucide-react";
import { MOCK_PROJECTS } from "@/lib/mock-data";

const REPORT_TEMPLATES = [
    { id: "full", name: "Full SEO Report", desc: "Complete audit with all sections", pages: 12, icon: "📊" },
    { id: "executive", name: "Executive Summary", desc: "High-level KPIs for stakeholders", pages: 3, icon: "📈" },
    { id: "technical", name: "Technical SEO", desc: "Issues, crawl data, Core Web Vitals", pages: 6, icon: "⚙️" },
    { id: "links", name: "Link Building Report", desc: "Backlinks, toxic links, opportunities", pages: 5, icon: "🔗" },
];

export function ReportsClient() {
    const [selectedDomain, setSelectedDomain] = useState(MOCK_PROJECTS[0].domain);
    const [isPro] = useState(false); // simulate free tier

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Reports</h1>
                    <p className="text-sm mt-1" style={{ color: "#6B7A99" }}>Build, schedule and share SEO reports</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition hover:bg-white/[0.06]"
                        style={{ color: "#8B9BB4", border: "1px solid #1E2940" }}>
                        <Share2 size={14} /> Share Link
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition"
                        style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}>
                        <Plus size={14} /> New Report
                    </button>
                </div>
            </div>

            {/* Domain selector */}
            <div className="rounded-xl border p-5" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#4A5568" }}>Select Website</p>
                <div className="flex flex-wrap gap-2">
                    {MOCK_PROJECTS.map(p => (
                        <button key={p.domain}
                            onClick={() => setSelectedDomain(p.domain)}
                            className="px-3 py-1.5 rounded-lg text-sm font-semibold transition"
                            style={{
                                background: selectedDomain === p.domain ? "rgba(255,100,45,0.15)" : "rgba(255,255,255,0.04)",
                                color: selectedDomain === p.domain ? "#FF642D" : "#8B9BB4",
                                border: `1px solid ${selectedDomain === p.domain ? "rgba(255,100,45,0.3)" : "#1E2940"}`,
                            }}>
                            {p.domain}
                        </button>
                    ))}
                </div>
            </div>

            {/* Report Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REPORT_TEMPLATES.map((t, i) => (
                    <motion.div key={t.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="rounded-xl border p-5"
                        style={{ background: "#151B27", borderColor: "#1E2940" }}>
                        <div className="flex items-start justify-between mb-3">
                            <span className="text-2xl">{t.icon}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: "#1E2940", color: "#8B9BB4" }}>{t.pages} pages</span>
                        </div>
                        <p className="font-bold text-white mb-1">{t.name}</p>
                        <p className="text-[12px] mb-4" style={{ color: "#6B7A99" }}>{t.desc}</p>
                        <div className="flex gap-2">
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold text-white hover:opacity-90 transition"
                                style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}>
                                <FileText size={12} /> Preview
                            </button>
                            <div className="relative">
                                <button
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition hover:bg-white/[0.06]"
                                    style={{ color: isPro ? "#8B9BB4" : "#4A5568", border: "1px solid #1E2940", opacity: isPro ? 1 : 0.7 }}
                                    title={isPro ? undefined : "PDF Export requires Pro plan"}
                                >
                                    <Download size={12} />
                                    {!isPro && <Lock size={10} />}
                                    PDF
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Scheduled Reports — Pro Gate */}
            <div className="rounded-xl border p-5 relative overflow-hidden" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <Calendar size={15} style={{ color: "#FF642D" }} /> Scheduled Reports
                    </h2>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(255,152,0,0.15)", color: "#FF9800" }}>
                        <Lock size={10} /> Pro Feature
                    </span>
                </div>
                <div className="filter blur-[2px] pointer-events-none select-none">
                    {["Weekly sitemap audit digest", "Monthly ranking report"].map(r => (
                        <div key={r} className="flex items-center gap-3 py-3 border-b" style={{ borderColor: "#1E2940" }}>
                            <div className="w-8 h-8 rounded-lg" style={{ background: "#1E2940" }} />
                            <div><p className="text-sm text-white">{r}</p><p className="text-[11px]" style={{ color: "#4A5568" }}>Every Monday · PDF + Email</p></div>
                        </div>
                    ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center rounded-xl" style={{ background: "rgba(13,20,36,0.8)", backdropFilter: "blur(2px)" }}>
                    <div className="text-center p-6">
                        <Lock size={24} style={{ color: "#FF9800" }} className="mx-auto mb-3" />
                        <p className="font-bold text-white mb-1">Upgrade to Pro</p>
                        <p className="text-[12px] mb-4" style={{ color: "#8B9BB4" }}>Schedule weekly/monthly reports with PDF export and email delivery</p>
                        <button className="px-5 py-2.5 rounded-lg text-sm font-bold text-white hover:opacity-90 transition"
                            style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}>
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
