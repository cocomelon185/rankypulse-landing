"use client";

import { type LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional icon for premium feel */
  icon?: LucideIcon;
  /** Extra class for container */
  className?: string;
}

export function SectionHeader({ title, subtitle, icon: Icon, className = "" }: SectionHeaderProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {Icon && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4318ff]/10 text-[#4318ff]">
          <Icon className="h-4 w-4" aria-hidden />
        </div>
      )}
      <div>
        <h2 className="audit-heading text-base font-bold text-[#1B2559] sm:text-lg">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{subtitle}</p>}
      </div>
    </div>
  );
}
