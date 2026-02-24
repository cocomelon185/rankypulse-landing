"use client";

import { buildStyles, CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { TrendingUp } from "lucide-react";

interface ScoreDoughnutChartProps {
  score: number;
  size?: number;
  /** When provided, shows Current → Potential impact preview below */
  potentialScore?: number;
}

export function ScoreDoughnutChart({ score, size = 72, potentialScore }: ScoreDoughnutChartProps) {
  const rounded = Math.round(Math.min(100, Math.max(0, score)));
  const potential = potentialScore != null ? Math.round(Math.min(100, Math.max(0, potentialScore))) : null;
  const showImpact = potential != null && potential > rounded;

  return (
    <div className="flex flex-col items-start gap-2">
      <div style={{ width: size, height: size }} className="shrink-0">
        <CircularProgressbarWithChildren
          value={rounded}
          styles={buildStyles({
            rotation: 0.25,
            strokeLinecap: "round",
            pathTransitionDuration: 0,
            pathColor: "#4318ff",
            trailColor: "#E9EDF7",
          })}
        >
          <span className="text-lg font-bold text-[#1B2559]">{rounded}</span>
        </CircularProgressbarWithChildren>
      </div>
      {showImpact && (
        <div className="flex w-full min-w-[90px] flex-col gap-1.5 rounded-lg border border-[#4318ff]/15 bg-white px-2.5 py-2 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-medium text-gray-500">Score impact</span>
            <TrendingUp className="h-3.5 w-3.5 text-[#4318ff]" aria-hidden />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-gray-600">{rounded}</span>
            <span className="text-sm font-medium text-gray-400">→</span>
            <span className="text-lg font-bold text-[#4318ff]">{potential}</span>
            <span className="text-[10px] font-medium text-gray-500">after fixes</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#4318ff] to-[#6d4cff] transition-all"
              style={{ width: `${potential}%` }}
              role="progressbar"
              aria-valuenow={potential}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Potential score ${potential} after fixes`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
