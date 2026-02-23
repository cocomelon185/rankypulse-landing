"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/horizon";
import { Loader2 } from "lucide-react";

const PROGRESS_MESSAGES = [
  "Checking page structure",
  "Analyzing technical SEO signals",
  "Evaluating indexing and metadata",
  "Prioritizing fixes",
];

export function AuditScanProgress() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % PROGRESS_MESSAGES.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card extra="w-full p-8 md:p-12 overflow-hidden" default>
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eff6ff] to-[#e0e7ff]">
          <Loader2 className="h-8 w-8 animate-spin text-[#4318ff]" aria-hidden />
        </div>
        <h2 className="mb-2 text-xl font-bold text-[#1B2559] md:text-2xl">
          Scanning your site...
        </h2>
        <p className="mb-8 text-gray-600">
          Checking structure, speed, indexability, and ranking signals
        </p>
        <p
          className="mb-6 min-h-[1.5rem] text-sm font-semibold text-[#4318ff] transition-opacity duration-300"
          key={messageIndex}
          role="status"
          aria-live="polite"
        >
          {PROGRESS_MESSAGES[messageIndex]}
        </p>
        <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#4318ff] to-[#7551ff] animate-shimmer"
            aria-hidden
          />
        </div>
      </div>
    </Card>
  );
}
