'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { useAuditContext } from '@/lib/audit-context';
import { useAuditStore } from '@/lib/use-audit';

const ISSUE_CATEGORIES = [
    { id: 'errors', label: 'Errors', count: 0, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertCircle },
    { id: 'warnings', label: 'Warnings', count: 0, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertTriangle },
    { id: 'notices', label: 'Notices', count: 0, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Info },
];

const timeAgo = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
};

const apiSeverityToIssueSeverity = (sev: string): 'error' | 'warning' | 'notice' => {
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

const priorityToSeverity = (priority: string): 'error' | 'warning' | 'notice' => {
    if (priority === 'critical' || priority === 'high') return 'error';
    if (priority === 'medium') return 'warning';
    return 'notice';
};

interface AuditIssue {
    id: string;
    severity: 'error' | 'warning' | 'notice';
    title: string;
    description: string;
    urlsAffected: number;
    affectedUrls?: string[];
    trend: string;
    discovered: Date | string;
}

export default function CrawlIssuesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Active audit context — tells us whether this visit is for a free or full audit
    const activeAuditId = useAuditContext((s) => s.auditId);
    const activeDomain  = useAuditContext((s) => s.domain);

    // Free audit data from Zustand (used when activeAuditId === "local")
    const zustandData   = useAuditStore((s) => s.data);
    const adjustedScore = useAuditStore((s) => s.adjustedScore);

    // Pre-select tab from ?severity= query param (e.g. from AuditHero click)
    const severityParam = searchParams?.get('severity');
    const initialTab = (
        severityParam && ['errors', 'warnings', 'notices'].includes(severityParam)
            ? severityParam
            : 'all'
    ) as 'all' | 'errors' | 'warnings' | 'notices';

    const [activeTab, setActiveTab] = useState<'all' | 'errors' | 'warnings' | 'notices'>(initialTab);
    const [search, setSearch] = useState('');
    const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

    // Keep tab in sync if URL param changes (e.g. browser back/forward)
    useEffect(() => {
        const sp = searchParams?.get('severity');
        if (sp && ['errors', 'warnings', 'notices'].includes(sp)) {
            setActiveTab(sp as 'errors' | 'warnings' | 'notices');
        }
    }, [searchParams]);

    const [loading, setLoading] = useState(true);
    const [issues, setIssues] = useState<AuditIssue[]>([]);
    const [stats, setStats] = useState({ healthScore: 0, crawledPages: 0, healthyPages: 0, brokenPages: 0, redirects: 0, blocked: 0 });

    // Authenticated Supabase path
    const [domain, setDomain] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [crawledAt, setCrawledAt] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Unauthenticated fallback path
    const [urlChecked, setUrlChecked] = useState<string | null>(null);

    const fetchAudit = async (forceUrl?: string) => {
        setLoading(true);
        try {
            // ── Path 0a: Free audit — read from Zustand, skip Supabase entirely ─
            if (activeAuditId === 'local') {
                const mapped = zustandData.issues
                    .filter(i => i.status !== 'fixed')
                    .map(issue => ({
                        id: issue.id,
                        severity: priorityToSeverity(issue.priority),
                        title: issue.title,
                        description: issue.description,
                        urlsAffected: issue.affectedPages?.length ?? 1,
                        trend: '0',
                        discovered: new Date(),
                    }));
                setIssues(mapped);
                setStats(prev => ({ ...prev, healthScore: adjustedScore() }));
                setDomain(activeDomain);
                setLoading(false);
                return; // Never call /api/audits/data
            }

            // ── Path 0b: Full audit by UUID — delegate to [auditId] route ───────
            if (activeAuditId && activeAuditId !== 'local') {
                const sp = severityParam ? `?severity=${severityParam}` : '';
                router.replace(`/audits/${activeAuditId}/issues${sp}`);
                return;
            }

            // ── Path 1: Authenticated Supabase data (no active local audit) ──────
            // Read domain from localStorage so we show data for the currently viewed domain
            const storedDomain = localStorage.getItem('rankypulse_audit_domain') ?? localStorage.getItem('rankypulse_last_url') ?? '';
            const cleanStoredDomain = storedDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase().trim();
            const domainQuery = cleanStoredDomain ? `?domain=${encodeURIComponent(cleanStoredDomain)}` : '';
            const authRes = await fetch(`/api/audits/data${domainQuery}`);
            if (authRes.ok) {
                const data = await authRes.json();
                setIsAuthenticated(true);
                setIssues(
                    (data.issues ?? []).map((issue: AuditIssue) => ({
                        ...issue,
                        // discovered is an ISO string from the API
                        discovered: issue.discovered,
                    }))
                );
                setStats(prev => ({
                    ...prev,
                    healthScore: data.healthScore ?? 0,
                    crawledPages: data.totalPages ?? 0,
                }));
                setDomain(data.domain ?? null);
                setTotalPages(data.totalPages ?? 0);
                setCrawledAt(data.crawledAt ?? null);
                return; // Done — skip unauthenticated path
            }

            // ── Path 2: Unauthenticated fallback (localStorage + /api/audit) ────
            setIsAuthenticated(false);
            const lastUrl = forceUrl || localStorage.getItem('rankypulse_last_url');
            if (!lastUrl) {
                setLoading(false);
                return;
            }
            setUrlChecked(lastUrl);
            const res = await fetch('/api/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: lastUrl }),
            });
            const json = await res.json();
            if (json.ok && json.data) {
                const apiIssues = json.data.issues || [];
                const mappedIssues: AuditIssue[] = apiIssues.map(
                    (apiIssue: { id?: string; severity: string; title?: string; suggestedFix?: string; msg?: string }, index: number) => ({
                        id: apiIssue.id || index.toString(),
                        severity: apiSeverityToIssueSeverity(apiIssue.severity),
                        title: apiIssue.title || apiIssue.id || 'Unknown Issue',
                        description: apiIssue.suggestedFix || apiIssue.msg || apiIssue.title || '',
                        urlsAffected: 1,
                        trend: '0',
                        discovered: new Date(),
                    })
                );
                setIssues(mappedIssues);
                setStats(prev => ({ ...prev, healthScore: Math.round(json.data.scores?.seo || 0) }));
            }
        } catch (err) {
            console.error("Failed to fetch audit for crawl issues", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Label shown in breadcrumb / header
    const domainLabel = domain ?? urlChecked ?? null;

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
                            {domainLabel && (
                                <>
                                    <span className="text-gray-700">/</span>
                                    <span className="font-['DM_Mono'] text-xs text-gray-500 tracking-wider">
                                        {domainLabel}
                                    </span>
                                </>
                            )}
                        </div>
                        <h1 className="font-['Fraunces'] text-4xl font-bold text-white tracking-tight leading-tight">
                            Crawl Issues
                        </h1>
                        <p className="font-['DM_Sans'] text-gray-400 text-sm mt-2 max-w-2xl">
                            Identify and fix technical SEO errors, warnings, and notices that are preventing search engines from fully crawling and indexing your site.
                            {totalPages > 0 && (
                                <span className="ml-2 text-gray-500">
                                    — {totalPages.toLocaleString()} pages crawled
                                    {crawledAt && ` · ${timeAgo(crawledAt)}`}
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button className="px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-['DM_Sans'] font-semibold text-sm hover:bg-white/10 transition-all flex items-center gap-2">
                            <Download size={14} />
                            Export CSV
                        </button>
                        <button
                            onClick={() => {
                                if (isAuthenticated) {
                                    fetchAudit(); // Re-fetch from Supabase
                                } else if (urlChecked) {
                                    fetchAudit(urlChecked);
                                } else {
                                    router.push('/audits');
                                }
                            }}
                            className="px-4 py-2.5 bg-red-500 text-white rounded-xl font-['DM_Sans'] font-semibold text-sm hover:bg-red-400 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20"
                        >
                            <Play size={14} fill="currentColor" />
                            {isAuthenticated ? "Refresh Data" : urlChecked ? "Re-Crawl Site" : "Run Audit"}
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
                            <div className="px-6 py-10 text-center text-gray-500 font-['DM_Sans']">Loading audit data...</div>
                        )}

                        {/* Authenticated but no crawl data → guide them to run a full crawl */}
                        {!loading && isAuthenticated && issues.length === 0 && (
                            <div className="py-20 text-center flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                                    <Search size={28} className="text-gray-600" />
                                </div>
                                <p className="font-['DM_Sans'] text-gray-300 font-semibold text-lg">No crawl data found</p>
                                <p className="font-['DM_Sans'] text-gray-500 text-sm max-w-sm">
                                    Run a full site audit to discover all crawl issues, broken links, and SEO errors across your entire site.
                                </p>
                                <button
                                    onClick={() => router.push('/audits/full')}
                                    className="mt-2 px-5 py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-xl font-['DM_Sans'] font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-red-500/20"
                                >
                                    <Play size={14} fill="currentColor" />
                                    Run Full Site Audit
                                </button>
                            </div>
                        )}

                        {/* Unauthenticated with no URL → send to audit page */}
                        {!loading && !isAuthenticated && !urlChecked && (
                            <div className="px-6 py-10 text-center text-gray-500 font-['DM_Sans']">
                                Run an audit first to see crawl issues.{' '}
                                <button onClick={() => router.push('/audits')} className="text-indigo-400 hover:underline">Go to Site Audit</button>
                            </div>
                        )}

                        {/* Results exist but search/filter shows nothing */}
                        {!loading && issues.length > 0 && filteredIssues.length === 0 && (
                            <div className="py-20 text-center flex flex-col items-center">
                                <CheckCircle size={32} className="text-gray-700 mb-4" />
                                <p className="font-['DM_Sans'] text-gray-400">No issues found matching your criteria.</p>
                            </div>
                        )}
                        {!loading && filteredIssues.map((issue) => {
                            const categoryInfo = categoriesWithCounts.find(c => c.id.toLowerCase() === issue.severity + 's');
                            const Icon = categoryInfo?.icon || Info;
                            const isExpanded = expandedIssue === issue.id;

                            return (
                                <div key={issue.id}>
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}
                                        className="grid grid-cols-12 items-center px-6 py-5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group cursor-pointer"
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

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: "auto" }}
                                                exit={{ height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 py-4 border-b border-white/[0.04] bg-white/[0.01]">
                                                    <p className="font-['DM_Sans'] text-[13px] text-gray-300 mb-3">{issue.description}</p>
                                                    {issue.affectedUrls && issue.affectedUrls.length > 0 && (
                                                        <div>
                                                            <p className="font-['DM_Mono'] text-[10px] text-gray-500 tracking-widest uppercase mb-2">
                                                                Affected Pages
                                                            </p>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {issue.affectedUrls.map((url) => {
                                                                    const path = url.replace(/^https?:\/\/[^/]+/, '') || '/';
                                                                    return (
                                                                        <span key={url} className="px-2 py-0.5 rounded font-['DM_Mono'] text-[11px] text-gray-400 bg-white/[0.04] border border-white/[0.08] truncate max-w-[300px]">
                                                                            {path}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>

            </div>
        </main>
    );
}
