"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Play,
  Circle,
  Lock,
  Clock,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuditStore } from "@/lib/use-audit";
import { useFixGate } from "@/hooks/useFixGate";
import { FixQuotaModal } from "../FixQuotaModal";
import { SectionHeading } from "./SectionHeading";
import type { AuditIssueData } from "@/lib/audit-data";

interface StepProps {
  issue: AuditIssueData;
  order: number;
  isLocked: boolean;
  status: "done" | "next" | "todo" | "locked";
  isLast: boolean;
  onOpenFix: () => void;
  onSkip: () => void;
}

function RoadmapStep({ issue, order, isLocked, status, isLast, onOpenFix, onSkip }: StepProps) {
  const router = useRouter();
  const icons = {
    done: <Check className="h-4 w-4" />,
    next: <Play className="h-4 w-4" />,
    todo: <Circle className="h-4 w-4" />,
    locked: <Lock className="h-4 w-4" />,
  };

  const iconBg = {
    done: "bg-[var(--accent-success)] text-white",
    next: "bg-[var(--accent-primary)] text-white",
    todo: "bg-white/[0.06] text-[var(--text-muted)]",
    locked: "bg-white/[0.04] text-[var(--text-muted)]",
  };

  const statusLabels = {
    done: "DONE",
    next: "NEXT",
    todo: "TODO",
    locked: "LOCKED",
  };

  const statusColors = {
    done: "text-[var(--accent-success)]",
    next: "text-[var(--accent-primary)]",
    todo: "text-[var(--text-muted)]",
    locked: "text-[var(--text-muted)]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: order * 0.1, duration: 0.4 }}
      className="flex gap-4"
    >
      {/* Stepper line + icon */}
      <div className="flex flex-col items-center">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${iconBg[status]}`}>
          {icons[status]}
        </div>
        {!isLast && (
          <div
            className={`mt-1 w-0.5 flex-1 ${status === "done" ? "bg-[var(--accent-success)]" : "bg-white/[0.06]"}`}
          />
        )}
      </div>

      {/* Content */}
      <div
        className={`mb-4 flex-1 rounded-xl p-4 transition ${
          status === "next"
            ? "audit-card-elevated border-l-2 !border-l-[var(--accent-primary)] shadow-[0_0_15px_rgba(99,102,241,0.08)]"
            : status === "locked"
              ? "audit-card opacity-60"
              : "audit-card"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold uppercase tracking-wider ${statusColors[status]}`}>
                {statusLabels[status]}
              </span>
              <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <Clock className="h-3 w-3" />
                {issue.timeEstimateMinutes} min
              </span>
              <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <TrendingUp className="h-3 w-3" />
                +{issue.trafficImpact.min}–{issue.trafficImpact.max}/mo
              </span>
            </div>
            {status === "locked" ? (
              <div className="relative mt-1.5">
                <p className="blur-sm select-none pointer-events-none text-sm font-semibold text-[var(--text-primary)]">
                  Fix #{order} — {issue.title}
                </p>
              </div>
            ) : (
              <h4
                className={`mt-1.5 text-sm font-semibold ${
                  status === "done"
                    ? "text-[var(--text-muted)] line-through"
                    : "text-[var(--text-primary)]"
                }`}
              >
                Fix #{order} — {issue.title}
              </h4>
            )}
            {status === "next" && (
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {issue.description.slice(0, 120)}
                {issue.description.length > 120 ? "..." : ""}
              </p>
            )}
          </div>
        </div>

        {status === "next" && (
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenFix}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-primary)]/90"
            >
              <Play className="h-3.5 w-3.5" /> Open Fix Guide
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-white/[0.04]"
            >
              Skip
            </button>
          </div>
        )}

        {isLocked && (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06]">
              <Lock className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            </div>
            <button
              type="button"
              onClick={() => router.push("/pricing")}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-primary)]/90 hover:-translate-y-px active:translate-y-0"
            >
              <Zap className="h-3.5 w-3.5" /> Unlock with Pro
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function UpgradePaywallBanner({
  lockedIssues,
}: {
  lockedIssues: { trafficImpact: { min: number; max: number } }[];
}) {
  const router = useRouter();
  const extraMin = lockedIssues.reduce((s, i) => s + i.trafficImpact.min, 0);
  const extraMax = lockedIssues.reduce((s, i) => s + i.trafficImpact.max, 0);

  return (
    <div
      className="relative my-4 overflow-hidden rounded-2xl p-5"
      style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))",
        border: "1px solid rgba(99,102,241,0.25)",
      }}
    >
      {/* Decorative corner glow */}
      <div
        className="pointer-events-none absolute -right-5 -top-5 h-24 w-24 rounded-full"
        style={{
          background: "rgba(99,102,241,0.15)",
          filter: "blur(30px)",
        }}
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-base">🔒</span>
            <p className="font-display text-[15px] font-bold text-white">
              {lockedIssues.length}{" "}
              {lockedIssues.length === 1 ? "fix" : "fixes"} locked — unlock{" "}
              <span style={{ color: "#6ee7b7" }}>+{extraMin}–{extraMax} visits/mo</span>
            </p>
          </div>
          <p className="mb-3 text-[12px] text-[var(--text-secondary)]">
            Pro members resolve{" "}
            {lockedIssues.length === 1 ? "this" : "these"} in under 20 min on average.{" "}
            <span className="font-semibold text-white">7-day free trial</span> — no card required.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {[
              "Unlimited audits",
              "All fixes unlocked",
              "PDF reports",
              "Priority support",
            ].map((f) => (
              <span key={f} className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                <span style={{ color: "#10b981" }}>✓</span> {f}
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
          <button
            type="button"
            onClick={() => router.push("/pricing")}
            className="rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(99,102,241,0.5)] active:translate-y-0"
            style={{ background: "#6366f1" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#818cf8")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#6366f1")
            }
          >
            Start Free Trial →
          </button>
          <span className="text-[10px] text-[var(--text-muted)]">
            From $9/mo · Cancel anytime
          </span>
        </div>
      </div>
    </div>
  );
}

export function ActionRoadmap({ onScrollToIssue }: { onScrollToIssue: (id: string) => void }) {
  const data = useAuditStore((s) => s.data);
  const completedFixIds = useAuditStore((s) => s.completedFixIds);
  const skippedIds = useAuditStore((s) => s.skippedIds);
  const skipIssue = useAuditStore((s) => s.skipIssue);
  const setExpandedIssue = useAuditStore((s) => s.setExpandedIssue);
  const { handleFixAction } = useFixGate();
  const [showQuotaModal, setShowQuotaModal] = useState(false);

  const completedCount = completedFixIds.length;

  const totalFree = useMemo(
    () => data.roadmap.filter((r) => !r.isLocked).length,
    [data.roadmap]
  );

  const progressPercent = useMemo(
    () =>
      totalFree > 0
        ? Math.round((completedFixIds.length / totalFree) * 100)
        : 0,
    [completedFixIds.length, totalFree]
  );

  const sortedRoadmap = [...data.roadmap].sort((a, b) => a.order - b.order);
  const totalMinutes = sortedRoadmap.reduce((sum, step) => {
    const issue = data.issues.find((i) => i.id === step.issueId);
    return sum + (issue?.timeEstimateMinutes ?? 0);
  }, 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      id="fix-roadmap"
      className="audit-card p-6 md:p-8"
    >
      <SectionHeading
        title="Your Fix Roadmap"
        subtitle="Sequential fix queue — work through each to maximize impact"
        rightElement={
          <span className="font-mono-data text-sm text-[var(--text-muted)]">
            Total: ~{totalMinutes} min
          </span>
        }
      />

      {/* Overall progress bar */}
      <div className="mt-5 mb-6">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>Progress</span>
          <span>
            {completedCount} of {totalFree} free fixes done
          </span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-success)]"
          />
        </div>
      </div>

      {/* Steps — with paywall banner inserted between free and locked */}
      <div>
        {(() => {
          // Exclude skipped issues from the active roadmap display
          const activeRoadmap = sortedRoadmap.filter(
            (s) => !skippedIds.includes(s.issueId)
          );
          const skippedSteps = sortedRoadmap.filter(
            (s) => !s.isLocked && skippedIds.includes(s.issueId)
          );
          const firstLockedIdx = activeRoadmap.findIndex((s) => s.isLocked);
          const lockedIssues = data.issues.filter((i) => i.status === "locked");

          return (
            <>
              {activeRoadmap.map((step, idx) => {
                const issue = data.issues.find((i) => i.id === step.issueId);
                if (!issue) return null;

                let status: "done" | "next" | "todo" | "locked";
                if (step.isLocked) {
                  status = "locked";
                } else if (completedFixIds.includes(step.issueId)) {
                  status = "done";
                } else {
                  const firstUnfinished = activeRoadmap.find(
                    (s) => !s.isLocked && !completedFixIds.includes(s.issueId)
                  );
                  status = firstUnfinished?.issueId === step.issueId ? "next" : "todo";
                }

                // Insert paywall banner once, just before the first locked step
                const showBanner =
                  lockedIssues.length > 0 && idx === firstLockedIdx;

                return (
                  <div key={step.issueId}>
                    {showBanner && (
                      <UpgradePaywallBanner lockedIssues={lockedIssues} />
                    )}
                    <RoadmapStep
                      issue={issue}
                      order={step.order}
                      isLocked={step.isLocked}
                      status={status}
                      isLast={idx === activeRoadmap.length - 1 && skippedSteps.length === 0}
                      onOpenFix={() => {
                        void handleFixAction(issue.id, () => {
                          onScrollToIssue(issue.id);
                          setExpandedIssue(issue.id);
                        }).then((result) => {
                          if (result === "quota_exceeded") setShowQuotaModal(true);
                        });
                      }}
                      onSkip={() => skipIssue(issue.id)}
                    />
                  </div>
                );
              })}

              {/* Skipped issues — collapsed at the bottom */}
              {skippedSteps.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition select-none">
                    {skippedSteps.length} skipped {skippedSteps.length === 1 ? "fix" : "fixes"} — click to review
                  </summary>
                  <div className="mt-2 space-y-0 opacity-50">
                    {skippedSteps.map((step, idx) => {
                      const issue = data.issues.find((i) => i.id === step.issueId);
                      if (!issue) return null;
                      return (
                        <RoadmapStep
                          key={step.issueId}
                          issue={issue}
                          order={step.order}
                          isLocked={false}
                          status="todo"
                          isLast={idx === skippedSteps.length - 1}
                          onOpenFix={() => {
                            void handleFixAction(issue.id, () => {
                              onScrollToIssue(issue.id);
                              setExpandedIssue(issue.id);
                            }).then((result) => {
                              if (result === "quota_exceeded") setShowQuotaModal(true);
                            });
                          }}
                          onSkip={() => {}}
                        />
                      );
                    })}
                  </div>
                </details>
              )}
            </>
          );
        })()}
      </div>

      {showQuotaModal && <FixQuotaModal onClose={() => setShowQuotaModal(false)} />}
    </motion.section>
  );
}
