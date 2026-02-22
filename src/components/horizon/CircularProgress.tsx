"use client";

import {
  buildStyles,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface CircularProgressProps {
  title?: string;
  percentage: number;
  size?: number;
}

export function CircularProgress({
  title,
  percentage,
  size = 130,
}: CircularProgressProps) {
  return (
    <div style={{ width: size, height: size }}>
      <CircularProgressbarWithChildren
        value={percentage}
        styles={buildStyles({
          rotation: 0.25,
          strokeLinecap: "round",
          textSize: "16px",
          pathTransitionDuration: 0.5,
          pathColor: "#4318FF",
          textColor: "#1B2559",
          trailColor: "#E9EDF7",
        })}
      >
        <div className="flex flex-col items-center justify-center">
          {title && (
            <div className="text-sm font-medium text-gray-600">{title}</div>
          )}
          <div className="text-xl font-bold text-[#1B2559] dark:text-white">
            {percentage}%
          </div>
        </div>
      </CircularProgressbarWithChildren>
    </div>
  );
}
