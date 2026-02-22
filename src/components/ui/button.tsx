"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#4318ff] text-white shadow-md hover:bg-[#3311db] hover:shadow-lg active:bg-[#2d1b9e] focus:ring-2 focus:ring-[#4318ff] focus:ring-offset-2",
  secondary:
    "bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 dark:text-white dark:hover:bg-white/10",
  outline:
    "border-2 border-gray-300 bg-transparent text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2",
};

const sizeStyles = {
  sm: "h-8 px-3 text-sm rounded-lg",
  md: "h-10 px-5 text-sm rounded-xl",
  lg: "h-12 px-8 text-base rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";
