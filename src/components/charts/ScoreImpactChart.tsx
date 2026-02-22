"use client";

import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ScoreImpactChartProps {
  stages: { label: string; score: number }[];
}

export function ScoreImpactChart({ stages }: ScoreImpactChartProps) {
  const options = {
    chart: {
      type: "bar" as const,
      toolbar: { show: false },
      fontFamily: "inherit",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 6,
        dataLabels: { position: "top" as const },
      },
    },
    colors: ["#4318ff", "#7551ff", "#a78bfa", "#c4b5fd", "#e0e7ff"],
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val + "",
      offsetY: -20,
      style: { fontSize: "12px" },
    },
    xaxis: {
      categories: stages.map((s) => s.label),
      labels: { style: { fontSize: "12px" } },
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 5,
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
    },
    legend: { show: false },
  };

  const series = [
    {
      name: "Score",
      data: stages.map((s) => s.score),
    },
  ];

  return (
    <Chart
      options={options}
      series={series}
      type="bar"
      height={280}
      width="100%"
    />
  );
}
