'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Search, Globe, ChevronRight, Star, ShieldCheck, Zap } from 'lucide-react';
import { track } from '@/lib/analytics';
import { extractAuditDomain, isValidExtractedDomain } from '@/lib/url-validation';

export default function FullAuditPage() {
    const router = useRouter();
    const [url, setUrl] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const domainCandidate = extractAuditDomain(url);
        if (!domainCandidate || !isValidExtractedDomain(domainCandidate)) {
            setError('Please enter a valid domain (e.g., yoursite.com)');
            return;
        }

        // Track and save to localStorage
        track('run_full_audit', { url_host: domainCandidate });
        try {
            localStorage.setItem('rankypulse_last_url', domainCandidate);
            localStorage.setItem('rankypulse_autorun_audit', '1');
            // Add a flag to indicate we want a full audit modal to open
            localStorage.setItem('rankypulse_trigger_full', '1');
        } catch { }

        // Start by routing to the report page where the premium full audit lives
        router.push(`/report/${encodeURIComponent(domainCandidate)}`);
    };

    return (
        <main className="min-h-screen bg-[#0d0f14] pt-24 pb-20 px-6 relative overflow-hidden">
            {/* Background glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative max-w-2xl mx-auto flex flex-col items-center justify-center text-center mt-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-['DM_Mono'] text-xs mb-6 tracking-wide">
                        <Star size={12} className="fill-current" />
                        PREMIUM FEATURE
                    </div>

                    <h1 className="font-['Fraunces'] text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
                        Deep-Scan Full Site Audit
                    </h1>
                    <p className="font-['DM_Sans'] text-gray-400 text-base mb-10 max-w-lg mx-auto">
                        Crawl up to 10,000 pages, uncover deep technical issues, validate Core Web Vitals across every URL, and generate a comprehensive SEO action plan.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full"
                >
                    <form onSubmit={handleSubmit} className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative flex items-center bg-[#13161f] border border-white/10 rounded-2xl overflow-hidden p-2">
                            <div className="pl-4 pr-3 text-gray-500">
                                <Globe size={24} />
                            </div>
                            <input
                                autoFocus
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Enter domain (e.g., example.com) to begin..."
                                className="flex-1 bg-transparent px-2 py-4 text-base md:text-lg text-white placeholder-gray-600 focus:outline-none font-['DM_Sans']"
                            />
                            <button
                                type="submit"
                                className="ml-2 flex flex-shrink-0 items-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white rounded-xl font-['DM_Sans'] font-bold text-base shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98]"
                            >
                                Start Crawl
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </form>
                    {error && (
                        <p className="mt-4 text-sm text-red-400 font-['DM_Sans']">{error}</p>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left"
                >
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                        <Search size={20} className="text-orange-400 mb-3" />
                        <h3 className="text-white font-bold text-sm mb-1 font-['DM_Sans']">Comprehensive Crawl</h3>
                        <p className="text-gray-500 text-xs font-['DM_Sans']">Crawls entire site structure to find deeply buried orphan pages and broken links.</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                        <Zap size={20} className="text-orange-400 mb-3" />
                        <h3 className="text-white font-bold text-sm mb-1 font-['DM_Sans']">Core Web Vitals</h3>
                        <p className="text-gray-500 text-xs font-['DM_Sans']">Runs Google Lighthouse metrics on all key templates across your site.</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                        <ShieldCheck size={20} className="text-orange-400 mb-3" />
                        <h3 className="text-white font-bold text-sm mb-1 font-['DM_Sans']">Export & Save</h3>
                        <p className="text-gray-500 text-xs font-['DM_Sans']">Results are saved permanently to your dashboard for historical tracking.</p>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
