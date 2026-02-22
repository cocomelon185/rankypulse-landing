"use client";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  cta?: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export function PageHeader({
  icon,
  title,
  subtitle,
  cta,
  className,
  gradient = true,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8 rounded-2xl border border-gray-200/60 bg-white px-6 py-8 shadow-[14px_17px_40px_4px_rgba(112,144,176,0.06)] md:px-8 md:py-10",
        gradient &&
          "bg-gradient-to-br from-white via-[#fafbff] to-[#eff6ff]/50",
        className
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-4">
          {icon && (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4318ff]/10 to-[#7551ff]/10 text-[#4318ff]">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1B2559] md:text-3xl lg:text-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 max-w-2xl text-base text-gray-600 md:text-lg">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {cta && <div className="shrink-0">{cta}</div>}
      </div>
    </div>
  );
}
