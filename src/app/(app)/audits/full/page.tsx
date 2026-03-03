"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Download,
  Share2,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ExternalLink,
  Bot,
  Globe,
  Shield,
  Zap,
  BarChart2,
  Link2,
  Code2,
  FileSearch,
  Play,
} from "lucide-react";
import { FullAuditProgress } from "@/components/audit/FullAuditProgress";
import { CrawlIssuesDashboard } from "@/components/audit/CrawlIssuesDashboard";

// ─── Types ──────────────────────────────────────────────────────────────────

type IssueSeverity = "error" | "warning" | "notice";
type BotStatus = "ok" | "blocked";
type Tab = "overview" | "issues" | "crawled-pages" | "progress";

interface TopIssue {
  id: string;
  title: string;
  severity: IssueSeverity;
  affectedPages: number;
  category: string;
}

interface FullReport {
  domain: string;
  crawledAt: string;
  pagesLimit: number;
  pagesCrawled: number;
  siteHealthScore: number;
  previousScore: number | null;
  pageBreakdown: {
    healthy: number;
    broken: number;
    hasIssues: number;
    redirects: number;
    blocked: number;
  };
  errors: number;
  warnings: number;
  topIssues: TopIssue[];
  thematic: {
    robotsTxt: { score: number; status: "ok" | "issues" | "missing" };
    crawlability: number;
    https: number;
    internationalSeo: "not_implemented";
    coreWebVitals: number;
    sitePerformance: number;
    internalLinking: number;
    markup: number;
  };
  aiSearchHealth: {
    score: number;
    message: string;
    issues: number;
    bots: { name: string; status: BotStatus }[];
  };
  noData?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function scoreBg(score: number): string {
  if (score >= 80) return "rgba(16,185,129,0.08)";
  if (score >= 50) return "rgba(245,158,11,0.08)";
  return "rgba(239,68,68,0.08)";
}

function scoreBorder(score: number): string {
  if (score >= 80) return "rgba(16,185,129,0.2)";
  if (score >= 50) return "rgba(245,158,11,0.2)";
  return "rgba(239,68,68,0.2)";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Mini SVG Gauge ──────────────────────────────────────────────────────────

function MiniGauge({ score, size = 80 }: { score: number; size?: number }) {
  const color = scoreColor(score);
  const r = (size / 2) * 0.78;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = Math.PI * r; // half-circle arc length
  const strokeDash = (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size / 2 + 10 }}>
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        {/* Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Value */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference}`}
          style={{ transition: "stroke-dasharray 1s ease-out" }}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-end justify-center pb-1"
        style={{ color }}
      >
        <span className="text-xl font-bold tabular-nums leading-none">{score}%</span>
      </div>
    </div>
  );
}

// ─── Card wrapper ────────────────────────────────────────────────────────────

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.07] bg-[var(--bg-elevated)] p-5 ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Site Health Card ────────────────────────────────────────────────────────

function SiteHealthCard({ score, prevScore }: { score: number; prevScore: number | null }) {
  const delta = prevScore !== null ? score - prevScore : null;
  const color = scoreColor(score);
  const label =
    score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 40 ? "Needs Work" : "Critical";

  return (
    <Card>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Site Health
      </p>
      <div className="flex flex-col items-center">
        <MiniGauge score={score} size={110} />
        <div className="mt-3 flex items-center gap-2">
          <span
            className="rounded-full px-3 py-0.5 text-xs font-bold"
            style={{ background: scoreBg(score), color, border: `1px solid ${scoreBorder(score)}` }}
          >
            ● {label}
          </span>
        </div>
        {delta !== null && (
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            <span style={{ color: delta >= 0 ? "#10b981" : "#ef4444" }}>
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} pts
            </span>{" "}
            vs last crawl
          </p>
        )}
        <div className="mt-3 w-full border-t border-white/[0.05] pt-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[var(--text-muted)]">Your site</span>
            <span className="font-semibold" style={{ color }}>{score}%</span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-1">
            <span className="text-[var(--text-muted)]">Top-10% websites</span>
            <span className="font-semibold text-[var(--text-secondary)]">92%</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Crawled Pages Card ──────────────────────────────────────────────────────

function CrawledPagesCard({
  total,
  limit,
  breakdown,
}: {
  total: number;
  limit: number;
  breakdown: FullReport["pageBreakdown"];
}) {
  const rows = [
    { label: "Healthy", count: breakdown.healthy, color: "#10b981" },
    { label: "Broken", count: breakdown.broken, color: "#ef4444" },
    { label: "Have issues", count: breakdown.hasIssues, color: "#f59e0b" },
    { label: "Redirects", count: breakdown.redirects, color: "#3b82f6" },
    { label: "Blocked", count: breakdown.blocked, color: "#6b7280" },
  ];

  // Stacked bar segments
  const barSegments = rows.filter((r) => r.count > 0);

  return (
    <Card>
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Crawled Pages
      </p>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-bold text-[var(--text-primary)]">{total}</span>
        <span className="text-xs text-[var(--text-muted)]">of {limit} limit</span>
      </div>

      {/* Stacked bar */}
      {total > 0 && (
        <div className="mb-4 flex h-2 overflow-hidden rounded-full bg-white/[0.05]">
          {barSegments.map((seg) => (
            <div
              key={seg.label}
              style={{
                width: `${(seg.count / total) * 100}%`,
                background: seg.color,
                transition: "width 1s ease-out",
              }}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <span className="h-2 w-2 rounded-full" style={{ background: row.color }} />
              {row.label}
            </span>
            <span className="font-semibold text-[var(--text-primary)]">{row.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── AI Search Health Card ───────────────────────────────────────────────────

function AISearchHealthCard({
  score,
  message,
  issues,
}: {
  score: number;
  message: string;
  issues: number;
}) {
  const color = scoreColor(score);

  return (
    <Card>
      <div className="flex items-center gap-1.5 mb-3">
        <Bot className="h-3.5 w-3.5 text-[var(--text-muted)]" />
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          AI Search Health
          <span className="ml-1.5 rounded-full bg-purple-500/20 px-2 py-0.5 text-[9px] font-bold uppercase text-purple-400">
            beta
          </span>
        </p>
      </div>
      <div className="flex flex-col items-center">
        <MiniGauge score={score} size={110} />
        <p className="mt-3 text-center text-[11px] text-[var(--text-secondary)] leading-snug max-w-[140px]">
          {message}
        </p>
        {issues > 0 && (
          <p className="mt-2 text-xs font-semibold" style={{ color }}>
            {issues} {issues === 1 ? "issue" : "issues"} found
          </p>
        )}
      </div>
    </Card>
  );
}

// ─── Blocked from AI Search Card ─────────────────────────────────────────────

function BlockedBotsCard({ bots }: { bots: { name: string; status: BotStatus }[] }) {
  return (
    <Card>
      <div className="flex items-center gap-1.5 mb-3">
        <Shield className="h-3.5 w-3.5 text-[var(--text-muted)]" />
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Blocked from AI Search
        </p>
      </div>
      <p className="mb-3 text-xs text-[var(--text-muted)]">
        Pages crawled: —
      </p>
      <div className="flex flex-col gap-2">
        {bots.map((bot) => (
          <div key={bot.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-[var(--text-secondary)]">
              <Bot className="h-3 w-3 text-[var(--text-muted)]" />
              {bot.name}
            </span>
            {bot.status === "ok" ? (
              <span className="flex items-center gap-1 text-[#10b981] font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> All good
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#ef4444] font-semibold">
                <XCircle className="h-3.5 w-3.5" /> Blocked
              </span>
            )}
          </div>
        ))}
      </div>
      <a
        href="#"
        className="mt-3 block text-[11px] text-[var(--accent-primary)] hover:underline"
      >
        How to unblock pages ↗
      </a>
    </Card>
  );
}

// ─── Errors / Warnings + Issues Table ────────────────────────────────────────

function IssuesOverviewSection({
  errors,
  warnings,
  topIssues,
}: {
  errors: number;
  warnings: number;
  topIssues: TopIssue[];
}) {
  const severityIcon = (s: IssueSeverity) => {
    if (s === "error")
      return <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-[#ef4444]" />;
    if (s === "warning")
      return <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-[#f59e0b]" />;
    return <Info className="h-3.5 w-3.5 flex-shrink-0 text-[#3b82f6]" />;
  };

  const aiCategories = ["ai-search", "llms", "sitemap", "robots"];
  const isAI = (issue: TopIssue) =>
    aiCategories.some((k) => issue.category?.includes(k) || issue.id?.includes(k));

  return (
    <Card className="p-0 overflow-hidden">
      {/* Stat row */}
      <div className="grid grid-cols-2 divide-x divide-white/[0.05]">
        {[
          { label: "Errors", count: errors, color: "#ef4444", bg: "rgba(239,68,68,0.05)" },
          { label: "Warnings", count: warnings, color: "#f59e0b", bg: "rgba(245,158,11,0.05)" },
        ].map((stat) => (
          <div key={stat.label} className="px-6 py-4" style={{ background: stat.bg }}>
            <div className="flex items-center gap-3">
              <span
                className="text-3xl font-bold tabular-nums"
                style={{ color: stat.color }}
              >
                {stat.count}
              </span>
              {/* Mini sparkline decoration */}
              <svg width="48" height="24" viewBox="0 0 48 24" className="opacity-40">
                <polyline
                  points="0,20 8,16 16,18 24,10 32,12 40,6 48,8"
                  fill="none"
                  stroke={stat.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="mt-0.5 text-xs font-medium text-[var(--text-secondary)]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Issues table */}
      <div className="divide-y divide-white/[0.04]">
        {topIssues.length === 0 ? (
          <div className="flex items-center gap-3 px-6 py-5">
            <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
            <span className="text-sm text-[var(--text-secondary)]">No issues found — your site looks great!</span>
          </div>
        ) : (
          topIssues.map((issue) => (
            <div
              key={issue.id}
              className="flex items-center justify-between gap-4 px-6 py-3 hover:bg-white/[0.02] transition"
            >
              <div className="flex min-w-0 items-center gap-3">
                {severityIcon(issue.severity)}
                <span className="truncate text-sm text-[var(--text-secondary)]">
                  {issue.title}
                </span>
                {isAI(issue) && (
                  <span className="flex-shrink-0 rounded-full bg-purple-500/20 px-2 py-0.5 text-[9px] font-bold uppercase text-purple-400">
                    AI Search
                  </span>
                )}
              </div>
              <div className="flex flex-shrink-0 items-center gap-6 text-xs">
                <span className="font-semibold text-[var(--text-primary)]">
                  {issue.affectedPages} {issue.affectedPages === 1 ? "page" : "pages"}
                </span>
                <a
                  href={`/audits/issues`}
                  className="flex items-center gap-1 text-[var(--accent-primary)] hover:underline"
                >
                  How to fix <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

// ─── Thematic Grid ───────────────────────────────────────────────────────────

function ThematicGrid({ thematic }: { thematic: FullReport["thematic"] }) {
  const cards = [
    {
      label: "Robots.txt",
      icon: FileSearch,
      value:
        thematic.robotsTxt.status === "missing"
          ? null
          : thematic.robotsTxt.score,
      statusText:
        thematic.robotsTxt.status === "missing"
          ? "File not found"
          : thematic.robotsTxt.status === "issues"
          ? "Has issues"
          : null,
      href: null,
      tooltip: "robots.txt",
    },
    {
      label: "Crawlability",
      icon: Globe,
      value: thematic.crawlability,
      statusText: null,
      href: "/audits/issues",
      tooltip: "crawlability",
    },
    {
      label: "HTTPS",
      icon: Shield,
      value: thematic.https,
      statusText: null,
      href: "/audits/issues",
      tooltip: "https",
    },
    {
      label: "International SEO",
      icon: Globe,
      value: null,
      statusText: "Not implemented",
      href: null,
      tooltip: "international-seo",
    },
    {
      label: "Core Web Vitals",
      icon: Zap,
      value: thematic.coreWebVitals,
      statusText: null,
      href: "/audits/vitals",
      tooltip: "core-web-vitals",
    },
    {
      label: "Site Performance",
      icon: BarChart2,
      value: thematic.sitePerformance,
      statusText: null,
      href: "/audits/speed",
      tooltip: "performance",
    },
    {
      label: "Internal Linking",
      icon: Link2,
      value: thematic.internalLinking,
      statusText: null,
      href: "/audits/links",
      tooltip: "internal-linking",
    },
    {
      label: "Markup",
      icon: Code2,
      value: thematic.markup < 10 ? null : thematic.markup,
      statusText: thematic.markup < 10 ? "n/a" : null,
      href: "/audits/issues",
      tooltip: "markup",
    },
  ] as const;

  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Thematic Reports
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const numVal = typeof card.value === "number" ? card.value : null;
          const color = numVal !== null ? scoreColor(numVal) : "var(--text-muted)";
          const bg = numVal !== null ? scoreBg(numVal) : "transparent";
          const border = numVal !== null ? scoreBorder(numVal) : "rgba(255,255,255,0.07)";

          return (
            <div
              key={card.label}
              className="rounded-xl border p-4 transition hover:border-white/20 hover:bg-white/[0.03]"
              style={{ borderColor: border, background: bg }}
            >
              <div className="mb-2 flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" style={{ color }} />
                <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                  {card.label}
                </span>
              </div>

              {numVal !== null ? (
                <div className="flex items-end gap-1.5">
                  <span className="text-2xl font-bold tabular-nums" style={{ color }}>
                    {numVal}%
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-[var(--text-muted)]">
                  {card.statusText ?? "—"}
                </p>
              )}

              {card.href ? (
                <a
                  href={card.href}
                  className="mt-3 flex items-center gap-1 text-[10px] font-semibold text-[var(--accent-primary)] hover:underline"
                >
                  View details <ChevronRight className="h-3 w-3" />
                </a>
              ) : (
                <div className="mt-3 h-4" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Upgrade Banner ──────────────────────────────────────────────────────────

function UpgradeBanner() {
  const router = useRouter();
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(139,92,246,0.06) 100%)",
        border: "1px solid rgba(99,102,241,0.2)",
      }}
    >
      {/* Decorative glow */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-30"
        style={{ background: "#6366f1", filter: "blur(50px)" }}
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-bold text-white">You&apos;re only seeing part of the picture</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)] max-w-md">
            Audit more pages and fix how your site appears to both Google and AI tools like
            ChatGPT — upgrade to Starter and access all features.
          </p>
        </div>
        <button
          onClick={() => router.push("/pricing")}
          className="flex-shrink-0 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(99,102,241,0.45)]"
          style={{ background: "#6366f1" }}
        >
          Get free trial
        </button>
      </div>
    </div>
  );
}

// ─── Issues Tab ───────────────────────────────────────────────────────────────

function IssuesTab({ issues }: { issues: TopIssue[] }) {
  const [filter, setFilter] = useState<"all" | "error" | "warning" | "notice">("all");
  const filtered = filter === "all" ? issues : issues.filter((i) => i.severity === filter);

  const filters: { key: "all" | "error" | "warning" | "notice"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "error", label: "Errors" },
    { key: "warning", label: "Warnings" },
    { key: "notice", label: "Notices" },
  ];

  const sevIcon = (s: IssueSeverity) => {
    if (s === "error") return <AlertCircle className="h-4 w-4 text-[#ef4444]" />;
    if (s === "warning") return <AlertTriangle className="h-4 w-4 text-[#f59e0b]" />;
    return <Info className="h-4 w-4 text-[#3b82f6]" />;
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              filter === f.key
                ? "bg-[var(--accent-primary)] text-white"
                : "bg-white/[0.04] text-[var(--text-secondary)] hover:bg-white/[0.08]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 border-b border-white/[0.05] px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          <span>Severity</span>
          <span>Issue</span>
          <span>Pages</span>
          <span>Action</span>
        </div>
        {filtered.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-[var(--text-muted)]">
            No {filter === "all" ? "" : filter} issues found.
          </div>
        ) : (
          filtered.map((issue) => (
            <div
              key={issue.id}
              className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 border-b border-white/[0.04] px-6 py-3.5 hover:bg-white/[0.02] transition last:border-0"
            >
              <span>{sevIcon(issue.severity)}</span>
              <span className="text-sm text-[var(--text-secondary)]">{issue.title}</span>
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {issue.affectedPages}
              </span>
              <a
                href="/audits/issues"
                className="flex items-center gap-1 text-xs text-[var(--accent-primary)] hover:underline"
              >
                Fix <ChevronRight className="h-3 w-3" />
              </a>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

// ─── No Data / Empty State ────────────────────────────────────────────────────

function EmptyState({
  domain,
  onStartCrawl,
}: {
  domain: string;
  onStartCrawl: () => void;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] p-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-primary)]/10">
        <FileSearch className="h-8 w-8 text-[var(--accent-primary)]" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">
          No audit data for <span className="text-[var(--accent-primary)]">{domain}</span>
        </h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Run a full site crawl to get your Site Health score, issue breakdown, and thematic reports.
        </p>
      </div>
      <button
        onClick={onStartCrawl}
        className="flex items-center gap-2 rounded-xl bg-[var(--accent-primary)] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
      >
        <Play className="h-4 w-4" /> Start Site Audit
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FullSiteAuditPage() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [report, setReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Read domain from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored =
        localStorage.getItem("rankypulse_last_url") ??
        localStorage.getItem("rankypulse_audit_domain") ??
        "";
      const clean = stored
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0]
        .toLowerCase()
        .trim();
      setDomain(clean || "");
    }
  }, []);

  const fetchReport = useCallback(async (d: string) => {
    if (!d) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/audits/full-report?domain=${encodeURIComponent(d)}`);
      if (!res.ok) { setReport(null); return; }
      const data: FullReport = await res.json();
      setReport(data.noData ? null : data);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (domain) fetchReport(domain);
    else setLoading(false);
  }, [domain, fetchReport]);

  const handleRerun = () => {
    setActiveTab("progress");
  };

  const handleShareCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "issues", label: "Issues" },
    { key: "crawled-pages", label: "Crawled Pages" },
    { key: "progress", label: "Progress" },
  ];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 md:px-8">

        {/* ── Page Header ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-semibold text-[var(--text-primary)]">
                Site Audit:
              </h1>
              {domain ? (
                <a
                  href={`https://${domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-display text-xl font-semibold text-[var(--accent-primary)] hover:underline"
                >
                  {domain} <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <span className="font-display text-xl font-semibold text-[var(--text-muted)]">
                  —
                </span>
              )}
            </div>
            {report && !report.noData && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Updated: {formatDate(report.crawledAt)} · Desktop · JS rendering: Disabled ·
                Pages crawled: {report.pagesCrawled}/{report.pagesLimit}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRerun}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Rerun Campaign
            </button>
            <button
              onClick={handleShareCopy}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-white/[0.07]"
            >
              <Share2 className="h-3.5 w-3.5" />
              {copied ? "Copied!" : "Share"}
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-white/[0.07]">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
          </div>
        </div>

        {/* ── Tab Navigation ───────────────────────────────────────── */}
        <div className="flex items-center gap-0 border-b border-white/[0.06]">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-5 py-3 text-sm font-medium transition ${
                activeTab === tab.key
                  ? "text-[var(--accent-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[var(--accent-primary)]"
                />
              )}
            </button>
          ))}
        </div>

        {/* ── Loading skeleton ─────────────────────────────────────── */}
        {loading && (
          <div className="grid animate-pulse grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-white/[0.04]" />
            ))}
          </div>
        )}

        {/* ── Tab Content ──────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {!loading && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >

              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {!report ? (
                    <EmptyState
                      domain={domain || "your site"}
                      onStartCrawl={() => setActiveTab("progress")}
                    />
                  ) : (
                    <>
                      {/* Top 4-card grid */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <SiteHealthCard
                          score={report.siteHealthScore}
                          prevScore={report.previousScore}
                        />
                        <CrawledPagesCard
                          total={report.pagesCrawled}
                          limit={report.pagesLimit}
                          breakdown={report.pageBreakdown}
                        />
                        <AISearchHealthCard
                          score={report.aiSearchHealth.score}
                          message={report.aiSearchHealth.message}
                          issues={report.aiSearchHealth.issues}
                        />
                        <BlockedBotsCard bots={report.aiSearchHealth.bots} />
                      </div>

                      {/* Errors / Warnings + Issues table */}
                      <IssuesOverviewSection
                        errors={report.errors}
                        warnings={report.warnings}
                        topIssues={report.topIssues}
                      />

                      {/* Thematic Reports */}
                      <ThematicGrid thematic={report.thematic} />

                      {/* Upgrade Banner */}
                      <UpgradeBanner />
                    </>
                  )}
                </div>
              )}

              {/* ISSUES TAB */}
              {activeTab === "issues" && (
                <div className="space-y-4">
                  {!report ? (
                    <EmptyState
                      domain={domain || "your site"}
                      onStartCrawl={() => setActiveTab("progress")}
                    />
                  ) : (
                    <IssuesTab issues={report.topIssues} />
                  )}
                </div>
              )}

              {/* CRAWLED PAGES TAB */}
              {activeTab === "crawled-pages" && (
                <div>
                  {!report ? (
                    <EmptyState
                      domain={domain || "your site"}
                      onStartCrawl={() => setActiveTab("progress")}
                    />
                  ) : (
                    <div className="text-sm text-[var(--text-muted)] text-center py-12">
                      Run a new crawl from the{" "}
                      <button
                        onClick={() => setActiveTab("progress")}
                        className="text-[var(--accent-primary)] hover:underline"
                      >
                        Progress tab
                      </button>{" "}
                      to see a live page-by-page breakdown here.
                    </div>
                  )}
                </div>
              )}

              {/* PROGRESS TAB */}
              {activeTab === "progress" && domain && (
                <FullAuditProgress domain={domain} />
              )}
              {activeTab === "progress" && !domain && (
                <div className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center text-sm text-[var(--text-muted)]">
                  No domain selected. Run an audit first from the report page.
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
