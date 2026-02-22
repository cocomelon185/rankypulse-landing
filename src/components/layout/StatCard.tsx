"use client";

import { cn } from "@/lib/utils";

interface StatCardProps {
  name: string;
  value: string | number;
  icon?: React.ReactNode;
  iconBg?: string;
  trend?: { value: number; positive: boolean };
  sparkline?: number[];
  className?: string;
}

export function StatCard({
  name,
  value,
  icon,
  iconBg = "bg-[#eff6ff]",
  trend,
  sparkline,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-4 rounded-xl bg-white px-5 py-4 shadow-[14px_17px_40px_4px_rgba(112,144,176,0.08)] transition-all duration-200 hover:shadow-[14px_17px_40px_4px_rgba(112,144,176,0.12)]",
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl",
            iconBg
          )}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-sm font-medium text-gray-600">{name}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-xl font-bold text-[#1B2559]">{value}</h3>
          {trend && (
            <span
              className={cn(
                "text-sm font-medium",
                trend.positive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.positive ? "+" : ""}
              {trend.value}%
            </span>
          )}
        </div>
        {sparkline && sparkline.length > 0 && (
          <svg
            className="mt-2 h-8 w-full"
            preserveAspectRatio="none"
            viewBox={`0 0 ${sparkline.length} 20`}
          >
            <polyline
              fill="none"
              stroke="url(#sparkline-gradient)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparkline
                .map((v, i) => {
                  const max = Math.max(...sparkline);
                  const min = Math.min(...sparkline);
                  const range = max - min || 1;
                  const y = 18 - ((v - min) / range) * 16;
                  return `${i},${y}`;
                })
                .join(" ")}
            />
            <defs>
              <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#4318ff" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#7551ff" stopOpacity={0.9} />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>
    </div>
  );
}
