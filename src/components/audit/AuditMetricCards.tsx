"use client";

import { AlertTriangle, Clock, TrendingDown } from "lucide-react";

type AuditIssue = {
  id: string;
  severity: string;
  effortMinutes?: number;
};

/**
 * Heuristic: CRITICAL/HIGH = 500–1500, MED = 100–500, LOW = 10–100 visits/mo risk
 * Exported for trust strip and outcome copy.
 */
export function estimateTrafficLossRange(issues: AuditIssue[]): { min: number; max: number } | null {
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="list" aria-label="Audit metrics">
      <div
        className="flex items-center gap-4 rounded-xl bg-white px-5 py-4 shadow-[14px_17px_40px_4px_rgba(112,144,176,0.08)] transition-shadow hover:shadow-[14px_17px_40px_4px_rgba(112,144,176,0.12)]"
        role="listitem"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <AlertTriangle className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="mb-0.5 text-sm font-medium text-gray-600">Issues found</p>
          <h3 className="text-xl font-bold text-[#1B2559]">{issuesFound}</h3>
        </div>
      </div>
      <div
        className="flex items-center gap-4 rounded-xl bg-white px-5 py-4 shadow-[14px_17px_40px_4px_rgba(112,144,176,0.08)] transition-shadow hover:shadow-[14px_17px_40px_4px_rgba(112,144,176,0.12)]"
        role="listitem"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Clock className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="mb-0.5 text-sm font-medium text-gray-600">Estimated effort</p>
          <h3 className="text-xl font-bold text-[#1B2559]">~{top3Effort} min</h3>
          <p className="text-xs text-gray-500">to fix top 3</p>
        </div>
      </div>
      <div
        className="col-span-2 sm:col-span-1 flex items-center gap-4 rounded-xl bg-white px-5 py-4 shadow-[14px_17px_40px_4px_rgba(112,144,176,0.08)] transition-shadow hover:shadow-[14px_17px_40px_4px_rgba(112,144,176,0.12)]"
        role="listitem"
        title="Estimate based on typical impact"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
          <TrendingDown className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="mb-0.5 text-sm font-medium text-gray-600">Potential traffic loss</p>
          {trafficRange ? (
            <>
              <h3 className="text-xl font-bold text-[#1B2559]">
                {trafficRange.min}–{trafficRange.max}/mo
              </h3>
              <p className="text-xs text-gray-500">Estimate</p>
            </>
          ) : (
            <h3 className="text-xl font-bold text-[#1B2559]">Low risk</h3>
          )}
        </div>
      </div>
    </div>
  );
}
