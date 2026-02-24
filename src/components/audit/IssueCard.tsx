"use client";

import type { PresentedIssue } from "@/lib/audit-issue-presentation";

type IssueCardProps = {
  issue: PresentedIssue;
  primaryAction?: boolean;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
};

function severityClasses(severity: string): string {
  const normalized = severity.toUpperCase();
  if (normalized === "CRITICAL" || normalized === "HIGH") {
    return "bg-amber-100 text-amber-800 border-amber-200";
  }
  if (normalized === "MED" || normalized === "MEDIUM") {
    return "bg-blue-50 text-blue-800 border-blue-200";
  }
  return "bg-gray-100 text-gray-700 border-gray-200";
}

export function IssueCard({ issue, primaryAction = false, onPrimaryAction, onSecondaryAction }: IssueCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${severityClasses(issue.severity)}`}>
          {issue.severity}
        </span>
        {issue.category && <span className="text-xs text-gray-500">{issue.category}</span>}
        <span className="text-xs text-gray-500">~{issue.effortMinutes} min</span>
      </div>

      <h3 className="mt-2 text-base font-semibold text-[#1B2559]">{issue.displayTitle}</h3>
      <p className="mt-1 text-sm text-gray-600">{issue.impactSummary}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onPrimaryAction}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-[#4318ff] px-3 text-sm font-semibold text-white hover:bg-[#3311db]"
        >
          {primaryAction ? "Fix #1 now" : "Open fix"}
        </button>
        {onSecondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View details
          </button>
        )}
      </div>
    </article>
  );
}
