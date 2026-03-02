'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Zap,
    CheckCircle,
    AlertTriangle,
    AlertCircle,
    LayoutTemplate,
    MousePointerClick,
    MonitorPlay,
    Play,
    Download,
    Activity
} from 'lucide-react';

const CWV_METRICS = [
    {
        id: 'lcp',
        name: 'Largest Contentful Paint (LCP)',
        description: 'Measures loading performance. Good is under 2.5s.',
        icon: MonitorPlay,
        value: '1.8s',
        status: 'good', // good | needs_improvement | poor
        distribution: { good: 75, needs_improvement: 15, poor: 10 },
    },
    {
        id: 'fid',
        name: 'First Input Delay (FID)',
        description: 'Measures interactivity. Good is under 100ms.',
        icon: MousePointerClick,
        value: '45ms',
        status: 'good',
        distribution: { good: 92, needs_improvement: 6, poor: 2 },
    },
    {
        id: 'cls',
        name: 'Cumulative Layout Shift (CLS)',
        description: 'Measures visual stability. Good is under 0.1.',
        icon: LayoutTemplate,
        value: '0.24',
        status: 'needs_improvement',
        distribution: { good: 40, needs_improvement: 45, poor: 15 },
    },
    {
        id: 'inp',
        name: 'Interaction to Next Paint (INP)',
        description: 'Measures overall responsiveness. Good is under 200ms.',
        icon: Activity,
        value: '310ms',
        status: 'poor',
        distribution: { good: 20, needs_improvement: 30, poor: 50 },
    }
];

const OVERALL_STATS = {
    goodUrls: 840,
    needsImprovementUrls: 320,
    poorUrls: 140,
    totalUrls: 1300,
};

const StatusBars = ({ distribution }: { distribution: { good: number, needs_improvement: number, poor: number } }) => {
    return (
        <div className="w-full mt-4">
            <div className="flex justify-between font-['DM_Mono'] text-[10px] text-gray-500 mb-1">
                <span>GOOD ({distribution.good}%)</span>
                <span>NEEDS IMP ({distribution.needs_improvement}%)</span>
                <span>POOR ({distribution.poor}%)</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden flex">
                <div style={{ width: `${distribution.good}%` }} className="bg-emerald-500/80" />
                <div style={{ width: `${distribution.needs_improvement}%` }} className="bg-amber-500/80" />
                <div style={{ width: `${distribution.poor}%` }} className="bg-red-500/80" />
            </div>
        </div>
    );
};

export default function CoreWebVitalsPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-[#0d0f14] pt-20 pb-20 px-6">
            {/* Background glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full" />
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
                            <span className="font-['DM_Mono'] text-xs text-amber-500 tracking-wider flex items-center gap-1">
                                <Zap size={12} fill="currentColor" /> CORE WEB VITALS
                            </span>
                        </div>
                        <h1 className="font-['Fraunces'] text-4xl font-bold text-white tracking-tight leading-tight">
                            Core Web Vitals
                        </h1>
                        <p className="font-['DM_Sans'] text-gray-400 text-sm mt-2 max-w-2xl">
                            Monitor real-world user experience metrics based on Chrome User Experience Report (CrUX) data and lab tests.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button className="px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-['DM_Sans'] font-semibold text-sm hover:bg-white/10 transition-all flex items-center gap-2">
                            <Download size={14} />
                            Export Report
                        </button>
                        <button className="px-4 py-2.5 bg-amber-500 text-black rounded-xl font-['DM_Sans'] font-semibold text-sm hover:bg-amber-400 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20">
                            <Play size={14} fill="currentColor" />
                            Analyze Lab Data
                        </button>
                    </div>
                </motion.div>

                {/* Global Overview Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.06] mb-8"
                >
                    <h2 className="font-['DM_Sans'] font-semibold text-white mb-6">Overall URL Performance</h2>
                    <div className="flex flex-wrap gap-8">
                        <div className="flex-1 min-w-[300px]">
                            <div className="h-6 w-full rounded-2xl overflow-hidden flex mb-3 border border-white/[0.05]">
                                <div style={{ width: `${(OVERALL_STATS.goodUrls / OVERALL_STATS.totalUrls) * 100}%` }} className="bg-emerald-500" />
                                <div style={{ width: `${(OVERALL_STATS.needsImprovementUrls / OVERALL_STATS.totalUrls) * 100}%` }} className="bg-amber-500" />
                                <div style={{ width: `${(OVERALL_STATS.poorUrls / OVERALL_STATS.totalUrls) * 100}%` }} className="bg-red-500" />
                            </div>
                            <div className="flex justify-between text-sm font-['DM_Sans']">
                                <span className="text-gray-400">0</span>
                                <span className="text-gray-400">{OVERALL_STATS.totalUrls.toLocaleString()} URLs analyzed</span>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-emerald-400 font-['DM_Sans'] font-semibold">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    {OVERALL_STATS.goodUrls.toLocaleString()} Good
                                </div>
                                <div className="flex items-center gap-2 text-amber-400 font-['DM_Sans'] font-semibold">
                                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                                    {OVERALL_STATS.needsImprovementUrls.toLocaleString()} Needs Improvement
                                </div>
                                <div className="flex items-center gap-2 text-red-400 font-['DM_Sans'] font-semibold">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    {OVERALL_STATS.poorUrls.toLocaleString()} Poor
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Individual Metrics */}
                <h2 className="font-['Fraunces'] text-2xl font-bold text-white tracking-tight mb-4">Metric Breakdown</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                    {CWV_METRICS.map((metric, i) => {
                        const statusConfig = {
                            good: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
                            needs_improvement: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertTriangle },
                            poor: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertCircle },
                        }[metric.status];

                        const StatusIcon = statusConfig.icon;

                        return (
                            <motion.div
                                key={metric.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.05 }}
                                className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.06] hover:bg-white/[0.02] transition-colors relative overflow-hidden group cursor-pointer"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <metric.icon size={80} className="text-white" />
                                </div>

                                <div className="flex items-start justify-between relative z-10 mb-6">
                                    <div>
                                        <h3 className="font-['DM_Sans'] font-bold text-lg text-white mb-1 flex items-center gap-2">
                                            <metric.icon size={18} className="text-gray-400" />
                                            {metric.name}
                                        </h3>
                                        <p className="font-['DM_Sans'] text-sm text-gray-500">
                                            {metric.description}
                                        </p>
                                    </div>
                                    <div className={`flex flex-col items-end`}>
                                        <span className={`font-['Fraunces'] text-3xl font-bold ${statusConfig.color}`}>
                                            {metric.value}
                                        </span>
                                        <div className={`mt-1 flex items-center gap-1 text-[11px] font-bold tracking-wider px-2 py-0.5 rounded ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border} uppercase`}>
                                            <StatusIcon size={10} />
                                            {metric.status.replace('_', ' ')}
                                        </div>
                                    </div>
                                </div>

                                <StatusBars distribution={metric.distribution} />
                            </motion.div>
                        );
                    })}
                </div>

            </div>
        </main>
    );
}
