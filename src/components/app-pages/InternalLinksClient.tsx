"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LinkOpportunityTable } from "@/components/audit/v2/LinkOpportunityTable";
import { AnchorAnalysis } from "@/components/audit/v2/AnchorAnalysis";
import {
  Network,
  AlertTriangle,
  Link2,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  Globe,
  ExternalLink,
  Download,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PageNode {
  url: string;
  inboundCount: number;
  outboundCount: number;
  depth: number;
  issues: string[];
  suggestedLinks: string[];
}

interface LinkOpportunity {
  sourcePage: string;
  targetPage: string;
  reason: string;
}

interface AnchorEntry {
  text: string;
  count: number;
  targetPage: string;
}

interface Overview {
  totalInternalLinks: number;
  avgLinksPerPage: number;
  orphanPages: string[];
  heavyPages: string[];
  brokenLinkPages: number;
}

interface AnchorSummary {
  totalAnchors: number;
  uniqueAnchors: number;
  topAnchors: AnchorEntry[];
}

interface InternalLinksData {
  domain: string;
  allDomains: string[];
  overview: Overview;
  pages: PageNode[];
  linkOpportunities: LinkOpportunity[];
  anchorSummary: AnchorSummary;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CARD_BG = "#151B27";
const BORDER = "#1E2940";
const ACCENT = "#FF642D";
const TEXT_MUTED = "#64748B";
const TEXT_DIM = "#8B9BB4";

// ── Small helpers ─────────────────────────────────────────────────────────────

function shortUrl(url: string, max = 55): string {
  try {
    const u = new URL(url);
    const path = u.pathname + u.search;
    const full = u.hostname + (path === "/" ? "" : path);
    return full.length > max ? full.slice(0, max) + "…" : full;
  } catch {
    return url.length > max ? url.slice(0, max) + "…" : url;
  }
}

function pathOnly(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname === "/" ? "/" : u.pathname;
  } catch {
    return url;
  }
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sublabel,
  accent,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-4 border flex flex-col gap-1"
      style={{ background: CARD_BG, borderColor: BORDER }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
        {label}
      </p>
      <p
        className="text-2xl font-bold leading-none"
        style={{ color: accent ? ACCENT : "#E2E8F0" }}
      >
        {value}
      </p>
      {sublabel && (
        <p className="text-[11px]" style={{ color: TEXT_MUTED }}>
          {sublabel}
        </p>
      )}
    </div>
  );
}

// ── Tab button ────────────────────────────────────────────────────────────────

function TabBtn({
  label,
  active,
  onClick,
  badge,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
      style={
        active
          ? { background: "rgba(255,100,45,0.12)", color: ACCENT }
          : { color: TEXT_DIM }
      }
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
          style={
            active
              ? { background: "rgba(255,100,45,0.2)", color: ACCENT }
              : { background: BORDER, color: TEXT_MUTED }
          }
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy URL"
      className="p-1 rounded transition-colors hover:opacity-80"
      style={{ color: copied ? "#22C55E" : TEXT_MUTED }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Network size={36} style={{ color: TEXT_MUTED, opacity: 0.4 }} />
      <p className="text-sm" style={{ color: TEXT_MUTED }}>
        {message}
      </p>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({
  overview,
  domain,
}: {
  overview: Overview;
  domain: string;
}) {
  const [showOrphans, setShowOrphans] = useState(false);
  const [showHeavy, setShowHeavy] = useState(false);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          label="Total Internal Links"
          value={overview.totalInternalLinks.toLocaleString()}
          sublabel="across all pages"
        />
        <StatCard
          label="Avg Links / Page"
          value={overview.avgLinksPerPage}
          sublabel="internal links per page"
        />
        <StatCard
          label="Orphan Pages"
          value={overview.orphanPages.length}
          sublabel="not linked internally"
          accent={overview.orphanPages.length > 0}
        />
        <StatCard
          label="Heavy Pages"
          value={overview.heavyPages.length}
          sublabel="more than 80 links"
          accent={overview.heavyPages.length > 0}
        />
        <StatCard
          label="Broken Link Pages"
          value={overview.brokenLinkPages}
          sublabel="pages with broken links"
          accent={overview.brokenLinkPages > 0}
        />
      </div>

      {/* Orphan pages list */}
      {overview.orphanPages.length > 0 && (
        <div
          className="rounded-xl border"
          style={{ background: CARD_BG, borderColor: BORDER }}
        >
          <button
            onClick={() => setShowOrphans((v) => !v)}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-400" />
              <span className="text-sm font-semibold text-white">
                Orphan Pages ({overview.orphanPages.length})
              </span>
              <span className="text-xs text-amber-400/80">
                — not linked from anywhere on {domain}
              </span>
            </div>
            {showOrphans ? (
              <ChevronUp size={15} style={{ color: TEXT_MUTED }} />
            ) : (
              <ChevronDown size={15} style={{ color: TEXT_MUTED }} />
            )}
          </button>
          <AnimatePresence>
            {showOrphans && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div
                  className="border-t px-4 pb-4 pt-3 space-y-2"
                  style={{ borderColor: BORDER }}
                >
                  {overview.orphanPages.slice(0, 20).map((url) => (
                    <div key={url} className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: "#0D1424", color: "#94A3B8" }}
                      >
                        {pathOnly(url)}
                      </span>
                      <CopyBtn text={url} />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-50 hover:opacity-100"
                        style={{ color: TEXT_MUTED }}
                      >
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  ))}
                  {overview.orphanPages.length > 20 && (
                    <p className="text-xs" style={{ color: TEXT_MUTED }}>
                      +{overview.orphanPages.length - 20} more orphan pages
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Heavy pages list */}
      {overview.heavyPages.length > 0 && (
        <div
          className="rounded-xl border"
          style={{ background: CARD_BG, borderColor: BORDER }}
        >
          <button
            onClick={() => setShowHeavy((v) => !v)}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-400" />
              <span className="text-sm font-semibold text-white">
                Overlinked Pages ({overview.heavyPages.length})
              </span>
              <span className="text-xs text-red-400/80">— more than 80 internal links</span>
            </div>
            {showHeavy ? (
              <ChevronUp size={15} style={{ color: TEXT_MUTED }} />
            ) : (
              <ChevronDown size={15} style={{ color: TEXT_MUTED }} />
            )}
          </button>
          <AnimatePresence>
            {showHeavy && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div
                  className="border-t px-4 pb-4 pt-3 space-y-2"
                  style={{ borderColor: BORDER }}
                >
                  {overview.heavyPages.slice(0, 20).map((url) => (
                    <div key={url} className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: "#0D1424", color: "#94A3B8" }}
                      >
                        {pathOnly(url)}
                      </span>
                      <CopyBtn text={url} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* All-good state */}
      {overview.orphanPages.length === 0 && overview.heavyPages.length === 0 && (
        <div
          className="rounded-xl border p-6 flex items-center gap-3"
          style={{ background: CARD_BG, borderColor: BORDER }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(34,197,94,0.15)" }}
          >
            <Check size={16} className="text-green-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">No critical link issues found</p>
            <p className="text-xs" style={{ color: TEXT_MUTED }}>
              All crawled pages are linked internally and none are overloaded.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pages Tab ─────────────────────────────────────────────────────────────────

type SortKey = "inboundCount" | "outboundCount" | "depth";

function PagesTab({
  pages,
  orphanUrls,
  heavyUrls,
}: {
  pages: PageNode[];
  orphanUrls: Set<string>;
  heavyUrls: Set<string>;
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("inboundCount");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);
  const PER_PAGE = 15;

  const filtered = pages
    .filter((p) => p.url.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const diff = (a[sortKey] as number) - (b[sortKey] as number);
      return sortAsc ? diff : -diff;
    });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const slice = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(false); }
    setPage(0);
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown size={12} style={{ color: TEXT_MUTED, opacity: 0.4 }} />;
    return sortAsc
      ? <ChevronUp size={12} style={{ color: ACCENT }} />
      : <ChevronDown size={12} style={{ color: ACCENT }} />;
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: TEXT_MUTED }} />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          placeholder="Filter by URL…"
          className="w-full rounded-lg border pl-9 pr-4 py-2 text-sm bg-transparent focus:outline-none focus:border-[#FF642D]/50"
          style={{ borderColor: BORDER, color: "#C8D0E0" }}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: BORDER }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#0D1424", borderBottom: `1px solid ${BORDER}` }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                  Page URL
                </th>
                {(["inboundCount", "outboundCount", "depth"] as SortKey[]).map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
                    style={{ color: sortKey === col ? ACCENT : TEXT_MUTED }}
                    onClick={() => toggleSort(col)}
                  >
                    <span className="flex items-center justify-end gap-1">
                      {col === "inboundCount" ? "Inbound" : col === "outboundCount" ? "Outbound" : "Depth"}
                      <SortIcon col={col} />
                    </span>
                  </th>
                ))}
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                  Issues
                </th>
              </tr>
            </thead>
            <tbody>
              {slice.map((p, i) => {
                const isOrphan = orphanUrls.has(p.url);
                const isHeavy = heavyUrls.has(p.url);
                return (
                  <tr
                    key={p.url}
                    style={{
                      background: isOrphan
                        ? "rgba(245,158,11,0.04)"
                        : isHeavy
                        ? "rgba(239,68,68,0.04)"
                        : i % 2 === 0
                        ? CARD_BG
                        : "#0D1424",
                      borderBottom: `1px solid ${BORDER}`,
                    }}
                  >
                    <td className="px-4 py-3 max-w-[320px]">
                      <div className="flex items-center gap-2">
                        {isOrphan && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 whitespace-nowrap">
                            Orphan
                          </span>
                        )}
                        {isHeavy && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 whitespace-nowrap">
                            Heavy
                          </span>
                        )}
                        <span
                          className="font-mono text-xs truncate"
                          style={{ color: "#94A3B8" }}
                          title={p.url}
                        >
                          {shortUrl(p.url)}
                        </span>
                        <CopyBtn text={p.url} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs" style={{ color: "#C8D0E0" }}>
                      {p.inboundCount}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs" style={{ color: "#C8D0E0" }}>
                      {p.outboundCount}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs" style={{ color: "#C8D0E0" }}>
                      {p.depth}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.issues.slice(0, 3).map((issue) => (
                          <span
                            key={issue}
                            className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{ background: "rgba(239,68,68,0.12)", color: "#F87171" }}
                          >
                            {issue.replace(/_/g, " ")}
                          </span>
                        ))}
                        {p.issues.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: BORDER, color: TEXT_MUTED }}>
                            +{p.issues.length - 3}
                          </span>
                        )}
                        {p.issues.length === 0 && (
                          <span className="text-[10px]" style={{ color: TEXT_MUTED }}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3 border-t"
            style={{ borderColor: BORDER, background: "#0D1424" }}
          >
            <p className="text-xs" style={{ color: TEXT_MUTED }}>
              Showing {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((v) => Math.max(0, v - 1))}
                disabled={page === 0}
                className="text-xs px-3 py-1.5 rounded border transition-colors disabled:opacity-40"
                style={{ borderColor: BORDER, color: "#C8D0E0" }}
              >
                Previous
              </button>
              <button
                onClick={() => setPage((v) => Math.min(totalPages - 1, v + 1))}
                disabled={page >= totalPages - 1}
                className="text-xs px-3 py-1.5 rounded border transition-colors disabled:opacity-40"
                style={{ borderColor: BORDER, color: "#C8D0E0" }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {slice.length === 0 && (
          <EmptyState message="No pages match your search." />
        )}
      </div>
    </div>
  );
}

// ── Opportunities Tab ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function OpportunitiesTab({ opportunities }: { opportunities: LinkOpportunity[] }) {
  return <LinkOpportunityTable />;
}

// ── Anchors Tab ───────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function AnchorsTab({ anchorSummary }: { anchorSummary: AnchorSummary }) {
  return <AnchorAnalysis />;
}

// ── No-data state ─────────────────────────────────────────────────────────────

function NoCrawlState({ allDomains }: { allDomains: string[] }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(255,100,45,0.1)" }}
      >
        <Network size={28} style={{ color: ACCENT }} />
      </div>
      <div className="text-center max-w-sm">
        <h3 className="text-lg font-semibold text-white mb-2">No crawl data yet</h3>
        <p className="text-sm" style={{ color: TEXT_MUTED }}>
          {allDomains.length === 0
            ? "Run a site audit first — go to Site Audit and start a crawl for your domain."
            : "The crawl for your domains is still in progress or has no page data yet."}
        </p>
      </div>
      <a
        href="/app/audit"
        className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
        style={{ background: `linear-gradient(135deg, ${ACCENT}, #E8541F)` }}
      >
        Go to Site Audit
      </a>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type TabId = "overview" | "pages" | "opportunities" | "anchors";

export function InternalLinksClient() {
  const [data, setData] = useState<InternalLinksData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [selectedDomain, setSelectedDomain] = useState<string>("");

  const fetchData = useCallback(
    async (domain?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const url = domain
          ? `/api/internal-links?domain=${encodeURIComponent(domain)}`
          : "/api/internal-links";
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load internal links data");
        const json = (await res.json()) as InternalLinksData;
        setData(json);
        if (json.domain && !selectedDomain) setSelectedDomain(json.domain);
      } catch {
        setError("Failed to load internal links data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDomain]
  );

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDomainChange(domain: string) {
    setSelectedDomain(domain);
    fetchData(domain);
  }

  // Derived sets for Pages tab
  const orphanUrls = new Set(data?.overview?.orphanPages ?? []);
  const heavyUrls = new Set(data?.overview?.heavyPages ?? []);

  // CSV export for the Pages tab
  function exportPagesCsv() {
    if (!data?.pages?.length) return;
    const headers = ["URL", "Inbound Links", "Outbound Links", "Depth", "Issues"];
    const rows = data.pages.map((p) => [
      p.url,
      p.inboundCount,
      p.outboundCount,
      p.depth,
      p.issues.join("; ") || "",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `internal-links-${data.domain}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const tabs: { id: TabId; label: string; badge?: number }[] = [
    { id: "overview", label: "Overview" },
    {
      id: "pages",
      label: "All Pages",
      badge: data?.pages?.length,
    },
    {
      id: "opportunities",
      label: "Link Opportunities",
      badge: data?.linkOpportunities?.length,
    },
    { id: "anchors", label: "Anchor Analysis" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,100,45,0.1)" }}
          >
            <Network size={20} style={{ color: ACCENT }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Internal Links</h1>
            <p className="text-sm" style={{ color: TEXT_MUTED }}>
              Analyse and optimise your site's internal link structure
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Domain selector */}
          {data && data.allDomains.length > 1 && (
            <div className="relative">
              <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: TEXT_MUTED }} />
              <select
                value={selectedDomain}
                onChange={(e) => handleDomainChange(e.target.value)}
                className="rounded-lg border pl-8 pr-8 py-2 text-sm bg-transparent focus:outline-none appearance-none cursor-pointer"
                style={{ borderColor: BORDER, color: "#C8D0E0", background: CARD_BG }}
              >
                {data.allDomains.map((d) => (
                  <option key={d} value={d} style={{ background: "#151B27" }}>
                    {d}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: TEXT_MUTED }} />
            </div>
          )}

          {/* Export CSV — only show when on Pages tab and data is loaded */}
          {!isLoading && data?.pages?.length && activeTab === "pages" && (
            <button
              onClick={exportPagesCsv}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors hover:opacity-80"
              style={{ borderColor: BORDER, color: TEXT_DIM }}
            >
              <Download size={14} />
              Export CSV
            </button>
          )}

          {/* Refresh */}
          <button
            onClick={() => fetchData(selectedDomain || undefined)}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors disabled:opacity-50"
            style={{ borderColor: BORDER, color: TEXT_DIM }}
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border h-24 animate-pulse"
                style={{ background: CARD_BG, borderColor: BORDER }}
              />
            ))}
          </div>
          <div
            className="rounded-xl border h-64 animate-pulse"
            style={{ background: CARD_BG, borderColor: BORDER }}
          />
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div
          className="rounded-xl border p-6 flex items-center gap-3"
          style={{ background: CARD_BG, borderColor: "rgba(239,68,68,0.3)" }}
        >
          <AlertTriangle size={18} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* No crawl data */}
      {!isLoading && !error && data && !data.overview && (
        <NoCrawlState allDomains={data.allDomains} />
      )}

      {/* Main content */}
      {!isLoading && !error && data?.overview && (
        <>
          {/* Domain badge */}
          {data.domain && (
            <div className="flex items-center gap-2">
              <Link2 size={13} style={{ color: TEXT_MUTED }} />
              <span className="text-sm font-mono" style={{ color: TEXT_DIM }}>
                {data.domain}
              </span>
            </div>
          )}

          {/* Tabs */}
          <div
            className="flex gap-1 p-1 rounded-xl border overflow-x-auto"
            style={{ background: CARD_BG, borderColor: BORDER }}
          >
            {tabs.map((tab) => (
              <TabBtn
                key={tab.id}
                label={tab.label}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                badge={tab.badge}
              />
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === "overview" && (
                <OverviewTab overview={data.overview} domain={data.domain} />
              )}
              {activeTab === "pages" && (
                <PagesTab
                  pages={data.pages}
                  orphanUrls={orphanUrls}
                  heavyUrls={heavyUrls}
                />
              )}
              {activeTab === "opportunities" && (
                <OpportunitiesTab opportunities={data.linkOpportunities} />
              )}
              {activeTab === "anchors" && (
                <AnchorsTab anchorSummary={data.anchorSummary} />
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
