"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Plus,
  Upload,
  ChevronRight,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

// ── Sparkline data ────────────────────────────────────────────────────────────
const SPARK: Record<string, number[]> = {
  seo:       [68, 72, 70, 75, 78, 80, 92],
  traffic:   [120, 135, 128, 148, 160, 172, 187],
  keywords:  [13200, 13400, 13100, 12900, 12700, 12500, 12450],
  backlinks: [3300, 3420, 3500, 3600, 3700, 3820, 3892],
};

function Sparkline({
  data,
  color,
  trend,
}: {
  data: number[];
  color: string;
  trend: "up" | "down";
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const h = 32;
  const w = 72;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  );
}

// ── Keyword Rankings chart data ───────────────────────────────────────────────
const RANKINGS_DATA = [
  { month: "Jan", top3: 18, top10: 42, top100: 95 },
  { month: "Feb", top3: 22, top10: 50, top100: 108 },
  { month: "Mar", top3: 28, top10: 58, top100: 120 },
  { month: "Apr", top3: 35, top10: 68, top100: 134 },
];

// ── Metric cards ──────────────────────────────────────────────────────────────
const METRICS = [
  {
    label: "SEO Score",
    value: "92",
    suffix: "/100",
    delta: "+4.3%",
    trend: "up" as const,
    sparkKey: "seo",
    deltaColor: "#00C853",
  },
  {
    label: "Traffic",
    value: "187.3K",
    suffix: "",
    delta: "+12.8%",
    trend: "up" as const,
    sparkKey: "traffic",
    deltaColor: "#00C853",
  },
  {
    label: "Keywords",
    value: "12,450",
    suffix: "",
    delta: "-2.11%",
    trend: "down" as const,
    sparkKey: "keywords",
    deltaColor: "#FF3D3D",
  },
  {
    label: "Backlinks",
    value: "3,892",
    suffix: "",
    delta: "+6.4%",
    trend: "up" as const,
    sparkKey: "backlinks",
    deltaColor: "#00C853",
  },
];

// ── Recent audits ─────────────────────────────────────────────────────────────
const AUDITS = [
  { domain: "rankypulse.com",  score: 92, status: "Completed",   updated: "2h ago" },
  { domain: "clientsite.io",   score: 88, status: "Completed",   updated: "1d ago" },
  { domain: "newproject.com",  score: 74, status: "In Progress", updated: "3d ago" },
];

function scoreColor(s: number) {
  if (s >= 80) return "#00C853";
  if (s >= 60) return "#FF9800";
  return "#FF3D3D";
}

// ── Site Health gauge ─────────────────────────────────────────────────────────
function SiteHealthGauge({ score = 92 }: { score?: number }) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <div className="relative w-44 h-44 flex items-center justify-center mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} stroke="#1E2940" strokeWidth="10" fill="none" />
        <circle
          cx="80" cy="80" r={r}
          stroke="#FF642D" strokeWidth="10" fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 8px rgba(255,100,45,0.5))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white leading-none">{score}</span>
        <span className="text-sm font-semibold mt-1" style={{ color: "#00C853" }}>Excellent</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function DashboardClient() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* ── Zone A: Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7A99" }}>
            Overview of your SEO performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors hover:bg-white/[0.04]"
            style={{ background: "#151B27", borderColor: "#1E2940", color: "#C8D0E0" }}
          >
            Last 30 days <ChevronDown size={14} />
          </button>
          <button
            onClick={() => router.push("/audits/full")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "#FF642D" }}
          >
            <Plus size={16} /> New Audit
          </button>
        </div>
      </div>

      {/* ── Zone B: 4 Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-xl border p-5 cursor-pointer transition-all hover:border-[#FF642D]/30"
            style={{ background: "#151B27", borderColor: "#1E2940" }}
          >
            <p className="text-xs font-semibold mb-3" style={{ color: "#6B7A99" }}>
              {m.label}
            </p>
            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white leading-none">{m.value}</span>
                  {m.suffix && (
                    <span className="text-sm font-medium" style={{ color: "#6B7A99" }}>
                      {m.suffix}
                    </span>
                  )}
                </div>
                <div
                  className="flex items-center gap-0.5 mt-1.5 text-xs font-semibold"
                  style={{ color: m.deltaColor }}
                >
                  {m.trend === "up" ? (
                    <ArrowUpRight size={13} />
                  ) : (
                    <ArrowDownRight size={13} />
                  )}
                  {m.delta}
                </div>
              </div>
              <Sparkline data={SPARK[m.sparkKey]} color={m.deltaColor} trend={m.trend} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Zone C: Middle 3-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Site Health (4 cols) */}
        <div
          className="lg:col-span-4 rounded-xl border p-6 flex flex-col"
          style={{ background: "#151B27", borderColor: "#1E2940" }}
        >
          <h2 className="text-sm font-bold text-white mb-6">Site Health</h2>

          <SiteHealthGauge score={92} />

          {/* Legend */}
          <div className="mt-6 space-y-2">
            {[
              { label: "Errors",   count: 2,  color: "#FF3D3D" },
              { label: "Warnings", count: 14, color: "#FF9800" },
              { label: "Notices",  count: 28, color: "#00B0FF" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-2 text-sm" style={{ color: "#8B9BB4" }}>
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: row.color }} />
                {row.label}
                <span className="ml-auto font-semibold text-white">{row.count}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push("/audits/full")}
            className="mt-6 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "#FF642D" }}
          >
            Run Full Audit
          </button>
        </div>

        {/* Keyword Rankings (5 cols) */}
        <div
          className="lg:col-span-5 rounded-xl border p-6 flex flex-col"
          style={{ background: "#151B27", borderColor: "#1E2940" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white">Keyword Rankings</h2>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-white/[0.04]"
              style={{ borderColor: "#1E2940", color: "#8B9BB4" }}
            >
              <Upload size={12} /> Export
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4">
            {[
              { label: "Top 3",   color: "#FF642D" },
              { label: "Top 10",  color: "#7B5CF5" },
              { label: "Top 100", color: "#421984" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs" style={{ color: "#8B9BB4" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>

          <div className="flex-1 min-h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={RANKINGS_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF642D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF642D" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g10" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7B5CF5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7B5CF5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g100" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#421984" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#421984" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#4A5568", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fill: "#4A5568", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0D1424", border: "1px solid #1E2940", borderRadius: 8, color: "#C8D0E0", fontSize: 12 }}
                  cursor={{ stroke: "#1E2940" }}
                />
                <Area type="monotone" dataKey="top3"   stroke="#FF642D" fill="url(#g3)"   strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="top10"  stroke="#7B5CF5" fill="url(#g10)"  strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="top100" stroke="#421984" fill="url(#g100)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Insights (3 cols) */}
        <div
          className="lg:col-span-3 rounded-xl border p-6 flex flex-col gap-5"
          style={{ background: "#151B27", borderColor: "#1E2940" }}
        >
          <h2 className="text-sm font-bold text-white">Quick Insights</h2>

          {/* +35 New Keywords */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold" style={{ color: "#00C853" }}>
                &gt; +35
              </span>
            </div>
            <p className="text-xs" style={{ color: "#8B9BB4" }}>New Keywords Ranked</p>
          </div>

          <div className="h-px" style={{ background: "#1E2940" }} />

          {/* 5 Issues */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold" style={{ color: "#FF3D3D" }}>⚑ 5</span>
            </div>
            <p className="text-xs" style={{ color: "#8B9BB4" }}>Issues Detected</p>
            <button
              onClick={() => router.push("/audits/issues")}
              className="text-xs font-semibold flex items-center gap-0.5 mt-0.5 w-fit"
              style={{ color: "#FF642D" }}
            >
              Fix Now <ArrowUpRight size={11} />
            </button>
          </div>

          <div className="h-px" style={{ background: "#1E2940" }} />

          {/* 2.1K Backlinks */}
          <div className="flex flex-col gap-1">
            <span className="text-xl font-bold" style={{ color: "#7B5CF5" }}>🔗 2.1K</span>
            <p className="text-xs" style={{ color: "#8B9BB4" }}>Backlinks Gained</p>
          </div>

          <div className="h-px" style={{ background: "#1E2940" }} />

          {/* Next Audit */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "#6B7A99" }}>
              <Calendar size={12} /> Next Audit in
            </div>
            <span className="text-2xl font-bold text-white">3 days</span>
          </div>
        </div>
      </div>

      {/* ── Zone D: Recent Audits ── */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "#151B27", borderColor: "#1E2940" }}
      >
        {/* Table header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#1E2940" }}>
          <h2 className="text-sm font-bold text-white">Recent Audits</h2>
          <button
            onClick={() => router.push("/audits")}
            className="text-sm font-semibold transition-colors hover:opacity-80"
            style={{ color: "#FF642D" }}
          >
            View All
          </button>
        </div>

        {/* Column headers */}
        <div
          className="grid grid-cols-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider"
          style={{ color: "#4A5568", borderBottom: "1px solid #1E2940" }}
        >
          <span>Website</span>
          <span>Score</span>
          <span>Status</span>
          <span>Updated</span>
        </div>

        {/* Rows */}
        {AUDITS.map((audit, i) => (
          <div
            key={audit.domain}
            className={cn(
              "grid grid-cols-4 px-6 py-4 items-center cursor-pointer transition-colors hover:bg-white/[0.02]",
              i < AUDITS.length - 1 ? "border-b" : ""
            )}
            style={i < AUDITS.length - 1 ? { borderColor: "#1E2940" } : {}}
            onClick={() => router.push(`/report/${audit.domain}`)}
          >
            {/* Domain */}
            <span className="text-sm font-medium text-white">{audit.domain}</span>

            {/* Score */}
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold" style={{ color: scoreColor(audit.score) }}>
                {audit.score}
              </span>
              <span className="text-xs" style={{ color: "#4A5568" }}>/100</span>
            </div>

            {/* Status badge */}
            <span>
              {audit.status === "Completed" ? (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(0,200,83,0.12)", color: "#00C853" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  Completed
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(0,176,255,0.12)", color: "#00B0FF" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  In Progress
                </span>
              )}
            </span>

            {/* Updated + arrow */}
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "#6B7A99" }}>{audit.updated}</span>
              <ChevronRight size={15} style={{ color: "#4A5568" }} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
