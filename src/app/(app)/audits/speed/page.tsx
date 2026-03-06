'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Activity,
    Smartphone,
    AlertTriangle,
    CheckCircle,
    Zap,
    ChevronDown,
    Download,
    Info,
    Loader2,
    RefreshCcw,
} from 'lucide-react';

interface SpeedData {
    hasPsiData: boolean;
    reason?: string;
    domain?: string;
    mobile?: {
        score: number;
        fcp: string | null;
        lcp: string | null;
        tti: string | null;
        tbt: string | null;
        cls: string | null;
        si: string | null;
    } | null;
    diagnostics?: { id: string; title: string; displayValue: string | null; savingsMs: number | null }[];
    passedAudits?: number;
}

const getScoreColor = (score: number) => {
    if (score >= 90) return { text: 'text-emerald-400', stroke: '#34d399', bg: 'bg-emerald-500/10' };
    if (score >= 50) return { text: 'text-amber-400', stroke: '#fbbf24', bg: 'bg-amber-500/10' };
    return { text: 'text-red-400', stroke: '#f87171', bg: 'bg-red-500/10' };
};

const classifyMetric = (key: string, value: string | null): 'good' | 'average' | 'poor' => {
    if (!value) return 'average';
    const n = parseFloat(value);
    if (isNaN(n)) return 'average';
    switch (key) {
        case 'fcp': return n < 1.8 ? 'good' : n < 3.0 ? 'average' : 'poor';
        case 'lcp': return n < 2.5 ? 'good' : n < 4.0 ? 'average' : 'poor';
        case 'tti': return n < 3.8 ? 'good' : n < 7.3 ? 'average' : 'poor';
        case 'si': return n < 3.4 ? 'good' : n < 5.8 ? 'average' : 'poor';
        case 'tbt': return n < 200 ? 'good' : n < 600 ? 'average' : 'poor';
        case 'cls': return n < 0.1 ? 'good' : n < 0.25 ? 'average' : 'poor';
        default: return 'average';
    }
};

const MetricRow = ({ label, value, status }: { label: string; value: string | null; status: 'good' | 'average' | 'poor' }) => {
    const color = status === 'good' ? 'text-emerald-400' : status === 'average' ? 'text-amber-400' : 'text-red-400';
    const Icon = status === 'good' ? CheckCircle : status === 'average' ? Info : AlertTriangle;
    return (
        <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] px-2 rounded -mx-2 transition-colors">
            <div className="flex items-center gap-2 font-['DM_Sans'] text-sm text-gray-300">
                <Icon size={14} className={color} />
                {label}
            </div>
            <span className={`font-['DM_Mono'] text-sm ${color} font-semibold`}>{value ?? '—'}</span>
        </div>
    );
};

export default function PageSpeedPage() {
    const router = useRouter();
    const [speedData, setSpeedData] = useState<SpeedData | null>(null);
    const [loading, setLoading] = useState(true);
    const [domain, setDomain] = useState<string | null>(null);
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const fetchSpeedData = async (d: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/audits/speed-data?domain=${encodeURIComponent(d)}`);
            if (res.ok) {
                setSpeedData(await res.json());
            }
        } catch (err) {
            console.error('Failed to fetch speed data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const d = localStorage.getItem('rankypulse_audit_domain') ?? localStorage.getItem('rankypulse_last_url') ?? '';
        const clean = d.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase().trim();
        setDomain(clean || null);
        if (clean) {
            fetchSpeedData(clean);
        } else {
            setLoading(false);
        }
    }, []);

    const toggleExpand = (id: string) => {
        setExpandedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    // Loading
    if (loading) {
        return (
            <main className="min-h-screen bg-[#0d0f14] pt-20 pb-20 px-6 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="animate-spin text-cyan-400" />
                    <p className="font-['DM_Sans'] text-sm text-gray-400">Loading speed data…</p>
                </div>
            </main>
        );
    }

    // No domain
    if (!domain) {
        return (
            <main className="min-h-screen bg-[#0d0f14] pt-20 pb-20 px-6 flex items-center justify-center">
                <div className="text-center">
                    <p className="font-['DM_Sans'] text-gray-400 mb-3">No domain selected.</p>
                    <button onClick={() => router.push('/app/audit')} className="text-cyan-400 hover:underline font-['DM_Sans'] text-sm">
                        Go to Site Audit to select a domain →
                    </button>
                </div>
            </main>
        );
    }

    // No PSI data
    if (!speedData?.hasPsiData) {
        return (
            <main className="min-h-screen bg-[#0d0f14] pt-20 pb-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-2 mb-6">
                        <button onClick={() => router.push('/audits')} className="font-['DM_Mono'] text-xs text-gray-600 hover:text-gray-400 transition-colors tracking-wider">← SITE AUDIT</button>
                        <span className="text-gray-700">/</span>
                        <span className="font-['DM_Mono'] text-xs text-cyan-400 tracking-wider flex items-center gap-1"><Activity size={12} fill="currentColor" /> PAGE SPEED</span>
                    </div>
                    <div className="rounded-2xl border border-white/[0.06] bg-[#13161f] p-12 flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                            <Zap size={28} className="text-cyan-400" />
                        </div>
                        <h2 className="font-['Fraunces'] text-2xl font-bold text-white">Speed data not available</h2>
                        <p className="font-['DM_Sans'] text-sm text-gray-400 max-w-md">
                            {speedData?.reason ?? 'PageSpeed Insights data is collected during a crawl. Re-run the audit for'}{' '}
                            <strong className="text-white">{domain}</strong> to get real speed data.
                        </p>
                        <button
                            onClick={() => router.push(`/app/audit/${domain}`)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 text-black rounded-xl font-['DM_Sans'] font-semibold text-sm hover:bg-cyan-400 transition-all"
                        >
                            <RefreshCcw size={14} /> Re-run Audit
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    const mobile = speedData.mobile!;
    const score = mobile.score;
    const scoreColors = getScoreColor(score);
    const diagnostics = speedData.diagnostics ?? [];
    const passedAudits = speedData.passedAudits ?? 0;

    return (
        <main className="min-h-screen bg-[#0d0f14] pt-20 pb-20 px-6">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="relative max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-end justify-between flex-wrap gap-4 mb-8"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <button onClick={() => router.push('/audits')} className="font-['DM_Mono'] text-xs text-gray-600 hover:text-gray-400 transition-colors tracking-wider">
                                ← SITE AUDIT
                            </button>
                            <span className="text-gray-700">/</span>
                            <span className="font-['DM_Mono'] text-xs text-cyan-400 tracking-wider flex items-center gap-1">
                                <Activity size={12} fill="currentColor" /> PAGE SPEED
                            </span>
                        </div>
                        <h1 className="font-['Fraunces'] text-4xl font-bold text-white tracking-tight leading-tight">
                            Page Speed Insights
                        </h1>
                        <p className="font-['DM_Sans'] text-gray-400 text-sm mt-1">
                            Mobile performance for <strong className="text-white">{domain}</strong>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-['DM_Sans'] font-semibold text-sm hover:bg-white/10 transition-all flex items-center gap-2">
                            <Download size={14} /> Export PDF
                        </button>
                        <button
                            onClick={() => router.push(`/app/audit/${domain}`)}
                            className="px-4 py-2.5 bg-cyan-500 text-black rounded-xl font-['DM_Sans'] font-semibold text-sm hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                        >
                            <Smartphone size={14} /> Re-run Audit
                        </button>
                    </div>
                </motion.div>

                {/* Main Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Performance Gauge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-8 rounded-2xl bg-[#13161f] border border-white/[0.06] flex flex-col items-center justify-center relative overflow-hidden"
                    >
                        <h2 className="font-['DM_Mono'] text-xs text-gray-500 tracking-widest absolute top-6 left-6">PERFORMANCE</h2>
                        <div className="relative w-48 h-48 mt-8 mb-4">
                            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                <motion.circle
                                    initial={{ strokeDashoffset: 283 }}
                                    animate={{ strokeDashoffset: 283 - (283 * score) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    cx="50" cy="50" r="45" fill="none" stroke={scoreColors.stroke} strokeWidth="8"
                                    strokeDasharray="283" strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.span
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className={`font-['Fraunces'] text-6xl font-bold ${scoreColors.text}`}
                                >
                                    {score}
                                </motion.span>
                            </div>
                        </div>
                        <div className="flex gap-4 font-['DM_Mono'] text-[10px] mt-4">
                            <div className="flex items-center gap-1.5 text-red-400"><div className="w-2 h-2 rounded-full bg-red-500" /> 0-49</div>
                            <div className="flex items-center gap-1.5 text-amber-400"><div className="w-2 h-2 rounded-full bg-amber-500" /> 50-89</div>
                            <div className="flex items-center gap-1.5 text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-500" /> 90-100</div>
                        </div>
                    </motion.div>

                    {/* Metrics Grid */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.06] lg:col-span-2 flex flex-col"
                    >
                        <h2 className="font-['DM_Mono'] text-xs text-gray-500 tracking-widest mb-6">LAB DATA · MOBILE</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 flex-grow">
                            <MetricRow label="First Contentful Paint" value={mobile.fcp} status={classifyMetric('fcp', mobile.fcp)} />
                            <MetricRow label="Time to Interactive" value={mobile.tti} status={classifyMetric('tti', mobile.tti)} />
                            <MetricRow label="Speed Index" value={mobile.si} status={classifyMetric('si', mobile.si)} />
                            <MetricRow label="Total Blocking Time" value={mobile.tbt} status={classifyMetric('tbt', mobile.tbt)} />
                            <MetricRow label="Largest Contentful Paint" value={mobile.lcp} status={classifyMetric('lcp', mobile.lcp)} />
                            <MetricRow label="Cumulative Layout Shift" value={mobile.cls} status={classifyMetric('cls', mobile.cls)} />
                        </div>
                    </motion.div>
                </div>

                {/* Diagnostics */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-white/[0.06] bg-[#13161f] overflow-hidden"
                >
                    <div className="px-6 py-5 border-b border-white/[0.05] bg-white/[0.01] flex justify-between items-center">
                        <h2 className="font-['DM_Sans'] font-semibold text-white">Opportunities & Diagnostics</h2>
                        {passedAudits > 0 && (
                            <span className="font-['DM_Mono'] text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                {passedAudits} PASSED AUDITS
                            </span>
                        )}
                    </div>

                    {diagnostics.length === 0 ? (
                        <div className="py-12 text-center flex flex-col items-center gap-2">
                            <CheckCircle size={28} className="text-emerald-400" />
                            <p className="font-['DM_Sans'] text-sm text-gray-400">No major opportunities found — great performance!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/[0.04]">
                            {diagnostics.map((item) => {
                                const savingsSec = item.savingsMs ? (item.savingsMs / 1000).toFixed(1) + 's' : item.displayValue;
                                return (
                                    <div key={item.id} className="group">
                                        <button
                                            onClick={() => toggleExpand(item.id)}
                                            className="w-full px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors text-left"
                                        >
                                            <div className="mt-0.5">
                                                <div className="text-amber-400 border border-amber-500/20 bg-amber-500/10 w-6 h-6 rounded flex items-center justify-center text-xs">▲</div>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-['DM_Sans'] font-medium text-gray-200 group-hover:text-white transition-colors">{item.title}</h3>
                                            </div>
                                            <div className="font-['DM_Mono'] text-sm text-gray-400 flex items-center gap-4">
                                                {savingsSec && <span className="text-emerald-400 hidden sm:inline-block">Savings: ~{savingsSec}</span>}
                                                <ChevronDown size={16} className={`text-gray-600 transition-transform ${expandedItems.includes(item.id) ? 'rotate-180' : ''}`} />
                                            </div>
                                        </button>
                                        <AnimatePresence>
                                            {expandedItems.includes(item.id) && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-6 pb-6 pt-2 pl-16">
                                                        <p className="font-['DM_Sans'] text-sm text-gray-400 max-w-3xl leading-relaxed">
                                                            {item.displayValue ?? 'Fix this opportunity to improve load time.'}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>
        </main>
    );
}
