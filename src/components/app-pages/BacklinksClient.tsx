"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { isDataProviderUnavailableCode } from "@/lib/data-provider";
import {
  Link as LinkIcon,
  Globe,
  RefreshCw,
  Shield,
  AlertTriangle,
  ExternalLink,
  BarChart2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────
interface BacklinkSnapshot {
  total_backlinks: number | null;
  referring_domains: number | null;
  trust_score: number | null;
  spam_score: number | null;
  gov_count: number | null;
  edu_count: number | null;
  dofollow_count: number | null;
  nofollow_count: number | null;
  snapshot_date: string;
  domain: string;
}

interface TrendPoint {
  date: string;
  totalBacklinks: number | null;
  referringDomains: number | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const CARD_BG = "#151B27";
const BORDER = "#1E2940";
const ACCENT = "#FF642D";
const TEXT_MUTED = "#64748B";
const TEXT_DIM = "#8B9BB4";

function fmt(n: number | null): string {
  if (n === null || n === undefined) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function trustColor(score: number | null): string {
  if (score === null) return TEXT_MUTED;
  if (score >= 70) return "#22C55E";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
}

function spamColor(score: number | null): string {
  if (score === null) return TEXT_MUTED;
  if (score < 20) return "#22C55E";
  if (score < 50) return "#F59E0B";
  return "#EF4444";
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sublabel,
  icon,
  iconColor,
  highlight,
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon: React.ReactNode;
  iconColor?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-3"
      style={{ background: CARD_BG, borderColor: highlight ? `${iconColor ?? ACCENT}40` : BORDER }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
          {label}
        </p>
        <span style={{ color: iconColor ?? ACCENT }}>{icon}</span>
      </div>
      <p
        className="text-3xl font-black leading-none"
        style={{ color: highlight ? (iconColor ?? ACCENT) : "#E2E8F0" }}
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

// ── Main component ────────────────────────────────────────────────────────────

export function BacklinksClient() {
  const [snapshot, setSnapshot] = useState<BacklinkSnapshot | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerUnavailable, setProviderUnavailable] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

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

  const fetchData = useCallback(async (d: string, forceRefresh = false) => {
    if (!d) return;
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    setProviderUnavailable(false);

    try {
      if (forceRefresh) {
        // POST to force a fresh DataForSEO fetch
        const res = await fetch("/api/backlinks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: d }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (isDataProviderUnavailableCode(data.code)) {
            setProviderUnavailable(true);
            return;
          }
          throw new Error(data.error ?? "Failed to fetch backlinks");
        }
        setSnapshot(data.snapshot ?? null);
        setTrend(data.trend ?? []);
        if (data.snapshot?.snapshot_date) setLastUpdated(data.snapshot.snapshot_date);
      } else {
        // GET cached
        const res = await fetch(`/api/backlinks?domain=${encodeURIComponent(d)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load backlinks");

        if (data.snapshot) {
          setSnapshot(data.snapshot);
          setTrend(data.trend ?? []);
          if (data.snapshot.snapshot_date) setLastUpdated(data.snapshot.snapshot_date);
        } else {
          // No cached data — fetch fresh
          await fetchData(d, true);
          return;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load backlinks");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (domain) fetchData(domain);
  }, [domain, fetchData]);

  const trendFormatted = trend.map((t) => ({
    date: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    backlinks: t.totalBacklinks ?? 0,
    domains: t.referringDomains ?? 0,
  }));

  // Trend delta (last vs first in window)
  const backlinkDelta =
    trendFormatted.length >= 2
      ? (trendFormatted[trendFormatted.length - 1].backlinks ?? 0) - (trendFormatted[0].backlinks ?? 0)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,100,45,0.1)" }}
          >
            <LinkIcon size={20} style={{ color: ACCENT }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Backlinks</h1>
            <p className="text-sm" style={{ color: TEXT_MUTED }}>
              {domain ? `Link profile for ${domain}` : "Analyse your domain's link profile"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[11px]" style={{ color: TEXT_MUTED }}>
              Updated {new Date(lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
          <button
            onClick={() => fetchData(domain, true)}
            disabled={!domain || refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors disabled:opacity-50"
            style={{ borderColor: BORDER, color: TEXT_DIM }}
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border h-32 animate-pulse"
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
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {!loading && providerUnavailable && !snapshot && (
        <div
          className="rounded-2xl border p-8 space-y-3"
          style={{ background: "rgba(123,92,245,0.05)", borderColor: "rgba(123,92,245,0.16)" }}
        >
          <div className="flex items-center gap-2">
            <BarChart2 size={16} style={{ color: "#A78BFA" }} />
            <p className="text-sm font-semibold text-white">Backlink refresh is temporarily unavailable</p>
          </div>
          <p className="text-sm" style={{ color: TEXT_DIM }}>
            Your dashboard is still available. Fresh backlink metrics will appear here once the provider is reachable again.
          </p>
        </div>
      )}

      {!loading && providerUnavailable && snapshot && (
        <div
          className="rounded-xl border p-4 text-sm"
          style={{ background: "rgba(123,92,245,0.05)", borderColor: "rgba(123,92,245,0.16)", color: TEXT_DIM }}
        >
          Fresh backlink refresh is temporarily unavailable. Showing your latest saved snapshot instead.
        </div>
      )}

      {/* No domain */}
      {!loading && !error && !providerUnavailable && !domain && (
        <div
          className="rounded-2xl border p-16 flex flex-col items-center gap-4"
          style={{ background: CARD_BG, borderColor: BORDER }}
        >
          <Globe size={40} style={{ color: TEXT_MUTED, opacity: 0.4 }} />
          <p className="text-sm text-center" style={{ color: TEXT_MUTED }}>
            Run a site audit first to set your domain. Then come back here.
          </p>
          <Link
            href="/app/audit"
            className="text-sm font-semibold px-4 py-2 rounded-lg text-white"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #E8541F)` }}
          >
            Go to Site Audit
          </Link>
        </div>
      )}

      {/* No data yet — prompt refresh */}
      {!loading && !error && !providerUnavailable && domain && !snapshot && (
        <div
          className="rounded-2xl border p-16 flex flex-col items-center gap-4"
          style={{ background: CARD_BG, borderColor: BORDER }}
        >
          <LinkIcon size={40} style={{ color: TEXT_MUTED, opacity: 0.4 }} />
          <div className="text-center">
            <h3 className="text-base font-bold text-white mb-1">No backlink data yet</h3>
            <p className="text-sm" style={{ color: TEXT_MUTED }}>
              Fetch your first backlink snapshot for {domain}.
            </p>
          </div>
          <button
            onClick={() => fetchData(domain, true)}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #E8541F)` }}
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Fetching…" : "Fetch Backlinks"}
          </button>
        </div>
      )}

      {/* Main content */}
      {!loading && !error && snapshot && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Backlinks"
              value={fmt(snapshot.total_backlinks)}
              sublabel={backlinkDelta !== 0 ? `${backlinkDelta > 0 ? "+" : ""}${fmt(backlinkDelta)} vs last week` : undefined}
              icon={<LinkIcon size={16} />}
            />
            <StatCard
              label="Referring Domains"
              value={fmt(snapshot.referring_domains)}
              sublabel="unique domains linking"
              icon={<Globe size={16} />}
            />
            <StatCard
              label="Trust Score"
              value={snapshot.trust_score != null ? String(snapshot.trust_score) : "—"}
              sublabel="domain authority (0–100)"
              icon={<Shield size={16} />}
              iconColor={trustColor(snapshot.trust_score)}
              highlight={snapshot.trust_score != null && snapshot.trust_score >= 50}
            />
            <StatCard
              label="Spam Score"
              value={snapshot.spam_score != null ? `${snapshot.spam_score}%` : "—"}
              sublabel="lower is better"
              icon={<AlertTriangle size={16} />}
              iconColor={spamColor(snapshot.spam_score)}
              highlight={snapshot.spam_score != null && snapshot.spam_score > 50}
            />
          </div>

          {/* Trend chart */}
          {trendFormatted.length >= 2 && (
            <div
              className="rounded-xl border p-5"
              style={{ background: CARD_BG, borderColor: BORDER }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart2 size={15} style={{ color: ACCENT }} />
                  Backlink Trend
                </h2>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: TEXT_MUTED }}>
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: ACCENT }} />
                    Backlinks
                  </span>
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: TEXT_MUTED }}>
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#7B5CF5" }} />
                    Domains
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={trendFormatted} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="blGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ACCENT} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="domGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7B5CF5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#7B5CF5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2940" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#4A5568", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#4A5568", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#0D1424", border: "1px solid #1E2940", borderRadius: 8, fontSize: 12 }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any, name: any) => [fmt(typeof value === "number" ? value : null), name === "backlinks" ? "Backlinks" : "Domains"] as any}
                  />
                  <Area type="monotone" dataKey="backlinks" stroke={ACCENT} strokeWidth={2} fill="url(#blGrad)" dot={false} />
                  <Area type="monotone" dataKey="domains" stroke="#7B5CF5" strokeWidth={2} fill="url(#domGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Link quality breakdown */}
          {(snapshot.dofollow_count != null || snapshot.gov_count != null) && (
            <div
              className="rounded-xl border p-5"
              style={{ background: CARD_BG, borderColor: BORDER }}
            >
              <h2 className="text-sm font-bold text-white mb-4">Link Quality</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Dofollow", value: fmt(snapshot.dofollow_count), color: "#22C55E" },
                  { label: "Nofollow", value: fmt(snapshot.nofollow_count), color: TEXT_DIM },
                  { label: ".gov Links", value: fmt(snapshot.gov_count), color: "#60A5FA" },
                  { label: ".edu Links", value: fmt(snapshot.edu_count), color: "#818CF8" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <p className="text-xl font-bold" style={{ color: item.color }}>
                      {item.value}
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: TEXT_MUTED }}>
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust/Spam score gauges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                label: "Trust Score",
                value: snapshot.trust_score,
                max: 100,
                good: ">= 50",
                color: trustColor(snapshot.trust_score),
                desc: "Higher is better — reflects domain authority",
                icon: <Shield size={14} />,
              },
              {
                label: "Spam Score",
                value: snapshot.spam_score,
                max: 100,
                good: "< 20%",
                color: spamColor(snapshot.spam_score),
                desc: "Lower is better — indicates link quality",
                icon: <AlertTriangle size={14} />,
              },
            ].map((gauge) => (
              <div
                key={gauge.label}
                className="rounded-xl border p-4"
                style={{ background: CARD_BG, borderColor: BORDER }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span style={{ color: gauge.color }}>{gauge.icon}</span>
                    <span className="text-sm font-semibold text-white">{gauge.label}</span>
                  </div>
                  <span className="text-lg font-black" style={{ color: gauge.color }}>
                    {gauge.value != null ? gauge.value : "—"}
                    {gauge.value != null && gauge.label === "Spam Score" ? "%" : ""}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: "#0D1424" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, gauge.value ?? 0)}%`,
                      background: gauge.color,
                    }}
                  />
                </div>
                <p className="text-[11px]" style={{ color: TEXT_MUTED }}>
                  {gauge.desc}
                </p>
              </div>
            ))}
          </div>

          {/* External link to detailed report */}
          <div
            className="rounded-xl border p-4 flex items-center justify-between"
            style={{ background: "rgba(255,100,45,0.04)", borderColor: "rgba(255,100,45,0.15)" }}
          >
            <div>
              <p className="text-sm font-semibold text-white">Want deeper analysis?</p>
              <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
                Check your full backlink profile on DataForSEO Labs or Ahrefs.
              </p>
            </div>
            <a
              href={`https://app.dataforseo.com/backlinks/summary?target=${domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition hover:opacity-80"
              style={{ background: "rgba(255,100,45,0.12)", color: ACCENT }}
            >
              <ExternalLink size={12} /> DataForSEO
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}
