"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Search,
  TrendingUp,
  Zap,
  Target,
  ArrowRight,
  ExternalLink,
  Clock,
} from "lucide-react";
import CountUp from "react-countup";
import { extractAuditDomain, isValidExtractedDomain } from "@/lib/url-validation";
import { useAuth } from "@/hooks/useAuth";

// ── Data types ─────────────────────────────────────────────────────────────────

export interface RecentAudit {
  domain: string;
  score: number;
  date: string;
}

export interface ScoreTrendPoint {
  day: string;
  score: number;
}

export interface DashboardClientProps {
  recentAudits?: RecentAudit[];
  avgScore?: number;
  fixedCount?: number;
  potentialScore?: number;
  scoreTrend?: ScoreTrendPoint[];
}

// ── Default mock data (shown before real data is wired) ───────────────────────

const DEFAULT_TREND: ScoreTrendPoint[] = [
  { day: "Mon", score: 52 },
  { day: "Tue", score: 55 },
  { day: "Wed", score: 58 },
  { day: "Thu", score: 62 },
  { day: "Fri", score: 65 },
  { day: "Sat", score: 68 },
  { day: "Sun", score: 72 },
];

const DEFAULT_AUDITS: RecentAudit[] = [
  { domain: "example.com", score: 78, date: "Today" },
  { domain: "mysite.com", score: 62, date: "Yesterday" },
  { domain: "project.io", score: 45, date: "2 days ago" },
];

const QUICK_START = [
  { label: "Run your first audit", done: true },
  { label: "Fix meta title & description", done: true },
  { label: "Add schema markup", done: false },
  { label: "Track discoverability score", done: false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getScoreStyle(score: number) {
  if (score >= 80) return { color: "#10b981", label: "GOOD", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)" };
  if (score >= 60) return { color: "#f59e0b", label: "OK", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" };
  return { color: "#ef4444", label: "POOR", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

// ── Animation variants ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

// ── Custom chart tooltip ──────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1e2e] px-4 py-3 shadow-xl">
      <p className="mb-1 font-['DM_Mono'] text-xs text-gray-500">{label}</p>
      <p className="font-['Fraunces'] text-2xl font-bold text-white">{payload[0].value}</p>
      <p className="font-['DM_Mono'] text-xs text-indigo-400">/100</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DashboardClient({
  recentAudits = DEFAULT_AUDITS,
  avgScore = 62,
  fixedCount = 8,
  potentialScore = 94,
  scoreTrend = DEFAULT_TREND,
}: DashboardClientProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true });
  const [domain, setDomain] = useState("");

  const doneCount = QUICK_START.filter((s) => s.done).length;
  const progress = (doneCount / QUICK_START.length) * 100;

  const auditCount = recentAudits.length;

  const STATS = [
    {
      value: auditCount,
      label: "Audits this month",
      icon: Search,
      color: "#6366f1",
      bg: "rgba(99,102,241,0.1)",
      border: "rgba(99,102,241,0.2)",
    },
    {
      value: avgScore,
      label: "Avg. discoverability",
      icon: TrendingUp,
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
      border: "rgba(16,185,129,0.2)",
      badge: "+12%",
      badgeColor: "#10b981",
    },
    {
      value: fixedCount,
      label: "Quick wins fixed",
      icon: Zap,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.2)",
    },
    {
      value: potentialScore,
      label: "Potential score",
      icon: Target,
      color: "#a5b4fc",
      bg: "rgba(165,180,252,0.1)",
      border: "rgba(165,180,252,0.2)",
    },
  ] as const;

  const handleNewAudit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem("domain") as HTMLInputElement | null;
    const rawValue = (input?.value ?? domain).trim();
    const cleaned = extractAuditDomain(rawValue);
    if (!isValidExtractedDomain(cleaned)) return;

    if (isAuthenticated) {
      try {
        const res = await fetch("/api/usage/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: cleaned }),
        });
        const data = await res.json() as { allowed?: boolean };
        if (!data.allowed) {
          // Show error in domain input field via browser validation
          const inputEl = e.currentTarget?.elements?.namedItem("domain") as HTMLInputElement | null;
          if (inputEl) {
            inputEl.setCustomValidity("Audit limit reached. Upgrade to continue.");
            inputEl.reportValidity();
          }
          return;
        }
      } catch {
        // Fail open on network error
      }
    }

    router.push(`/report/${cleaned}`);
  };

  const dateLabel = new Date()
    .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    .toUpperCase();

  return (
    <div className="relative">
      <div className="relative">


        {/* ── Header ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 font-['DM_Mono'] text-xs uppercase tracking-widest text-indigo-400">
                {dateLabel}
              </p>
              <h1 className="font-['Fraunces'] text-4xl font-bold leading-tight tracking-tight text-white">
                Good {getGreeting()}
              </h1>
              <p className="mt-1 font-['DM_Sans'] text-gray-400">
                Here&apos;s how your sites are performing
              </p>
            </div>

            {/* Inline audit input */}
            <form onSubmit={handleNewAudit} className="flex flex-shrink-0 gap-2">
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
                />
                <input
                  name="domain"
                  type="text"
                  autoComplete="off"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="audit a new domain..."
                  className="w-56 rounded-xl border border-white/8 bg-white/5 py-2.5 pl-8 pr-4 font-['DM_Sans'] text-sm text-white placeholder-gray-600 transition-all focus:border-indigo-500/50 focus:bg-indigo-500/4 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-indigo-500 px-4 py-2.5 font-['DM_Sans'] text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/25"
              >
                <Zap size={13} />
                Audit
              </button>
            </form>
          </div>
        </motion.div>

        {/* ── Stat cards ── */}
        <motion.div
          ref={statsRef}
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="group rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "#13161f", borderColor: "rgba(255,255,255,0.06)" }}
              >
                <div
                  className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
                  style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
                >
                  <Icon size={16} style={{ color: stat.color }} />
                </div>

                <div className="mb-1 flex items-end gap-2">
                  <span className="font-['Fraunces'] text-3xl font-bold text-white">
                    {statsInView ? (
                      <CountUp start={0} end={stat.value} duration={1.2} delay={i * 0.1} />
                    ) : (
                      0
                    )}
                  </span>
                  {"badge" in stat && stat.badge && (
                    <span
                      className="mb-1 rounded-md px-1.5 py-0.5 font-['DM_Mono'] text-xs font-semibold"
                      style={{
                        color: stat.badgeColor,
                        background: `${stat.badgeColor}18`,
                      }}
                    >
                      {stat.badge} ↑
                    </span>
                  )}
                </div>

                <p className="font-['DM_Mono'] text-xs uppercase tracking-wider text-gray-600">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Score trend chart ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="mb-6 rounded-2xl border border-white/6 p-6"
          style={{ background: "#13161f" }}
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-['Fraunces'] text-xl font-bold text-white">
                Discoverability score trend
              </h2>
              <p className="mt-0.5 font-['DM_Sans'] text-xs text-gray-500">
                Last 7 days across all your audited domains
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="font-['DM_Mono'] text-xs text-emerald-400">+38% this week</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={scoreTrend}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fill: "#475569", fontSize: 11, fontFamily: "DM Mono" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#475569", fontSize: 11, fontFamily: "DM Mono" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#scoreGradient)"
                dot={{ fill: "#6366f1", stroke: "#0d0f14", strokeWidth: 2, r: 4 }}
                activeDot={{ fill: "#a5b4fc", stroke: "#0d0f14", strokeWidth: 2, r: 6 }}
                isAnimationActive
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ── Quick Start + Next Best Action ── */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">

          {/* Quick Start */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="rounded-2xl border border-white/6 p-6"
            style={{ background: "#13161f" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-['Fraunces'] text-lg font-bold text-white">Quick Start</h2>
                <p className="mt-0.5 font-['DM_Mono'] text-xs text-gray-600">
                  {doneCount}/{QUICK_START.length} COMPLETE
                </p>
              </div>
              <span
                className="font-['Fraunces'] text-xl font-bold"
                style={{ color: progress === 100 ? "#10b981" : "#6366f1" }}
              >
                {Math.round(progress)}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/6">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #6366f1, #10b981)" }}
                initial={{ width: "0%" }}
                whileInView={{ width: `${progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              />
            </div>

            {/* Steps */}
            <div className="space-y-2.5">
              {QUICK_START.map((step, i) => (
                <div
                  key={step.label}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200 ${step.done
                    ? "border-emerald-500/10 bg-emerald-500/5"
                    : "border-white/5 bg-white/2"
                    }`}
                >
                  {step.done ? (
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20">
                      <svg width="10" height="10" viewBox="0 0 10 10">
                        <path
                          d="M2 5l2.5 2.5L8 3"
                          stroke="#10b981"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
                      <span className="font-['DM_Mono'] text-xs text-gray-600">{i + 1}</span>
                    </div>
                  )}
                  <span
                    className={`font-['DM_Sans'] text-sm transition-colors ${step.done ? "text-gray-600 line-through" : "text-gray-300"
                      }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push("/")}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/8 py-2.5 font-['DM_Sans'] text-sm text-gray-400 transition-all hover:border-white/15 hover:bg-white/5 hover:text-white"
            >
              <Search size={13} />
              Run new audit
            </button>
          </motion.div>

          {/* Next Best Action */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="flex flex-col rounded-2xl border border-white/6 p-6"
            style={{ background: "#13161f" }}
          >
            <div className="mb-5 flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
              <h2 className="font-['Fraunces'] text-lg font-bold text-white">
                Next Best Action
              </h2>
            </div>

            <div className="flex-1 rounded-xl border border-indigo-500/15 bg-indigo-500/5 p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/25 bg-indigo-500/15">
                <Target size={18} className="text-indigo-400" />
              </div>
              <h3 className="mb-2 font-['Fraunces'] text-lg font-bold text-white">
                Add schema markup to your homepage
              </h3>
              <p className="mb-1 font-['DM_Sans'] text-sm leading-relaxed text-gray-400">
                Structured data can boost your search visibility by up to 15% and make
                you eligible for rich results in Google.
              </p>
              <p className="mb-5 font-['DM_Mono'] text-xs text-indigo-400">
                ↗ +50–300 visits/mo estimated
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    recentAudits[0]
                      ? router.push(`/report/${recentAudits[0].domain}`)
                      : router.push("/")
                  }
                  className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 font-['DM_Sans'] text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/25"
                >
                  <Zap size={13} />
                  Fix now
                </button>
                <button className="rounded-xl border border-white/8 px-4 py-2.5 font-['DM_Sans'] text-sm text-gray-400 transition-all hover:bg-white/5 hover:text-white">
                  Learn more
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Recent Audits ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="overflow-hidden rounded-2xl border border-white/6"
          style={{ background: "#13161f" }}
        >
          {/* Table header */}
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
            <h2 className="font-['Fraunces'] text-lg font-bold text-white">Recent Audits</h2>
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-1.5 font-['DM_Sans'] text-sm text-indigo-400 transition-colors hover:text-indigo-300"
            >
              Run new
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Column labels */}
          <div className="grid grid-cols-3 border-b border-white/5 px-6 py-2.5 md:grid-cols-4">
            {["URL", "Score", "Date", "Actions"].map((col, i) => (
              <span
                key={col}
                className={`font-['DM_Mono'] text-xs uppercase tracking-wider text-gray-600 ${i === 2 ? "hidden md:block" : ""
                  }`}
              >
                {col}
              </span>
            ))}
          </div>

          {/* Rows */}
          {recentAudits.length > 0 ? (
            <div className="divide-y divide-white/4">
              {recentAudits.map((audit, i) => {
                const style = getScoreStyle(audit.score);
                return (
                  <motion.div
                    key={`${audit.domain}-${i}`}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="group grid cursor-pointer grid-cols-3 items-center px-6 py-4 transition-colors hover:bg-white/2 md:grid-cols-4"
                    onClick={() => router.push(`/report/${audit.domain}`)}
                  >
                    {/* Domain */}
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/5">
                        <span className="font-['DM_Mono'] text-xs text-gray-500">
                          {audit.domain[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="font-['DM_Sans'] text-sm font-semibold text-white transition-colors group-hover:text-indigo-300">
                        {audit.domain}
                      </span>
                    </div>

                    {/* Score badge */}
                    <div>
                      <div
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
                        style={{ background: style.bg, borderColor: style.border }}
                      >
                        <div
                          className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                          style={{ background: style.color }}
                        />
                        <span
                          className="font-['Fraunces'] text-sm font-bold"
                          style={{ color: style.color }}
                        >
                          {audit.score}
                        </span>
                        <span
                          className="font-['DM_Mono'] text-xs"
                          style={{ color: style.color }}
                        >
                          {style.label}
                        </span>
                      </div>
                    </div>

                    {/* Date — hidden on mobile */}
                    <div className="hidden items-center gap-1.5 md:flex">
                      <Clock size={12} className="text-gray-600" />
                      <span className="font-['DM_Sans'] text-sm text-gray-500">
                        {audit.date}
                      </span>
                    </div>

                    {/* Action */}
                    <div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/report/${audit.domain}`);
                        }}
                        className="flex items-center gap-1.5 font-['DM_Sans'] text-sm text-indigo-400 transition-all hover:gap-2.5 hover:text-indigo-300"
                      >
                        View
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
                <Search size={22} className="text-indigo-400" />
              </div>
              <h3 className="mb-2 font-['Fraunces'] text-xl font-bold text-white">
                No audits yet
              </h3>
              <p className="mb-6 font-['DM_Sans'] text-sm text-gray-400">
                Run your first audit to see results here
              </p>
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 font-['DM_Sans'] text-sm font-semibold text-white transition-colors hover:bg-indigo-400"
              >
                <Zap size={14} />
                Run free audit
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

