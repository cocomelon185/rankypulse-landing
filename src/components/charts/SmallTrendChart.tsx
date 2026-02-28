"use client";

import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function SmallTrendChart({ data, color = "#6366f1" }: { data: number[], color?: string }) {
    const options = {
        chart: { type: "line" as const, toolbar: { show: false }, sparkline: { enabled: true } },
        stroke: { curve: "smooth" as const, width: 2 },
        colors: [color],
        tooltip: {
            fixed: { enabled: false },
            x: { show: false },
            y: { title: { formatter: () => "" } },
            marker: { show: false }
        }
    };

    const series = [{ data }];
    return <Chart options={options} series={series} type="line" height={40} width="100%" />;
}
