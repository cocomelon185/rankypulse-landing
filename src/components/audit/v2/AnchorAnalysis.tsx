"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react";

// ApexCharts — SSR disabled (window dependency)
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// ── Styling constants (matching InternalLinksClient.tsx palette) ───────────────
const CARD_BG    = "#151B27";
const BORDER     = "#1E2940";
const ACCENT     = "#FF642D";
const TEXT_MUTED = "#64748B";
const TEXT_DIM   = "#8B9BB4";

// ── Types ─────────────────────────────────────────────────────────────────────
interface AnchorType {
  label: string;
  count: number;
  color: string;
}

interface AnchorRow {
  text: string;
  count: number;
  frequency: number; // percent of total uses
  topPage: string;
}

type RiskLevel = "HIGH" | "MEDIUM" | "HEALTHY";

// ── Mock data (50-page site crawl, 50 total internal links) ───────────────────
const ANCHOR_TYPES: AnchorType[] = [
  { label: "Exact Match",    count: 14, color: ACCENT       },
  { label: "Partial Match",  count: 16, color: "#7B5CF5"    },
  { label: "Branded",        count: 11, color: "#10B981"    },
  { label: "Generic",        count:  9, color: "#f59e0b"    },
];

const TOTAL_ANCHORS = ANCHOR_TYPES.reduce((s, t) => s + t.count, 0); // 50

const ANCHOR_ROWS: AnchorRow[] = [
  { text: "SEO audit tool",           count: 14, frequency: 28.0, topPage: "/seo-audit-tool"            },
  { text: "check links here",         count:  8, frequency: 16.0, topPage: "/internal-link-checker"     },
  { text: "RankyPulse",               count:  7, frequency: 14.0, topPage: "/"                          },
  { text: "audit your site",          count:  5, frequency: 10.0, topPage: "/seo-audit-tool"            },
  { text: "RankyPulse tool",          count:  4, frequency:  8.0, topPage: "/"                          },
  { text: "internal links",           count:  4, frequency:  8.0, topPage: "/internal-link-checker"     },
  { text: "read more",                count:  4, frequency:  8.0, topPage: "/blog/core-web-vitals-guide" },
  { text: "learn more",               count:  3, frequency:  6.0, topPage: "/pricing"                   },
  { text: "click here",               count:  2, frequency:  4.0, topPage: "/features/action-plan"      },
  { text: "fix your technical SEO",   count:  2, frequency:  4.0, topPage: "/guides/technical-seo-checklist" },
  { text: "see pricing",              count:  2, frequency:  4.0, topPage: "/pricing"                   },
  { text: "organic traffic strategy", count:  1, frequency:  2.0, topPage: "/blog/what-is-seo"          },
];

// ── Risk score logic ──────────────────────────────────────────────────────────
function computeRisk(): { level: RiskLevel; exactPct: number; genericPct: number } {
  const exactCount   = ANCHOR_TYPES.find((t) => t.label === "Exact Match")?.count  ?? 0;
  const genericCount = ANCHOR_TYPES.find((t) => t.label === "Generic")?.count      ?? 0;
  const exactPct     = (exactCount   / TOTAL_ANCHORS) * 100;
  const genericPct   = (genericCount / TOTAL_ANCHORS) * 100;
  const level: RiskLevel =
    exactPct > 50 ? "HIGH" : genericPct > 30 ? "MEDIUM" : "HEALTHY";
  return { level, exactPct, genericPct };
}

// ── Sub-components ────────────────────────────────────────────────────────────
function RiskAlert({ level }: { level: RiskLevel }) {
  const configs = {
    HIGH: {
      icon: AlertTriangle,
      borderColor: "#EF4444",
      bg: "rgba(239,68,68,0.06)",
      textColor: "#F87171",
      badgeStyle: { background: "rgba(239,68,68,0.15)", color: "#F87171" },
      title: "High Risk of Over-Optimization",
      body: "Your exact-match anchor percentage exceeds 50%. Diversify your anchor text to avoid search penalties.",
    },
    MEDIUM: {
      icon: AlertCircle,
      borderColor: "#F59E0B",
      bg: "rgba(245,158,11,0.06)",
      textColor: "#FBD34D",
      badgeStyle: { background: "rgba(245,158,11,0.15)", color: "#FBD34D" },
      title: "Low Descriptive Value",
      body: "Generic anchors ('Click Here', 'Read More') exceed 30% of your profile. Replace them with descriptive keywords to boost crawl relevancy.",
    },
    HEALTHY: {
      icon: CheckCircle2,
      borderColor: "#10B981",
      bg: "rgba(16,185,129,0.06)",
      textColor: "#34d399",
      badgeStyle: { background: "rgba(16,185,129,0.15)", color: "#34d399" },
      title: "Anchor Profile Healthy",
      body: "Good distribution across exact-match, partial, and branded anchors. Keep monitoring as you add new content.",
    },
  };

  const c = configs[level];
  const Icon = c.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-start gap-3 rounded-xl border p-4"
      style={{ borderColor: `${c.borderColor}40`, background: c.bg }}
    >
      <Icon size={18} style={{ color: c.textColor, flexShrink: 0, marginTop: 1 }} />
      <div className="flex-1 min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: c.textColor }}>
            {c.title}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={c.badgeStyle}
          >
            {level}
          </span>
        </div>
        <p className="text-[12px] leading-relaxed" style={{ color: TEXT_DIM }}>
          {c.body}
        </p>
      </div>
    </motion.div>
  );
}

function StatChip({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className="flex-1 min-w-[120px] rounded-xl border p-4"
      style={{ background: CARD_BG, borderColor: BORDER }}
    >
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
        {label}
      </p>
      <p className="text-2xl font-bold" style={{ color: accent ? ACCENT : "#E2E8F0" }}>
        {value}
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function AnchorAnalysis() {
  const [sortDesc, setSortDesc] = useState(true);
  const { level, exactPct, genericPct } = computeRisk();

  const sortedRows = [...ANCHOR_ROWS].sort((a, b) =>
    sortDesc ? b.frequency - a.frequency : a.frequency - b.frequency
  );

  const donutOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "donut",
      background: "transparent",
      toolbar: { show: false },
      animations: { enabled: true, speed: 700 },
    },
    colors: ANCHOR_TYPES.map((t) => t.color),
    labels: ANCHOR_TYPES.map((t) => t.label),
    legend: {
      position: "bottom",
      labels: { colors: TEXT_DIM },
      fontFamily: "DM Mono, monospace",
      fontSize: "11px",
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
      style: { fontSize: "11px", fontFamily: "DM Mono, monospace", colors: ["#fff"] },
      dropShadow: { enabled: false },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Links",
              color: TEXT_MUTED,
              fontFamily: "DM Mono, monospace",
              fontSize: "11px",
              formatter: () => String(TOTAL_ANCHORS),
            },
            value: {
              color: "#E2E8F0",
              fontFamily: "DM Sans, sans-serif",
              fontSize: "20px",
              fontWeight: "700",
            },
          },
        },
      },
    },
    stroke: { width: 2, colors: ["#0D1424"] },
    tooltip: {
      theme: "dark",
      style: { fontFamily: "DM Mono, monospace", fontSize: "12px" },
    },
  };

  const donutSeries = ANCHOR_TYPES.map((t) => t.count);

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="flex flex-wrap gap-3">
        <StatChip label="Total Anchor Uses" value={TOTAL_ANCHORS} />
        <StatChip label="Unique Anchors" value={ANCHOR_ROWS.length} />
        <StatChip
          label="Exact Match %"
          value={`${exactPct.toFixed(0)}%`}
          accent={exactPct > 50}
        />
        <StatChip
          label="Generic %"
          value={`${genericPct.toFixed(0)}%`}
          accent={genericPct > 30}
        />
      </div>

      {/* Risk alert */}
      <RiskAlert level={level} />

      {/* Donut chart + legend */}
      <div
        className="rounded-xl border p-5"
        style={{ background: CARD_BG, borderColor: BORDER }}
      >
        <p
          className="mb-4 text-[10px] font-semibold uppercase tracking-[2px]"
          style={{ color: TEXT_MUTED }}
        >
          Anchor Type Distribution
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {/* Chart */}
          <div className="w-full max-w-xs shrink-0">
            <Chart
              options={donutOptions}
              series={donutSeries}
              type="donut"
              height={260}
              width="100%"
            />
          </div>

          {/* Manual legend for extra detail */}
          <div className="flex-1 space-y-3 pt-2">
            {ANCHOR_TYPES.map((t) => {
              const pct = ((t.count / TOTAL_ANCHORS) * 100).toFixed(1);
              return (
                <div key={t.label} className="flex items-center gap-3">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: t.color }}
                  />
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium" style={{ color: "#C8D0E0" }}>
                        {t.label}
                      </span>
                      <span className="font-mono text-xs" style={{ color: TEXT_DIM }}>
                        {t.count} ({pct}%)
                      </span>
                    </div>
                    <div
                      className="h-1.5 w-full overflow-hidden rounded-full"
                      style={{ background: "#0D1424" }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: t.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Anchor text frequency table */}
      <div
        className="overflow-hidden rounded-xl border"
        style={{ borderColor: BORDER }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{
                background: "#0D1424",
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: TEXT_MUTED }}
              >
                Anchor Text
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                style={{ color: TEXT_MUTED }}
              >
                Count
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                style={{ color: TEXT_MUTED }}
              >
                <button
                  onClick={() => setSortDesc((v) => !v)}
                  className="inline-flex items-center gap-1 transition-colors hover:opacity-80"
                  style={{ color: ACCENT }}
                >
                  Frequency %
                  <ArrowUpDown size={11} />
                </button>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: TEXT_MUTED }}
              >
                Top Page
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, i) => (
              <motion.tr
                key={row.text}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                style={{
                  background: i % 2 === 0 ? CARD_BG : "#0D1424",
                  borderBottom: `1px solid ${BORDER}`,
                }}
              >
                <td className="px-4 py-3">
                  <span className="text-xs font-medium" style={{ color: "#C8D0E0" }}>
                    {row.text}
                  </span>
                </td>
                <td
                  className="px-4 py-3 text-right font-mono text-xs"
                  style={{ color: "#C8D0E0" }}
                >
                  {row.count}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold"
                    style={
                      row.frequency >= 20
                        ? { background: `${ACCENT}20`, color: ACCENT }
                        : { background: "#0D1424", color: TEXT_DIM }
                    }
                  >
                    {row.frequency.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={row.topPage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[11px] transition-opacity hover:opacity-80"
                    style={{ color: TEXT_MUTED }}
                  >
                    {row.topPage}
                    <ExternalLink size={10} />
                  </a>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px]" style={{ color: TEXT_MUTED }}>
        * Anchor text reflects what the crawler captured at the link element level.
        Frequency % is calculated against the total 50 internal links in this crawl sample.
      </p>
    </div>
  );
}
