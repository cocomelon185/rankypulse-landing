'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Activity,
    Smartphone,
    Monitor,
    AlertTriangle,
    CheckCircle,
    Clock,
    Zap,
    ChevronDown,
    Download,
    Info
} from 'lucide-react';

const METRICS = {
    mobile: {
        score: 64,
        fcp: '2.1s', // First Contentful Paint
        si: '4.8s', // Speed Index
        lcp: '4.2s', // Largest Contentful Paint
        tti: '5.2s', // Time to Interactive
        tbt: '450ms', // Total Blocking Time
        cls: '0.15', // Cumulative Layout Shift
    },
    desktop: {
        score: 92,
        fcp: '0.8s',
        si: '1.2s',
        lcp: '1.4s',
        tti: '1.1s',
        tbt: '40ms',
        cls: '0.02',
    }
};

const DIAGNOSTICS = [
    {
        id: '1',
        title: 'Serve images in next-gen formats',
        description: 'Image formats like WebP and AVIF often provide better compression than PNG or JPEG, which means faster downloads and less data consumption.',
        savings: '1.2s',
        impact: 'high', // high, med, low
        expanded: false,
    },
    {
        id: '2',
        title: 'Eliminate render-blocking resources',
        description: 'Resources are blocking the first paint of your page. Consider delivering critical JS/CSS inline and deferring all non-critical JS/styles.',
        savings: '0.8s',
        impact: 'high',
        expanded: false,
    },
    {
        id: '3',
        title: 'Reduce unused JavaScript',
        description: 'Reduce unused JavaScript and defer loading scripts until they are required to decrease bytes consumed by network activity.',
        savings: '0.4s',
        impact: 'med',
        expanded: false,
    },
    {
        id: '4',
        title: 'Properly size images',
        description: 'Serve images that are appropriately-sized to save cellular data and improve load time.',
        savings: '0.15s',
        impact: 'low',
        expanded: false,
    },
    {
        id: '5',
        title: 'Minify CSS',
        description: 'Minifying CSS files can reduce network payload sizes.',
        savings: '0.05s',
        impact: 'low',
        expanded: false,
    },
];

const PASSED_AUDITS = 18;

const getScoreColor = (score: number) => {
    if (score >= 90) return { text: 'text-emerald-400', stroke: '#34d399', bg: 'bg-emerald-500/10' };
    if (score >= 50) return { text: 'text-amber-400', stroke: '#fbbf24', bg: 'bg-amber-500/10' };
    return { text: 'text-red-400', stroke: '#f87171', bg: 'bg-red-500/10' };
};

const MetricRow = ({ label, value, status }: { label: string, value: string, status: 'good' | 'average' | 'poor' }) => {
    const color = status === 'good' ? 'text-emerald-400' : status === 'average' ? 'text-amber-400' : 'text-red-400';
    const Icon = status === 'good' ? CheckCircle : status === 'average' ? Info : AlertTriangle;

    return (
        <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] px-2 rounded -mx-2 transition-colors">
            <div className="flex items-center gap-2 font-['DM_Sans'] text-sm text-gray-300">
                <Icon size={14} className={color} />
                {label}
            </div>
            <span className={`font-['DM_Mono'] text-sm ${color} font-semibold`}>{value}</span>
        </div>
    );
};

export default function PageSpeedPage() {
    const router = useRouter();
    const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const currentMetrics = METRICS[device];
    const scoreColors = getScoreColor(currentMetrics.score);

    const toggleExpand = (id: string) => {
        setExpandedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <main className="min-h-screen bg-[#0d0f14] pt-20 pb-20 px-6">
            {/* Background glow */}
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
                            <button
                                onClick={() => router.push('/audits')}
                                className="font-['DM_Mono'] text-xs text-gray-600 hover:text-gray-400 transition-colors tracking-wider"
                            >
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
                        <p className="font-['DM_Sans'] text-gray-400 text-sm mt-2 max-w-2xl">
                            Diagnose performance issues and discover specific opportunities to make your pages load faster across all devices.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button className="px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-['DM_Sans'] font-semibold text-sm hover:bg-white/10 transition-all flex items-center gap-2">
                            <Download size={14} />
                            Export PDF
                        </button>
                        <button className="px-4 py-2.5 bg-cyan-500 text-black rounded-xl font-['DM_Sans'] font-semibold text-sm hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20">
                            <Activity size={14} fill="currentColor" />
                            Re-analyze
                        </button>
                    </div>
                </motion.div>

                {/* Device Toggle */}
                <div className="flex items-center gap-2 mb-8 bg-[#13161f] p-1.5 rounded-xl border border-white/[0.06] w-fit">
                    <button
                        onClick={() => setDevice('mobile')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-['DM_Sans'] font-semibold text-sm transition-all ${device === 'mobile' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <Smartphone size={16} /> Mobile
                    </button>
                    <button
                        onClick={() => setDevice('desktop')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-['DM_Sans'] font-semibold text-sm transition-all ${device === 'desktop' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <Monitor size={16} /> Desktop
                    </button>
                </div>

                {/* Main Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                    {/* Performance Gauge */}
                    <motion.div
                        key={`gauge-${device}`}
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
                                    animate={{ strokeDashoffset: 283 - (283 * currentMetrics.score) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    cx="50" cy="50" r="45" fill="none" stroke={scoreColors.stroke} strokeWidth="8"
                                    strokeDasharray="283"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.span
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className={`font-['Fraunces'] text-6xl font-bold ${scoreColors.text}`}
                                >
                                    {currentMetrics.score}
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
                        key={`metrics-${device}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.06] lg:col-span-2 flex flex-col"
                    >
                        <h2 className="font-['DM_Mono'] text-xs text-gray-500 tracking-widest mb-6">LAB DATA</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 flex-grow">
                            <MetricRow
                                label="First Contentful Paint"
                                value={currentMetrics.fcp}
                                status={parseFloat(currentMetrics.fcp) < 1.8 ? 'good' : parseFloat(currentMetrics.fcp) < 3.0 ? 'average' : 'poor'}
                            />
                            <MetricRow
                                label="Time to Interactive"
                                value={currentMetrics.tti}
                                status={parseFloat(currentMetrics.tti) < 3.8 ? 'good' : parseFloat(currentMetrics.tti) < 7.3 ? 'average' : 'poor'}
                            />
                            <MetricRow
                                label="Speed Index"
                                value={currentMetrics.si}
                                status={parseFloat(currentMetrics.si) < 3.4 ? 'good' : parseFloat(currentMetrics.si) < 5.8 ? 'average' : 'poor'}
                            />
                            <MetricRow
                                label="Total Blocking Time"
                                value={currentMetrics.tbt}
                                status={parseInt(currentMetrics.tbt) < 200 ? 'good' : parseInt(currentMetrics.tbt) < 600 ? 'average' : 'poor'}
                            />
                            <MetricRow
                                label="Largest Contentful Paint"
                                value={currentMetrics.lcp}
                                status={parseFloat(currentMetrics.lcp) < 2.5 ? 'good' : parseFloat(currentMetrics.lcp) < 4.0 ? 'average' : 'poor'}
                            />
                            <MetricRow
                                label="Cumulative Layout Shift"
                                value={currentMetrics.cls}
                                status={parseFloat(currentMetrics.cls) < 0.1 ? 'good' : parseFloat(currentMetrics.cls) < 0.25 ? 'average' : 'poor'}
                            />
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
                        <span className="font-['DM_Mono'] text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                            {PASSED_AUDITS} PASSED AUDITS
                        </span>
                    </div>

                    <div className="divide-y divide-white/[0.04]">
                        {DIAGNOSTICS.map((item, i) => (
                            <div key={item.id} className="group">
                                <button
                                    onClick={() => toggleExpand(item.id)}
                                    className="w-full px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors text-left"
                                >
                                    <div className="mt-0.5">
                                        {item.impact === 'high' ? (
                                            <div className="text-red-400 border border-red-500/20 bg-red-500/10 w-6 h-6 rounded flex items-center justify-center">▲</div>
                                        ) : item.impact === 'med' ? (
                                            <div className="text-amber-400 border border-amber-500/20 bg-amber-500/10 w-6 h-6 rounded flex items-center justify-center">■</div>
                                        ) : (
                                            <div className="text-gray-400 border border-gray-500/20 bg-gray-500/10 w-6 h-6 rounded flex items-center justify-center">●</div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-['DM_Sans'] font-medium text-gray-200 group-hover:text-white transition-colors">{item.title}</h3>
                                    </div>

                                    <div className="font-['DM_Mono'] text-sm text-gray-400 flex items-center gap-4">
                                        <span className="text-emerald-400 hidden sm:inline-block">Savings: ~{item.savings}</span>
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
                                                    {item.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </motion.div>

            </div>
        </main>
    );
}
