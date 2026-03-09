"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Globe,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  ChevronDown,
  ExternalLink,
  BarChart2,
  Plus,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Competitor {
  competitor_domain: string;
  intersections: number;
  avg_position: number | null;
  overlap_percent: number | null;
  competitor_se_type: string;
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

function overlapColor(pct: number | null): string {
  if (pct === null) return TEXT_MUTED;
  if (pct >= 70) return "#EF4444";
  if (pct >= 40) return "#F59E0B";
  return "#22C55E";
}

function overlapLabel(pct: number | null): string {
  if (pct === null) return "—";
  if (pct >= 70) return "Strong";
  if (pct >= 40) return "Moderate";
  return "Low";
}

// ── Track competitor button ───────────────────────────────────────────────────
function TrackCompetitorBtn({
  competitorDomain,
  myDomain,
  country,
}: {
  competitorDomain: string;
  myDomain: string;
  country: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function track() {
    setState("loading");
    try {
      const res = await fetch("/api/rank/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: myDomain,
          keyword: `site:${competitorDomain}`,
          country,
          device: "desktop",
        }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <span className="text-[11px] font-bold text-green-400">Tracked</span>
    );
  }

  return (
    <button
      onClick={track}
      disabled={state === "loading"}
      title="Add competitor to rank tracking"
      className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg transition hover:opacity-80 disabled:opacity-50"
      style={{ background: "rgba(255,100,45,0.1)", color: ACCENT }}
    >
      <Plus size={10} /> Monitor
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CompetitorIntelligenceClient() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [domain, setDomain] = useState("");
  const [country, setCountry] = useState("US");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Resolve domain from localStorage
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

  const fetchData = useCallback(
    async (d: string, c: string, forceRefresh = false) => {
      if (!d) return;
      forceRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);

      try {
        if (forceRefresh) {
          const res = await fetch("/api/competitors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ domain: d, country: c }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Failed to fetch competitors");
          setCompetitors(data.competitors ?? []);
          setFromCache(data.cached ?? false);
        } else {
          const res = await fetch(`/api/competitors?domain=${encodeURIComponent(d)}&country=${c}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Failed to load competitors");

          if (data.competitors && data.competitors.length > 0) {
            setCompetitors(data.competitors);
            setFromCache(data.cached ?? true);
          } else {
            await fetchData(d, c, true);
            return;
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load competitors");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setHasLoaded(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (domain) fetchData(domain, country);
  }, [domain, country, fetchData]);

  const topCompetitor = competitors[0] ?? null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,100,45,0.1)" }}
          >
            <Target size={20} style={{ color: ACCENT }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Competitor Intelligence</h1>
            <p className="text-sm" style={{ color: TEXT_MUTED }}>
              {domain ? `Competitors of ${domain}` : "Discover who competes with you in search"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Country selector */}
          <div className="relative">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="rounded-lg border pl-3 pr-8 py-2 text-sm appearance-none bg-transparent text-white focus:outline-none focus:border-orange-500/50"
              style={{ background: CARD_BG, borderColor: BORDER }}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code} style={{ background: "#151B27" }}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: TEXT_MUTED }} />
          </div>

          {fromCache && (
            <span className="text-[11px]" style={{ color: TEXT_MUTED }}>Cached today</span>
          )}

          <button
            onClick={() => fetchData(domain, country, true)}
            disabled={!domain || refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors disabled:opacity-50"
            style={{ borderColor: BORDER, color: TEXT_DIM }}
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {(loading && !hasLoaded) && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border h-20 animate-pulse"
              style={{ background: CARD_BG, borderColor: BORDER }}
            />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          className="rounded-xl border p-5 flex items-center gap-3"
          style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)" }}
        >
          <AlertTriangle size={18} className="text-red-400 shrink-0" />
          <div>
            <p className="text-sm text-red-400 font-semibold">Failed to load competitors</p>
            <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* No domain */}
      {!loading && !error && !domain && (
        <div
          className="rounded-2xl border p-16 flex flex-col items-center gap-4"
          style={{ background: CARD_BG, borderColor: BORDER }}
        >
          <Globe size={40} style={{ color: TEXT_MUTED, opacity: 0.4 }} />
          <p className="text-sm text-center" style={{ color: TEXT_MUTED }}>
            Run a site audit first to set your domain, then return here.
          </p>
          <a
            href="/app/audit"
            className="text-sm font-semibold px-4 py-2 rounded-lg text-white"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #E8541F)` }}
          >
            Go to Site Audit
          </a>
        </div>
      )}

      {/* No competitors yet */}
      {hasLoaded && !loading && !error && domain && competitors.length === 0 && (
        <div
          className="rounded-2xl border p-16 flex flex-col items-center gap-4"
          style={{ background: CARD_BG, borderColor: BORDER }}
        >
          <Target size={40} style={{ color: TEXT_MUTED, opacity: 0.4 }} />
          <div className="text-center">
            <h3 className="text-base font-bold text-white mb-1">No competitor data yet</h3>
            <p className="text-sm" style={{ color: TEXT_MUTED }}>
              Fetch competitors for {domain} in {country}.
            </p>
          </div>
          <button
            onClick={() => fetchData(domain, country, true)}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #E8541F)` }}
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Fetching…" : "Find Competitors"}
          </button>
        </div>
      )}

      {/* Main content */}
      {!loading && !error && competitors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Summary banner */}
          {topCompetitor && (
            <div
              className="rounded-xl border p-4 flex items-center gap-4"
              style={{ background: "rgba(255,100,45,0.05)", borderColor: "rgba(255,100,45,0.15)" }}
            >
              <BarChart2 size={18} style={{ color: ACCENT }} />
              <div>
                <p className="text-sm font-semibold text-white">
                  {competitors.length} competitors found in Google {country}
                </p>
                <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
                  Strongest: <span style={{ color: ACCENT }}>{topCompetitor.competitor_domain}</span> with{" "}
                  {topCompetitor.intersections.toLocaleString()} shared keywords
                </p>
              </div>
            </div>
          )}

          {/* Competitor cards */}
          <div className="space-y-3">
            {competitors.map((comp, i) => {
              const ol = comp.overlap_percent;
              return (
                <motion.div
                  key={comp.competitor_domain}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-xl border p-4"
                  style={{ background: CARD_BG, borderColor: BORDER }}
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    {/* Rank + domain */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0"
                        style={{
                          background:
                            i === 0
                              ? "rgba(239,68,68,0.12)"
                              : i === 1
                              ? "rgba(245,158,11,0.12)"
                              : "rgba(99,102,241,0.1)",
                          color:
                            i === 0 ? "#EF4444" : i === 1 ? "#F59E0B" : "#818CF8",
                        }}
                      >
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white truncate">
                            {comp.competitor_domain}
                          </p>
                          <a
                            href={`https://${comp.competitor_domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0"
                          >
                            <ExternalLink size={12} style={{ color: TEXT_MUTED }} />
                          </a>
                        </div>
                        <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTED }}>
                          {comp.intersections.toLocaleString()} keywords in common
                          {comp.avg_position != null &&
                            ` · avg position #${Math.round(comp.avg_position)}`}
                        </p>
                      </div>
                    </div>

                    {/* Overlap + action */}
                    <div className="flex items-center gap-4 shrink-0">
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded"
                        style={{
                          background: `${overlapColor(ol)}18`,
                          color: overlapColor(ol),
                        }}
                      >
                        {overlapLabel(ol)} overlap
                      </span>

                      {/* Overlap bar */}
                      <div className="hidden sm:block w-24">
                        <div
                          className="h-1.5 rounded-full overflow-hidden"
                          style={{ background: "#0D1424" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${ol ?? 0}%`,
                              background: overlapColor(ol),
                            }}
                          />
                        </div>
                        <p
                          className="text-[10px] text-center mt-0.5"
                          style={{ color: TEXT_MUTED }}
                        >
                          {ol != null ? `${ol.toFixed(0)}%` : "—"}
                        </p>
                      </div>

                      <TrackCompetitorBtn
                        competitorDomain={comp.competitor_domain}
                        myDomain={domain}
                        country={country}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Tips card */}
          <div
            className="rounded-xl border p-5 space-y-3"
            style={{ background: "rgba(123,92,245,0.05)", borderColor: "rgba(123,92,245,0.15)" }}
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={16} style={{ color: "#7B5CF5" }} />
              <h3 className="text-sm font-bold text-white">How to use this data</h3>
            </div>
            <ul className="space-y-1.5">
              {[
                "High-overlap competitors share your most important keywords — study their content strategy.",
                "Low-overlap competitors may rank for keywords you've missed — explore their topics.",
                "Click \"Monitor\" to add a competitor to rank tracking for ongoing comparison.",
              ].map((tip, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs"
                  style={{ color: TEXT_DIM }}
                >
                  <span
                    className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full"
                    style={{ background: "#7B5CF5" }}
                  />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}
