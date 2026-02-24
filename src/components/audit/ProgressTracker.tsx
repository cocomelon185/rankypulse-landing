"use client";

interface ProgressTrackerProps {
  completed: number;
  total: number;
  riskReducedPercent: number;
}

export function ProgressTracker({ completed, total, riskReducedPercent }: ProgressTrackerProps) {
  const progress = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[#1B2559]">Progress</p>
        <p className="text-xs font-medium text-gray-600">
          {completed}/{total} done
        </p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-[#4318ff] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-gray-600">
        Estimated traffic risk reduced by {riskReducedPercent}%
      </p>
    </div>
  );
}
