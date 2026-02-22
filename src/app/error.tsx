"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-[#1B2559]">Something went wrong</h1>
        <p className="mt-2 text-gray-600">
          We ran into an unexpected error. Please try again or contact support if it persists.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button onClick={reset} size="lg">
            <RefreshCw className="mr-2 h-5 w-5" />
            Try again
          </Button>
          <Link href="/">
            <Button variant="secondary" size="lg">
              Back to home
            </Button>
          </Link>
        </div>
        <a
          href="mailto:support@rankypulse.com?subject=Error%20Report"
          className="mt-6 text-sm text-gray-500 hover:text-[#4318ff]"
        >
          Report to support
        </a>
      </div>
    </div>
  );
}
