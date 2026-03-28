"use client";

import {
    ScatterChart, Scatter, XAxis, YAxis, ZAxis,
    Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from "recharts";

type SearchRow = {
    keyword: string;
    searchVolume: number | null;
    difficultyScore: number | null;
    difficultyLabel: string;
    difficultyStatus: "pending" | "available" | "unavailable";
    preOpportunityScore: number;
    opportunityScore: number | null;
};

interface ScatterPoint {
    x: number;       // difficulty score
    y: number;       // search volume
    z: number;       // bubble size (opportunity score)
    keyword: string;
    difficulty: number;
    volume: number;
    opportunity: number;
    diffLabel: string;
}

function diffColor(score: number, label: string): string {
    if (label === "Pending analysis") return "#60A5FA";
    if (score <= 30) return "#22C55E";
    if (score <= 60) return "#F59E0B";
    if (score <= 80) return "#F97316";
    return "#EF4444";
}

function MapTooltip({ active, payload }: {
    active?: boolean;
    payload?: Array<{ payload: ScatterPoint }>;
}) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const color = diffColor(d.difficulty, d.diffLabel);
    return (
        <div className="rounded-xl border px-4 py-3 shadow-xl text-xs space-y-1.5" style={{ background: "#151B27", borderColor: "#1E2940" }}>
            <p className="font-bold text-white text-sm truncate max-w-[200px]">{d.keyword}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <span style={{ color: "#4A5568" }}>Difficulty</span>
                <span className="font-bold" style={{ color }}>{d.difficulty} · {d.diffLabel}</span>
                <span style={{ color: "#4A5568" }}>Search Vol.</span>
                <span className="font-bold text-white">{d.volume.toLocaleString()}</span>
                <span style={{ color: "#4A5568" }}>Opportunity</span>
                <span className="font-bold" style={{ color: "#7B5CF5" }}>{d.opportunity}</span>
            </div>
        </div>
    );
}

function ColorDot(props: {
    cx?: number; cy?: number; payload?: ScatterPoint; r?: number;
}) {
    const { cx = 0, cy = 0, payload, r = 6 } = props;
    if (!payload) return null;
    const color = diffColor(payload.difficulty, payload.diffLabel);
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

interface KeywordOpportunityMapProps {
    rows: SearchRow[];
}

export function KeywordOpportunityMap({ rows }: KeywordOpportunityMapProps) {
    const data: ScatterPoint[] = rows
        .filter((r) => r.searchVolume != null && r.searchVolume > 0)
        .map((r) => {
            const diff = r.difficultyScore ?? 50;
            const vol = r.searchVolume!;
            const opp = r.opportunityScore ?? r.preOpportunityScore;
            return {
                x: diff,
                y: vol,
                z: Math.max(20, Math.min(600, opp * 5)),
                keyword: r.keyword,
                difficulty: diff,
                volume: vol,
                opportunity: opp,
                diffLabel: r.difficultyLabel,
            };
        });

    if (data.length === 0) {
        return (
            <div className="rounded-2xl border p-5" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#4A5568" }}>Keyword Opportunity Map</p>
                <div className="h-52 flex items-center justify-center">
                    <p className="text-xs" style={{ color: "#4A5568" }}>Run a search to see the opportunity map.</p>
                </div>
            </div>
        );
    }

    const maxVol = Math.max(...data.map((d) => d.y));
    const yMax = Math.ceil(maxVol * 1.2 / 1000) * 1000 || 1000;

    return (
        <div className="rounded-2xl border p-5" style={{ background: "#151B27", borderColor: "#1E2940" }}>
            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    <p className="text-sm font-bold text-white">Keyword Opportunity Map</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "#8B9BB4" }}>
                        Low difficulty + high volume = best targets
                    </p>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-3 flex-wrap justify-end">
                    {[
                        { label: "Easy ≤30", color: "#22C55E" },
                        { label: "Medium", color: "#F59E0B" },
                        { label: "Hard", color: "#F97316" },
                        { label: "Very Hard", color: "#EF4444" },
                    ].map((l) => (
                        <div key={l.label} className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                            <span className="text-[10px]" style={{ color: "#8B9BB4" }}>{l.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
                <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2940" />
                    <XAxis
                        type="number"
                        dataKey="x"
                        domain={[0, 100]}
                        name="Difficulty"
                        tick={{ fill: "#4A5568", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        label={{ value: "← Easy    Difficulty    Hard →", position: "insideBottom", offset: -12, fill: "#4A5568", fontSize: 10 }}
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
                    <ReferenceLine
                        x={40}
                        stroke="rgba(123,92,245,0.3)"
                        strokeDasharray="4 4"
                        label={{ value: "Easy | Hard", fill: "#7B5CF5", fontSize: 9, position: "top" }}
                    />
                    <Tooltip content={<MapTooltip />} />
                    <Scatter data={data} shape={<ColorDot />} />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}
