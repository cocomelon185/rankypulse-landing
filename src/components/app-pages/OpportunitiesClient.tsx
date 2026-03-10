"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, TrendingUp, ArrowUpRight, Search, ChevronDown, ChevronUp,
  Globe, ExternalLink, RefreshCw, AlertCircle, Loader2, Check,
  X, CheckCircle2,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

/** Opportunity from /api/opportunities (persisted, CTR-based) */
interface Opportunity {
  id: string;
  keyword: string;
  current_position: number;
  target_position: number;
  search_volume: number;
  estimated_traffic_gain: number;
  recommended_actions: string[];
  status: "open" | "dismissed" | "completed";
  ranked_url: string | null;
  change: number | null;
  domain: string;
  created_at: string;
}

/** All tracked keywords (for the bottom table) */
interface RankedKeyword {
  id: string;
  keyword: string;
  target_url: string | null;
  device: "desktop" | "mobile";
  country: string;
  volume: number | null;
  cpc: number | null;
  position: number | null;
  change: number | null;
  ranked_url: string | null;
  checked_at: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CARD_BG = "#151B27";
const BORDER = "#1E2940";
const ACCENT = "#FF642D";
const PURPLE = "#7B5CF5";
const TEXT_MUTED = "#64748B";
const TEXT_DIM = "#8B9BB4";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getRankBadgeStyle(position: number): { background: string; color: string } {
  if (position <= 13) return { background: "rgba(255,152,0,0.15)", color: "#FF9800" };
  if (position <= 17) return { background: "rgba(255,100,45,0.15)", color: "#FF642D" };
  return { background: "rgba(100,116,139,0.15)", color: "#64748B" };
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ── Shared Card wrapper ───────────────────────────────────────────────────────

function Card({ children, className, style }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-xl border ${className ?? ""}`}
      style={{ background: CARD_BG, borderColor: BORDER, boxShadow: "0 1px 2px rgba(0,0,0,0.4)", ...style }}
    >
      {children}
    </div>
  );
}

// ── KPI Stat Card ─────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <p className="text-xl font-black text-white tabular-nums">{value}</p>
      <p className="text-xs mt-0.5 font-medium" style={{ color: TEXT_MUTED }}>{label}</p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: "#4A5568" }}>{sub}</p>}
    </Card>
  );
}

// ── Opportunity Card ──────────────────────────────────────────────────────────

function OpportunityCard({
  opp, domain, index, onStatusChange,
}: {
  opp: Opportunity; domain: string; index: number;
  onStatusChange: (id: string, status: "dismissed" | "completed" | "open") => void;
}) {
  const router = useRouter();
  const badgeStyle = getRankBadgeStyle(opp.current_position);
  const isTrending = opp.change !== null && opp.change > 0; // positive change = improvement
  const isDismissed = opp.status === "dismissed";
  const isCompleted = opp.status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDismissed ? 0.4 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
    >
      <Card
        className={`p-5 transition-colors ${isDismissed ? "opacity-40" : "hover:border-[#2A3A55]"}`}
        style={isCompleted ? { borderColor: "rgba(0,200,83,0.25)" } : {}}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`text-sm font-semibold text-white truncate ${isCompleted ? "line-through opacity-60" : ""}`}>
                {opp.keyword}
              </p>
              {isTrending && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                  style={{ background: "rgba(0,200,83,0.12)", color: "#00C853" }}>
                  ↑ Trending
                </span>
              )}
              {isCompleted && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                  style={{ background: "rgba(0,200,83,0.12)", color: "#00C853" }}>
                  ✓ Completed
                </span>
              )}
            </div>
            {opp.ranked_url && (
              <p className="text-[11px] mt-0.5 truncate" style={{ color: TEXT_MUTED }}>
                {opp.ranked_url.replace(/^https?:\/\/(www\.)?/, "")}
              </p>
            )}
          </div>
          <span className="text-sm font-black px-2.5 py-1 rounded-lg shrink-0" style={badgeStyle}>
            #{opp.current_position}
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: TEXT_MUTED }}>Volume</p>
            <p className="text-sm font-bold text-white">
              {formatNumber(opp.search_volume)}
              <span className="text-xs font-normal ml-1" style={{ color: TEXT_MUTED }}>/mo</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: TEXT_MUTED }}>Traffic Gain</p>
            <p className="text-sm font-bold" style={{ color: "#00C853" }}>
              +{formatNumber(opp.estimated_traffic_gain)}
              <span className="text-xs font-normal ml-1" style={{ color: TEXT_MUTED }}>/mo</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: TEXT_MUTED }}>Target</p>
            <p className="text-sm font-bold" style={{ color: PURPLE }}>
              Top #{opp.target_position}
            </p>
          </div>
        </div>

        {/* Recommended actions */}
        {opp.recommended_actions.length > 0 && (
          <div className="rounded-lg px-3 py-2.5 mb-4"
            style={{ background: "rgba(123,92,245,0.06)", border: "1px solid rgba(123,92,245,0.12)" }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: PURPLE }}>
              Recommended
            </p>
            <div className="space-y-1">
              {opp.recommended_actions.slice(0, 3).map((action, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Check size={10} style={{ color: "#00C853", flexShrink: 0 }} />
                  <p className="text-[11px]" style={{ color: "#C8D0E0" }}>{action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/app/audit/${domain}`)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #E8541F)` }}
          >
            <ExternalLink size={12} /> Optimize Page
          </button>
          {!isCompleted && (
            <button
              onClick={() => onStatusChange(opp.id, "completed")}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition hover:bg-green-500/10"
              style={{ color: "#00C853", border: `1px solid ${BORDER}` }}
              title="Mark as completed"
            >
              <CheckCircle2 size={13} />
            </button>
          )}
          {!isDismissed ? (
            <button
              onClick={() => onStatusChange(opp.id, "dismissed")}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition hover:bg-red-500/10"
              style={{ color: TEXT_MUTED, border: `1px solid ${BORDER}` }}
              title="Dismiss"
            >
              <X size={13} />
            </button>
          ) : (
            <button
              onClick={() => onStatusChange(opp.id, "open")}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition"
              style={{ color: PURPLE, border: `1px solid ${BORDER}` }}
              title="Restore"
            >
              Restore
            </button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// ── All Keywords Table ────────────────────────────────────────────────────────

type SortKey = "keyword" | "position" | "volume" | "change";

function AllKeywordsTable({ keywords }: { keywords: RankedKeyword[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("position");
  const [sortAsc, setSortAsc] = useState(true);
  const [search, setSearch] = useState("");

  const filtered = keywords
    .filter((k) => k.keyword.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let diff = 0;
      if (sortKey === "keyword") diff = a.keyword.localeCompare(b.keyword);
      else if (sortKey === "position") diff = (a.position ?? 999) - (b.position ?? 999);
      else if (sortKey === "volume") diff = (b.volume ?? 0) - (a.volume ?? 0);
      else if (sortKey === "change") diff = (b.change ?? 0) - (a.change ?? 0);
      return sortAsc ? diff : -diff;
    });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(key === "position"); }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown size={12} style={{ color: TEXT_MUTED, opacity: 0.4 }} />;
    return sortAsc ? <ChevronUp size={12} style={{ color: ACCENT }} /> : <ChevronDown size={12} style={{ color: ACCENT }} />;
  }

  const getGenericAction = (pos: number | null) => {
    if (!pos) return null;
    if (pos <= 13) return "Strengthen backlinks";
    if (pos <= 17) return "Improve content depth";
    return "Optimize on-page SEO";
  };

  return (
    <Card className="!p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: BORDER }}>
        <h3 className="text-sm font-bold text-white">All Tracked Keywords</h3>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: TEXT_MUTED }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords…"
            className="rounded-lg border pl-7 pr-3 py-1.5 text-xs bg-transparent focus:outline-none"
            style={{ borderColor: BORDER, color: "#C8D0E0", width: 180 }}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#0D1424", borderBottom: `1px solid ${BORDER}` }}>
              {(["keyword", "position", "volume", "change"] as SortKey[]).map((col) => (
                <th key={col}
                  className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest cursor-pointer select-none"
                  style={{ color: sortKey === col ? ACCENT : TEXT_MUTED }}
                  onClick={() => toggleSort(col)}>
                  <span className="flex items-center gap-1">
                    {col === "keyword" ? "Keyword" : col === "position" ? "Position" : col === "volume" ? "Volume" : "Change"}
                    <SortIcon col={col} />
                  </span>
                </th>
              ))}
              <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: TEXT_MUTED }}>
                Opportunity
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((kw, i) => {
              const pos = kw.position;
              const isOpportunity = pos !== null && pos >= 11 && pos <= 20;
              const change = kw.change ?? 0;
              return (
                <tr key={kw.id} className="border-t hover:bg-white/[0.02] transition-colors"
                  style={{ borderColor: BORDER, background: isOpportunity ? "rgba(255,100,45,0.02)" : i % 2 === 0 ? CARD_BG : "#0D1424" }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {isOpportunity && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: "rgba(255,100,45,0.12)", color: ACCENT }}>
                          Opportunity
                        </span>
                      )}
                      <span className="font-medium text-white">{kw.keyword}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {pos !== null ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={getRankBadgeStyle(pos)}>
                        #{pos}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: TEXT_MUTED }}>Not ranking</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ color: "#C8D0E0" }}>
                    {kw.volume != null ? formatNumber(kw.volume) : "—"}
                  </td>
                  <td className="px-5 py-3">
                    {change !== 0 ? (
                      <span className="flex items-center gap-0.5 text-xs font-semibold w-fit"
                        style={{ color: change > 0 ? "#00C853" : "#FF3D3D" }}>
                        {change > 0 ? "▲" : "▼"} {Math.abs(change)}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: TEXT_MUTED }}>—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {isOpportunity && pos !== null ? (
                      <span className="text-[11px]" style={{ color: TEXT_DIM }}>
                        {getGenericAction(pos)}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: TEXT_MUTED }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm" style={{ color: TEXT_MUTED }}>
                  No keywords match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ── Status filter tabs ────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: "open",      label: "Open" },
  { key: "completed", label: "Completed" },
  { key: "dismissed", label: "Dismissed" },
] as const;

// ── Main Component ────────────────────────────────────────────────────────────

export function OpportunitiesClient() {
  const router = useRouter();

  // Opportunities from /api/opportunities (persisted, CTR-based)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  // All keywords from /api/rank/keywords (for the bottom table)
  const [allKeywords, setAllKeywords] = useState<RankedKeyword[]>([]);

  const [allDomains, setAllDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [totalTrafficPotential, setTotalTrafficPotential] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<"open" | "completed" | "dismissed">("open");
  const [saving, setSaving] = useState<string | null>(null);

  // ── Fetch opportunities from the new API ─────────────────────────────────

  const fetchOpportunities = useCallback(async (domain?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = domain
        ? `/api/opportunities?domain=${encodeURIComponent(domain)}&showAll=true`
        : "/api/opportunities?showAll=true";

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load opportunities");
      const data = await res.json();

      setOpportunities(data.opportunities ?? []);
      setAllDomains(data.allDomains ?? []);
      setTotalTrafficPotential(data.totalTrafficPotential ?? 0);

      const activeDomain = domain ?? data.domain ?? "";
      setSelectedDomain(activeDomain);

      // Also fetch all keywords for the bottom table
      if (activeDomain) {
        const kwRes = await fetch(`/api/rank/keywords?domain=${encodeURIComponent(activeDomain)}`);
        if (kwRes.ok) {
          const kwData = await kwRes.json();
          setAllKeywords(kwData.keywords ?? []);
        }
      }
    } catch {
      // If opportunities API fails (e.g. no data yet), try fetching from rank keywords directly
      try {
        const projRes = await fetch("/api/projects");
        if (projRes.ok) {
          const projData = await projRes.json();
          const firstDomain = (projData.domains ?? []).find((d: { status: string }) => d.status === "completed")?.domain;
          if (firstDomain) {
            setSelectedDomain(firstDomain);
            const kwRes = await fetch(`/api/rank/keywords?domain=${encodeURIComponent(firstDomain)}`);
            if (kwRes.ok) {
              const kwData = await kwRes.json();
              setAllKeywords(kwData.keywords ?? []);
            }
          }
        }
      } catch {
        setError("Failed to load opportunity data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOpportunities(); }, [fetchOpportunities]);

  // ── Update opportunity status ─────────────────────────────────────────────

  const handleStatusChange = async (id: string, status: "dismissed" | "completed" | "open") => {
    setSaving(id);
    // Optimistic update
    setOpportunities(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    try {
      await fetch(`/api/opportunities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch {
      // Revert on failure
      fetchOpportunities(selectedDomain);
    } finally {
      setSaving(null);
    }
  };

  // ── Computed stats ────────────────────────────────────────────────────────

  const openOpps = opportunities.filter(o => o.status === "open");
  const filteredOpps = opportunities.filter(o => o.status === statusTab);

  const avgPosition = openOpps.length > 0
    ? Math.round(openOpps.reduce((s, o) => s + o.current_position, 0) / openOpps.length)
    : null;

  const quickestWin = openOpps.reduce<Opportunity | null>(
    (best, o) => (!best || o.current_position < best.current_position ? o : best), null
  );

  // Keywords have no opportunities yet — check if we have rank data at all
  const hasRankData = allKeywords.length > 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(123,92,245,0.12)" }}>
            <Target size={20} style={{ color: PURPLE }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">SEO Opportunities</h1>
            <p className="text-sm" style={{ color: TEXT_MUTED }}>
              Keywords in position 11–20 ready to break onto page 1
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {allDomains.length > 1 && (
            <div className="relative">
              <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: TEXT_MUTED }} />
              <select
                value={selectedDomain}
                onChange={(e) => fetchOpportunities(e.target.value)}
                className="rounded-lg border pl-8 pr-7 py-2 text-sm bg-transparent focus:outline-none appearance-none cursor-pointer"
                style={{ borderColor: BORDER, color: "#C8D0E0", background: CARD_BG }}
              >
                {allDomains.map((d) => (
                  <option key={d} value={d} style={{ background: "#151B27" }}>{d}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: TEXT_MUTED }} />
            </div>
          )}
          <button
            onClick={() => fetchOpportunities(selectedDomain || undefined)}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors disabled:opacity-50"
            style={{ borderColor: BORDER, color: TEXT_DIM }}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Loading ─────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin" style={{ color: ACCENT }} />
        </div>
      )}

      {/* ── Error ───────────────────────────────────────────────────────────── */}
      {!loading && error && (
        <Card className="p-6 flex items-center gap-3" style={{ borderColor: "rgba(239,68,68,0.3)" }}>
          <AlertCircle size={18} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </Card>
      )}

      {/* ── No rank tracking set up ─────────────────────────────────────────── */}
      {!loading && !error && !hasRankData && opportunities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(123,92,245,0.1)" }}>
            <Target size={28} style={{ color: PURPLE }} />
          </div>
          <div className="text-center max-w-md">
            <h3 className="text-lg font-semibold text-white mb-2">SEO Opportunities — your quickest path to page 1</h3>
            <p className="text-sm mb-5" style={{ color: TEXT_MUTED }}>
              Keywords ranked 11–20 are just one push away from page 1. A small content improvement on the right page can double your traffic.
            </p>
            {/* 3-step funnel */}
            <div className="flex items-start gap-0 text-left">
              {[
                { step: "1", title: "Track keywords", desc: "Add keywords with volume ≥ 1,000 to Rank Tracking" },
                { step: "2", title: "Rankings refresh", desc: "Positions update daily — positions 11–20 are flagged" },
                { step: "3", title: "Opportunities appear", desc: "Each card shows traffic estimate + recommended fixes" },
              ].map(({ step, title, desc }, i) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                      style={{ background: "rgba(123,92,245,0.15)", color: PURPLE }}
                    >
                      {step}
                    </div>
                    {i < 2 && <div className="flex-1 h-px" style={{ background: BORDER }} />}
                  </div>
                  <div className="mt-2 pr-2">
                    <p className="text-xs font-semibold text-white">{title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTED }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => router.push("/app/rank-tracking")}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #E8541F)` }}
          >
            Set Up Rank Tracking
          </button>
        </div>
      )}

      {/* ── Main content ────────────────────────────────────────────────────── */}
      {!loading && !error && (opportunities.length > 0 || hasRankData) && (
        <>
          {/* KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Target} label="Opportunities Found" value={String(openOpps.length)}
              sub="keywords in position 11–20" color={PURPLE} />
            <StatCard icon={TrendingUp} label="Avg Position"
              value={avgPosition !== null ? `#${avgPosition}` : "—"}
              sub="open opportunities" color="#FF9800" />
            <StatCard icon={ArrowUpRight} label="Traffic Potential"
              value={totalTrafficPotential > 0 ? `+${formatNumber(totalTrafficPotential)}` : "—"}
              sub="est. monthly visits if on page 1" color="#00C853" />
            <StatCard icon={Search} label="Quickest Win"
              value={quickestWin ? `#${quickestWin.current_position}` : "—"}
              sub={quickestWin?.keyword ?? "no data"} color={ACCENT} />
          </div>

          {/* Status tabs */}
          {opportunities.length > 0 && (
            <div className="flex items-center gap-1.5">
              {STATUS_TABS.map(tab => {
                const count = opportunities.filter(o => o.status === tab.key).length;
                return (
                  <button key={tab.key}
                    onClick={() => setStatusTab(tab.key)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                    style={{
                      background: statusTab === tab.key ? "rgba(123,92,245,0.15)" : "rgba(255,255,255,0.03)",
                      color: statusTab === tab.key ? PURPLE : TEXT_MUTED,
                      border: `1px solid ${statusTab === tab.key ? "rgba(123,92,245,0.3)" : BORDER}`,
                    }}>
                    {tab.label} {count > 0 ? `(${count})` : ""}
                  </button>
                );
              })}
            </div>
          )}

          {/* Opportunity Cards */}
          {opportunities.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white">
                  {filteredOpps.length} {statusTab} keyword{filteredOpps.length !== 1 ? "s" : ""}
                  {statusTab === "open" ? " within reach of page 1" : ""}
                </h2>
                {statusTab === "open" && (
                  <p className="text-xs" style={{ color: TEXT_MUTED }}>Sorted by traffic potential</p>
                )}
              </div>

              {filteredOpps.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {[...filteredOpps]
                      .sort((a, b) => b.estimated_traffic_gain - a.estimated_traffic_gain)
                      .map((opp, i) => (
                        <OpportunityCard
                          key={opp.id}
                          opp={opp}
                          domain={selectedDomain}
                          index={i}
                          onStatusChange={(id, status) => {
                            if (!saving) handleStatusChange(id, status);
                          }}
                        />
                      ))}
                  </AnimatePresence>
                </div>
              ) : (
                <Card className="p-8 flex flex-col items-center text-center gap-3">
                  <p className="text-sm font-semibold text-white">No {statusTab} opportunities</p>
                  <p className="text-xs" style={{ color: TEXT_MUTED }}>
                    {statusTab === "open"
                      ? "All opportunities have been completed or dismissed."
                      : `No ${statusTab} opportunities found.`}
                  </p>
                </Card>
              )}
            </div>
          )}

          {/* No opportunities from API but have keywords — show guidance */}
          {opportunities.length === 0 && hasRankData && (
            <Card className="p-8 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,200,83,0.1)" }}>
                <TrendingUp size={20} className="text-green-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">No page-2 opportunities found yet</h3>
              <p className="text-xs max-w-sm" style={{ color: TEXT_MUTED }}>
                This could be good news — your tracked keywords may already be on page 1, or they need more data.
                Opportunities are auto-detected after each daily ranking refresh.
                Try adding more keywords with volume ≥ 1,000 to uncover new opportunities.
              </p>
              <button
                onClick={() => router.push("/app/keyword-research")}
                className="mt-1 px-4 py-2 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${PURPLE}, #5B4CC4)` }}
              >
                Discover More Keywords
              </button>
            </Card>
          )}

          {/* All Keywords Table (from rank/keywords — shows full picture) */}
          {hasRankData && (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <AllKeywordsTable keywords={allKeywords} />
              </motion.div>
            </AnimatePresence>
          )}
        </>
      )}
    </div>
  );
}
