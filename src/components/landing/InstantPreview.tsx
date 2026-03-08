"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import CountUp from "react-countup";
import { Check, Lock, RotateCcw, TrendingUp } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────

export type PreviewIssue = {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  trafficImpact: { min: number; max: number };
};

export type PreviewResult = {
  domain: string;
  score: number;
  issues: PreviewIssue[];
  estimatedTrafficLoss: { min: number; max: number };
};

export type PreviewError = {
  error: "unreachable" | "rate_limited" | "failed";
  domain: string;
  score: null;
  message: string;
};

type InstantPreviewProps = {
  domain: string;
  score: number;
  issues: PreviewIssue[];
  estimatedTrafficLoss: { min: number; max: number };
  onRunAnother?: () => void;
};

// ── Helpers ───────────────────────────────────────────────────────

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

function scoreStyle(score: number) {
  if (score >= 75)
    return {
      color: "#10b981",
      badgeBg: "rgba(16,185,129,0.1)",
      badgeBorder: "rgba(16,185,129,0.2)",
      label: "Good",
    };
  if (score >= 50)
    return {
      color: "#f59e0b",
      badgeBg: "rgba(245,158,11,0.1)",
      badgeBorder: "rgba(245,158,11,0.2)",
      label: "Needs Work",
    };
  return {
    color: "#ef4444",
    badgeBg: "rgba(239,68,68,0.1)",
    badgeBorder: "rgba(239,68,68,0.2)",
    label: "Critical",
  };
}

function priorityBadge(priority: string) {
  switch (priority) {
    case "high":
      return { text: "HIGH", color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.2)" };
    case "medium":
      return { text: "MED", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" };
    default:
      return { text: "LOW", color: "#60a5fa", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.2)" };
  }
}

// ── Sub-components ────────────────────────────────────────────────

function BrowserChrome({ domain }: { domain: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
      <div className="flex items-center gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
        <span className="font-['DM_Mono'] text-xs text-gray-500">
          rankypulse.com/report/{domain}
        </span>
      </div>
      <div className="w-16" />
    </div>
  );
}

function ScorePanel({ score }: { score: number }) {
  const style = scoreStyle(score);
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-background p-4">
      <span className="mb-2 font-['DM_Mono'] text-xs tracking-widest text-gray-600">
        SEO SCORE
      </span>
      <span className="font-['Fraunces'] text-5xl font-bold" style={{ color: style.color }}>
        <CountUp start={0} end={score} duration={1.2} delay={0.1} />
      </span>
      <span className="mt-1 font-['DM_Sans'] text-xs text-gray-500">/ 100</span>
      <div
        className="mt-3 rounded-full px-3 py-1"
        style={{ background: style.badgeBg, border: `1px solid ${style.badgeBorder}` }}
      >
        <span
          className="font-['DM_Mono'] text-xs tracking-wider"
          style={{ color: style.color }}
        >
          ● {style.label.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

function IssueRow({ issue }: { issue: PreviewIssue }) {
  const badge = priorityBadge(issue.priority);
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-2.5">
      <span
        className="flex-shrink-0 rounded-full px-2 py-0.5 font-['DM_Mono'] text-[9px] tracking-wider"
        style={{ color: badge.color, background: badge.bg, border: `1px solid ${badge.border}` }}
      >
        {badge.text}
      </span>
      <span className="flex-1 truncate font-['DM_Sans'] text-xs text-gray-300">
        {issue.title}
      </span>
      <span className="flex-shrink-0 font-['DM_Mono'] text-xs text-emerald-400">
        +{issue.trafficImpact.min}–{issue.trafficImpact.max}/mo
      </span>
    </div>
  );
}

function LockedRow({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <div className="relative overflow-hidden rounded-lg border border-indigo-500/15 bg-indigo-500/5">
      {/* Blurred ghost rows */}
      <div className="flex select-none flex-col gap-1.5 p-2.5 blur-[3px]" aria-hidden>
        {Array.from({ length: Math.min(count, 2) }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded bg-white/4 px-2 py-1.5">
            <div className="h-3.5 w-8 rounded-full bg-white/10" />
            <div className="h-3 flex-1 rounded bg-white/8" />
            <div className="h-3 w-14 rounded bg-white/10" />
          </div>
        ))}
      </div>
      {/* Gradient lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-card via-card/70 to-transparent">
        <div className="flex items-center gap-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3 py-1">
          <Lock size={10} className="text-indigo-300" />
          <span className="font-['DM_Mono'] text-[10px] tracking-wider text-indigo-300">
            {count} more issue{count !== 1 ? "s" : ""} found
          </span>
        </div>
      </div>
    </div>
  );
}

function TrafficBanner({ min, max }: { min: number; max: number }) {
  return (
    <div
      className="flex items-center justify-between rounded-lg border border-indigo-500/20 p-2.5"
      style={{ background: "rgba(99,102,241,0.08)" }}
    >
      <div className="flex items-center gap-1.5">
        <TrendingUp size={13} className="text-indigo-400" />
        <span className="font-['DM_Sans'] text-xs text-gray-400">Potential traffic gain</span>
      </div>
      <span className="font-['Fraunces'] text-sm font-bold text-indigo-300">
        +{min.toLocaleString()}–{max.toLocaleString()} visits/mo
      </span>
    </div>
  );
}

const UNLOCK_FEATURES = [
  "Full site audit (50+ checks)",
  "Action Center with fix guides",
  "Rank tracking & keyword intel",
  "Weekly SEO reports to your inbox",
];

function UnlockCTA({ onRunAnother }: { onRunAnother?: () => void }) {
  return (
    <div className="border-t border-border px-6 py-5">
      <p className="mb-3 text-center font-['DM_Mono'] text-xs uppercase tracking-widest text-gray-600">
        Unlock the full SEO roadmap
      </p>
      <div className="mb-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {UNLOCK_FEATURES.map((f) => (
          <div key={f} className="flex items-start gap-1.5">
            <Check size={11} className="mt-0.5 flex-shrink-0 text-emerald-400" />
            <span className="font-['DM_Sans'] text-xs text-gray-400">{f}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/auth/signup"
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 font-['DM_Sans'] text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-400 hover:shadow-xl hover:shadow-indigo-500/30 active:translate-y-0"
        >
          Create Free Account
        </Link>
        <p className="text-center font-['DM_Sans'] text-xs text-gray-600 sm:text-right">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </div>
      {onRunAnother && (
        <button
          onClick={onRunAnother}
          className="mt-3 flex w-full items-center justify-center gap-1.5 font-['DM_Sans'] text-xs text-gray-600 transition-colors hover:text-gray-400"
        >
          <RotateCcw size={11} />
          Scan another domain
        </button>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────

export function InstantPreview({
  domain,
  score,
  issues,
  estimatedTrafficLoss,
  onRunAnother,
}: InstantPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Smooth-scroll the preview card into view once it appears
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const id = setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
    return () => clearTimeout(id);
  }, []);

  // Sort by priority before slicing
  const sorted = [...issues].sort(
    (a, b) =>
      (PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] ?? 3) -
      (PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] ?? 3)
  );
  const visibleIssues = sorted.slice(0, 3);
  const lockedCount = Math.max(0, issues.length - 3);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto mt-6 max-w-2xl"
    >
      {/* Ambient glow */}
      <div className="absolute -inset-8 rounded-full bg-indigo-500/8 blur-3xl" />

      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <BrowserChrome domain={domain} />

        {/* Score + Issues */}
        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-3">
          {/* Score panel */}
          <div className="sm:col-span-1">
            <ScorePanel score={score} />
          </div>

          {/* Issues list */}
          <div className="flex flex-col gap-2 sm:col-span-2">
            {visibleIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-6">
                <span className="font-['DM_Mono'] text-xs tracking-wider text-emerald-400">
                  NO ISSUES FOUND ✓
                </span>
                <span className="text-center font-['DM_Sans'] text-xs text-gray-500">
                  This site has excellent on-page SEO.
                </span>
              </div>
            ) : (
              <>
                {visibleIssues.map((issue) => (
                  <IssueRow key={issue.id} issue={issue} />
                ))}
                <LockedRow count={lockedCount} />
              </>
            )}
            <TrafficBanner
              min={estimatedTrafficLoss.min}
              max={estimatedTrafficLoss.max}
            />
          </div>
        </div>

        <UnlockCTA onRunAnother={onRunAnother} />
      </div>
    </motion.div>
  );
}
