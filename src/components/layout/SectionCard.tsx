"use client";

import { cn } from "@/lib/utils";

interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ children, className, ...props }: SectionCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl bg-white bg-clip-border shadow-[14px_17px_40px_4px_rgba(112,144,176,0.08)] transition-all duration-200 hover:shadow-[14px_17px_40px_4px_rgba(112,144,176,0.12)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
