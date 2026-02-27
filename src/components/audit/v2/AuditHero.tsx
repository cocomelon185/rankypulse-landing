"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ExternalLink, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { ScoreGauge } from "../ScoreGauge";
import { ScoreHistory } from "../ScoreHistory";
import { useCountUp } from "@/hooks/useCountUp";
import { useAuditStore } from "@/lib/use-audit";
import { MOCK_AUDIT } from "@/lib/audit-data";
import { ShareScoreCard } from "./ShareScoreCard";
import { ReauditButton } from "./ReauditButton";

function MetricCard({
  value,
  label,
  delay,
  color,
}: {
  value: number | string;
  label: string;
  delay: number;
  color?: string;
}) {
  const numericValue = typeof value === "number" ? value : 0;
  const animated = useCountUp({ end: numericValue, delay, duration: 800 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.5 }}
      className="audit-card flex flex-col items-center justify-center px-4 py-4 text-center"
    >
      <span
        className="font-display text-2xl font-bold tabular-nums"
        style={{ color: color ?? "var(--text-primary)" }}
      >
        {typeof value === "string" ? value : animated}
      </span>
      <span className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
        {label}
      </span>
    </motion.div>
  );
}

export function AuditHero() {
  const data = useAuditStore((s) => s.data);
  const completedFixIds = useAuditStore((s) => s.completedFixIds);

  const openIssuesCount = useMemo(
    () =>
      data.issues.filter(
        (i) => i.status === "open" || i.status === "in-progress"
      ).length,
    [data.issues]
  );

  const completedCount = completedFixIds.length;

  const adjustedScore = useMemo(() => {
    const base = data.score;
    const extraFixes = completedFixIds.filter(
      (id) =>
        !MOCK_AUDIT.issues.find((i) => i.id === id && i.status === "fixed")
    ).length;
    return Math.min(100, base + extraFixes * 3);
  }, [data.score, completedFixIds]);

  const scannedDate = new Date(data.lastScanned).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });

  // Score delta vs previous scan
  const scoreDelta = useMemo(() => {
    if (data.scoreHistory.length < 2) return null;
    const prev = data.scoreHistory[data.scoreHistory.length - 2].score;
    return adjustedScore - prev;
  }, [adjustedScore, data.scoreHistory]);

  const errorsCount = useMemo(() => data.issues.filter(i => i.priority === 'critical' || i.priority === 'high').length, [data.issues]);
  const warningsCount = useMemo(() => data.issues.filter(i => i.priority === 'medium').length, [data.issues]);
  const noticesCount = useMemo(() => data.issues.filter(i => i.priority === 'low' || i.priority === 'opportunity').length, [data.issues]);
  const healthyPercent = Math.max(0, 100 - Math.round((openIssuesCount / Math.max(1, data.issues.length)) * 100));

  const thematicScores = useMemo(() => {
    // These would ideally come from the API, but we'll infer them from the data we have for now
    const calcScore = (issueType: string) => {
      const typeIssues = data.issues.filter(i => JSON.stringify(i).toLowerCase().includes(issueType));
      return Math.max(0, 100 - (typeIssues.length * 5));
    };

    const crawlability = calcScore('canonical');
    const https = calcScore('http');
    const performance = calcScore('speed') || calcScore('image');
    // Using adjustedScore and open counts as proxies for remaining areas
    const internalLinking = Math.min(100, adjustedScore + 10);
    const markup = calcScore('schema') || calcScore('meta');
    // Core Web Vitals often correlates with performance but we'll give it a slight penalty if there are open notices
    const cwv = Math.max(0, performance - noticesCount * 2);

    const getColor = (score: number) => {
      if (score >= 80) return "#10b981";
      if (score >= 50) return "#f97316";
      return "#ef4444";
    };

    return [
      { label: "Crawlability", score: crawlability, color: getColor(crawlability) },
      { label: "HTTPS", score: https, color: getColor(https) },
      { label: "Site Performance", score: performance, color: getColor(performance) },
      { label: "Internal Linking", score: internalLinking, color: getColor(internalLinking) },
      { label: "Markup", score: markup, color: getColor(markup) },
      { label: "Core Web Vitals", score: cwv, color: getColor(cwv) },
    ];
  }, [data.issues, adjustedScore, noticesCount]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="audit-card p-6 md:p-8"
    >
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-xl font-semibold text-[var(--text-primary)]">
            {data.domain}
          </h1>
          <a
            href={`https://${data.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-[var(--accent-primary)] transition hover:bg-[var(--accent-primary)]/10"
          >
            Live <ExternalLink className="h-3 w-3" />
          </a>
          {/* Share score card button */}
          <ShareScoreCard />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Score delta */}
          {scoreDelta !== null && (
            <span className="flex items-center gap-1 font-mono-data text-[11px]">
              <span style={{ color: scoreDelta >= 0 ? "#10b981" : "#ef4444" }}>
                {scoreDelta >= 0 ? "↑" : "↓"} {scoreDelta >= 0 ? "+" : ""}{scoreDelta} pts
              </span>
              <span className="text-[var(--text-muted)]">since last audit</span>
            </span>
          )}
          <span className="text-xs text-[var(--text-muted)]">
            {scannedDate}
          </span>
          {data.scoreHistory.length >= 2 && (
            <ScoreHistory history={data.scoreHistory} />
          )}
          {/* Re-audit button */}
          <ReauditButton />
        </div>
      </div>

      {/* Main gauge and Semrush-style breakdown */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6 shadow-sm">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[var(--text-secondary)]">
            SEO Health Score
          </p>
          <ScoreGauge score={adjustedScore} />
        </div>

        <div className="flex flex-col justify-center gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center justify-center rounded-xl border border-[#ef4444]/20 bg-[#ef4444]/5 p-4 transition hover:bg-[#ef4444]/10">
              <span className="font-display text-2xl font-bold tabular-nums text-[#ef4444]">{errorsCount}</span>
              <span className="mt-1 flex items-center justify-center gap-1 text-xs font-medium text-[var(--text-secondary)]">
                <AlertCircle className="h-3 w-3 text-[#ef4444]" /> Errors
              </span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl border border-[#f97316]/20 bg-[#f97316]/5 p-4 transition hover:bg-[#f97316]/10">
              <span className="font-display text-2xl font-bold tabular-nums text-[#f97316]">{warningsCount}</span>
              <span className="mt-1 flex items-center justify-center gap-1 text-xs font-medium text-[var(--text-secondary)]">
                <AlertTriangle className="h-3 w-3 text-[#f97316]" /> Warnings
              </span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl border border-[#3b82f6]/20 bg-[#3b82f6]/5 p-4 transition hover:bg-[#3b82f6]/10">
              <span className="font-display text-2xl font-bold tabular-nums text-[#3b82f6]">{noticesCount}</span>
              <span className="mt-1 flex items-center justify-center gap-1 text-xs font-medium text-[var(--text-secondary)]">
                <Info className="h-3 w-3 text-[#3b82f6]" /> Notices
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
              <h4 className="mb-3 font-display text-sm font-semibold text-[var(--text-primary)]">Crawled Pages</h4>
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90 transform">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/[0.05]" strokeWidth="4" />
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-[#10b981]" strokeWidth="4" strokeDasharray={`${healthyPercent}, 100`} />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[var(--text-primary)]">{healthyPercent}%</span>
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-[var(--text-secondary)]"><span className="h-2 w-2 rounded-full bg-[#10b981]"></span>Healthy</span>
                    <span className="font-medium text-[var(--text-primary)]">{Math.max(0, 50 - openIssuesCount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-[var(--text-secondary)]"><span className="h-2 w-2 rounded-full bg-[#ef4444]"></span>Broken</span>
                    <span className="font-medium text-[var(--text-primary)]">{errorsCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-[var(--text-secondary)]"><span className="h-2 w-2 rounded-full bg-[#f97316]"></span>Issues</span>
                    <span className="font-medium text-[var(--text-primary)]">{warningsCount + noticesCount}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
              <h4 className="mb-3 font-display text-sm font-semibold text-[var(--text-primary)]">Top Issues</h4>
              <div className="flex flex-col gap-2.5">
                {data.issues.slice(0, 3).map((issue) => (
                  <div key={issue.id} className="group flex items-start justify-between gap-3">
                    <p className="line-clamp-1 cursor-default text-xs text-[var(--text-secondary)] transition group-hover:text-[var(--text-primary)]">
                      {issue.title}
                    </p>
                    <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider ${issue.priority === 'critical' || issue.priority === 'high' ? 'text-[#ef4444]' : 'text-[#f97316]'}`}>
                      {issue.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thematic Reports (Semrush style) */}
      <div className="mt-8">
        <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-[var(--text-secondary)]">Thematic Reports</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {thematicScores.map((report) => (
            <div key={report.label} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 flex flex-col items-center gap-3 transition hover:border-white/10 hover:bg-white/[0.04]">
              <div className="relative h-12 w-12">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90 transform">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/[0.05]" strokeWidth="3.5" />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="transition-all duration-1000 ease-out"
                    stroke={report.color}
                    strokeWidth="3.5"
                    strokeDasharray={`${report.score}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[var(--text-primary)]">
                  {report.score}%
                </div>
              </div>
              <span className="text-center text-[11px] font-medium leading-tight text-[var(--text-secondary)]">{report.label}</span>
              <button className="mt-auto rounded-lg bg-white/[0.05] px-3 py-1 text-[10px] font-semibold text-[var(--text-primary)] hover:bg-white/10 transition">
                Details
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Metric cards grid */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          value={openIssuesCount}
          label="Issues Found"
          delay={200}
          color="var(--accent-secondary)"
        />
        <MetricCard
          value={completedCount}
          label="Fixed"
          delay={400}
          color="var(--accent-success)"
        />
        <MetricCard
          value={data.roadmap.filter((r) => r.isLocked).length}
          label="Locked"
          delay={600}
          color="var(--text-muted)"
        />
        <MetricCard
          value={`${data.estimatedTrafficLoss.min}–${data.estimatedTrafficLoss.max}`}
          label="Potential visits/mo"
          delay={800}
          color="var(--accent-primary)"
        />
      </div>
    </motion.section>
  );
}

