"use client";

import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-12",
        className
      )}
    >
      {children}
    </div>
  );
}
