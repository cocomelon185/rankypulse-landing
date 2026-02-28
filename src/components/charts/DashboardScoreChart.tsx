"use client";

import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function DashboardScoreChart({ data }: { data: { day: string; score: number }[] }) {
    const options = {
        chart: {
            type: "area" as const,
            toolbar: { show: false },
            fontFamily: "inherit",
            zoom: { enabled: false },
        },
        stroke: { curve: "smooth" as const, width: 2 },
        fill: {
            type: "gradient" as const,
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [50, 100],
            },
        },
        colors: ["#10b981"], // Emerald Green for positive vibe
        dataLabels: { enabled: false },
        xaxis: {
            categories: data.map(d => d.day),
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: { colors: "#6b7280", fontSize: "11px", fontFamily: "DM Mono" },
            },
        },
        yaxis: {
            min: 0,
            max: 100,
            labels: {
                style: { colors: "#6b7280", fontSize: "11px", fontFamily: "DM Mono" },
            },
        },
        grid: {
            borderColor: "rgba(255,255,255,0.05)",
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } },
        },
        tooltip: {
            theme: "dark",
            y: { formatter: (val: number) => val + " / 100" },
        },
    };

    const series = [{ name: "Score", data: data.map(d => d.score) }];

    return <Chart options={options} series={series} type="area" height={260} width="100%" />;
}
