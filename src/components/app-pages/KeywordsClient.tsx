"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  TrendingUp,
  Plus,
  Loader2,
  Filter,
  BarChart2,
  DollarSign,
  Zap,
  Globe,
  ChevronDown,
  CheckSquare,
  Square,
  ArrowRight,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Suggestion {
  keyword: string;
  volume: number | null;
  cpc: number | null;
  competition: number | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const CARD_BG = "#151B27";
const BORDER = "#1E2940";
const ACCENT = "#FF642D";
const TEXT_MUTED = "#64748B";
const TEXT_DIM = "#8B9BB4";

const COUNTRIES = [
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
  { code: "IN", label: "India" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
];

type VolumeFilter = "all" | "1k" | "5k" | "10k";
type SortKey = "volume" | "cpc" | "competition";

function competitionLabel(c: number | null): { label: string; color: string } {
  if (c === null) return { label: "—", color: TEXT_MUTED };
  if (c < 0.33) return { label: "Low", color: "#22C55E" };
  if (c < 0.66) return { label: "Medium", color: "#F59E0B" };
  return { label: "High", color: "#EF4444" };
}

function formatVolume(v: number | null): string {
  if (v === null) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}

// ── Tracking state per keyword ────────────────────────────────────────────────
function TrackButton({
  keyword,
  domain,
  country,
}: {
  keyword: string;
  domain: string;
  country: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function track() {
    setState("loading");
    try {
      const res = await fetch("/api/rank/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, keyword, country }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <span className="text-[11px] font-bold text-green-400 flex items-center gap-1">
        <TrendingUp size={11} /> Tracking
      </span>
    );
  }

  return (
    <button
      onClick={track}
      disabled={state === "loading"}
      className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition hover:opacity-80 disabled:opacity-50"
      style={{ background: "rgba(255,100,45,0.12)", color: ACCENT }}
    >
      {state === "loading" ? (
        <Loader2 size={10} className="animate-spin" />
      ) : (
        <Plus size={10} />
      )}
      {state === "error" ? "Retry" : "Track Ranking"}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function KeywordsClient() {
  const [domain, setDomain] = useState("");
  const [seed, setSeed] = useState("");
  const [country, setCountry] = useState("US");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Filters & sort
  const [volumeFilter, setVolumeFilter] = useState<VolumeFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("volume");

  // Multi-select for batch tracking
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchState, setBatchState] = useState<"idle" | "running" | "done">("idle");
  const [batchProgress, setBatchProgress] = useState(0);
  const batchRef = useRef(false);

  // Load domain from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("rankypulse_last_url") ?? "";
    const cleaned = raw
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .toLowerCase()
      .trim();
    setDomain(cleaned || "");
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!seed.trim() || !domain) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setSelected(new Set());
    setBatchState("idle");

    // First try to load from cache (GET)
    try {
      const cacheRes = await fetch(
        `/api/keywords/research?domain=${encodeURIComponent(domain)}&seed=${encodeURIComponent(seed.trim())}`
      );
      if (cacheRes.ok) {
        const { suggestions: cached } = await cacheRes.json();
        if (cached && cached.length > 0) {
          setSuggestions(cached);
          setFromCache(true);
          setLoading(false);
          return;
        }
      }
    } catch {
      // ignore — fall through to fresh fetch
    }

    // Fresh fetch from DataForSEO
    try {
      const res = await fetch("/api/keywords/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, seed: seed.trim(), country }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to fetch keyword suggestions");
        setSuggestions([]);
      } else {
        setSuggestions(data.suggestions ?? []);
        setFromCache(false);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function trackSelected() {
    const keywords = Array.from(selected);
    if (!keywords.length || batchState === "running") return;
    batchRef.current = true;
    setBatchState("running");
    setBatchProgress(0);

    for (let i = 0; i < keywords.length; i++) {
      if (!batchRef.current) break;
      await fetch("/api/rank/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, keyword: keywords[i], country }),
      });
      setBatchProgress(i + 1);
    }

    setBatchState("done");
    setSelected(new Set());
  }

  function toggleSelect(kw: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(kw)) next.delete(kw);
      else next.add(kw);
      return next;
    });
  }

  // Filter & sort
  const filtered = suggestions
    .filter((s) => {
      if (volumeFilter === "all") return true;
      if (volumeFilter === "1k") return (s.volume ?? 0) >= 1_000;
      if (volumeFilter === "5k") return (s.volume ?? 0) >= 5_000;
      if (volumeFilter === "10k") return (s.volume ?? 0) >= 10_000;
      return true;
    })
    .sort((a, b) => {
      if (sortKey === "volume") return (b.volume ?? 0) - (a.volume ?? 0);
      if (sortKey === "cpc") return (b.cpc ?? 0) - (a.cpc ?? 0);
      if (sortKey === "competition") return (b.competition ?? 0) - (a.competition ?? 0);
      return 0;
    });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Keyword Research</h1>
        <p className="text-sm mt-1" style={{ color: TEXT_MUTED }}>
          Discover keyword opportunities, search volumes, and competition data.
        </p>
      </div>

      {/* Search form */}
      <div
        className="rounded-2xl border p-5"
        style={{ background: CARD_BG, borderColor: BORDER }}
      >
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          {/* Domain display */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-mono min-w-0"
            style={{ background: "#0D1424", borderColor: BORDER, color: "#8B9BB4" }}
          >
            <Globe size={13} style={{ color: TEXT_MUTED, flexShrink: 0 }} />
            <span className="truncate">{domain || "no domain"}</span>
          </div>

          {/* Seed keyword */}
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: TEXT_MUTED }} />
            <input
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="Enter a seed keyword (e.g. seo audit)"
              required
              className="w-full rounded-lg border pl-9 pr-4 py-2.5 text-sm bg-transparent focus:outline-none focus:border-orange-500/50 text-white placeholder-gray-600"
              style={{ borderColor: BORDER }}
            />
          </div>

          {/* Country */}
          <div className="relative">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="rounded-lg border px-3 py-2.5 text-sm appearance-none bg-transparent text-white pr-8 focus:outline-none focus:border-orange-500/50"
              style={{ background: "#0D1424", borderColor: BORDER }}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code} style={{ background: "#151B27" }}>
                  {c.code}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: TEXT_MUTED }} />
          </div>

          <button
            type="submit"
            disabled={loading || !seed.trim() || !domain}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition disabled:opacity-50 whitespace-nowrap"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #E8541F)` }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Research
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-xl border p-4 text-sm text-red-400"
          style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)" }}
        >
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && hasSearched && !error && (
        <AnimatePresence mode="wait">
          <motion.div
            key={seed + country}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Stats + filters bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">
                  {filtered.length}{suggestions.length !== filtered.length ? ` / ${suggestions.length}` : ""} keywords found
                </p>
                {fromCache && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(99,102,241,0.12)", color: "#818CF8" }}
                  >
                    Cached
                  </span>
                )}
                <span className="hidden sm:inline text-[11px]" style={{ color: TEXT_MUTED }}>
                  — click &quot;Track Ranking&quot; to monitor positions daily
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Volume filter */}
                <div className="flex items-center gap-1 rounded-lg p-0.5 border" style={{ borderColor: BORDER }}>
                  {(["all", "1k", "5k", "10k"] as VolumeFilter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setVolumeFilter(f)}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-md transition"
                      style={{
                        background: volumeFilter === f ? "rgba(255,100,45,0.15)" : "transparent",
                        color: volumeFilter === f ? ACCENT : TEXT_DIM,
                      }}
                    >
                      {f === "all" ? "All" : `${f}+`}
                    </button>
                  ))}
                </div>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as SortKey)}
                    className="rounded-lg border pl-3 pr-7 py-1.5 text-[11px] appearance-none bg-transparent focus:outline-none"
                    style={{ borderColor: BORDER, color: TEXT_DIM, background: CARD_BG }}
                  >
                    <option value="volume" style={{ background: "#151B27" }}>Sort: Volume</option>
                    <option value="cpc" style={{ background: "#151B27" }}>Sort: CPC</option>
                    <option value="competition" style={{ background: "#151B27" }}>Sort: Competition</option>
                  </select>
                  <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: TEXT_MUTED }} />
                </div>
              </div>
            </div>

            {/* Batch action bar */}
            <AnimatePresence>
              {selected.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl"
                  style={{ background: "rgba(255,100,45,0.1)", border: "1px solid rgba(255,100,45,0.25)" }}
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare size={16} style={{ color: ACCENT }} />
                    <span className="text-sm font-semibold text-white">
                      {selected.size} keyword{selected.size !== 1 ? "s" : ""} selected
                    </span>
                    {batchState === "running" && (
                      <span className="text-xs" style={{ color: TEXT_MUTED }}>
                        — adding {batchProgress}/{selected.size + batchProgress}…
                      </span>
                    )}
                    {batchState === "done" && (
                      <span className="text-xs text-green-400">— all added to rank tracking!</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelected(new Set())}
                      className="text-xs px-2 py-1 rounded-lg transition hover:opacity-80"
                      style={{ color: TEXT_MUTED }}
                    >
                      Clear
                    </button>
                    <button
                      onClick={trackSelected}
                      disabled={batchState === "running"}
                      className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-lg text-white transition disabled:opacity-60"
                      style={{ background: `linear-gradient(135deg, ${ACCENT}, #E8541F)` }}
                    >
                      {batchState === "running" ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <ArrowRight size={13} />
                      )}
                      Track Selected ({selected.size})
                    </button>
                    {batchState === "done" && (
                      <a
                        href="/app/position-tracking"
                        className="text-xs font-semibold underline"
                        style={{ color: ACCENT }}
                      >
                        View Rank Tracking →
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Table */}
            {filtered.length === 0 ? (
              <div
                className="rounded-xl border p-12 text-center"
                style={{ background: CARD_BG, borderColor: BORDER }}
              >
                <Filter size={32} className="mx-auto mb-3 opacity-30" style={{ color: TEXT_MUTED }} />
                <p className="text-sm" style={{ color: TEXT_MUTED }}>
                  {suggestions.length === 0
                    ? "No keyword suggestions found. Try a different seed keyword."
                    : "No keywords match the current volume filter."}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: BORDER }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "#0D1424", borderBottom: `1px solid ${BORDER}` }}>
                      <th className="px-4 py-3 w-8">
                        <button
                          onClick={() => {
                            if (selected.size === filtered.length) {
                              setSelected(new Set());
                            } else {
                              setSelected(new Set(filtered.map((s) => s.keyword)));
                            }
                          }}
                          className="text-gray-500 hover:text-white transition"
                          title={selected.size === filtered.length ? "Deselect all" : "Select all"}
                        >
                          {selected.size === filtered.length && filtered.length > 0
                            ? <CheckSquare size={14} style={{ color: ACCENT }} />
                            : <Square size={14} />
                          }
                        </button>
                      </th>
                      <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                        Keyword
                      </th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT_MUTED }}>
                        <span className="flex items-center justify-end gap-1">
                          <BarChart2 size={10} /> Volume
                        </span>
                      </th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                        <span className="flex items-center justify-end gap-1">
                          <DollarSign size={10} /> CPC
                        </span>
                      </th>
                      <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                        <span className="flex items-center justify-center gap-1">
                          <Zap size={10} /> Difficulty
                        </span>
                      </th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, i) => {
                      const comp = competitionLabel(s.competition);
                      return (
                        <motion.tr
                          key={s.keyword}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: Math.min(i * 0.03, 0.5) }}
                          className="border-b hover:bg-white/[0.02] transition cursor-pointer"
                          style={{
                            borderColor: BORDER,
                            background: selected.has(s.keyword)
                              ? "rgba(255,100,45,0.05)"
                              : i % 2 === 0 ? CARD_BG : "#0D1424",
                          }}
                          onClick={() => toggleSelect(s.keyword)}
                        >
                          <td className="px-4 py-3 w-8" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => toggleSelect(s.keyword)} className="transition">
                              {selected.has(s.keyword)
                                ? <CheckSquare size={14} style={{ color: ACCENT }} />
                                : <Square size={14} className="text-gray-600" />
                              }
                            </button>
                          </td>
                          <td className="px-4 py-3 font-medium text-white">
                            {s.keyword}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-white">
                            {formatVolume(s.volume)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs" style={{ color: TEXT_DIM }}>
                            {s.cpc != null ? `$${s.cpc.toFixed(2)}` : "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className="text-[11px] font-bold px-2 py-0.5 rounded"
                              style={{
                                background: `${comp.color}18`,
                                color: comp.color,
                              }}
                            >
                              {comp.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <TrackButton keyword={s.keyword} domain={domain} country={country} />
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Initial empty state */}
      {!hasSearched && !loading && (
        <div
          className="rounded-2xl border p-12 flex flex-col items-center gap-6"
          style={{ background: CARD_BG, borderColor: BORDER }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,100,45,0.1)" }}
          >
            <Search size={24} style={{ color: ACCENT }} />
          </div>
          <div className="text-center max-w-sm">
            <h3 className="text-base font-bold text-white mb-1">Discover keyword opportunities</h3>
            <p className="text-sm" style={{ color: TEXT_MUTED }}>
              Enter any topic to find related keywords your audience searches for — with volume, CPC, and competition data.
            </p>
          </div>
          {/* 3-step guide */}
          <div className="flex gap-3 flex-wrap justify-center text-left max-w-lg w-full">
            {[
              { step: "①", title: "Enter seed keyword", desc: "Any topic related to your business" },
              { step: "②", title: "Browse results", desc: "Filter by volume, sort by CPC or difficulty" },
              { step: "③", title: "Track Ranking", desc: "Add high-potential keywords to daily rank tracking" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-2 flex-1 min-w-[140px]">
                <span className="text-lg font-black shrink-0" style={{ color: ACCENT }}>{step}</span>
                <div>
                  <p className="text-xs font-bold text-white">{title}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTED }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {[
              { icon: <BarChart2 size={14} />, text: "Search volume data" },
              { icon: <DollarSign size={14} />, text: "CPC estimates" },
              { icon: <Zap size={14} />, text: "Competition score" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: TEXT_DIM }}>
                <span style={{ color: ACCENT }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: BORDER }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 border-b animate-pulse"
              style={{ borderColor: BORDER, background: i % 2 === 0 ? CARD_BG : "#0D1424" }}
            >
              <div className="h-3.5 rounded" style={{ width: `${120 + (i % 4) * 40}px`, background: "#1E2940" }} />
              <div className="flex gap-6">
                {[60, 50, 70, 60].map((w, j) => (
                  <div key={j} className="h-3 rounded" style={{ width: w, background: "#1E2940" }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
