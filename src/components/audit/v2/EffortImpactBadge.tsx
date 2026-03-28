"use client";

interface EffortImpactBadgeProps {
  timeEstimateMinutes: number;
  impact: "HIGH" | "MED" | "LOW";
}

function effortLabel(mins: number): string {
  if (mins <= 5) return "⚡ Quick Fix";
  if (mins <= 30) return `~${mins} min`;
  return "⏱ Longer Task";
}

function effortColor(mins: number): string {
  if (mins <= 5) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
  if (mins <= 30) return "bg-amber-500/15 text-amber-400 border-amber-500/20";
  return "bg-white/[0.06] text-[var(--text-muted)] border-white/[0.08]";
}

function impactLabel(impact: "HIGH" | "MED" | "LOW"): string {
  if (impact === "HIGH") return "🔥 High Impact";
  if (impact === "MED") return "📈 Medium";
  return "📊 Low";
}

function impactColor(impact: "HIGH" | "MED" | "LOW"): string {
  if (impact === "HIGH") return "bg-orange-500/15 text-orange-400 border-orange-500/20";
  if (impact === "MED") return "bg-sky-500/15 text-sky-400 border-sky-500/20";
  return "bg-white/[0.06] text-[var(--text-muted)] border-white/[0.08]";
}

export function EffortImpactBadge({ timeEstimateMinutes, impact }: EffortImpactBadgeProps) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold leading-tight ${effortColor(timeEstimateMinutes)}`}
      >
        {effortLabel(timeEstimateMinutes)}
      </span>
      <span
        className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold leading-tight ${impactColor(impact)}`}
      >
        {impactLabel(impact)}
      </span>
    </span>
  );
}
