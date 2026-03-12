"use client";

import { useState, useEffect } from "react";
import { X, TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, ReferenceLine,
} from "recharts";
import type { RankKeyword } from "@/lib/rank-engine";

interface HistoryPoint {
    date: string;
    position: number | null;
}

interface KeywordHistoryPanelProps {
    keyword: RankKeyword;
    onClose: () => void;
}

const CTR_MAP: Record<number, number> = {
    1: 0.276, 2: 0.158, 3: 0.110, 4: 0.084, 5: 0.063,
    6: 0.049, 7: 0.039, 8: 0.033, 9: 0.027, 10: 0.024,
    11: 0.015, 12: 0.012, 13: 0.010, 14: 0.009, 15: 0.008,
    16: 0.006, 17: 0.006, 18: 0.006, 19: 0.006, 20: 0.006,
};
function getCTR(pos: number) { return CTR_MAP[pos] ?? 0.005; }

function positionColor(pos: number | null) {
    if (pos == null) return "#4A5568";
    if (pos <= 3) return "#00C853";
    if (pos <= 10) return "#F59E0B";
    if (pos <= 20) return "#FF642D";
    return "#FF3D3D";
}

// Custom tooltip so Y-axis (position) shows "higher = better" intuitively
function CustomTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    const pos = payload[0].value;
    return (
        <div className="rounded-lg border px-3 py-2 text-xs" style={{ background: "#0D1424", borderColor: "#1E2940" }}>
            <p style={{ color: "#8B9BB4" }}>{label}</p>
            <p className="font-bold mt-0.5" style={{ color: positionColor(pos) }}>
                Position #{pos}
            </p>
        </div>
    );
}

export function KeywordHistoryPanel({ keyword, onClose }: KeywordHistoryPanelProps) {
    const [history, setHistory] = useState<HistoryPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/rank/history?keyword_id=${keyword.id}`)
            .then((r) => r.json())
            .then((d) => {
                setHistory(
                    (d.history ?? []).map((h: HistoryPoint) => ({
                        ...h,
                        date: new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                    }))
                );
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [keyword.id]);

    const positions = history.map((h) => h.position).filter((p): p is number => p !== null);
    const bestPos = positions.length ? Math.min(...positions) : null;
    const worstPos = positions.length ? Math.max(...positions) : null;
    const estTraffic = keyword.position != null && keyword.volume != null
        ? Math.round(keyword.volume * getCTR(keyword.position))
        : null;

    // Invert Y axis: lower position number = higher on chart
    const yDomain = positions.length
        ? [Math.max(1, Math.min(...positions) - 2), Math.min(100, Math.max(...positions) + 2)]
        : [1, 20];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/60"
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[480px] overflow-y-auto shadow-2xl flex flex-col"
                style={{ background: "#0D1424", borderLeft: "1px solid #1E2940" }}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 px-6 py-5 border-b sticky top-0 z-10" style={{ background: "#0D1424", borderColor: "#1E2940" }}>
                    <div className="min-w-0">
                        <h2 className="text-base font-bold text-white truncate">{keyword.keyword}</h2>
                        <p className="text-[11px] mt-0.5" style={{ color: "#8B9BB4" }}>
                            Google / {keyword.country} / {keyword.device}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition shrink-0 mt-0.5"
                        style={{ color: "#8B9BB4" }}
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="flex-1 px-6 py-5 space-y-6">
                    {/* KPI strip */}
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            {
                                label: "Current",
                                value: keyword.position != null ? `#${keyword.position}` : "—",
                                color: positionColor(keyword.position),
                            },
                            {
                                label: "Change",
                                value: keyword.change == null || keyword.change === 0
                                    ? "—"
                                    : `${keyword.change > 0 ? "+" : ""}${keyword.change}`,
                                color: (keyword.change ?? 0) > 0 ? "#00C853" : (keyword.change ?? 0) < 0 ? "#FF3D3D" : "#8B9BB4",
                                icon: (keyword.change ?? 0) > 0 ? <TrendingUp size={11} /> : (keyword.change ?? 0) < 0 ? <TrendingDown size={11} /> : <Minus size={11} />,
                            },
                            {
                                label: "Best (30d)",
                                value: bestPos != null ? `#${bestPos}` : "—",
                                color: "#00C853",
                            },
                            {
                                label: "Worst (30d)",
                                value: worstPos != null ? `#${worstPos}` : "—",
                                color: "#FF3D3D",
                            },
                        ].map((kpi) => (
                            <div key={kpi.label} className="rounded-xl border p-3 text-center" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#4A5568" }}>{kpi.label}</p>
                                <div className="flex items-center justify-center gap-1 font-bold text-sm" style={{ color: kpi.color }}>
                                    {kpi.icon}
                                    {kpi.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Metrics row */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Monthly Volume", value: keyword.volume != null ? keyword.volume.toLocaleString() : "—" },
                            { label: "CPC (USD)", value: keyword.cpc != null ? `$${Number(keyword.cpc).toFixed(2)}` : "—" },
                            { label: "Est. Monthly Traffic", value: estTraffic != null ? `~${estTraffic.toLocaleString()}` : "—" },
                        ].map((m) => (
                            <div key={m.label} className="rounded-xl border p-3" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#4A5568" }}>{m.label}</p>
                                <p className="font-bold text-sm text-white">{m.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* 30-day position chart */}
                    <div className="rounded-xl border p-4" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                        <h3 className="text-xs font-bold text-white mb-4">30-Day Position History</h3>
                        {loading ? (
                            <div className="h-[180px] flex items-center justify-center">
                                <div className="w-5 h-5 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin" />
                            </div>
                        ) : history.length === 0 ? (
                            <div className="h-[180px] flex items-center justify-center text-xs" style={{ color: "#4A5568" }}>
                                No history yet — first update pending.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={history} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2940" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fill: "#4A5568", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis
                                        reversed
                                        domain={yDomain}
                                        tick={{ fill: "#4A5568", fontSize: 10 }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v) => `#${v}`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    {/* Top 10 reference line */}
                                    <ReferenceLine y={10} stroke="rgba(0,200,83,0.25)" strokeDasharray="4 4" label={{ value: "Top 10", fill: "#4A5568", fontSize: 10 }} />
                                    <Line
                                        type="monotone"
                                        dataKey="position"
                                        stroke="#FF642D"
                                        strokeWidth={2.5}
                                        dot={(props) => {
                                            const { cx, cy, payload } = props as { cx: number; cy: number; payload: { position: number } };
                                            return (
                                                <circle
                                                    key={`dot-${cx}-${cy}`}
                                                    cx={cx}
                                                    cy={cy}
                                                    r={3}
                                                    fill={positionColor(payload.position)}
                                                    stroke="none"
                                                />
                                            );
                                        }}
                                        connectNulls
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* History table */}
                    {history.length > 0 && (
                        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#1E2940" }}>
                            <table className="w-full text-[12px]">
                                <thead>
                                    <tr style={{ background: "#0D1424" }}>
                                        <th className="text-left px-4 py-2.5 font-bold uppercase tracking-widest text-[10px]" style={{ color: "#4A5568" }}>Date</th>
                                        <th className="text-center px-4 py-2.5 font-bold uppercase tracking-widest text-[10px]" style={{ color: "#4A5568" }}>Position</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...history].reverse().map((h, i) => (
                                        <tr key={i} className="border-t hover:bg-white/[0.02] transition" style={{ borderColor: "#1E2940" }}>
                                            <td className="px-4 py-2.5" style={{ color: "#8B9BB4" }}>{h.date}</td>
                                            <td className="px-4 py-2.5 text-center font-bold" style={{ color: positionColor(h.position) }}>
                                                {h.position != null ? `#${h.position}` : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Ranked URL */}
                    {(keyword.ranked_url ?? keyword.target_url) && (
                        <div className="rounded-xl border px-4 py-3" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#4A5568" }}>Ranking URL</p>
                            <a
                                href={keyword.ranked_url ?? keyword.target_url ?? "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs font-medium hover:underline transition"
                                style={{ color: "#FF642D" }}
                            >
                                <span className="truncate">{keyword.ranked_url ?? keyword.target_url}</span>
                                <ExternalLink size={11} className="shrink-0" />
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
