"use client";

import { useMemo } from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { useCountUp } from "@/hooks/useCountUp";
import { motion } from "framer-motion";

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

function getScoreColor(score: number) {
  if (score >= 85) return "#10b981";
  if (score >= 70) return "#10b981";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

function getScoreTier(score: number) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 40) return "Needs Work";
  return "Critical";
}

function getGlowColor(score: number) {
  if (score >= 70) return "rgba(16, 185, 129, 0.15)";
  if (score >= 40) return "rgba(245, 158, 11, 0.15)";
  return "rgba(239, 68, 68, 0.15)";
}

export function ScoreGauge({ score, size = 240 }: ScoreGaugeProps) {
  const animatedScore = useCountUp({ end: score, duration: 1500 });
  const color = getScoreColor(score);
  const tier = getScoreTier(score);
  const glowColor = getGlowColor(score);

  const chartData = useMemo(
    () => [{ name: "score", value: animatedScore, fill: color }],
    [animatedScore, color]
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative flex flex-col items-center"
    >
      <div
        className="relative rounded-full"
        style={{
          boxShadow: `0 0 30px 6px ${glowColor}`,
          animation: "gaugeGlow 3s ease-in-out infinite",
          ["--glow-primary" as string]: glowColor,
        }}
      >
        <RadialBarChart
          width={size}
          height={size}
          cx={size / 2}
          cy={size / 2}
          innerRadius={(size / 2) * 0.7}
          outerRadius={(size / 2) * 0.92}
          startAngle={225}
          endAngle={-45}
          data={chartData}
          barSize={12}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            dataKey="value"
            cornerRadius={6}
            background={{ fill: "rgba(255,255,255,0.06)" }}
            isAnimationActive={true}
            animationBegin={300}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </RadialBarChart>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display text-5xl font-bold tabular-nums"
            style={{ color }}
          >
            {animatedScore}
          </span>
          <span className="mt-0.5 text-xs font-medium uppercase tracking-widest text-[var(--text-secondary)]">
            / 100
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
        style={{
          background: `${color}18`,
          border: `1px solid ${color}45`,
        }}
      >
        {/* Pulse dot */}
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: color }}
        />
        <span
          className="font-mono-data text-[11px] font-semibold tracking-[0.12em]"
          style={{ color }}
        >
          {tier.toUpperCase()}
        </span>
      </motion.div>
    </motion.div>
  );
}
