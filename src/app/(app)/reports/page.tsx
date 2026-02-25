'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  FileText, Download, Share2, Search, Plus, ArrowRight,
  Clock, ExternalLink, CheckCircle, AlertTriangle, Zap,
} from 'lucide-react';
import { extractAuditDomain, isValidExtractedDomain } from '@/lib/url-validation';

const MOCK_REPORTS = [
  {
    id: 'r1',
    domain: 'stripe.com',
    generatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    score: 88,
    criticalIssues: 0,
    warnings: 2,
    passed: 19,
    highlights: ['All meta tags present', 'Core Web Vitals: Good', 'Structured data valid'],
    status: 'ready' as const,
  },
  {
    id: 'r2',
    domain: 'notion.so',
    generatedAt: new Date(Date.now() - 28 * 60 * 60 * 1000),
    score: 71,
    criticalIssues: 2,
    warnings: 3,
    passed: 16,
    highlights: ['Canonical mismatch on 4 pages', 'Missing OG images', 'LCP within range'],
    status: 'ready' as const,
  },
  {
    id: 'r3',
    domain: 'myshop.io',
    generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    score: 45,
    criticalIssues: 5,
    warnings: 4,
    passed: 8,
    highlights: ['No meta descriptions (14 pages)', 'Missing H1 tags', 'Robots.txt blocking crawlers'],
    status: 'ready' as const,
  },
  {
    id: 'r4',
    domain: 'linear.app',
    generatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    score: 94,
    criticalIssues: 0,
    warnings: 0,
    passed: 21,
    highlights: ['Perfect score on all checks', 'Schema markup excellent', 'Mobile optimised'],
    status: 'ready' as const,
  },
  {
    id: 'r5',
    domain: 'techblog.dev',
    generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    score: 62,
    criticalIssues: 1,
    warnings: 3,
    passed: 14,
    highlights: ['Slow LCP (3.8s)', 'Missing canonical tags', 'Open Graph incomplete'],
    status: 'ready' as const,
  },
];

const getScoreColor = (score: number) => {
  if (score >= 85) return { text: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', label: 'Excellent' };
  if (score >= 70) return { text: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', label: 'Good' };
  if (score >= 50) return { text: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.25)', label: 'Fair' };
  return             { text: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  label: 'Poor' };
};

const timeAgo = (date: Date) => {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export default function ReportsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'critical' | 'clean'>('all');
  const [newDomain, setNewDomain] = useState('');
  const [showInput, setShowInput] = useState(false);

  const filtered = useMemo(() => {
    return MOCK_REPORTS
      .filter(r => {
        const matchSearch = r.domain.includes(search.toLowerCase());
        const matchTab =
          tab === 'all'      ? true :
          tab === 'critical' ? r.criticalIssues > 0 :
          tab === 'clean'    ? r.criticalIssues === 0 : true;
        return matchSearch && matchTab;
      })
      .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  }, [search, tab]);

  const handleNewReport = (e: React.FormEvent<HTMLFormElement>) => {
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

        {/* ── Header ── */}
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
                REPORTS
              </span>
            </div>
            <h1 className="font-['Fraunces'] text-4xl font-bold text-white
              tracking-tight leading-tight">
              Audit Reports
            </h1>
            <p className="font-['DM_Sans'] text-gray-400 text-sm mt-1">
              {MOCK_REPORTS.length} reports generated ·{' '}
              {MOCK_REPORTS.filter(r => r.criticalIssues > 0).length} have critical issues
            </p>
          </div>

          {/* Generate new report */}
          <div>
            {!showInput ? (
              <button
                onClick={() => setShowInput(true)}
                className="flex items-center gap-2 px-5 py-2.5
                  bg-indigo-500 text-white rounded-xl
                  font-['DM_Sans'] font-semibold text-sm
                  hover:bg-indigo-400 hover:-translate-y-0.5
                  hover:shadow-lg hover:shadow-indigo-500/25
                  transition-all"
              >
                <Plus size={15} />
                New Report
              </button>
            ) : (
              <motion.form
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onSubmit={handleNewReport}
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
                  Generate
                </button>
                <button type="button"
                  onClick={() => setShowInput(false)}
                  className="px-3 py-2.5 border border-white/10 text-gray-500
                    rounded-xl text-sm hover:bg-white/5 transition-colors">
                  ✕
                </button>
              </motion.form>
            )}
          </div>
        </motion.div>

        {/* ── Tabs + Search ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex flex-wrap items-center gap-3 mb-6"
        >
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            {([
              { key: 'all',      label: 'All Reports' },
              { key: 'critical', label: 'Has Issues' },
              { key: 'clean',    label: 'Clean' },
            ] as const).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-1.5 rounded-lg font-['DM_Sans'] text-xs
                  font-medium transition-all
                  ${tab === t.key
                    ? 'bg-indigo-500/20 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-8 pr-4 py-2.5 bg-white/[0.04]
                border border-white/[0.08] rounded-xl text-sm text-white
                placeholder-gray-600 font-['DM_Sans']
                focus:outline-none focus:border-indigo-500/40 transition-all"
            />
          </div>
        </motion.div>

        {/* ── Report Cards ── */}
        <div className="grid gap-4">
          <AnimatePresence>
            {filtered.map((report, i) => {
              const score = getScoreColor(report.score);
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                  className="group rounded-2xl border border-white/[0.06]
                    bg-[#13161f] hover:border-white/[0.12]
                    hover:shadow-xl hover:shadow-black/30
                    transition-all duration-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">

                      {/* Left: domain + meta */}
                      <div className="flex items-start gap-4 min-w-0">
                        {/* Score ring */}
                        <div
                          className="relative flex-shrink-0 w-14 h-14 rounded-xl
                            flex flex-col items-center justify-center border"
                          style={{ background: score.bg, borderColor: score.border }}
                        >
                          <span className="font-['Fraunces'] text-lg font-bold leading-none"
                            style={{ color: score.text }}>
                            {report.score}
                          </span>
                          <span className="font-['DM_Mono'] text-[8px] tracking-widest mt-0.5"
                            style={{ color: score.text }}>
                            {score.label.toUpperCase()}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h2 className="font-['DM_Sans'] font-semibold text-white text-base
                              group-hover:text-indigo-300 transition-colors">
                              {report.domain}
                            </h2>
                            <span className="font-['DM_Mono'] text-[10px] text-gray-600
                              tracking-wider">
                              <Clock size={9} className="inline mr-1" />
                              {timeAgo(report.generatedAt)}
                            </span>
                          </div>

                          {/* Issue counts */}
                          <div className="flex items-center gap-3 mb-3">
                            {report.criticalIssues > 0 ? (
                              <span className="flex items-center gap-1
                                font-['DM_Sans'] text-xs text-red-400">
                                <AlertTriangle size={11} />
                                {report.criticalIssues} critical
                              </span>
                            ) : (
                              <span className="flex items-center gap-1
                                font-['DM_Sans'] text-xs text-emerald-400">
                                <CheckCircle size={11} />
                                No critical issues
                              </span>
                            )}
                            {report.warnings > 0 && (
                              <span className="font-['DM_Sans'] text-xs text-amber-500">
                                {report.warnings} warnings
                              </span>
                            )}
                            <span className="font-['DM_Sans'] text-xs text-gray-600">
                              {report.passed} passed
                            </span>
                          </div>

                          {/* Highlights */}
                          <ul className="space-y-0.5">
                            {report.highlights.map((h, j) => (
                              <li key={j}
                                className="font-['DM_Sans'] text-xs text-gray-500
                                  flex items-start gap-1.5">
                                <span className="mt-1 w-1 h-1 rounded-full flex-shrink-0"
                                  style={{ background: j === 0 && report.criticalIssues > 0 ? '#ef4444' : '#374151' }} />
                                {h}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Right: actions */}
                      <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                        <button
                          title="Download PDF"
                          className="flex items-center gap-1.5 px-3 py-2
                            bg-white/[0.04] border border-white/[0.08]
                            rounded-lg font-['DM_Sans'] text-xs text-gray-400
                            hover:text-white hover:border-white/[0.15]
                            transition-all"
                          onClick={e => e.stopPropagation()}
                        >
                          <Download size={12} />
                          PDF
                        </button>
                        <button
                          title="Share report"
                          className="flex items-center gap-1.5 px-3 py-2
                            bg-white/[0.04] border border-white/[0.08]
                            rounded-lg font-['DM_Sans'] text-xs text-gray-400
                            hover:text-white hover:border-white/[0.15]
                            transition-all"
                          onClick={e => e.stopPropagation()}
                        >
                          <Share2 size={12} />
                          Share
                        </button>
                        <button
                          title="Open full report"
                          onClick={() => router.push(`/report/${report.domain}`)}
                          className="flex items-center gap-1.5 px-4 py-2
                            bg-indigo-500/15 border border-indigo-500/30
                            rounded-lg font-['DM_Sans'] text-xs text-indigo-300
                            hover:bg-indigo-500/25 hover:text-white
                            transition-all"
                        >
                          <ExternalLink size={12} />
                          View Report
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom bar: progress */}
                  <div className="h-0.5 w-full bg-white/[0.04]">
                    <div
                      className="h-full transition-all duration-700 rounded-full"
                      style={{
                        width: `${report.score}%`,
                        background: score.text,
                        opacity: 0.5,
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FileText size={28} className="text-gray-700 mb-4" />
              <p className="font-['DM_Sans'] text-gray-500 text-sm mb-2">
                No reports found
              </p>
              <button
                onClick={() => setShowInput(true)}
                className="mt-2 flex items-center gap-2 px-4 py-2
                  bg-indigo-500/15 border border-indigo-500/30
                  rounded-xl font-['DM_Sans'] text-xs text-indigo-300
                  hover:bg-indigo-500/25 transition-all"
              >
                <Plus size={12} />
                Generate your first report
              </button>
            </div>
          )}
        </div>

        {/* ── Upgrade CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 p-6 rounded-2xl border border-white/[0.06]
            bg-white/[0.02] flex items-center justify-between gap-6 flex-wrap"
        >
          <div>
            <h3 className="font-['Fraunces'] text-lg font-bold text-white mb-1">
              PDF export & shareable links coming soon
            </h3>
            <p className="font-['DM_Sans'] text-gray-400 text-sm">
              Generate white-label reports and send them to clients in one click.
            </p>
          </div>
          <button
            onClick={() => router.push('/pricing')}
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5
              bg-indigo-500 text-white rounded-xl
              font-['DM_Sans'] font-semibold text-sm
              hover:bg-indigo-400 hover:-translate-y-0.5
              hover:shadow-lg hover:shadow-indigo-500/25
              transition-all"
          >
            See Plans
            <ArrowRight size={14} />
          </button>
        </motion.div>

      </div>
    </main>
  );
}
