"use client";

import { LineChart, Line, Tooltip, ResponsiveContainer } from "recharts";
import type { AuditData } from "@/lib/audit-data";

interface ScoreHistoryProps {
  history: AuditData["scoreHistory"];
  width?: number;
  height?: number;
}

export function ScoreHistory({ history, width = 120, height = 40 }: ScoreHistoryProps) {
  if (history.length < 2) return null;

  const first = history[0].score;
  const last = history[history.length - 1].score;
  const trending = last >= first;
  const color = trending ? "#10b981" : "#ef4444";

  return (
    <div style={{ width, height }} className="relative">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history}>
          <Line
            type="monotone"
            dataKey="score"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1e2e",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              fontSize: 12,
              color: "#f1f5f9",
            }}
            formatter={(value) => [`Score: ${value}`, ""]}
            labelFormatter={(label) =>
              new Date(String(label)).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
