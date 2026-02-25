"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
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

      {/* Main gauge */}
      <div className="mt-8 flex flex-col items-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[var(--text-secondary)]">
          SEO Health Score
        </p>
        <ScoreGauge score={adjustedScore} />
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
