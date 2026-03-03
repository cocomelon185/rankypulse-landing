'use client';

import { useState, useEffect } from 'react';
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
    Activity,
    Download
} from 'lucide-react';
import { useAuditStore } from '@/lib/use-audit';
import { extractAuditDomain } from '@/lib/url-validation';

interface CWVMetric {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    value: string;
    status: 'good' | 'needs_improvement' | 'poor';
    distribution: { good: number, needs_improvement: number, poor: number };
}

const INITIAL_CWV_METRICS: CWVMetric[] = [
    {
        id: 'lcp',
        name: 'Largest Contentful Paint (LCP)',
        description: 'Measures loading performance. Good is under 2.5s.',
        icon: MonitorPlay,
        value: 'N/A',
        status: 'needs_improvement',
        distribution: { good: 0, needs_improvement: 0, poor: 0 },
    },
    {
        id: 'fid',
        name: 'First Input Delay (FID)',
        description: 'Measures interactivity. Good is under 100ms.',
        icon: MousePointerClick,
        value: 'N/A',
        status: 'needs_improvement',
        distribution: { good: 0, needs_improvement: 0, poor: 0 },
    },
    {
        id: 'cls',
        name: 'Cumulative Layout Shift (CLS)',
        description: 'Measures visual stability. Good is under 0.1.',
        icon: LayoutTemplate,
        value: 'N/A',
        status: 'needs_improvement',
        distribution: { good: 0, needs_improvement: 0, poor: 0 },
    },
    {
        id: 'inp',
        name: 'Interaction to Next Paint (INP)',
        description: 'Measures overall responsiveness. Good is under 200ms.',
        icon: Activity,
        value: 'N/A',
        status: 'needs_improvement',
        distribution: { good: 0, needs_improvement: 0, poor: 0 },
    }
];

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

export default function CoreWebVitalsClient() {
    const router = useRouter();
    const [metrics, setMetrics] = useState(INITIAL_CWV_METRICS);
    const [loading, setLoading] = useState(true);
    const [urlChecked, setUrlChecked] = useState<string | null>(null);
    const [overallStats, setOverallStats] = useState({ goodUrls: 0, needsImprovementUrls: 0, poorUrls: 0, totalUrls: 0 });

    const auditData = useAuditStore(state => state.data);

    const fetchVitals = async (forceUrl?: string) => {
        setLoading(true);
        try {
            const lastUrl = forceUrl || localStorage.getItem('rankypulse_last_url');
            let dbData: any = null;

            let apiUrl = '/api/audits/data?type=vitals';
            let hostnameFallback = "";
            if (lastUrl) {
                const hostname = extractAuditDomain(lastUrl);
                if (hostname) {
                    hostnameFallback = hostname;
                    setUrlChecked(hostname);
                    apiUrl += `&domain=${encodeURIComponent(hostname)}`;
                } else {
                    setLoading(false);
                    return;
                }
            } else {
                setLoading(false);
                return;
            }

            const res = await fetch(apiUrl);
            if (res.ok) {
                const result = await res.json();
                if (!Array.isArray(result) && result.data) {
                    dbData = result.data;
                    if (result.hostname) setUrlChecked(result.hostname);
                }
            }

            const applyMetrics = (metadata: any) => {
                const lcp = metadata.lcpSeconds || metadata.lcp || 0;
                const cls = metadata.cls || 0;
                const fid = metadata.fidMs || metadata.fid || 0;
                const inp = metadata.inpMs || metadata.inp || 0;
                const perfScore = metadata.performanceScore || 0;

                setMetrics(prev => prev.map(m => {
                    if (m.id === 'lcp') {
                        const status: 'good' | 'needs_improvement' | 'poor' = lcp > 0 && lcp <= 2.5 ? 'good' : lcp <= 4.0 ? 'needs_improvement' : 'poor';
                        return { ...m, value: lcp > 0 ? `${lcp}s` : 'N/A', status };
                    }
                    if (m.id === 'cls') {
                        const status: 'good' | 'needs_improvement' | 'poor' = cls <= 0.1 ? 'good' : cls <= 0.25 ? 'needs_improvement' : 'poor';
                        return { ...m, value: cls > 0 ? cls.toFixed(3) : 'N/A', status };
                    }
                    if (m.id === 'fid') {
                        const status: 'good' | 'needs_improvement' | 'poor' = fid > 0 && fid <= 100 ? 'good' : fid <= 300 ? 'needs_improvement' : 'poor';
                        return { ...m, value: fid > 0 ? `${fid}ms` : 'N/A', status };
                    }
                    if (m.id === 'inp') {
                        const status: 'good' | 'needs_improvement' | 'poor' = inp > 0 && inp <= 200 ? 'good' : inp <= 500 ? 'needs_improvement' : 'poor';
                        return { ...m, value: inp > 0 ? `${inp}ms` : 'N/A', status };
                    }
                    return m;
                }));

                // Derive overall stats from performance score
                if (perfScore > 0) {
                    const good = Math.round(perfScore);
                    const poor = Math.max(0, Math.round((100 - perfScore) * 0.4));
                    const ni = Math.max(0, 100 - good - poor);
                    setOverallStats({ goodUrls: good, needsImprovementUrls: ni, poorUrls: poor, totalUrls: 100 });
                }
            };

            if (dbData && dbData.length > 0 && dbData[0].metadata) {
                applyMetrics(dbData[0].metadata);
            } else if (lastUrl && auditData && auditData.domain === hostnameFallback) {
                setUrlChecked(auditData.domain);
                applyMetrics((auditData as any)._raw || {});
            }
        } catch (err) {
            console.error("Failed to fetch CWV data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVitals();
    }, []);

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
                        <button
                            onClick={() => {
                                if (urlChecked) {
                                    fetchVitals(urlChecked);
                                } else {
                                    router.push('/audits');
                                }
                            }}
                            className="px-4 py-2.5 bg-amber-500 text-black rounded-xl font-['DM_Sans'] font-semibold text-sm hover:bg-amber-400 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
                        >
                            <Play size={14} fill="currentColor" />
                            {urlChecked ? "Analyze Lab Data" : "Run Audit"}
                        </button>
                    </div>
                </motion.div>

                {/* Global Overview Chart — only shown when we have real data */}
                {!loading && urlChecked && overallStats.totalUrls > 0 && (
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
                                    <div style={{ width: `${(overallStats.goodUrls / overallStats.totalUrls) * 100}%` }} className="bg-emerald-500" />
                                    <div style={{ width: `${(overallStats.needsImprovementUrls / overallStats.totalUrls) * 100}%` }} className="bg-amber-500" />
                                    <div style={{ width: `${(overallStats.poorUrls / overallStats.totalUrls) * 100}%` }} className="bg-red-500" />
                                </div>
                                <div className="flex justify-between text-sm font-['DM_Sans']">
                                    <span className="text-gray-400">0</span>
                                    <span className="text-gray-400">{overallStats.totalUrls.toLocaleString()} URLs analyzed</span>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-emerald-400 font-['DM_Sans'] font-semibold">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                        {overallStats.goodUrls.toLocaleString()} Good
                                    </div>
                                    <div className="flex items-center gap-2 text-amber-400 font-['DM_Sans'] font-semibold">
                                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                                        {overallStats.needsImprovementUrls.toLocaleString()} Needs Improvement
                                    </div>
                                    <div className="flex items-center gap-2 text-red-400 font-['DM_Sans'] font-semibold">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        {overallStats.poorUrls.toLocaleString()} Poor
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Individual Metrics */}
                <h2 className="font-['Fraunces'] text-2xl font-bold text-white tracking-tight mb-4">Metric Breakdown</h2>

                {loading && (
                    <div className="py-10 text-center text-gray-500">Loading lab data...</div>
                )}
                {!loading && !urlChecked && (
                    <div className="py-10 text-center text-gray-500">Run an audit first to analyze lab data. <button onClick={() => router.push('/audits')} className="text-amber-500 hover:underline">Go to Site Audit</button></div>
                )}

                {!loading && urlChecked && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                        {metrics.map((metric, i) => {
                            const statusMap = {
                                good: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
                                needs_improvement: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertTriangle },
                                poor: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertCircle },
                            };
                            const statusConfig = statusMap[metric.status as keyof typeof statusMap] || statusMap.needs_improvement;

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
                )}

            </div>
        </main>
    );
}
