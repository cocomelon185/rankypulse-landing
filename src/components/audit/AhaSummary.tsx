"use client";

import { useState } from "react";
import { TrendingUp, Wrench, Clock, Info } from "lucide-react";
import type { PresentedIssue } from "@/lib/audit-issue-presentation";

interface AhaSummaryProps {
  trafficLiftText: string;
  priorityFixCount: number;
  totalEffortMinutes: number;
  topFix: PresentedIssue | null;
}

function HowWeEstimateTooltip({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-1 text-xs text-[#4318ff] hover:underline"
        aria-expanded={open}
      >
        <Info className="h-3 w-3" aria-hidden />
        How we estimate
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-xs text-gray-600">
          <ul className="space-y-1.5">
            <li>Severity × typical CTR/indexing impact from benchmark data</li>
            <li>Number of affected pages × average impressions per page tier</li>
            <li>Confidence reflects data completeness (Medium = heuristic estimate)</li>
          </ul>
        </div>
      )}
    </span>
  );
}

export function AhaSummary({ trafficLiftText, priorityFixCount, totalEffortMinutes, topFix }: AhaSummaryProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <section className="rounded-xl border border-[#4318ff]/15 bg-gradient-to-br from-[#f8f6ff] to-white p-5 shadow-sm">
      <h1 className="text-lg font-bold text-[#1B2559] sm:text-xl">
        Your fastest growth path is {totalEffortMinutes} minutes.
      </h1>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-white px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <TrendingUp className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-gray-500">Potential lift</p>
            <p className="text-sm font-bold text-[#1B2559]">+{trafficLiftText}</p>
            <p className="text-[10px] text-gray-400">visits/mo</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-white px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <Wrench className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-gray-500">Priority fixes</p>
            <p className="text-sm font-bold text-[#1B2559]">{priorityFixCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-white px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Clock className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-gray-500">Effort</p>
            <p className="text-sm font-bold text-[#1B2559]">~{totalEffortMinutes} min</p>
          </div>
        </div>
      </div>

      {topFix && (
        <div className="mt-4 rounded-lg border border-[#4318ff]/10 bg-[#4318ff]/[0.03] px-4 py-3">
          <p className="text-xs font-semibold text-gray-500">If you do only 1 thing…</p>
          <p className="mt-1 text-sm font-semibold text-[#1B2559]">{topFix.displayTitle}</p>
          <p className="mt-0.5 text-xs text-gray-600">
            Expected impact: {topFix.expectedLift}
          </p>
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
          Confidence: Medium
        </span>
        <HowWeEstimateTooltip open={tooltipOpen} onToggle={() => setTooltipOpen((v) => !v)} />
      </div>
    </section>
  );
}
