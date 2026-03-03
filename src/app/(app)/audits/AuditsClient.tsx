'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Search, Plus, ArrowRight, ChevronDown,
    Clock, AlertTriangle, CheckCircle, Zap,
} from 'lucide-react';
import { extractAuditDomain, isValidExtractedDomain } from '@/lib/url-validation';
import { useAuditStore } from '@/lib/use-audit';

interface AuditItem {
    id: string;
    domain: string;
    score: number;
    issueCount: number;
    trafficLoss: number;
    scannedAt: number;
    topIssue: string | null;
    trend: string;
    trendDelta: number;
}

const getScoreTier = (score: number) => {
    if (score >= 85) return { label: 'EXCELLENT', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' };
    if (score >= 70) return { label: 'GOOD', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' };
    if (score >= 50) return { label: 'FAIR', color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.25)' };
    return { label: 'POOR', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' };
};

const timeAgo = (dateValue: number) => {
    const seconds = Math.floor((Date.now() - dateValue) / 1000);
    if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
};

export default function AuditsClient({ audits }: { audits: AuditItem[] }) {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'critical' | 'good'>('all');
    const [sortBy, setSortBy] = useState<'date' | 'score' | 'issues'>('date');
    const [newDomain, setNewDomain] = useState('');
    const [showNewInput, setShowNewInput] = useState(false);
    const [visibleCount, setVisibleCount] = useState(4);

    const localAuditData = useAuditStore(state => state.data);

    const combinedAudits = useMemo(() => {
        const merged = [...audits];
        if (localAuditData?.domain) {
            // Check if it's already in the DB list to avoid duplicates
            if (!merged.find(a => a.domain === localAuditData.domain)) {
                // Approximate issues count
                const issues = Array.isArray(localAuditData.issues) ? localAuditData.issues : [];
                merged.push({
                    id: `local-${localAuditData.domain}`,
                    domain: localAuditData.domain,
                    score: localAuditData.score || 0,
                    issueCount: issues.length,
                    trafficLoss: 0,
                    scannedAt: Date.now(), // Since it's in memory, it's recent
                    topIssue: issues.length > 0 ? (issues[0].title || 'Configuration Issue') : null,
                    trend: 'flat',
                    trendDelta: 0
                });
            }
        }
        return merged;
    }, [audits, localAuditData]);

    const filtered = useMemo(() => {
        return combinedAudits
            .filter(a => {
                const matchSearch = a.domain.includes(search.toLowerCase());
                const matchFilter =
                    filter === 'all' ? true :
                        filter === 'critical' ? a.score < 60 :
                            filter === 'good' ? a.score >= 80 : true;
                return matchSearch && matchFilter;
            })
            .sort((a, b) => {
                if (sortBy === 'score') return b.score - a.score;
                if (sortBy === 'issues') return b.issueCount - a.issueCount;
                return b.scannedAt - a.scannedAt;
            });
    }, [search, filter, sortBy, audits]);

    const handleNewAudit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem('domain') as HTMLInputElement | null;
        const cleaned = extractAuditDomain(input?.value ?? newDomain);
        if (isValidExtractedDomain(cleaned)) {
            router.push(`/report/${cleaned}`);
        }
    };

    return (
        <main className="min-h-screen bg-[#0d0f14] pt-20 pb-20 px-6">
            {/* Background glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2
          w-[800px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="relative max-w-5xl mx-auto">
                {/* ── Page Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-end justify-between flex-wrap gap-4 mb-8"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="font-['DM_Mono'] text-xs text-gray-600
                  hover:text-gray-400 transition-colors tracking-wider"
                            >
                                ← DASHBOARD
                            </button>
                            <span className="text-gray-700">/</span>
                            <span className="font-['DM_Mono'] text-xs text-indigo-400 tracking-wider">
                                ALL AUDITS
                            </span>
                        </div>
                        <h1 className="font-['Fraunces'] text-4xl font-bold text-white
              tracking-tight leading-tight">
                            Audit History
                        </h1>
                        <p className="font-['DM_Sans'] text-gray-400 text-sm mt-1">
                            {audits.length} domains tracked ·{' '}
                            {audits.filter(a => a.issueCount > 0).length} need attention
                        </p>
                    </div>

                    {/* New audit button / inline input */}
                    <div>
                        {!showNewInput ? (
                            <button
                                onClick={() => setShowNewInput(true)}
                                className="flex items-center gap-2 px-5 py-2.5
                  bg-indigo-500 text-white rounded-xl
                  font-['DM_Sans'] font-semibold text-sm
                  hover:bg-indigo-400 hover:-translate-y-0.5
                  hover:shadow-lg hover:shadow-indigo-500/25
                  transition-all"
                            >
                                <Plus size={15} />
                                New Audit
                            </button>
                        ) : (
                            <motion.form
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onSubmit={handleNewAudit}
                                className="flex gap-2"
                            >
                                <input
                                    autoFocus
                                    name="domain"
                                    type="text"
                                    autoComplete="off"
                                    value={newDomain}
                                    onChange={e => setNewDomain(e.target.value)}
                                    placeholder="domain.com"
                                    className="px-4 py-2.5 bg-white/5 border border-white/10
                    rounded-xl text-sm text-white placeholder-gray-600
                    font-['DM_Sans'] focus:outline-none
                    focus:border-indigo-500/50 w-48 transition-all"
                                />
                                <button type="submit"
                                    className="px-4 py-2.5 bg-indigo-500 text-white
                    rounded-xl font-['DM_Sans'] font-semibold text-sm
                    hover:bg-indigo-400 transition-colors flex items-center gap-1.5">
                                    <Zap size={13} />
                                    Audit
                                </button>
                                <button type="button"
                                    onClick={() => setShowNewInput(false)}
                                    className="px-3 py-2.5 border border-white/10 text-gray-500
                    rounded-xl text-sm hover:bg-white/5 transition-colors">
                                    ✕
                                </button>
                            </motion.form>
                        )}
                    </div>
                </motion.div>

                {/* ── Search + Filters ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="flex flex-wrap items-center gap-3 mb-6"
                >
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={13}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search domains..."
                            className="w-full pl-8 pr-4 py-2.5 bg-white/[0.04]
                border border-white/[0.08] rounded-xl text-sm text-white
                placeholder-gray-600 font-['DM_Sans']
                focus:outline-none focus:border-indigo-500/40
                transition-all"
                        />
                    </div>

                    {/* Filter pills */}
                    <div className="flex gap-2">
                        {(['all', 'critical', 'good'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-2 rounded-lg font-['DM_Mono'] text-xs
                  tracking-wider transition-all capitalize
                  ${filter === f
                                        ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                                        : 'bg-white/[0.04] border border-white/[0.08] text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                {f.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value as 'date' | 'score' | 'issues')}
                            className="appearance-none pl-3 pr-8 py-2 bg-white/[0.04]
                border border-white/[0.08] rounded-xl text-xs text-gray-400
                font-['DM_Mono'] focus:outline-none cursor-pointer
                hover:border-white/[0.15] transition-all"
                        >
                            <option value="date">SORT: DATE</option>
                            <option value="score">SORT: SCORE</option>
                            <option value="issues">SORT: ISSUES</option>
                        </select>
                        <ChevronDown size={12}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2
                text-gray-600 pointer-events-none" />
                    </div>
                </motion.div>

                {/* ── Audit Table ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="rounded-2xl border border-white/[0.06] overflow-hidden"
                    style={{ background: '#13161f' }}
                >
                    {/* Table header */}
                    <div className="grid grid-cols-12 px-6 py-3 border-b border-white/[0.05]">
                        {[
                            { label: 'DOMAIN', cols: 'col-span-3' },
                            { label: 'SCORE', cols: 'col-span-2' },
                            { label: 'ISSUES', cols: 'col-span-2' },
                            { label: 'TRAFFIC LOSS', cols: 'col-span-2' },
                            { label: 'SCANNED', cols: 'col-span-2' },
                            { label: '', cols: 'col-span-1' },
                        ].map(col => (
                            <div key={col.label}
                                className={`${col.cols} font-['DM_Mono'] text-[10px]
                  text-gray-600 tracking-widest`}>
                                {col.label}
                            </div>
                        ))}
                    </div>

                    {/* Rows */}
                    <AnimatePresence>
                        {filtered.slice(0, visibleCount).map((audit, i) => {
                            const tier = getScoreTier(audit.score);
                            return (
                                <motion.div
                                    key={audit.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ delay: i * 0.05, duration: 0.3 }}
                                    onClick={() => router.push(`/report/${audit.domain}`)}
                                    className="grid grid-cols-12 items-center px-6 py-4
                    border-b border-white/[0.04] last:border-0
                    hover:bg-white/[0.03] transition-all cursor-pointer group"
                                >
                                    {/* Domain */}
                                    <div className="col-span-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/[0.05]
                      border border-white/[0.08] flex items-center
                      justify-center flex-shrink-0">
                                            <span className="font-['DM_Mono'] text-xs text-gray-500">
                                                {audit.domain[0].toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-['DM_Sans'] font-semibold text-sm
                        text-white group-hover:text-indigo-300 transition-colors">
                                                {audit.domain}
                                            </p>
                                            {audit.topIssue && (
                                                <p className="font-['DM_Sans'] text-xs text-gray-600
                          truncate max-w-[140px]">
                                                    {audit.topIssue}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Score */}
                                    <div className="col-span-2">
                                        <div className="inline-flex items-center gap-1.5
                      px-2.5 py-1.5 rounded-lg border"
                                            style={{ background: tier.bg, borderColor: tier.border }}
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                style={{ background: tier.color }} />
                                            <span className="font-['Fraunces'] text-sm font-bold"
                                                style={{ color: tier.color }}>
                                                {audit.score}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-1">
                                            {audit.trend === 'up' && (
                                                <span className="font-['DM_Mono'] text-[10px] text-emerald-500">
                                                    ↑ +{audit.trendDelta}
                                                </span>
                                            )}
                                            {audit.trend === 'down' && (
                                                <span className="font-['DM_Mono'] text-[10px] text-red-500">
                                                    ↓ {audit.trendDelta}
                                                </span>
                                            )}
                                            {audit.trend === 'flat' && (
                                                <span className="font-['DM_Mono'] text-[10px] text-gray-600">
                                                    → 0
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Issues */}
                                    <div className="col-span-2">
                                        {audit.issueCount === 0 ? (
                                            <div className="flex items-center gap-1.5">
                                                <CheckCircle size={13} className="text-emerald-500" />
                                                <span className="font-['DM_Sans'] text-xs text-emerald-400">
                                                    All clear
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <AlertTriangle size={13}
                                                    className={audit.issueCount >= 7 ? 'text-red-400' : 'text-amber-400'} />
                                                <span className={`font-['DM_Sans'] text-xs font-semibold
                          ${audit.issueCount >= 7 ? 'text-red-400' : 'text-amber-400'}`}>
                                                    {audit.issueCount} open
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Traffic Loss */}
                                    <div className="col-span-2">
                                        {audit.trafficLoss === 0 ? (
                                            <span className="font-['DM_Mono'] text-xs text-gray-600">—</span>
                                        ) : (
                                            <div>
                                                <span className="font-['DM_Mono'] text-xs text-red-400">
                                                    {audit.trafficLoss.toLocaleString()}/mo
                                                </span>
                                                <div className="w-16 h-1 bg-white/[0.05] rounded-full mt-1 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-red-500/40"
                                                        style={{ width: `${Math.min(100, Math.abs(audit.trafficLoss) / 30)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Date */}
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={11} className="text-gray-600" />
                                            <span className="font-['DM_Mono'] text-xs text-gray-500">
                                                {timeAgo(audit.scannedAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    <div className="col-span-1 flex justify-end">
                                        <ArrowRight size={14}
                                            className="text-gray-700 group-hover:text-indigo-400
                        group-hover:translate-x-1 transition-all" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Empty state */}
                    {filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Search size={24} className="text-gray-700 mb-4" />
                            <p className="font-['DM_Sans'] text-gray-500 text-sm">
                                No audits match your search
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Load more */}
                {visibleCount < filtered.length && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center mt-4"
                    >
                        <button
                            onClick={() => setVisibleCount(v => v + 4)}
                            className="px-6 py-2.5 border border-white/[0.08] text-gray-400
                rounded-xl font-['DM_Sans'] text-sm
                hover:bg-white/[0.05] hover:text-white transition-all"
                        >
                            Load {Math.min(4, filtered.length - visibleCount)} more
                        </button>
                    </motion.div>
                )}

            </div>
        </main>
    );
}
