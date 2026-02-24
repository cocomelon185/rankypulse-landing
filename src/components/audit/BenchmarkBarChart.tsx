"use client";

import { Lock } from "lucide-react";

interface BenchmarkBarChartProps {
  yourScore: number;
  competitorAvg?: number | null;
  /** When true, show locked teaser instead */
  isLocked?: boolean;
}

/** Compact horizontal bar chart – lightweight, no external chart lib for 2 bars */
function MiniBars({ yourScore, competitorAvg }: { yourScore: number; competitorAvg: number }) {
  const max = Math.max(yourScore, competitorAvg, 60);
  const yourW = Math.round((yourScore / max) * 100);
  const compW = Math.round((competitorAvg / max) * 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="w-20 shrink-0 text-[11px] text-gray-600">Your Site</span>
        <div className="h-5 flex-1 overflow-hidden rounded bg-gray-100">
          <div
            className="h-full rounded bg-[#4318ff]"
            style={{ width: `${yourW}%` }}
          />
        </div>
        <span className="w-6 shrink-0 text-right text-xs font-semibold text-[#1B2559]">{yourScore}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 shrink-0 text-[11px] text-gray-600">Competitor Avg</span>
        <div className="h-5 flex-1 overflow-hidden rounded bg-gray-100">
          <div
            className="h-full rounded bg-gray-400"
            style={{ width: `${compW}%` }}
          />
        </div>
        <span className="w-6 shrink-0 text-right text-xs font-semibold text-gray-600">{competitorAvg}</span>
      </div>
    </div>
  );
}

export function BenchmarkBarChart({
  yourScore,
  competitorAvg = null,
  isLocked = true,
}: BenchmarkBarChartProps) {
  if (isLocked || competitorAvg == null) {
    return (
      <div className="rounded-lg border border-gray-200/80 bg-gray-50/50 p-4">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-gray-400" aria-hidden />
          <span className="text-sm font-medium text-gray-600">
            Unlock competitor benchmark
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          See how your site compares to competitors in your niche.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200/80 bg-white p-3">
      <MiniBars yourScore={yourScore} competitorAvg={competitorAvg} />
      <p className="mt-1.5 text-[10px] text-gray-500">Benchmark (preview) · Estimate</p>
    </div>
  );
}
