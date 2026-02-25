"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import type { PresentedIssue, IssueCategory } from "@/lib/audit-issue-presentation";

interface FixQueueItemProps {
  issue: PresentedIssue;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
}

const CATEGORY_STYLES: Record<IssueCategory, string> = {
  CTR: "bg-blue-50 text-blue-700 border-blue-200",
  Indexing: "bg-amber-50 text-amber-700 border-amber-200",
  Performance: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Content: "bg-purple-50 text-purple-700 border-purple-200",
};

function severityDot(severity: string): string {
  const s = severity.toUpperCase();
  if (s === "CRITICAL" || s === "HIGH") return "bg-red-500";
  if (s === "MED" || s === "MEDIUM") return "bg-amber-400";
  return "bg-gray-300";
}

export function FixQueueItem({ issue, index, isActive, isCompleted, onSelect, onViewDetails }: FixQueueItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      className={`rounded-xl border bg-white transition-all ${
        isActive ? "border-[#4318ff]/30 shadow-[0_0_0_1px_rgba(67,24,255,0.1)]" : "border-gray-200"
      } ${isCompleted ? "opacity-60" : ""}`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
      >
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-label="Completed" />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-300 text-[10px] font-bold text-gray-400">
              {index + 1}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${severityDot(issue.severity)}`} aria-label={`${issue.severity} severity`} />
            <span className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] font-medium ${CATEGORY_STYLES[issue.categoryTag]}`}>
              {issue.categoryTag}
            </span>
            <span className="text-[10px] text-gray-400">~{issue.effortMinutes} min</span>
          </div>
          <h3 className={`mt-1 text-sm font-semibold ${isCompleted ? "line-through text-gray-400" : "text-[#1B2559]"}`}>
            {issue.displayTitle}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">{issue.whyItMatters}</p>

          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
            <span>Affects: {issue.affectedUrlsCount} URLs</span>
            <span className="text-[10px]">·</span>
            <span>{issue.expectedLift}</span>
          </div>
        </div>
      </button>

      <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-[#4318ff]"
        >
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          {expanded ? "Hide URLs" : `Show ${Math.min(2, issue.affectedUrlsCount)} sample URLs`}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
          className="text-[11px] font-medium text-[#4318ff] hover:underline"
        >
          View details
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-2">
          <ul className="space-y-1">
            {issue.sampleUrls.slice(0, 2).map((u) => (
              <li key={u} className="truncate text-[11px] text-gray-500 font-mono">{u}</li>
            ))}
            {issue.affectedUrlsCount > 2 && (
              <li className="text-[11px] text-gray-400">+{issue.affectedUrlsCount - 2} more</li>
            )}
          </ul>
        </div>
      )}
    </article>
  );
}
