/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Sample/hint action to show (e.g. "Try: Add meta description to your homepage") */
  sampleAction?: string;
  /** CTA href when sampleAction is a link (e.g. /audit) */
  sampleHref?: string;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  sampleAction,
  sampleHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200/80 bg-gradient-to-br from-gray-50/80 to-white py-20 px-8 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eff6ff] to-[#e0e7ff] text-[#4318ff] shadow-inner">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold text-[#1B2559]">{title}</h3>
      {description && (
        <p className="mt-3 max-w-md text-base text-gray-600">{description}</p>
      )}
      {action && <div className="mt-8">{action}</div>}
      {sampleAction && (
        <div className="mt-6 rounded-xl bg-gray-100/80 px-4 py-3 text-sm text-gray-600">
          <span className="font-medium">Sample:</span> {sampleAction}
          {sampleHref && (
            <Link href={sampleHref} className="ml-2 font-semibold text-[#4318ff] hover:underline">
              Try it →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
