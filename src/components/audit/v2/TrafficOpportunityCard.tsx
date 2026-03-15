"use client";

import { useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useAuditStore } from "@/lib/use-audit";
import { useCountUp } from "@/hooks/useCountUp";

export function TrafficOpportunityCard() {
  const data = useAuditStore((s) => s.data);

  const { totalOpportunity, floorPct, ceilPct, openCount } = useMemo(() => {
    const openIssues = data.issues.filter(
      (i) => i.status === "open" || i.status === "in-progress"
    );
    const total = openIssues.reduce((sum, i) => sum + (i.trafficImpact?.max ?? 0), 0);
    const baseline = Math.max(1, (data.estimatedTrafficLoss?.max ?? 100) * 4);
    const pct = Math.min(50, Math.max(5, Math.round((total / baseline) * 100)));
    const floor = Math.floor(pct / 5) * 5;
    const ceil = floor + 5;
    return { totalOpportunity: total, floorPct: floor, ceilPct: ceil, openCount: openIssues.length };
  }, [data.issues, data.estimatedTrafficLoss]);

  const animatedFloor = useCountUp({ end: floorPct, delay: 400, duration: 1200 });
  const animatedCeil = useCountUp({ end: ceilPct, delay: 600, duration: 1200 });

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="relative overflow-hidden rounded-xl border border-[var(--accent-primary)]/30 bg-gradient-to-br from-[var(--accent-primary)]/10 to-transparent p-4"
      style={{
        boxShadow: "0 0 20px color-mix(in srgb, var(--accent-primary) 15%, transparent)",
      }}
    >
      {/* Glow blob */}
      <div
        className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl"
        style={{ background: "color-mix(in srgb, var(--accent-primary) 20%, transparent)" }}
      />

      <div className="relative flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-primary)]/20">
          <TrendingUp className="h-4 w-4 text-[var(--accent-primary)]" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--accent-primary)]">
            Traffic Opportunity
          </p>
          <p className="mt-0.5 font-display text-2xl font-bold tabular-nums text-[var(--text-primary)]">
            +{animatedFloor}–{animatedCeil}%
          </p>
          <p className="mt-1 text-[11px] leading-snug text-[var(--text-secondary)]">
            estimated uplift if all {openCount} open issues are resolved
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-white/[0.08]">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${ceilPct * 2}%` } : { width: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: "var(--accent-primary)" }}
        />
      </div>
    </motion.div>
  );
}
