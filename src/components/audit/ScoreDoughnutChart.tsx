"use client";

import { buildStyles, CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface ScoreDoughnutChartProps {
  score: number;
  size?: number;
}

export function ScoreDoughnutChart({ score, size = 72 }: ScoreDoughnutChartProps) {
  const rounded = Math.round(Math.min(100, Math.max(0, score)));
  return (
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
  );
}
