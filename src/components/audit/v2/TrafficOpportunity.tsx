"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign } from "lucide-react";
import { useAuditStore } from "@/lib/use-audit";
import { SectionHeading } from "./SectionHeading";

function buildChartData(
  baseline: number,
  issues: { id: string; trafficImpact: { min: number; max: number }; status: string }[]
) {
  const openIssues = issues.filter((i) => i.status !== "fixed" && i.status !== "locked");
  const points = [
    { name: "Now", current: baseline, projected: baseline, upper: baseline, lower: baseline },
  ];

  let cumMin = 0;
  let cumMax = 0;
  openIssues.forEach((issue, idx) => {
    cumMin += issue.trafficImpact.min;
    cumMax += issue.trafficImpact.max;
    const mid = Math.round((cumMin + cumMax) / 2);
    points.push({
      name: `Fix #${idx + 1}`,
      current: baseline,
      projected: baseline + mid,
      upper: baseline + cumMax,
      lower: baseline + cumMin,
    });
  });

  if (openIssues.length > 0) {
    const totalMid = Math.round((cumMin + cumMax) / 2);
    points.push({
      name: "All Fixed",
      current: baseline,
      projected: baseline + totalMid,
      upper: baseline + cumMax,
      lower: baseline + cumMin,
    });
  }

  return points;
}

export function TrafficOpportunity() {
  const data = useAuditStore((s) => s.data);

  const openIssues = useMemo(
    () =>
      data.issues.filter(
        (i) => i.status === "open" || i.status === "in-progress"
      ),
    [data.issues]
  );

  const estimatedBaseline = 200;
  const chartData = useMemo(
    () => buildChartData(estimatedBaseline, data.issues),
    [data.issues]
  );

  const totalMin = data.estimatedTrafficLoss.min;
  const totalMax = data.estimatedTrafficLoss.max;
  const adSpendMin = totalMin * 2;
  const adSpendMax = totalMax * 2;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="audit-card p-6 md:p-8"
    >
      <SectionHeading
        title="Traffic Opportunity"
        subtitle={`You could be gaining ${totalMin.toLocaleString()}–${totalMax.toLocaleString()} more visits/month`}
        rightElement={
          <span className="rounded-full bg-[var(--accent-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--accent-primary)]">
            {data.confidence} confidence
          </span>
        }
      />

      {/* Chart */}
      <div className="mt-6">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="projectedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#94a3b8", fontSize: 12, fontFamily: "DM Sans" }}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12, fontFamily: "DM Mono" }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              contentStyle={{
                background: "#1a1e2e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                fontSize: 13,
                color: "#f1f5f9",
              }}
              formatter={(value, name) => {
                const labels: Record<string, string> = {
                  current: "Current",
                  projected: "Projected",
                  upper: "Upper bound",
                  lower: "Lower bound",
                };
                return [`${Number(value).toLocaleString()} visits/mo`, labels[String(name)] ?? String(name)];
              }}
            />
            {/* Confidence band */}
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="url(#confidenceGrad)"
              fillOpacity={1}
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="var(--bg-surface)"
              fillOpacity={1}
            />
            {/* Current baseline */}
            <Area
              type="monotone"
              dataKey="current"
              stroke="rgba(255,255,255,0.15)"
              strokeDasharray="4 4"
              fill="none"
              strokeWidth={1.5}
            />
            {/* Projected */}
            <Area
              type="monotone"
              dataKey="projected"
              stroke="#6366f1"
              fill="url(#projectedGrad)"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Unlock cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {openIssues.slice(0, 3).map((issue, idx) => (
          <motion.div
            key={issue.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + idx * 0.1, duration: 0.4 }}
            className="audit-card-elevated p-4"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[var(--accent-primary)]" />
              <span className="text-xs font-semibold text-[var(--accent-primary)]">
                Fix #{idx + 1}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
              {issue.title}
            </p>
            <p className="mt-1 font-mono-data text-xs text-[var(--accent-success)]">
              +{issue.trafficImpact.min}–{issue.trafficImpact.max} visits/mo
            </p>
          </motion.div>
        ))}
      </div>

      {/* Ad spend callout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="mt-4 flex items-center gap-3 rounded-lg bg-[var(--accent-primary)]/5 px-4 py-3"
      >
        <DollarSign className="h-5 w-5 shrink-0 text-[var(--accent-primary)]" />
        <p className="text-sm text-[var(--text-secondary)]">
          At avg. $2 CPC, that&apos;s{" "}
          <span className="font-semibold text-[var(--accent-primary)]">
            ${adSpendMin.toLocaleString()}–${adSpendMax.toLocaleString()}/mo
          </span>{" "}
          in ad spend saved
        </p>
      </motion.div>
    </motion.section>
  );
}
