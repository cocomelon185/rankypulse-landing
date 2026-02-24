"use client";

import type { PresentedIssue } from "@/lib/audit-issue-presentation";

interface FixDrawerProps {
  issue: PresentedIssue | null;
  open: boolean;
  isLocked: boolean;
  onClose: () => void;
  onMarkDone: (issueId: string) => void;
  onUpgradeRequest: () => void;
}

export function FixDrawer({
  issue,
  open,
  isLocked,
  onClose,
  onMarkDone,
  onUpgradeRequest,
}: FixDrawerProps) {
  if (!open || !issue) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-end bg-black/35" onClick={onClose}>
      <div
        className="h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[#1B2559]">{issue.displayTitle}</h3>
          <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:underline">
            Close
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-700">{issue.whyItMatters}</p>

        {!isLocked ? (
          <>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-gray-700">
              {issue.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => onMarkDone(issue.id)}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[#4318ff] px-4 text-sm font-semibold text-white hover:bg-[#3311db]"
            >
              Mark as done
            </button>
          </>
        ) : (
          <div className="mt-4 rounded-xl border border-[#4318ff]/25 bg-[#4318ff]/5 p-4">
            <p className="text-sm font-medium text-[#1B2559]">
              Full fix steps for this item are part of Pro.
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Unlock remaining fixes, the full roadmap, and competitor benchmark.
            </p>
            <button
              type="button"
              onClick={onUpgradeRequest}
              className="mt-3 inline-flex h-10 items-center justify-center rounded-xl bg-[#4318ff] px-4 text-sm font-semibold text-white hover:bg-[#3311db]"
            >
              Unlock remaining fixes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
