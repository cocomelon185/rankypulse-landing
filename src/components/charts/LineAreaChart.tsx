"use client";

import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface LineAreaChartProps {
  series: { name: string; data: number[] }[];
  categories?: string[];
}

export function LineAreaChart({
  series,
  categories = [],
}: LineAreaChartProps) {
  const options = {
    chart: {
      type: "area" as const,
      toolbar: { show: false },
      fontFamily: "inherit",
      zoom: { enabled: false },
    },
    stroke: { curve: "smooth" as const, width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.5,
        opacityFrom: 0.4,
        opacityTo: 0.1,
      },
    },
    colors: ["#4318ff", "#7551ff"],
    xaxis: {
      categories:
        categories.length > 0
          ? categories
          : series[0]?.data.map((_, i) => `Day ${i + 1}`) || [],
    },
    yaxis: { min: 0 },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
    },
  };

  return <Chart options={options} series={series} type="area" height={200} width="100%" />;
}
