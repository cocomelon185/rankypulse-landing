"use client";

import { AlertTriangle, Clock, TrendingDown } from "lucide-react";

type AuditIssue = {
  id: string;
  severity: string;
  effortMinutes?: number;
};

/**
 * Heuristic: CRITICAL/HIGH = 500–1500, MED = 100–500, LOW = 10–100 visits/mo risk
 */
function estimateTrafficLossRange(issues: AuditIssue[]): { min: number; max: number } | null {
  if (!issues.length) return null;
  let min = 0;
  let max = 0;
  for (const i of issues) {
    const s = i.severity.toUpperCase();
    if (s === "HIGH" || s === "CRITICAL") {
      min += 500;
      max += 1500;
    } else if (s === "MED" || s === "MEDIUM") {
      min += 100;
      max += 500;
    } else {
      min += 10;
      max += 100;
    }
  }
  return min > 0 ? { min, max } : null;
}

function getIssuesBreakdown(issues: AuditIssue[]): { critical: number; medium: number; low: number } {
  let critical = 0;
  let medium = 0;
  let low = 0;
  for (const i of issues) {
    const s = i.severity.toUpperCase();
    if (s === "HIGH" || s === "CRITICAL") critical++;
    else if (s === "MED" || s === "MEDIUM") medium++;
    else low++;
  }
  return { critical, medium, low };
}

function formatIssuesFound(breakdown: ReturnType<typeof getIssuesBreakdown>): string {
  const parts: string[] = [];
  if (breakdown.critical) parts.push(`${breakdown.critical} critical`);
  if (breakdown.medium) parts.push(`${breakdown.medium} medium`);
  if (breakdown.low) parts.push(`${breakdown.low} low`);
  return parts.join(", ") || "0";
}

interface AuditMetricCardsProps {
  issues: AuditIssue[];
}

export function AuditMetricCards({ issues }: AuditMetricCardsProps) {
  const breakdown = getIssuesBreakdown(issues);
  const issuesFound = formatIssuesFound(breakdown);
  const top3Effort = issues
    .slice(0, 3)
    .reduce((sum, i) => sum + (i.effortMinutes ?? 10), 0);
  const trafficRange = estimateTrafficLossRange(issues);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="list" aria-label="Audit metrics">
      <div
        className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
        role="listitem"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          <AlertTriangle className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-[11px] font-medium text-gray-500">Issues found</p>
          <p className="text-sm font-bold text-[#1B2559]">{issuesFound}</p>
        </div>
      </div>
      <div
        className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
        role="listitem"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Clock className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-[11px] font-medium text-gray-500">Estimated effort</p>
          <p className="text-sm font-bold text-[#1B2559]">~{top3Effort} min</p>
          <p className="text-[10px] text-gray-500">to fix top 3</p>
        </div>
      </div>
      <div
        className="col-span-2 sm:col-span-1 flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
        role="listitem"
        title="Estimate based on typical impact"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
          <TrendingDown className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-[11px] font-medium text-gray-500">Potential traffic loss</p>
          {trafficRange ? (
            <>
              <p className="text-sm font-bold text-[#1B2559]">
                {trafficRange.min}–{trafficRange.max}/mo
              </p>
              <p className="text-[10px] text-gray-500">Estimate</p>
            </>
          ) : (
            <p className="text-sm font-bold text-[#1B2559]">Low risk</p>
          )}
        </div>
      </div>
    </div>
  );
}
