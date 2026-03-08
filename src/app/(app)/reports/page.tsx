'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  FileText, Search, Plus, ArrowRight,
  Clock, ExternalLink, CheckCircle, AlertTriangle, Zap, Loader2,
} from 'lucide-react';
import { extractAuditDomain, isValidExtractedDomain } from '@/lib/url-validation';

interface Project {
  id: string;
  domain: string;
  status: 'completed' | 'crawling' | 'pending' | 'failed';
  created_at?: string;
  updated_at?: string;
  pages_crawled?: number;
  pages_total?: number;
}

const timeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const STATUS_COLORS: Record<string, string> = {
  completed: '#10b981',
  crawling:  '#f59e0b',
  pending:   '#6b7280',
  failed:    '#ef4444',
};

export default function ReportsPage() {
  const router = useRouter();
  const [projects, setProjects]   = useState<Project[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [tab, setTab]             = useState<'all' | 'completed' | 'crawling'>('all');
  const [newDomain, setNewDomain] = useState('');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.ok ? r.json() : [])
      .then((data: Project[]) => setProjects(data ?? []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return projects
      .filter(p => {
        const matchSearch = p.domain.toLowerCase().includes(search.toLowerCase());
        const matchTab =
          tab === 'all'       ? true :
          tab === 'completed' ? p.status === 'completed' :
          tab === 'crawling'  ? (p.status === 'crawling' || p.status === 'pending') : true;
        return matchSearch && matchTab;
      })
      .sort((a, b) =>
        new Date(b.updated_at || b.created_at || 0).getTime() -
        new Date(a.updated_at || a.created_at || 0).getTime()
      );
  }, [projects, search, tab]);

  const handleNewAudit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('domain') as HTMLInputElement | null;
    const cleaned = extractAuditDomain(input?.value ?? newDomain);
    if (isValidExtractedDomain(cleaned)) {
      router.push(`/audits/issues?domain=${encodeURIComponent(cleaned)}`);
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
              {loading ? 'Loading your projects…' : (
                <>
                  {projects.length} project{projects.length !== 1 ? 's' : ''} ·{' '}
                  {projects.filter(p => p.status === 'completed').length} audits complete
                </>
              )}
            </p>
          </div>

          {/* Start new audit */}
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
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-500 text-white
                    rounded-xl font-['DM_Sans'] font-semibold text-sm
                    hover:bg-indigo-400 transition-colors flex items-center gap-1.5"
                >
                  <Zap size={13} />
                  Start
                </button>
                <button
                  type="button"
                  onClick={() => setShowInput(false)}
                  className="px-3 py-2.5 border border-white/10 text-gray-500
                    rounded-xl text-sm hover:bg-white/5 transition-colors"
                >
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
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            {([
              { key: 'all',       label: 'All' },
              { key: 'completed', label: 'Completed' },
              { key: 'crawling',  label: 'In Progress' },
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

          <div className="relative flex-1 min-w-[180px]">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
            />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by domain..."
              className="w-full pl-8 pr-4 py-2.5 bg-white/[0.04]
                border border-white/[0.08] rounded-xl text-sm text-white
                placeholder-gray-600 font-['DM_Sans']
                focus:outline-none focus:border-indigo-500/40 transition-all"
            />
          </div>
        </motion.div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={24} className="animate-spin text-indigo-400" />
          </div>
        )}

        {/* ── Project Cards ── */}
        {!loading && (
          <div className="grid gap-4">
            <AnimatePresence>
              {filtered.map((project, i) => {
                const isCompleted = project.status === 'completed';
                const isCrawling  = project.status === 'crawling' || project.status === 'pending';
                const isFailed    = project.status === 'failed';
                const statusColor = STATUS_COLORS[project.status] ?? '#6b7280';
                const dateStr     = project.updated_at || project.created_at;

                return (
                  <motion.div
                    key={project.id}
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

                        {/* Left: domain + status */}
                        <div className="flex items-start gap-4 min-w-0">
                          {/* Status icon */}
                          <div
                            className="relative flex-shrink-0 w-14 h-14 rounded-xl
                              flex flex-col items-center justify-center border"
                            style={{
                              background:   `${statusColor}18`,
                              borderColor:  `${statusColor}40`,
                            }}
                          >
                            {isCrawling ? (
                              <Loader2 size={20} className="animate-spin" style={{ color: statusColor }} />
                            ) : isCompleted ? (
                              <CheckCircle size={20} style={{ color: statusColor }} />
                            ) : (
                              <AlertTriangle size={20} style={{ color: statusColor }} />
                            )}
                            <span
                              className="font-['DM_Mono'] text-[8px] tracking-widest mt-1"
                              style={{ color: statusColor }}
                            >
                              {isCompleted ? 'DONE' : isCrawling ? 'LIVE' : 'FAIL'}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h2 className="font-['DM_Sans'] font-semibold text-white text-base
                                group-hover:text-indigo-300 transition-colors">
                                {project.domain}
                              </h2>
                              {dateStr && (
                                <span className="font-['DM_Mono'] text-[10px] text-gray-600 tracking-wider">
                                  <Clock size={9} className="inline mr-1" />
                                  {timeAgo(dateStr)}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 mb-1">
                              {isCompleted && (
                                <span className="flex items-center gap-1 font-['DM_Sans'] text-xs text-emerald-400">
                                  <CheckCircle size={11} />
                                  Audit complete — ready to view
                                </span>
                              )}
                              {isCrawling && (
                                <span className="flex items-center gap-1 font-['DM_Sans'] text-xs text-amber-400">
                                  <Loader2 size={11} className="animate-spin" />
                                  Crawl in progress
                                </span>
                              )}
                              {isFailed && (
                                <span className="flex items-center gap-1 font-['DM_Sans'] text-xs text-red-400">
                                  <AlertTriangle size={11} />
                                  Crawl failed — try again
                                </span>
                              )}
                              {project.pages_crawled != null && project.pages_total != null && (
                                <span className="font-['DM_Sans'] text-xs text-gray-600">
                                  {project.pages_crawled}/{project.pages_total} pages
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: actions */}
                        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                          {isCompleted ? (
                            <button
                              title="Open full report"
                              onClick={() =>
                                router.push(`/audits/issues?domain=${encodeURIComponent(project.domain)}`)
                              }
                              className="flex items-center gap-1.5 px-4 py-2
                                bg-indigo-500/15 border border-indigo-500/30
                                rounded-lg font-['DM_Sans'] text-xs text-indigo-300
                                hover:bg-indigo-500/25 hover:text-white
                                transition-all"
                            >
                              <ExternalLink size={12} />
                              View Report
                            </button>
                          ) : (
                            <button
                              title="Go to audits"
                              onClick={() => router.push('/audits')}
                              className="flex items-center gap-1.5 px-4 py-2
                                bg-white/[0.04] border border-white/[0.08]
                                rounded-lg font-['DM_Sans'] text-xs text-gray-400
                                hover:text-white hover:border-white/[0.15]
                                transition-all"
                            >
                              <ExternalLink size={12} />
                              Go to Audit
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom progress bar */}
                    <div className="h-0.5 w-full bg-white/[0.04]">
                      <div
                        className="h-full transition-all duration-700 rounded-full"
                        style={{
                          width: isCompleted
                            ? '100%'
                            : isCrawling && project.pages_total
                              ? `${Math.min(100, ((project.pages_crawled ?? 0) / project.pages_total) * 100)}%`
                              : '0%',
                          background: statusColor,
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
                  {projects.length === 0
                    ? 'No audits yet. Start your first audit to see reports here.'
                    : 'No reports match your search.'}
                </p>
                {projects.length === 0 && (
                  <button
                    onClick={() => router.push('/audits')}
                    className="mt-2 flex items-center gap-2 px-4 py-2
                      bg-indigo-500/15 border border-indigo-500/30
                      rounded-xl font-['DM_Sans'] text-xs text-indigo-300
                      hover:bg-indigo-500/25 transition-all"
                  >
                    <Plus size={12} />
                    Start your first audit
                  </button>
                )}
              </div>
            )}
          </div>
        )}

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
              PDF export &amp; shareable links coming soon
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
