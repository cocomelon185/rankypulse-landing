"use client";

type SearchRow = {
    difficultyScore: number | null;
    difficultyStatus: "pending" | "available" | "unavailable";
};

const BUCKETS = [
    { label: "0–10",  min: 0,  max: 10,  color: "#22C55E" },
    { label: "11–20", min: 11, max: 20,  color: "#4ADE80" },
    { label: "21–30", min: 21, max: 30,  color: "#F59E0B" },
    { label: "31–40", min: 31, max: 40,  color: "#FB923C" },
    { label: "41–50", min: 41, max: 50,  color: "#F97316" },
    { label: "51+",   min: 51, max: 100, color: "#EF4444" },
];

interface DifficultyDistributionBarProps {
    rows: SearchRow[];
}

export function DifficultyDistributionBar({ rows }: DifficultyDistributionBarProps) {
    const analyzed = rows.filter((r) => r.difficultyStatus === "available" && r.difficultyScore != null);
    const total = analyzed.length;

    const data = BUCKETS.map((b) => {
        const count = analyzed.filter((r) => {
            const s = r.difficultyScore!;
            return s >= b.min && s <= b.max;
        }).length;
        return {
            label: b.label,
            count,
            pct: total > 0 ? Math.round((count / total) * 100) : 0,
            color: b.color,
        };
    });

    const pending = rows.filter((r) => r.difficultyStatus === "pending").length;
    const unanalyzed = rows.filter((r) => r.difficultyStatus === "unavailable").length;

    return (
        <div className="rounded-2xl border p-5" style={{ background: "#151B27", borderColor: "#1E2940" }}>
            <div className="mb-4">
                <p className="text-sm font-bold text-white">Difficulty Distribution</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#8B9BB4" }}>
                    {total > 0 ? `Based on ${total} analyzed keyword${total !== 1 ? "s" : ""}` : "Analyze keywords to see distribution"}
                </p>
            </div>

            {total === 0 ? (
                <div className="space-y-2.5">
                    {BUCKETS.map((b) => (
                        <div key={b.label} className="flex items-center gap-3">
                            <span className="text-[11px] font-semibold w-12 shrink-0 text-right" style={{ color: "#8B9BB4" }}>
                                {b.label}
                            </span>
                            <div className="flex-1 h-2 rounded-full" style={{ background: "#1E2940" }} />
                            <span className="text-[11px] font-bold w-5 shrink-0 text-right" style={{ color: "#4A5568" }}>0</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2.5">
                    {data.map((d) => (
                        <div key={d.label} className="flex items-center gap-3">
                            <span className="text-[11px] font-semibold w-12 shrink-0 text-right" style={{ color: "#8B9BB4" }}>
                                {d.label}
                            </span>
                            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#1E2940" }}>
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${d.pct}%`,
                                        background: d.color,
                                        boxShadow: d.count > 0 ? `0 0 6px ${d.color}55` : "none",
                                    }}
                                />
                            </div>
                            <span className="text-[11px] font-bold w-5 shrink-0 text-right" style={{ color: d.color }}>
                                {d.count}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {(pending > 0 || unanalyzed > 0) && (
                <div className="mt-4 flex flex-wrap gap-3 pt-4 border-t" style={{ borderColor: "#1E2940" }}>
                    {pending > 0 && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: "#60A5FA" }} />
                            <span className="text-[10px]" style={{ color: "#8B9BB4" }}>{pending} pending analysis</span>
                        </div>
                    )}
                    {unanalyzed > 0 && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: "#4A5568" }} />
                            <span className="text-[10px]" style={{ color: "#8B9BB4" }}>{unanalyzed} unavailable</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
