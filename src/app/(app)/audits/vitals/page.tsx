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
    Activity,
    Download,
    Play,
    Loader2,
} from 'lucide-react';

interface CWVMetric {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    value: string;
    status: 'good' | 'needs_improvement' | 'poor';
    distribution: { good: number; needs_improvement: number; poor: number };
}

const DEFAULT_METRICS: CWVMetric[] = [
    {
        id: 'lcp',
        name: 'Largest Contentful Paint (LCP)',
        description: 'Measures loading performance. Good is under 2.5s.',
        icon: MonitorPlay,
        value: '—',
        status: 'needs_improvement',
        distribution: { good: 0, needs_improvement: 0, poor: 0 },
    },
    {
        id: 'fcp',
        name: 'First Contentful Paint (FCP)',
        description: 'Measures when the first content is painted. Good is under 1.8s.',
        icon: Activity,
        value: '—',
        status: 'needs_improvement',
        distribution: { good: 0, needs_improvement: 0, poor: 0 },
    },
    {
        id: 'cls',
        name: 'Cumulative Layout Shift (CLS)',
        description: 'Measures visual stability. Good is under 0.1.',
        icon: LayoutTemplate,
        value: '—',
        status: 'needs_improvement',
        distribution: { good: 0, needs_improvement: 0, poor: 0 },
    },
    {
        id: 'tbt',
        name: 'Total Blocking Time (TBT)',
        description: 'Measures main thread blocking. Good is under 200ms.',
        icon: MousePointerClick,
        value: '—',
        status: 'needs_improvement',
        distribution: { good: 0, needs_improvement: 0, poor: 0 },
    },
];

const StatusBars = ({ distribution }: { distribution: { good: number; needs_improvement: number; poor: number } }) => {
    const total = distribution.good + distribution.needs_improvement + distribution.poor;
    if (total === 0) {
        return <div className="w-full h-2 rounded-full bg-white/[0.05] mt-4" />;
    }
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
    const [metrics, setMetrics] = useState<CWVMetric[]>(DEFAULT_METRICS);
    const [loading, setLoading] = useState(true);
    const [domain, setDomain] = useState<string | null>(null);
    const [hasPsiData, setHasPsiData] = useState(false);

    const fetchVitals = async (d: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/audits/speed-data?domain=${encodeURIComponent(d)}`);
            if (!res.ok) return;
            const json = await res.json();

            if (!json.hasPsiData || !json.mobile) {
                setHasPsiData(false);
                return;
            }

            setHasPsiData(true);
            const m = json.mobile;

            const classifyLcp = (v: string | null): CWVMetric['status'] => {
                if (!v) return 'needs_improvement';
                const n = parseFloat(v);
                return n < 2.5 ? 'good' : n < 4.0 ? 'needs_improvement' : 'poor';
            };
            const classifyFcp = (v: string | null): CWVMetric['status'] => {
                if (!v) return 'needs_improvement';
                const n = parseFloat(v);
                return n < 1.8 ? 'good' : n < 3.0 ? 'needs_improvement' : 'poor';
            };
            const classifyCls = (v: string | null): CWVMetric['status'] => {
                if (!v) return 'needs_improvement';
                const n = parseFloat(v);
                return n < 0.1 ? 'good' : n < 0.25 ? 'needs_improvement' : 'poor';
            };
            const classifyTbt = (v: string | null): CWVMetric['status'] => {
                if (!v) return 'needs_improvement';
                const n = parseInt(v);
                return n < 200 ? 'good' : n < 600 ? 'needs_improvement' : 'poor';
            };

            const toDistribution = (status: CWVMetric['status']) => ({
                good: status === 'good' ? 100 : 0,
                needs_improvement: status === 'needs_improvement' ? 100 : 0,
                poor: status === 'poor' ? 100 : 0,
            });

            setMetrics([
                {
                    id: 'lcp',
                    name: 'Largest Contentful Paint (LCP)',
                    description: 'Measures loading performance. Good is under 2.5s.',
                    icon: MonitorPlay,
                    value: m.lcp ?? '—',
                    status: classifyLcp(m.lcp),
                    distribution: toDistribution(classifyLcp(m.lcp)),
                },
                {
                    id: 'fcp',
                    name: 'First Contentful Paint (FCP)',
                    description: 'Measures when first content is painted. Good is under 1.8s.',
                    icon: Activity,
                    value: m.fcp ?? '—',
                    status: classifyFcp(m.fcp),
                    distribution: toDistribution(classifyFcp(m.fcp)),
                },
                {
                    id: 'cls',
                    name: 'Cumulative Layout Shift (CLS)',
                    description: 'Measures visual stability. Good is under 0.1.',
                    icon: LayoutTemplate,
                    value: m.cls ?? '—',
                    status: classifyCls(m.cls),
                    distribution: toDistribution(classifyCls(m.cls)),
                },
                {
                    id: 'tbt',
                    name: 'Total Blocking Time (TBT)',
                    description: 'Measures main thread blocking. Good is under 200ms.',
                    icon: MousePointerClick,
                    value: m.tbt ?? '—',
                    status: classifyTbt(m.tbt),
                    distribution: toDistribution(classifyTbt(m.tbt)),
                },
            ]);
        } catch (err) {
            console.error('Failed to fetch vitals data', err);
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
            fetchVitals(clean);
        } else {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className="min-h-screen bg-[#0d0f14] pt-20 pb-20 px-6">
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
                            <button onClick={() => router.push('/audits')} className="font-['DM_Mono'] text-xs text-gray-600 hover:text-gray-400 transition-colors tracking-wider">
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
                            {domain
                                ? <>Lab metrics for <strong className="text-white">{domain}</strong> from PageSpeed Insights</>
                                : 'Monitor real-world user experience metrics from PageSpeed Insights lab data.'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-['DM_Sans'] font-semibold text-sm hover:bg-white/10 transition-all flex items-center gap-2">
                            <Download size={14} /> Export Report
                        </button>
                        <button
                            onClick={() => domain ? router.push(`/app/audit/${domain}`) : router.push('/audits')}
                            className="px-4 py-2.5 bg-amber-500 text-black rounded-xl font-['DM_Sans'] font-semibold text-sm hover:bg-amber-400 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
                        >
                            <Play size={14} fill="currentColor" />
                            {domain ? 'Re-run Audit' : 'Run Audit'}
                        </button>
                    </div>
                </motion.div>

                {/* Loading */}
                {loading && (
                    <div className="py-20 flex items-center justify-center gap-3">
                        <Loader2 size={24} className="animate-spin text-amber-500" />
                        <span className="font-['DM_Sans'] text-sm text-gray-400">Loading lab data…</span>
                    </div>
                )}

                {/* No domain */}
                {!loading && !domain && (
                    <div className="py-10 text-center text-gray-500 font-['DM_Sans']">
                        No domain selected.{' '}
                        <button onClick={() => router.push('/app/audit')} className="text-amber-500 hover:underline">Go to Site Audit</button>
                    </div>
                )}

                {/* No PSI data */}
                {!loading && domain && !hasPsiData && (
                    <div className="rounded-2xl border border-white/[0.06] bg-[#13161f] p-12 flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                            <Zap size={28} className="text-amber-400" />
                        </div>
                        <h2 className="font-['Fraunces'] text-2xl font-bold text-white">No PSI data yet</h2>
                        <p className="font-['DM_Sans'] text-sm text-gray-400 max-w-md">
                            PageSpeed Insights data is collected when you run an audit. Re-run the audit for{' '}
                            <strong className="text-white">{domain}</strong> to see real Core Web Vitals.
                        </p>
                        <button
                            onClick={() => router.push(`/app/audit/${domain}`)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-black rounded-xl font-['DM_Sans'] font-semibold text-sm hover:bg-amber-400 transition-all"
                        >
                            <Play size={14} /> Re-run Audit
                        </button>
                    </div>
                )}

                {/* Metric Cards */}
                {!loading && domain && hasPsiData && (
                    <>
                        <h2 className="font-['Fraunces'] text-2xl font-bold text-white tracking-tight mb-4">Metric Breakdown</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                            {metrics.map((metric, i) => {
                                const statusMap = {
                                    good: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
                                    needs_improvement: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertTriangle },
                                    poor: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertCircle },
                                };
                                const statusConfig = statusMap[metric.status];
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
                                                <p className="font-['DM_Sans'] text-sm text-gray-500">{metric.description}</p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className={`font-['Fraunces'] text-3xl font-bold ${statusConfig.color}`}>{metric.value}</span>
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
                    </>
                )}
            </div>
        </main>
    );
}
