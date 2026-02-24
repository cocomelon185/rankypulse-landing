"use client";

import { useState } from "react";
import type { PresentedIssue } from "@/lib/audit-issue-presentation";
import { ProgressTracker } from "@/components/audit/ProgressTracker";

interface ActionPanelProps {
  currentTask: PresentedIssue | null;
  completedCount: number;
  totalCount: number;
  riskReducedPercent: number;
  onPrimaryClick: () => void;
  reportUrl: string;
}

export function ActionPanel({
  currentTask,
  completedCount,
  totalCount,
  riskReducedPercent,
  onPrimaryClick,
  reportUrl,
}: ActionPanelProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <aside className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Current task</p>
      <h3 className="mt-1 text-sm font-semibold text-[#1B2559]">
        {currentTask ? `Fix #1: ${currentTask.displayTitle}` : "No active fix"}
      </h3>
      {currentTask && (
        <p className="mt-1 text-xs text-gray-600">
          {currentTask.effortMinutes} min · {currentTask.impactSummary}
        </p>
      )}

      <div className="mt-3">
        <ProgressTracker
          completed={completedCount}
          total={totalCount}
          riskReducedPercent={riskReducedPercent}
        />
      </div>

      <button
        type="button"
        onClick={onPrimaryClick}
        className="mt-3 flex h-11 w-full items-center justify-center rounded-xl bg-[#4318ff] text-sm font-semibold text-white hover:bg-[#3311db]"
      >
        {completedCount > 0 ? "Continue fix" : "Fix #1 now"}
      </button>

      <div className="mt-3 space-y-1 text-xs">
        <a
          href={`mailto:?subject=RankyPulse%20SEO%20report&body=${encodeURIComponent(reportUrl)}`}
          className="block text-[#4318ff] hover:underline"
        >
          Email report
        </a>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(reportUrl)}
          className="block text-[#4318ff] hover:underline"
        >
          Share report
        </button>
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="block text-gray-600 hover:underline"
        >
          More
        </button>
        {showMore && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-gray-600">
            Additional actions are available in the full roadmap view.
          </div>
        )}
      </div>
    </aside>
  );
}
