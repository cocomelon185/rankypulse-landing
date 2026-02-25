"use client";

import { RotateCcw, ShieldCheck, CheckCircle2 } from "lucide-react";
import { track } from "@/lib/analytics";

export type FixStatus = "not_started" | "done_unverified" | "verified";

interface ProgressProofProps {
  initialScore: number;
  currentScore: number;
  completedCount: number;
  verifiedCount: number;
  totalCount: number;
  projectedLiftText: string;
  riskReducedPercent: number;
  onRerunAudit: () => void;
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const color = value >= 80 ? "bg-emerald-500" : value >= 50 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 shrink-0 text-xs font-medium text-gray-500">{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 shrink-0 text-right text-xs font-bold text-[#1B2559]">{value}</span>
    </div>
  );
}

export function ProgressProof({
  initialScore,
  currentScore,
  completedCount,
  verifiedCount,
  totalCount,
  projectedLiftText,
  riskReducedPercent,
  onRerunAudit,
}: ProgressProofProps) {
  const doneUnverified = completedCount - verifiedCount;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-[#1B2559]">Progress & Proof</h3>

      <div className="mt-3 space-y-2.5">
        <ScoreBar label="Before" value={initialScore} max={100} />
        <ScoreBar label="After" value={currentScore} max={100} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
          <p className="text-lg font-bold text-[#1B2559]">{totalCount - completedCount}</p>
          <p className="text-[10px] text-gray-500">Not started</p>
        </div>
        <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-2 text-center">
          <div className="flex items-center justify-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
            <p className="text-lg font-bold text-[#1B2559]">{doneUnverified}</p>
          </div>
          <p className="text-[10px] text-gray-500">Done</p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-2 text-center">
          <div className="flex items-center justify-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <p className="text-lg font-bold text-[#1B2559]">{verifiedCount}</p>
          </div>
          <p className="text-[10px] text-gray-500">Verified</p>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2">
        <p className="text-xs text-gray-600">
          Projected lift now: <span className="font-semibold text-emerald-700">+{projectedLiftText} visits/mo</span>
        </p>
        {riskReducedPercent > 0 && (
          <p className="mt-0.5 text-[11px] text-gray-500">
            Risk reduced by {riskReducedPercent}%
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          track("rerun_audit_clicked", { source: "progress_proof" });
          onRerunAudit();
        }}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#4318ff] hover:underline"
      >
        <RotateCcw className="h-3 w-3" aria-hidden />
        Re-run audit to verify
      </button>
    </section>
  );
}
