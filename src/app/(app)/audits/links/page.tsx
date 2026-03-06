'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Link as LinkIcon,
    Search,
    GitMerge,
    AlertTriangle,
    CheckCircle,
    Info,
    Download,
    Loader2,
    Globe,
} from 'lucide-react';

interface LinksData {
    domain?: string | null;
    totalInternal: number;
    crawled: number;
    broken: number;
    orphan: number;
    topPages: { url: string; status: string }[];
}

export default function InternalLinkingPage() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [linksData, setLinksData] = useState<LinksData | null>(null);
    const [loading, setLoading] = useState(true);
    const [domain, setDomain] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const d = localStorage.getItem('rankypulse_audit_domain') ?? localStorage.getItem('rankypulse_last_url') ?? '';
        const clean = d.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase().trim();
        setDomain(clean || null);

        if (!clean) { setLoading(false); return; }

        fetch(`/api/audits/links-data?domain=${encodeURIComponent(clean)}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setLinksData(data); })
            .catch(err => console.error('Failed to fetch links data', err))
            .finally(() => setLoading(false));
    }, []);

    const filteredPages = (linksData?.topPages ?? []).filter(p =>
        p.url.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <main className="min-h-screen bg-[#0d0f14] pt-20 pb-20 px-6 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="animate-spin text-indigo-400" />
                    <p className="font-['DM_Sans'] text-sm text-gray-400">Loading link data…</p>
                </div>
            </main>
        );
    }

    if (!domain) {
        return (
            <main className="min-h-screen bg-[#0d0f14] pt-20 pb-20 px-6 flex items-center justify-center">
                <div className="text-center">
                    <p className="font-['DM_Sans'] text-gray-400 mb-3">No domain selected.</p>
                    <button onClick={() => router.push('/app/audit')} className="text-indigo-400 hover:underline font-['DM_Sans'] text-sm">
                        Go to Site Audit to select a domain →
                    </button>
                </div>
            </main>
        );
    }

    if (!linksData || linksData.totalInternal === 0) {
        return (
            <main className="min-h-screen bg-[#0d0f14] pt-20 pb-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-2 mb-6">
                        <button onClick={() => router.push('/audits')} className="font-['DM_Mono'] text-xs text-gray-600 hover:text-gray-400 transition-colors tracking-wider">← SITE AUDIT</button>
                        <span className="text-gray-700">/</span>
                        <span className="font-['DM_Mono'] text-xs text-indigo-400 tracking-wider flex items-center gap-1"><LinkIcon size={12} fill="currentColor" /> INTERNAL LINKING</span>
                    </div>
                    <div className="rounded-2xl border border-white/[0.06] bg-[#13161f] p-12 flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                            <Globe size={28} className="text-indigo-400" />
                        </div>
                        <h2 className="font-['Fraunces'] text-2xl font-bold text-white">No link data yet</h2>
                        <p className="font-['DM_Sans'] text-sm text-gray-400 max-w-md">
                            Run a crawl for <strong className="text-white">{domain}</strong> to see internal link data.
                        </p>
                        <button
                            onClick={() => router.push(`/app/audit/${domain}`)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white rounded-xl font-['DM_Sans'] font-semibold text-sm hover:bg-indigo-400 transition-all"
                        >
                            Run Audit
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    const { totalInternal, crawled, broken, topPages } = linksData;

    return (
        <main className="min-h-screen bg-[#0d0f14] pt-20 pb-20 px-6">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full" />
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
                            <span className="font-['DM_Mono'] text-xs text-indigo-400 tracking-wider flex items-center gap-1">
                                <LinkIcon size={12} fill="currentColor" /> INTERNAL LINKING
                            </span>
                        </div>
                        <h1 className="font-['Fraunces'] text-4xl font-bold text-white tracking-tight leading-tight">
                            Internal Linking
                        </h1>
                        <p className="font-['DM_Sans'] text-gray-400 text-sm mt-2">
                            Link structure for <strong className="text-white">{domain}</strong>
                        </p>
                    </div>
                    <button className="px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-['DM_Sans'] font-semibold text-sm hover:bg-white/10 transition-all flex items-center gap-2">
                        <Download size={14} /> Export Links
                    </button>
                </motion.div>

                {/* Top Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-5 rounded-2xl bg-[#13161f] border border-white/[0.06] flex flex-col justify-between"
                    >
                        <span className="font-['DM_Mono'] text-xs text-gray-500 tracking-wider mb-2">DISCOVERED URLS</span>
                        <span className="font-['Fraunces'] text-4xl font-bold text-white mb-2">{totalInternal.toLocaleString()}</span>
                        <div className="flex gap-4 font-['DM_Mono'] text-[10px] text-gray-500">
                            <div className="flex items-center gap-1 text-emerald-400"><GitMerge size={12} /> {crawled.toLocaleString()} Crawled</div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className={`p-5 rounded-2xl bg-[#13161f] border flex flex-col justify-between relative overflow-hidden group ${broken > 0 ? 'border-red-500/30' : 'border-white/[0.06]'}`}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                            {broken > 0 ? <AlertTriangle size={64} className="text-red-500" /> : <CheckCircle size={64} className="text-emerald-500" />}
                        </div>
                        <span className={`font-['DM_Mono'] text-xs tracking-wider mb-2 ${broken > 0 ? 'text-red-400' : 'text-emerald-400'}`}>PAGES WITH BROKEN LINKS</span>
                        <div className="flex items-end gap-2">
                            <span className={`font-['Fraunces'] text-4xl font-bold text-white ${broken > 0 ? 'group-hover:text-red-400' : 'group-hover:text-emerald-400'} transition-colors`}>{broken}</span>
                            <span className="text-gray-500 text-sm mb-1">pages</span>
                        </div>
                        <span className="font-['DM_Sans'] text-xs text-gray-500 mt-2">
                            {broken === 0 ? 'No broken links detected' : 'Pages containing broken outbound links'}
                        </span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-5 rounded-2xl bg-[#13161f] border border-white/[0.06] flex flex-col justify-between"
                    >
                        <span className="font-['DM_Mono'] text-xs text-gray-500 tracking-wider mb-2">CRAWL COVERAGE</span>
                        <span className="font-['Fraunces'] text-4xl font-bold text-white mb-2">
                            {totalInternal > 0 ? Math.round((crawled / totalInternal) * 100) : 0}%
                        </span>
                        <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden mt-1">
                            <div
                                style={{ width: `${totalInternal > 0 ? Math.round((crawled / totalInternal) * 100) : 0}%` }}
                                className="h-full bg-indigo-500 rounded-full transition-all"
                            />
                        </div>
                        <span className="font-['DM_Sans'] text-xs text-gray-500 mt-2">{crawled} of {totalInternal} URLs crawled</span>
                    </motion.div>
                </div>

                {/* Search */}
                {topPages.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap items-center gap-3 mb-6"
                    >
                        <div className="relative flex-1 min-w-[300px]">
                            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search discovered URLs…"
                                className="w-full pl-9 pr-4 py-2.5 bg-[#13161f] border border-white/[0.08] rounded-xl text-sm text-white placeholder-gray-500 font-['DM_Sans'] focus:outline-none focus:border-indigo-500/40 transition-all"
                            />
                        </div>
                    </motion.div>
                )}

                {/* URLs Table */}
                {topPages.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="rounded-2xl border border-white/[0.06] bg-[#13161f] overflow-hidden"
                    >
                        {/* Table Header */}
                        <div className="grid grid-cols-12 px-6 py-4 border-b border-white/[0.05] bg-white/[0.01]">
                            <div className="col-span-9 font-['DM_Mono'] text-[10px] text-gray-500 tracking-widest">DISCOVERED URL</div>
                            <div className="col-span-3 font-['DM_Mono'] text-[10px] text-gray-500 tracking-widest text-right">STATUS</div>
                        </div>

                        {/* List */}
                        <div>
                            {filteredPages.slice(0, 50).map((page, i) => (
                                <div
                                    key={page.url + i}
                                    className="grid grid-cols-12 items-center px-6 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors text-sm font-['DM_Sans'] group"
                                >
                                    <div className="col-span-9 pr-4">
                                        <div className="text-gray-300 truncate group-hover:text-indigo-300 transition-colors text-xs font-['DM_Mono']">
                                            {page.url}
                                        </div>
                                    </div>
                                    <div className="col-span-3 text-right">
                                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded font-['DM_Mono'] text-[10px] uppercase tracking-wider ${
                                            page.status === 'done'
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                : page.status === 'processing'
                                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                    : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                        }`}>
                                            {page.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredPages.length === 0 && (
                            <div className="py-20 text-center flex flex-col items-center">
                                <Info size={32} className="text-gray-700 mb-4" />
                                <p className="font-['DM_Sans'] text-gray-400">No URLs found matching your search.</p>
                            </div>
                        )}

                        {topPages.length >= 50 && filteredPages.length >= 50 && (
                            <div className="px-6 py-3 border-t border-white/[0.05] text-center">
                                <p className="font-['DM_Sans'] text-xs text-gray-500">Showing first 50 of {totalInternal} discovered URLs</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </main>
    );
}
