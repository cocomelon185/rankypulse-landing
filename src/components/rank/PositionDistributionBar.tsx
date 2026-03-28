"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { RankKeyword } from "@/lib/rank-engine";

interface PositionDistributionBarProps {
    keywords: RankKeyword[];
}

const BUCKETS = [
    { label: "Top 3",  max: 3,  color: "#00C853" },
    { label: "Top 5",  max: 5,  color: "#22C55E" },
    { label: "Top 10", max: 10, color: "#F59E0B" },
    { label: "Top 20", max: 20, color: "#FF642D" },
    { label: "Top 50", max: 50, color: "#FF3D3D" },
];

function DistTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { label: string; count: number; pct: number } }> }) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="rounded-lg px-3 py-2 text-xs shadow-xl" style={{ background: "#0D1424", border: "1px solid #1E2940" }}>
            <p className="font-bold text-white">{d.label}</p>
            <p style={{ color: "#8B9BB4" }}>{d.count} keyword{d.count !== 1 ? "s" : ""} · {d.pct}%</p>
        </div>
    );
}

export function PositionDistributionBar({ keywords }: PositionDistributionBarProps) {
    const ranked = keywords.filter((k) => k.position != null);
    const total = ranked.length;

    const data = BUCKETS.map((b) => {
        const count = ranked.filter((k) => (k.position ?? 999) <= b.max).length;
        return {
            label: b.label,
            count,
            pct: total > 0 ? Math.round((count / total) * 100) : 0,
            color: b.color,
        };
    });

    if (total === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
                <p className="text-xs" style={{ color: "#4A5568" }}>No ranking data yet</p>
            </div>
        );
    }

    return (
        <div>
            {/* Custom horizontal bars (more control than recharts horizontal layout) */}
            <div className="space-y-2.5">
                {data.map((d) => (
                    <div key={d.label} className="flex items-center gap-3">
                        <span className="text-[11px] font-semibold w-14 shrink-0 text-right" style={{ color: "#8B9BB4" }}>
                            {d.label}
                        </span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#1E2940" }}>
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: `${d.pct}%`,
                                    background: d.color,
                                    boxShadow: `0 0 6px ${d.color}55`,
                                }}
                            />
                        </div>
                        <span className="text-[11px] font-bold w-6 shrink-0" style={{ color: d.color }}>
                            {d.count}
                        </span>
                    </div>
                ))}
            </div>

            {/* Mini recharts for tooltip interaction — hidden visually but accessible */}
            <div className="mt-3 opacity-0 h-0 overflow-hidden" aria-hidden>
                <ResponsiveContainer width="100%" height={1}>
                    <BarChart data={data} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="label" type="category" hide />
                        <Tooltip content={<DistTooltip />} />
                        <Bar dataKey="count">
                            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <p className="text-[10px] mt-3 text-center" style={{ color: "#4A5568" }}>
                Based on {total} keyword{total !== 1 ? "s" : ""} with ranking data
            </p>
        </div>
    );
}
