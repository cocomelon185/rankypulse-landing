"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ApiErrorRetryProps {
  message?: string;
  onRetry: () => void;
  className?: string;
}

export function ApiErrorRetry({
  message = "Something went wrong. Please try again.",
  onRetry,
  className,
}: ApiErrorRetryProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50/50 p-8 text-center ${className ?? ""}`}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <p className="text-gray-700">{message}</p>
      <Button onClick={onRetry} variant="secondary" size="md" className="mt-4">
        <RefreshCw className="mr-2 h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
