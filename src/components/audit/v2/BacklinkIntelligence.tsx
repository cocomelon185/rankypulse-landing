"use client";

import { motion } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  ExternalLink,
  Hash,
  Globe,
  Link as LinkIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useAuditStore } from "@/lib/use-audit";
import { AddToRoadmapButton } from "./AddToRoadmapButton";

// ApexCharts — SSR disabled
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// ── Styling constants ──────────────────────────────────────────────────────────
const CARD_BG    = "#151B27";
const BORDER     = "#1E2940";
const ACCENT     = "#FF642D";
const EMERALD    = "#10B981";
const RED        = "#EF4444";
const AMBER      = "#F59E0B";
const TEXT_MUTED = "#64748B";
const TEXT_DIM   = "#8B9BB4";

// ── Core metrics (mock — matches normalized 0-100 trust scale) ─────────────────
const TRUST_SCORE   = 68;   // 0-100 normalized
const SPAM_SCORE    = 12;   // 0-100 spam risk %
const TOTAL_LINKS   = 4_821;
const REF_DOMAINS   = 312;
const GAUGE_R       = 54;
const GAUGE_CIRC    = Math.round(2 * Math.PI * GAUGE_R); // ≈ 339

// ── Toxicity breakdown ─────────────────────────────────────────────────────────
const TOXICITY_ROWS = [
  { label: "Suspicious Anchors",     value: 0 },
  { label: "PBN Patterns",           value: 2 },
  { label: "Low Authority Networks", value: 9 },
];

// ── 30-day momentum data ───────────────────────────────────────────────────────
const MOMENTUM_DATES: string[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2025, 0, 14 + i); // Jan 14 → Feb 12
  return `${d.toLocaleString("en", { month: "short" })} ${d.getDate()}`;
});

// Deterministic new/lost series with realistic variation
const SEEDS_NEW  = [12,18,15,25,30,22,40,35,28,33,41,38,19,27,31,44,23,17,36,29,43,20,38,16,34,27,45,21,39,32];
const SEEDS_LOST = [ 2, 5, 3, 8, 4,12, 5, 9, 3, 7, 2,11, 6, 4, 8, 3,10, 5, 7, 2, 9, 6, 4,11, 3, 8, 5, 7, 4, 6];

const NEW_TOTAL  = SEEDS_NEW.reduce((a, b) => a + b, 0);   // 142 approx
const LOST_TOTAL = SEEDS_LOST.reduce((a, b) => a + b, 0);  // ~39

// ── Lost high-authority links ──────────────────────────────────────────────────
const LOST_LINKS = [
  { id: "ll-1", domain: "moz.com",               dr: 91, anchor: "SEO audit guide",       lastSeen: "Jan 20, 2025" },
  { id: "ll-2", domain: "hubspot.com",            dr: 85, anchor: "backlink analysis",     lastSeen: "Jan 18, 2025" },
  { id: "ll-3", domain: "searchengineland.com",   dr: 78, anchor: "site health checker",   lastSeen: "Jan 15, 2025" },
  { id: "ll-4", domain: "ahrefs.com",             dr: 74, anchor: "technical SEO tools",   lastSeen: "Jan 11, 2025" },
];

// ── High authority referrals ───────────────────────────────────────────────────
const REFERRALS = [
  { domain: "wikipedia.org",        trust: 98, anchor: "Data Analysis Tools",    type: "Dofollow" as const },
  { domain: "github.com",           trust: 94, anchor: "RankyPulse",             type: "Dofollow" as const },
  { domain: "techcrunch.com",       trust: 91, anchor: "SEO SaaS tools 2025",    type: "Dofollow" as const },
  { domain: "smashingmagazine.com", trust: 87, anchor: "on-page SEO checker",    type: "Dofollow" as const },
  { domain: "medium.com",           trust: 82, anchor: "seo audit tool",         type: "Nofollow" as const },
  { domain: "producthunt.com",      trust: 79, anchor: "RankyPulse launch",      type: "Nofollow" as const },
];

// ── External anchor cloud ──────────────────────────────────────────────────────
const ANCHOR_CLOUD = [
  { text: "RankyPulse",                domains: 48, frequency: 28.2 },
  { text: "seo audit tool",            domains: 31, frequency: 18.1 },
  { text: "rankypulse.com",            domains: 19, frequency: 11.1 },
  { text: "technical seo checker",     domains: 14, frequency:  8.2 },
  { text: "site health dashboard",     domains: 11, frequency:  6.4 },
  { text: "check here",               domains:  9, frequency:  5.3 },
  { text: "internal link analysis",   domains:  8, frequency:  4.7 },
  { text: "click here",               domains:  6, frequency:  3.5 },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function trustColor(score: number): string {
  if (score >= 70) return EMERALD;
  if (score >= 40) return AMBER;
  return RED;
}

function spamColor(score: number): string {
  return score > 20 ? RED : EMERALD;
}

// ── ApexCharts options ─────────────────────────────────────────────────────────
const momentumOptions: ApexCharts.ApexOptions = {
  chart: {
    type: "area",
    background: "transparent",
    toolbar: { show: false },
    animations: { enabled: true, speed: 800 },
    sparkline: { enabled: false },
  },
  colors: [EMERALD, RED],
  stroke: { curve: "smooth", width: 2 },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.35,
      opacityTo: 0,
      stops: [0, 100],
    },
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: MOMENTUM_DATES,
    labels: {
      style: { colors: TEXT_MUTED, fontSize: "10px", fontFamily: "DM Mono, monospace" },
      rotate: 0,
      // Show roughly every 5th label
      formatter: (_val: string, idx?: number) =>
        idx !== undefined && idx % 5 === 0 ? MOMENTUM_DATES[idx] : "",
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { show: false },
  grid: {
    borderColor: BORDER,
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
  },
  tooltip: {
    theme: "dark",
    style: { fontFamily: "DM Mono, monospace", fontSize: "11px" },
  },
  legend: {
    labels: { colors: TEXT_DIM },
    fontFamily: "DM Mono, monospace",
    fontSize: "11px",
  },
};

const momentumSeries = [
  { name: "New Links",  data: SEEDS_NEW },
  { name: "Lost Links", data: SEEDS_LOST },
];

// ── Sub-components ─────────────────────────────────────────────────────────────
function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      className="flex-1 min-w-[120px] rounded-xl border p-4"
      style={{ background: CARD_BG, borderColor: BORDER }}
    >
      <p
        className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: TEXT_MUTED }}
      >
        {label}
      </p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function TypeBadge({ type }: { type: "Dofollow" | "Nofollow" }) {
  return (
    <span
      className="rounded px-2 py-0.5 text-[10px] font-bold uppercase"
      style={
        type === "Dofollow"
          ? { background: `${EMERALD}18`, color: EMERALD }
          : { background: "rgba(100,116,139,0.12)", color: TEXT_MUTED }
      }
    >
      {type}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function BacklinkIntelligence() {
  const { brandingConfig } = useAuditStore();

  const spamArc = GAUGE_CIRC - (GAUGE_CIRC * SPAM_SCORE) / 100;
  const isHighSpam = SPAM_SCORE > 20;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleExport = () => {
    const color = brandingConfig.primaryColor ?? ACCENT;
    toast.success("Backlink report exported!", {
      description: `Branded with your agency colour (${color}). Check your downloads folder.`,
    });
  };

  const handleDisavow = () => {
    toast.info("Disavow file generated", {
      description: "2 suspected PBN domains added to disavow.txt — review before submitting to GSC.",
    });
  };

  const handleExportCsv = () => {
    toast.success("CSV exported!", {
      description: `${REFERRALS.length} high-authority referrals downloaded.`,
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {isHighSpam ? (
            <ShieldAlert size={22} style={{ color: RED }} />
          ) : (
            <ShieldCheck size={22} style={{ color: EMERALD }} />
          )}
          <div>
            <h2 className="text-xl font-bold text-white">Backlink Intelligence</h2>
            <p className="text-xs" style={{ color: TEXT_DIM }}>
              Toxicity radar · Link momentum · Anchor distribution · Lost link recovery
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Trust score pill */}
          <span
            className="rounded-full border px-3 py-1.5 text-xs font-bold"
            style={{
              borderColor: `${trustColor(TRUST_SCORE)}30`,
              background: `${trustColor(TRUST_SCORE)}10`,
              color: trustColor(TRUST_SCORE),
            }}
          >
            Trust Score: {TRUST_SCORE}/100
          </span>

          {/* Export button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition-all hover:opacity-90"
            style={{
              borderColor: `${ACCENT}30`,
              background: `${ACCENT}10`,
              color: ACCENT,
            }}
          >
            <Download size={13} />
            Export Report
          </button>
        </div>
      </div>

      {/* ── Summary stats ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <StatChip label="Total Backlinks"    value={TOTAL_LINKS.toLocaleString()} color="#E2E8F0" />
        <StatChip label="Referring Domains"  value={REF_DOMAINS.toLocaleString()} color="#E2E8F0" />
        <StatChip label="Trust Score"        value={`${TRUST_SCORE}/100`}         color={trustColor(TRUST_SCORE)} />
        <StatChip label="Spam Risk"          value={`${SPAM_SCORE}%`}             color={spamColor(SPAM_SCORE)} />
      </div>

      {/* ── Toxicity Radar + Link Momentum ───────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Toxicity Radar */}
        <div
          className="lg:col-span-1 rounded-2xl border p-6"
          style={{ background: CARD_BG, borderColor: BORDER }}
        >
          <div className="flex items-center justify-between mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: TEXT_MUTED }}>
              Toxicity Radar
            </p>
            {isHighSpam ? (
              <ShieldAlert size={16} style={{ color: RED }} />
            ) : (
              <ShieldCheck size={16} style={{ color: EMERALD }} />
            )}
          </div>

          {/* SVG Gauge */}
          <div className="flex flex-col items-center py-2">
            <div className="relative">
              <svg width="120" height="120" viewBox="0 0 120 120">
                {/* Track */}
                <circle
                  cx="60"
                  cy="60"
                  r={GAUGE_R}
                  stroke={BORDER}
                  strokeWidth="10"
                  fill="none"
                />
                {/* Animated arc */}
                <motion.circle
                  cx="60"
                  cy="60"
                  r={GAUGE_R}
                  stroke={spamColor(SPAM_SCORE)}
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={GAUGE_CIRC}
                  transform="rotate(-90 60 60)"
                  initial={{ strokeDashoffset: GAUGE_CIRC }}
                  animate={{ strokeDashoffset: spamArc }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{SPAM_SCORE}%</span>
                <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                  Spam Risk
                </span>
              </div>
            </div>

            {/* Health indicator */}
            <div
              className="mt-3 flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold"
              style={
                isHighSpam
                  ? { borderColor: `${RED}30`, background: `${RED}10`, color: RED }
                  : { borderColor: `${EMERALD}30`, background: `${EMERALD}10`, color: EMERALD }
              }
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: spamColor(SPAM_SCORE) }}
              />
              {isHighSpam ? "High Risk" : "Link Profile Healthy"}
            </div>
          </div>

          {/* Breakdown rows */}
          <div className="mt-5 space-y-3">
            {TOXICITY_ROWS.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-lg px-3 py-2"
                style={{ background: "#0D1424" }}
              >
                <span className="text-xs" style={{ color: TEXT_DIM }}>
                  {row.label}
                </span>
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color: row.value > 0 ? (row.value > 5 ? RED : AMBER) : EMERALD }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Disavow CTA */}
          <button
            onClick={handleDisavow}
            className="mt-5 w-full rounded-xl border py-2.5 text-xs font-bold transition-all hover:opacity-80"
            style={{
              borderColor: `${RED}30`,
              background: `${RED}08`,
              color: "#F87171",
            }}
          >
            Generate Disavow File
          </button>
        </div>

        {/* Link Momentum Chart */}
        <div
          className="lg:col-span-2 rounded-2xl border p-6"
          style={{ background: CARD_BG, borderColor: BORDER }}
        >
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: TEXT_MUTED }}>
                Link Momentum
              </p>
              <p className="text-xs mt-0.5" style={{ color: TEXT_DIM }}>
                New vs. Lost domains — last 30 days
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: EMERALD }}>
                <TrendingUp size={13} />
                +{NEW_TOTAL} new
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: RED }}>
                <TrendingDown size={13} />
                −{LOST_TOTAL} lost
              </div>
            </div>
          </div>

          <Chart
            options={momentumOptions}
            series={momentumSeries}
            type="area"
            height={220}
            width="100%"
          />
        </div>
      </div>

      {/* ── Lost High-Authority Links ─────────────────────────────────────────── */}
      <div
        className="overflow-hidden rounded-2xl border"
        style={{ borderColor: BORDER }}
      >
        {/* Table header */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4"
          style={{ background: CARD_BG, borderColor: BORDER }}
        >
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} style={{ color: AMBER }} />
              <span className="text-sm font-bold" style={{ color: AMBER }}>
                Lost High-Authority Links
              </span>
            </div>
            <p className="mt-0.5 text-xs" style={{ color: TEXT_DIM }}>
              Recover these links to restore lost PageRank equity.
            </p>
          </div>
          <span
            className="rounded-full border px-2.5 py-0.5 text-[10px] font-bold"
            style={{ borderColor: `${AMBER}30`, background: `${AMBER}10`, color: AMBER }}
          >
            {LOST_LINKS.length} lost
          </span>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ background: "#0D1424", borderBottom: `1px solid ${BORDER}` }}>
              {["Source Domain", "DR", "Anchor Text", "Last Seen", "Action"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: TEXT_MUTED }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LOST_LINKS.map((link, i) => (
              <motion.tr
                key={link.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="transition-colors hover:bg-white/[0.02]"
                style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? CARD_BG : "#0D1424" }}
              >
                <td className="px-6 py-3">
                  <div className="flex items-center gap-1.5">
                    <Globe size={12} style={{ color: TEXT_MUTED }} />
                    <span className="text-xs font-medium text-white">{link.domain}</span>
                    <ExternalLink size={10} style={{ color: TEXT_MUTED }} />
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span
                    className="font-mono text-xs font-bold"
                    style={{ color: link.dr >= 70 ? EMERALD : AMBER }}
                  >
                    {link.dr}
                  </span>
                </td>
                <td className="px-6 py-3 text-xs" style={{ color: TEXT_DIM }}>
                  {link.anchor}
                </td>
                <td className="px-6 py-3 font-mono text-[11px]" style={{ color: TEXT_MUTED }}>
                  {link.lastSeen}
                </td>
                <td className="px-6 py-3">
                  <AddToRoadmapButton
                    task={{
                      id: link.id,
                      type: "LINK",
                      title: `Recover lost link: ${link.domain}`,
                      description: `High-authority backlink (DR ${link.dr}) was lost on ${link.lastSeen}. Anchor: "${link.anchor}". Reach out to reclaim or recreate this link.`,
                      impact: link.dr >= 70 ? "HIGH" : "MED",
                      effort: "60 min",
                    }}
                  />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── High Authority Referrals ──────────────────────────────────────────── */}
      <div
        className="overflow-hidden rounded-2xl border"
        style={{ borderColor: BORDER }}
      >
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ background: CARD_BG, borderColor: BORDER }}
        >
          <div className="flex items-center gap-2">
            <LinkIcon size={14} style={{ color: ACCENT }} />
            <span className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: TEXT_MUTED }}>
              High Authority Referrals
            </span>
          </div>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-70"
            style={{ color: ACCENT }}
          >
            <Download size={13} />
            Export CSV
          </button>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ background: "#0D1424", borderBottom: `1px solid ${BORDER}` }}>
              {["Source Domain", "Trust", "Anchor Text", "Type"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: TEXT_MUTED }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REFERRALS.map((ref, i) => (
              <motion.tr
                key={ref.domain}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="transition-colors hover:bg-white/[0.02]"
                style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? CARD_BG : "#0D1424" }}
              >
                <td className="px-6 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-white">{ref.domain}</span>
                    <ExternalLink size={10} style={{ color: TEXT_MUTED }} />
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span
                    className="font-mono text-xs font-bold"
                    style={{ color: trustColor(ref.trust) }}
                  >
                    {ref.trust}
                  </span>
                </td>
                <td className="px-6 py-3 text-xs" style={{ color: TEXT_DIM }}>
                  {ref.anchor}
                </td>
                <td className="px-6 py-3">
                  <TypeBadge type={ref.type} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── External Anchor Cloud ─────────────────────────────────────────────── */}
      <div
        className="overflow-hidden rounded-2xl border"
        style={{ borderColor: BORDER }}
      >
        <div
          className="border-b px-6 py-4"
          style={{ background: CARD_BG, borderColor: BORDER }}
        >
          <div className="flex items-center gap-2">
            <Hash size={14} style={{ color: ACCENT }} />
            <span className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: TEXT_MUTED }}>
              External Anchor Distribution
            </span>
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ background: "#0D1424", borderBottom: `1px solid ${BORDER}` }}>
              {["Anchor Text", "Referring Domains", "Frequency %", ""].map((h, i) => (
                <th
                  key={i}
                  className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: TEXT_MUTED }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ANCHOR_CLOUD.map((row, i) => (
              <motion.tr
                key={row.text}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="transition-colors hover:bg-white/[0.02]"
                style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? CARD_BG : "#0D1424" }}
              >
                <td className="px-6 py-3">
                  <span className="text-xs font-medium text-white">{row.text}</span>
                </td>
                <td className="px-6 py-3 font-mono text-xs" style={{ color: TEXT_DIM }}>
                  {row.domains}
                </td>
                <td className="px-6 py-3">
                  <span
                    className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold"
                    style={
                      row.frequency >= 20
                        ? { background: `${ACCENT}18`, color: ACCENT }
                        : { background: "#0D1424", color: TEXT_DIM }
                    }
                  >
                    {row.frequency.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-3 w-32">
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full"
                    style={{ background: BORDER }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: row.frequency >= 20 ? ACCENT : TEXT_MUTED }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(row.frequency / 30) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                    />
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        <div className="px-6 py-3" style={{ background: CARD_BG }}>
          <p className="text-[10px]" style={{ color: TEXT_MUTED }}>
            * Anchor data reflects external inbound links only. Frequency % is calculated against
            total referring domains in this dataset.
          </p>
        </div>
      </div>
    </div>
  );
}
