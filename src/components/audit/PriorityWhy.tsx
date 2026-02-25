"use client";

import { Lightbulb } from "lucide-react";
import type { PresentedIssue } from "@/lib/audit-issue-presentation";

interface PriorityWhyProps {
  issue: PresentedIssue;
}

export function PriorityWhy({ issue }: PriorityWhyProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-500" aria-hidden />
        <h3 className="text-sm font-bold text-[#1B2559]">Why this is Fix #1</h3>
      </div>

      <ul className="mt-3 space-y-2">
        {issue.priorityReasons.map((reason, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[9px] font-bold text-amber-700">
              {idx + 1}
            </span>
            <span className="text-xs text-gray-700 leading-relaxed">{reason}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2">
        <p className="text-[11px] text-gray-500">
          <span className="font-medium text-[#1B2559]">Category:</span> {issue.categoryTag}
          <span className="mx-1.5">·</span>
          <span className="font-medium text-[#1B2559]">Expected:</span> {issue.expectedLift}
          <span className="mx-1.5">·</span>
          <span className="font-medium text-[#1B2559]">Effort:</span> ~{issue.effortMinutes} min
        </p>
      </div>
    </section>
  );
}
