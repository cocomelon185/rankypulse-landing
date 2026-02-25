"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useAuditStore } from "@/lib/use-audit";
import { MOCK_AUDIT } from "@/lib/audit-data";
import { SectionHeading } from "./SectionHeading";

function BenchmarkBar({
  domain,
  score,
  maxScore,
  delay,
  isYou,
}: {
  domain: string;
  score: number;
  maxScore: number;
  delay: number;
  isYou?: boolean;
}) {
  const width = Math.max(8, (score / maxScore) * 100);
  const color = isYou ? "var(--accent-primary)" : "var(--text-muted)";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay / 1000, duration: 0.4 }}
      className="flex items-center gap-3"
    >
      <span
        className={`w-40 shrink-0 truncate text-sm ${
          isYou
            ? "font-semibold text-[var(--text-primary)]"
            : "text-[var(--text-secondary)]"
        }`}
      >
        {domain}
        {isYou && (
          <span className="ml-1.5 text-[10px] font-semibold uppercase text-[var(--accent-primary)]">
            (you)
          </span>
        )}
      </span>
      <div className="relative flex-1 h-3 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ delay: delay / 1000 + 0.2, duration: 0.8, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: color }}
        />
      </div>
      <span
        className="font-mono-data w-8 text-right text-sm font-semibold"
        style={{ color }}
      >
        {score}
      </span>
    </motion.div>
  );
}

export function CompetitorBenchmark() {
  const data = useAuditStore((s) => s.data);
  const completedFixIds = useAuditStore((s) => s.completedFixIds);

  const adjustedScore = useMemo(() => {
    const base = data.score;
    const extraFixes = completedFixIds.filter(
      (id) =>
        !MOCK_AUDIT.issues.find((i) => i.id === id && i.status === "fixed")
    ).length;
    return Math.min(100, base + extraFixes * 3);
  }, [data.score, completedFixIds]);

  const all = [
    { domain: data.domain, score: adjustedScore, isYou: true },
    ...data.competitors.map((c) => ({ ...c, isYou: false })),
  ].sort((a, b) => b.score - a.score);

  const maxScore = Math.max(...all.map((c) => c.score), 100);
  const avgScore = Math.round(
    data.competitors.reduce((sum, c) => sum + c.score, 0) / data.competitors.length
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="audit-card p-6 md:p-8"
    >
      <SectionHeading
        title="Competitor Benchmark"
        subtitle={`Based on sites ranking for your top 5 keywords · Industry avg: ${avgScore}`}
      />

      <div className="mt-5 space-y-3">
        {all.map((entry, idx) => (
          <BenchmarkBar
            key={entry.domain}
            domain={entry.domain}
            score={entry.score}
            maxScore={maxScore}
            delay={200 + idx * 100}
            isYou={entry.isYou}
          />
        ))}
      </div>
    </motion.section>
  );
}
