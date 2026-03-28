"use client";

import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ScoreSparklineProps {
  history: { date: string; score: number }[];
}

function sparklineColor(history: { score: number }[]): string {
  if (history.length < 2) return "#8B9BB4";
  const delta = history[history.length - 1].score - history[0].score;
  if (delta > 2) return "#10b981"; // improving
  if (delta < -2) return "#ef4444"; // declining
  return "#f97316"; // flat
}

export function ScoreSparkline({ history }: ScoreSparklineProps) {
  if (!history || history.length < 2) return null;

  const color = sparklineColor(history);
  const scores = history.map((h) => h.score);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      sparkline: { enabled: true },
      animations: { enabled: true, speed: 600 },
      background: "transparent",
    },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0,
        stops: [0, 100],
      },
    },
    colors: [color],
    tooltip: { enabled: false },
    yaxis: { min: Math.max(0, Math.min(...scores) - 5) },
  };

  return (
    <div className="flex flex-col items-center">
      <ReactApexChart
        type="area"
        series={[{ data: scores }]}
        options={options}
        width={80}
        height={32}
      />
      <span className="mt-0.5 text-[10px] font-medium" style={{ color }}>
        {scores[scores.length - 1] > scores[0] ? "▲" : scores[scores.length - 1] < scores[0] ? "▼" : "→"}{" "}
        Trend
      </span>
    </div>
  );
}
