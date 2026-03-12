"use client";

import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from "recharts";

interface RowSparklineProps {
    /** 14 position values, oldest first. null = no data that day. */
    positions: (number | null)[];
    color?: string;
}

function SparkTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded px-2 py-1 text-[10px] font-bold shadow-lg" style={{ background: "#0D1424", border: "1px solid #1E2940", color: "#E2E8F0" }}>
            #{payload[0].value}
        </div>
    );
}

export function RowSparkline({ positions, color = "#7B5CF5" }: RowSparklineProps) {
    // Filter out leading nulls so chart doesn't look empty
    const hasData = positions.some((p) => p !== null);
    if (!hasData) {
        return (
            <div className="flex items-center justify-center h-8 w-24">
                <span className="text-[10px]" style={{ color: "#4A5568" }}>—</span>
            </div>
        );
    }

    // recharts needs numeric values; replace null with undefined for gaps
    const data = positions.map((p, i) => ({ i, pos: p ?? undefined }));

    // Calculate domain with padding for inverted axis
    const validPositions = positions.filter((p): p is number => p !== null);
    const minPos = Math.min(...validPositions);
    const maxPos = Math.max(...validPositions);
    const pad = Math.max(2, Math.round((maxPos - minPos) * 0.3));
    // Inverted: smaller position number = higher on chart (better)
    const yDomain: [number, number] = [
        Math.max(1, minPos - pad),
        maxPos + pad,
    ];

    return (
        <div style={{ width: 96, height: 32 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                    <YAxis
                        hide
                        reversed
                        domain={yDomain}
                        allowDataOverflow={false}
                    />
                    <Tooltip content={<SparkTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="pos"
                        stroke={color}
                        strokeWidth={1.5}
                        dot={false}
                        connectNulls={false}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
