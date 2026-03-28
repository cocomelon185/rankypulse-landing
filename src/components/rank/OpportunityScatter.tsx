"use client";

import {
    ScatterChart, Scatter, XAxis, YAxis, ZAxis,
    Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from "recharts";
import type { RankKeyword } from "@/lib/rank-engine";

const CTR_MAP: Record<number, number> = {
    1: 0.276, 2: 0.158, 3: 0.110, 4: 0.084, 5: 0.063,
    6: 0.049, 7: 0.039, 8: 0.033, 9: 0.027, 10: 0.024,
    11: 0.015, 12: 0.012, 13: 0.010, 14: 0.009, 15: 0.008,
    16: 0.006, 17: 0.006, 18: 0.006, 19: 0.006, 20: 0.006,
};
function getCTR(pos: number) { return CTR_MAP[pos] ?? 0.005; }

function posColor(pos: number) {
    if (pos <= 3)  return "#00C853";
    if (pos <= 10) return "#F59E0B";
    if (pos <= 20) return "#FF642D";
    return "#FF3D3D";
}

interface ScatterPoint {
    x: number;        // current position
    y: number;        // search volume
    z: number;        // estimated traffic (bubble size)
    keyword: string;
    traffic: number;
    position: number;
    volume: number;
}

interface OpportunityScatterProps {
    keywords: RankKeyword[];
}

function ScatterTooltip({ active, payload }: {
    active?: boolean;
    payload?: Array<{ payload: ScatterPoint }>;
}) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="rounded-xl border px-4 py-3 shadow-xl text-xs space-y-1.5" style={{ background: "#151B27", borderColor: "#1E2940" }}>
            <p className="font-bold text-white text-sm truncate max-w-[180px]">{d.keyword}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <span style={{ color: "#4A5568" }}>Position</span>
                <span className="font-bold" style={{ color: posColor(d.position) }}>#{d.position}</span>
                <span style={{ color: "#4A5568" }}>Search Vol.</span>
                <span className="font-bold text-white">{d.volume.toLocaleString()}</span>
                <span style={{ color: "#4A5568" }}>Est. Traffic</span>
                <span className="font-bold" style={{ color: "#7B5CF5" }}>~{d.traffic.toLocaleString()}/mo</span>
            </div>
        </div>
    );
}

// Custom scatter dot with per-point color
function ColorDot(props: {
    cx?: number; cy?: number; payload?: ScatterPoint;
    r?: number;
}) {
    const { cx = 0, cy = 0, payload, r = 6 } = props;
    if (!payload) return null;
    const color = posColor(payload.position);
    return (
        <circle
            cx={cx}
            cy={cy}
            r={r}
            fill={color}
            fillOpacity={0.75}
            stroke={color}
            strokeWidth={1}
            strokeOpacity={0.4}
        />
    );
}

export function OpportunityScatter({ keywords }: OpportunityScatterProps) {
    const data: ScatterPoint[] = keywords
        .filter((k) => k.position != null && k.volume != null && k.volume > 0)
        .map((k) => {
            const pos = k.position!;
            const vol = k.volume!;
            const traffic = Math.round(vol * getCTR(pos));
            return {
                x: pos,
                y: vol,
                z: Math.max(20, Math.min(800, traffic * 2)),
                keyword: k.keyword,
                traffic,
                position: pos,
                volume: vol,
            };
        });

    if (data.length === 0) {
        return (
            <div className="h-48 flex flex-col items-center justify-center gap-2">
                <p className="text-xs" style={{ color: "#4A5568" }}>
                    No keyword data available for the opportunity map.
                </p>
                <p className="text-[11px]" style={{ color: "#4A5568" }}>
                    Add keywords with search volume data to see opportunities.
                </p>
            </div>
        );
    }

    const maxVol = Math.max(...data.map((d) => d.y));
    const yMax = Math.ceil(maxVol * 1.2 / 1000) * 1000;

    return (
        <div>
            {/* Legend */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
                {[
                    { label: "Top 3",   color: "#00C853" },
                    { label: "Top 10",  color: "#F59E0B" },
                    { label: "Top 20",  color: "#FF642D" },
                    { label: "21+",     color: "#FF3D3D" },
                ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                        <span className="text-[11px]" style={{ color: "#8B9BB4" }}>{l.label}</span>
                    </div>
                ))}
                <span className="text-[11px] ml-auto" style={{ color: "#4A5568" }}>
                    Bubble size = estimated traffic
                </span>
            </div>

            <ResponsiveContainer width="100%" height={280}>
                <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2940" />
                    <XAxis
                        type="number"
                        dataKey="x"
                        domain={[1, 100]}
                        name="Position"
                        tick={{ fill: "#4A5568", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        label={{ value: "← Page 1 Rank    Page 2 → ", position: "insideBottom", offset: -12, fill: "#4A5568", fontSize: 10 }}
                    />
                    <YAxis
                        type="number"
                        dataKey="y"
                        name="Volume"
                        domain={[0, yMax]}
                        tick={{ fill: "#4A5568", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                        label={{ value: "Search Volume", angle: -90, position: "insideLeft", offset: 12, fill: "#4A5568", fontSize: 10 }}
                    />
                    <ZAxis type="number" dataKey="z" range={[20, 400]} />
                    {/* Page 1 / Page 2 divider */}
                    <ReferenceLine x={10} stroke="rgba(123,92,245,0.3)" strokeDasharray="4 4" label={{ value: "Page 1 boundary", fill: "#7B5CF5", fontSize: 9, position: "top" }} />
                    <Tooltip content={<ScatterTooltip />} />
                    <Scatter
                        data={data}
                        shape={<ColorDot />}
                    />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}
