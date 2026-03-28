"use client";

import { useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BarChart2 } from "lucide-react";
import { useAuditStore } from "@/lib/use-audit";

const NICHE_AVERAGES: Record<string, number> = {
  ecommerce: 61,
  saas: 68,
  local: 55,
  blog: 63,
  agency: 70,
  default: 62,
};

const NICHE_LABELS: Record<string, string> = {
  ecommerce: "E-commerce",
  saas: "SaaS",
  local: "Local Business",
  blog: "Blog / Media",
  agency: "Agency",
  default: "Industry",
};

function guessNiche(domain: string): string {
  const d = domain.toLowerCase();
  if (d.includes("shop") || d.endsWith(".store") || d.includes("commerce")) return "ecommerce";
  if (d.includes("agency") || d.includes("studio") || d.includes("creative")) return "agency";
  if (d.includes("blog") || d.includes("news") || d.includes("media")) return "blog";
  if (d.includes("local") || d.includes("city") || d.includes("plumb") || d.includes("dental")) return "local";
  if (d.includes("app") || d.includes("saas") || d.includes("software")) return "saas";
  return "default";
}

function percentileLabel(score: number, avg: number): string {
  const diff = score - avg;
  if (diff >= 15) return "Top 10%";
  if (diff >= 8) return "Top 25%";
  if (diff >= 3) return "Top 40%";
  if (diff >= -3) return "Average";
  if (diff >= -10) return "Below avg";
  return "Bottom 25%";
}

export function NicheBenchmarkWidget() {
  const data = useAuditStore((s) => s.data);
  const adjustedScore = useAuditStore((s) => s.adjustedScore());

  const { niche, avg, label, percentile } = useMemo(() => {
    const n = guessNiche(data.domain ?? "");
    const a = NICHE_AVERAGES[n];
    return {
      niche: n,
      avg: a,
      label: NICHE_LABELS[n],
      percentile: percentileLabel(adjustedScore, a),
    };
  }, [data.domain, adjustedScore]);

  const siteBarWidth = Math.min(100, adjustedScore);
  const avgBarWidth = Math.min(100, avg);

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
    >
      <div className="flex items-center gap-2">
        <BarChart2 className="h-4 w-4 text-[var(--accent-purple,#7B5CF5)]" />
        <span className="text-xs font-semibold text-[var(--text-primary)]">Niche Benchmark</span>
        <span className="ml-auto rounded border border-[var(--accent-purple,#7B5CF5)]/30 bg-[var(--accent-purple,#7B5CF5)]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent-purple,#7B5CF5)]">
          {percentile}
        </span>
      </div>

      <p className="mt-1 text-[11px] text-[var(--text-muted)]">{label} sites</p>

      <div className="mt-3 space-y-2.5">
        {/* Your score bar */}
        <div>
          <div className="mb-1 flex items-center justify-between text-[10px]">
            <span className="font-medium text-[var(--text-secondary)]">Your Score</span>
            <span className="font-bold tabular-nums text-[var(--text-primary)]">{adjustedScore}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              animate={inView ? { width: `${siteBarWidth}%` } : { width: 0 }}
              transition={{ delay: 0.6, duration: 0.9, ease: "easeOut" }}
              className="h-full rounded-full bg-[var(--accent-purple,#7B5CF5)]"
            />
          </div>
        </div>

        {/* Industry avg bar */}
        <div>
          <div className="mb-1 flex items-center justify-between text-[10px]">
            <span className="font-medium text-[var(--text-secondary)]">{label} Avg</span>
            <span className="tabular-nums text-[var(--text-muted)]">{avg}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              animate={inView ? { width: `${avgBarWidth}%` } : { width: 0 }}
              transition={{ delay: 0.75, duration: 0.9, ease: "easeOut" }}
              className="h-full rounded-full bg-white/20"
            />
          </div>
        </div>
      </div>

      {/* Delta callout */}
      <p className="mt-3 text-[10px] text-[var(--text-muted)]">
        {adjustedScore > avg ? (
          <span className="text-emerald-400">
            ▲ {adjustedScore - avg} pts above {label.toLowerCase()} average
          </span>
        ) : adjustedScore < avg ? (
          <span className="text-[#ef4444]">
            ▼ {avg - adjustedScore} pts below {label.toLowerCase()} average
          </span>
        ) : (
          <span>On par with {label.toLowerCase()} average</span>
        )}
      </p>
    </motion.div>
  );
}
