"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { useAuditStore } from "@/lib/use-audit";
import { useScrollToIssue } from "@/hooks/useScrollToIssue";
import { SectionHeading } from "./SectionHeading";

// Fixed axis definitions — order matters for hexagon shape
const RADAR_AXES = [
  { key: "technical",    label: "Technical",      fallbackScore: 82, fallbackBenchmark: 74 },
  { key: "content",      label: "Content",         fallbackScore: 54, fallbackBenchmark: 68 },
  { key: "performance",  label: "Performance",     fallbackScore: 38, fallbackBenchmark: 61 },
  { key: "mobile",       label: "Mobile",          fallbackScore: 80, fallbackBenchmark: 72 },
  { key: "ux",           label: "UX",              fallbackScore: 64, fallbackBenchmark: 70 },
  { key: "linkAuthority",label: "Link Authority",  fallbackScore: 22, fallbackBenchmark: 55 },
];

function ProgressBar({
  label,
  score,
  benchmark,
  delay,
  onClick,
}: {
  label: string;
  score: number;
  benchmark: number;
  delay: number;
  onClick?: () => void;
}) {
  const diff = score - benchmark;
  const barColor =
    diff > 10
      ? "var(--accent-success)"
      : diff >= -10
        ? "var(--accent-warn)"
        : "var(--accent-danger)";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay / 1000, duration: 0.4 }}
      className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-white/[0.03]"
    >
      <span className="w-28 shrink-0 text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition">
        {label}
      </span>
      <div className="relative flex-1 h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: delay / 1000 + 0.2, duration: 0.8, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: barColor }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/30"
          style={{ left: `${benchmark}%` }}
          title={`Industry avg: ${benchmark}`}
        />
      </div>
      <span className="font-mono-data w-8 text-right text-sm font-medium" style={{ color: barColor }}>
        {score}
      </span>
    </motion.button>
  );
}

export function IssueRadar() {
  const categories = useAuditStore((s) => s.data.categories);
  const { scrollToIssue } = useScrollToIssue();

  // Build radar data using A/B keys — Recharts requires exact property name match.
  // We fuzzy-match store categories by axis label, falling back to hardcoded values.
  const radarData = RADAR_AXES.map((axis) => {
    const match = categories.find((c) =>
      c.name.toLowerCase().includes(axis.key.toLowerCase()) ||
      c.name.toLowerCase().replace(/\s+/g, "").includes(axis.key.toLowerCase())
    );
    return {
      subject: axis.label,
      A: Number(match?.score ?? axis.fallbackScore) || 0,
      B: Number(match?.benchmark ?? axis.fallbackBenchmark) || 0,
      fullMark: 100,
    };
  });

  // Use store categories for the bar chart (accurate labels), fall back to RADAR_AXES
  const barCategories =
    categories.length > 0
      ? categories
      : RADAR_AXES.map((a) => ({
          name: a.label,
          score: a.fallbackScore,
          benchmark: a.fallbackBenchmark,
        }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="audit-card p-6 md:p-8"
    >
      <SectionHeading
        title="Issue Breakdown"
        subtitle="Your site vs. industry average across 6 ranking factors"
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Radar Chart — hidden on mobile, shown on md+ */}
        <div className="hidden md:flex items-center justify-center">
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
              <PolarGrid
                stroke="rgba(255,255,255,0.07)"
                gridType="polygon"
              />
              <PolarAngleAxis
                dataKey="subject"
                tick={{
                  fill: "#94a3b8",
                  fontSize: 11,
                  fontFamily: "DM Sans, sans-serif",
                }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="You"
                dataKey="A"
                stroke="#6366f1"
                fill="rgba(99,102,241,0.3)"
                strokeWidth={2}
                isAnimationActive={true}
                animationDuration={1000}
              />
              <Radar
                name="Industry Avg"
                dataKey="B"
                stroke="rgba(255,255,255,0.25)"
                fill="rgba(255,255,255,0.04)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                isAnimationActive={true}
                animationDuration={1200}
              />
              <Legend
                formatter={(value) => (
                  <span
                    style={{
                      color: "#94a3b8",
                      fontSize: "12px",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    {value}
                  </span>
                )}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1e2e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#f1f5f9",
                }}
                formatter={(value: number | string | undefined, name: string | undefined) => [
                  value ?? 0,
                  name === "A" ? "You" : "Industry Avg",
                ]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Category bars — always visible */}
        <div className="flex flex-col justify-center space-y-1">
          {barCategories.map((cat, idx) => (
            <ProgressBar
              key={cat.name}
              label={cat.name}
              score={cat.score}
              benchmark={cat.benchmark}
              delay={400 + idx * 100}
              onClick={() => scrollToIssue(cat.name.toLowerCase().replace(/\s+/g, "-"))}
            />
          ))}
          <div className="mt-3 flex items-center gap-4 px-3 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent-primary)]" />
              You
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-white/30" />
              Industry avg
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
