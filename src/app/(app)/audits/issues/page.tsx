'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    AlertTriangle,
    Search,
    CheckCircle,
    AlertCircle,
    Info,
    Clock,
    Filter,
    ArrowUpRight,
    Play,
    Download
} from 'lucide-react';
import { useAuditStore } from '@/lib/use-audit';
import { extractAuditDomain } from '@/lib/url-validation';

// MOCK DATA REMOVED

const ISSUE_CATEGORIES = [
    { id: 'errors', label: 'Errors', count: 0, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertCircle },
    { id: 'warnings', label: 'Warnings', count: 0, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertTriangle },
    { id: 'notices', label: 'Notices', count: 0, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Info },
];

const timeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
};

const apiSeverityToIssueSeverity = (sev: string) => {
    switch (sev?.toUpperCase()) {
        case 'HIGH':
        case 'CRITICAL':
            return 'error';
        case 'MED':
        case 'MEDIUM':
            return 'warning';
        case 'LOW':
        default:
            return 'notice';
    }
};

interface AuditIssue {
    id: string;
    severity: 'error' | 'warning' | 'notice';
    title: string;
    description: string;
    urlsAffected: number;
    trend: string;
    discovered: Date;
}

export default function CrawlIssuesPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'all' | 'errors' | 'warnings' | 'notices'>('all');
    const [search, setSearch] = useState('');

    const [loading, setLoading] = useState(true);
    const [issues, setIssues] = useState<AuditIssue[]>([]);
    const [stats, setStats] = useState({ healthScore: 0, crawledPages: 1, healthyPages: 1, brokenPages: 0, redirects: 0, blocked: 0 });
    const [urlChecked, setUrlChecked] = useState<string | null>(null);
    const auditData = useAuditStore(state => state.data);

    const fetchAudit = async (forceUrl?: string) => {
        setLoading(true);
        try {
            const lastUrl = forceUrl || localStorage.getItem('rankypulse_last_url');
            let dbData: any = null;

            let apiUrl = '/api/audits/data?type=issues';
            let hostnameFallback = "";
            if (lastUrl) {
                const hostname = extractAuditDomain(lastUrl);
                if (hostname) {
                    hostnameFallback = hostname;
                    setUrlChecked(hostname);
                    apiUrl += `&domain=${encodeURIComponent(hostname)}`;
                }
            }

            // Only fetch database if we're authenticated / have an endpoint hit
            if (apiUrl) {

                const res = await fetch(apiUrl);
                if (res.ok) {
                    const result = await res.json();
                    if (!Array.isArray(result) && result.data) {
                        dbData = result.data;
                        if (result.hostname) setUrlChecked(result.hostname);
                    }
                }

                if (dbData && dbData.length > 0) {
                    const apiIssues = dbData[0].issues || []; // issues JSONB array

                    const mappedIssues: AuditIssue[] = apiIssues.map((apiIssue: any, index: number) => ({
                        id: apiIssue.id || index.toString(),
                        severity: apiSeverityToIssueSeverity(apiIssue.priority || apiIssue.severity || apiIssue.type),
                        title: apiIssue.title || apiIssue.id || 'Unknown Issue',
                        description: apiIssue.description || apiIssue.suggestedFix || apiIssue.message || apiIssue.title || '',
                        urlsAffected: 1,
                        trend: '0',
                        discovered: new Date(),
                    }));
                    setIssues(mappedIssues);
                    setStats(prev => ({ ...prev, healthScore: Math.round(dbData[0].score || 0) }));
                } else if (lastUrl && auditData && auditData.domain === hostnameFallback) {
                    // Fallback to stateless Zustand store if running a free audit!
                    setUrlChecked(auditData.domain);
                    const mappedIssues: AuditIssue[] = auditData.issues.map((apiIssue: any, index: number) => ({
                        id: apiIssue.id || index.toString(),
                        severity: apiSeverityToIssueSeverity(apiIssue.priority || apiIssue.severity || apiIssue.type),
                        title: apiIssue.title || apiIssue.id || 'Unknown Issue',
                        description: apiIssue.description || apiIssue.suggestedFix || apiIssue.message || apiIssue.title || '',
                        urlsAffected: 1,
                        trend: '1',
                        discovered: new Date(),
                    }));
                    setIssues(mappedIssues);
                    setStats(prev => ({ ...prev, healthScore: Math.round(auditData.score || 0) }));
                } else {
                    setIssues([]);
                    setStats(prev => ({ ...prev, healthScore: 0 }));
                }
            }
        } catch (err) {
            console.error("Failed to fetch audit for crawl issues", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAudit();
    }, []);

    const filteredIssues = issues.filter(issue => {
        const matchesSearch = issue.title?.toLowerCase().includes(search.toLowerCase());
        const matchesTab = activeTab === 'all' || issue.severity === (activeTab.endsWith('s') ? activeTab.slice(0, -1) : activeTab);
        return matchesSearch && matchesTab;
    });

    const categoriesWithCounts = ISSUE_CATEGORIES.map(cat => ({
        ...cat,
        count: issues.filter(i => i.severity === (cat.id.endsWith('s') ? cat.id.slice(0, -1) : cat.id)).length
    }));

    return (
        <main className="min-h-screen bg-[#0d0f14] pt-20 pb-20 px-6">
            {/* Background glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-500/5 blur-[120px] rounded-full" />
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
                            <span className="font-['DM_Mono'] text-xs text-red-400 tracking-wider">
                                CRAWL ISSUES
                            </span>
                        </div>
                        <h1 className="font-['Fraunces'] text-4xl font-bold text-white tracking-tight leading-tight">
                            Crawl Issues
                        </h1>
                        <p className="font-['DM_Sans'] text-gray-400 text-sm mt-2 max-w-2xl">
                            Identify and fix technical SEO errors, warnings, and notices that are preventing search engines from fully crawling and indexing your site.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button className="px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-['DM_Sans'] font-semibold text-sm hover:bg-white/10 transition-all flex items-center gap-2">
                            <Download size={14} />
                            Export CSV
                        </button>
                        <button
                            onClick={() => {
                                if (urlChecked) {
                                    fetchAudit(urlChecked);
                                } else {
                                    router.push('/audits');
                                }
                            }}
                            className="px-4 py-2.5 bg-red-500 text-white rounded-xl font-['DM_Sans'] font-semibold text-sm hover:bg-red-400 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20"
                        >
                            <Play size={14} fill="currentColor" />
                            {urlChecked ? "Re-Crawl Site" : "Run Audit"}
                        </button>
                    </div>
                </motion.div>

                {/* Top Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-5 rounded-2xl bg-[#13161f] border border-white/[0.06] flex flex-col justify-between relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CheckCircle size={64} className="text-emerald-500" />
                        </div>
                        <span className="font-['DM_Mono'] text-xs text-gray-500 tracking-wider mb-2">HEALTH SCORE</span>
                        <div className="flex items-end gap-2">
                            <span className="font-['Fraunces'] text-4xl font-bold text-emerald-400">{stats.healthScore}</span>
                            <span className="text-gray-500 text-sm mb-1">/100</span>
                        </div>
                    </motion.div>

                    {categoriesWithCounts.map((cat, i) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + (i + 1) * 0.05 }}
                            onClick={() => setActiveTab(cat.id as 'errors' | 'warnings' | 'notices')}
                            className={`p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${activeTab === cat.id || activeTab === 'all'
                                ? 'bg-[#13161f] border-white/[0.12] shadow-sm'
                                : 'bg-white/[0.02] border-white/[0.04] opacity-70 hover:opacity-100'
                                }`}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <cat.icon size={64} className={cat.color} />
                            </div>
                            <span className={`font-['DM_Mono'] text-xs tracking-wider mb-2 uppercase ${cat.color}`}>
                                {cat.label}
                            </span>
                            <div className="flex items-end gap-2">
                                <span className="font-['Fraunces'] text-4xl font-bold text-white">{cat.count}</span>
                                <span className="text-gray-500 text-sm mb-1">issues</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Toolbar */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap items-center gap-3 mb-6"
                >
                    {/* Search */}
                    <div className="relative flex-1 min-w-[250px]">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search issues..."
                            className="w-full pl-9 pr-4 py-2.5 bg-[#13161f] border border-white/[0.08] rounded-xl text-sm text-white placeholder-gray-500 font-['DM_Sans'] focus:outline-none focus:border-red-500/40 transition-all"
                        />
                    </div>

                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2.5 rounded-xl font-['DM_Mono'] text-xs tracking-wider transition-all ${activeTab === 'all'
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'bg-transparent text-gray-500 border border-transparent hover:text-gray-300'
                            }`}
                    >
                        ALL ISSUES
                    </button>

                    <button className="px-3 py-2.5 border border-white/[0.08] text-gray-400 rounded-xl hover:bg-white/[0.05] transition-all flex items-center gap-2">
                        <Filter size={14} />
                        <span className="font-['DM_Sans'] text-sm">More Filters</span>
                    </button>
                </motion.div>

                {/* Issues Table */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl border border-white/[0.06] bg-[#13161f] overflow-hidden"
                >
                    {/* Table Header */}
                    <div className="grid grid-cols-12 px-6 py-4 border-b border-white/[0.05] bg-white/[0.01]">
                        <div className="col-span-6 font-['DM_Mono'] text-[10px] text-gray-500 tracking-widest">ISSUE</div>
                        <div className="col-span-2 font-['DM_Mono'] text-[10px] text-gray-500 tracking-widest text-right">URLS AFFECTED</div>
                        <div className="col-span-2 font-['DM_Mono'] text-[10px] text-gray-500 tracking-widest text-right">TREND (7D)</div>
                        <div className="col-span-2 font-['DM_Mono'] text-[10px] text-gray-500 tracking-widest text-right">DISCOVERED</div>
                    </div>

                    {/* List */}
                    <AnimatePresence mode="popLayout">
                        {loading && (
                            <div className="px-6 py-10 text-center text-gray-500">Loading audit data...</div>
                        )}
                        {!loading && !urlChecked && (
                            <div className="px-6 py-10 text-center text-gray-500">Run an audit first to see crawl issues. <button onClick={() => router.push('/audits')} className="text-indigo-400 hover:underline">Go to Site Audit</button></div>
                        )}
                        {!loading && urlChecked && filteredIssues.map((issue) => {
                            const categoryInfo = categoriesWithCounts.find(c => c.id.toLowerCase() === issue.severity + 's');
                            const Icon = categoryInfo?.icon || Info;

                            return (
                                <motion.div
                                    key={issue.id}
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="grid grid-cols-12 items-center px-6 py-5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                >
                                    <div className="col-span-6 flex gap-4 pr-4">
                                        <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-lg ${categoryInfo?.bg} ${categoryInfo?.border} border flex items-center justify-center`}>
                                            <Icon size={16} className={categoryInfo?.color} />
                                        </div>
                                        <div>
                                            <h3 className="font-['DM_Sans'] font-semibold text-[15px] text-gray-200 group-hover:text-white transition-colors flex items-center gap-2">
                                                {issue.title}
                                                <ArrowUpRight size={14} className="text-gray-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                            </h3>
                                            <p className="font-['DM_Sans'] text-[13px] text-gray-500 mt-1 line-clamp-1">
                                                {issue.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="col-span-2 text-right">
                                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] font-['DM_Mono'] text-sm text-gray-300">
                                            {issue.urlsAffected.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="col-span-2 text-right">
                                        <span className={`font-['DM_Mono'] text-[13px] ${issue.trend.startsWith('+') ? 'text-red-400' :
                                            issue.trend.startsWith('-') ? 'text-emerald-400' :
                                                'text-gray-500'
                                            }`}>
                                            {issue.trend.startsWith('-') ? '↓ ' : issue.trend.startsWith('+') ? '↑ ' : ''}
                                            {Math.abs(parseInt(issue.trend))}
                                        </span>
                                    </div>

                                    <div className="col-span-2 text-right">
                                        <div className="flex items-center justify-end gap-1.5 text-gray-500">
                                            <Clock size={12} />
                                            <span className="font-['DM_Mono'] text-[12px]">{timeAgo(issue.discovered)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {!loading && urlChecked && filteredIssues.length === 0 && (
                        <div className="py-20 text-center flex flex-col items-center">
                            <CheckCircle size={32} className="text-gray-700 mb-4" />
                            <p className="font-['DM_Sans'] text-gray-400">No issues found matching your criteria.</p>
                        </div>
                    )}
                </motion.div>

            </div>
        </main>
    );
}
