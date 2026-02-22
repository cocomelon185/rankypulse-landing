"use client";

import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  extra?: string;
  default?: boolean;
}

export function Card({ children, extra = "", default: defaultShadow = false, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-[20px] bg-white bg-clip-border",
        defaultShadow ? "shadow-[14px_17px_40px_4px_rgba(112,144,176,0.08)]" : "shadow-[14px_17px_40px_4px_rgba(112,144,176,0.08)]",
        "dark:bg-[#111c44] dark:text-white dark:shadow-none",
        extra,
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
