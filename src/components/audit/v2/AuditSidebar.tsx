"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useFixGate } from "@/hooks/useFixGate";
import { FixQuotaModal } from "../FixQuotaModal";
import {
  Play,
  Share2,
  Download,
  TrendingUp,
  AlertTriangle,
  Target,
  Send,
  Check,
} from "lucide-react";
import { useAuditStore } from "@/lib/use-audit";
import { MOCK_AUDIT } from "@/lib/audit-data";
import { ScoreHistory } from "../ScoreHistory";
import { SerpPreview } from "./SerpPreview";
import { ShareScoreCard } from "./ShareScoreCard";

export function AuditSidebar({
  onScrollToIssue,
}: {
  onScrollToIssue: (id: string) => void;
}) {
  const data = useAuditStore((s) => s.data);
  const completedFixIds = useAuditStore((s) => s.completedFixIds);
  const setExpandedIssue = useAuditStore((s) => s.setExpandedIssue);

  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const { handleFixAction } = useFixGate();

  const currentTask = useMemo(() => {
    const sorted = [...data.roadmap].sort((a, b) => a.order - b.order);
    for (const step of sorted) {
      if (!completedFixIds.includes(step.issueId) && !step.isLocked) {
        return data.issues.find((i) => i.id === step.issueId) ?? null;
      }
    }
    return null;
  }, [data.issues, data.roadmap, completedFixIds]);

  const completedCount = completedFixIds.length;

  const totalFree = useMemo(
    () => data.roadmap.filter((r) => !r.isLocked).length,
    [data.roadmap]
  );

  const adjustedScore = useMemo(() => {
    const base = data.score;
    const extraFixes = completedFixIds.filter(
      (id) =>
        !MOCK_AUDIT.issues.find((i) => i.id === id && i.status === "fixed")
    ).length;
    return Math.min(100, base + extraFixes * 3);
  }, [data.score, completedFixIds]);

  const openIssuesCount = useMemo(
    () =>
      data.issues.filter(
        (i) => i.status === "open" || i.status === "in-progress"
      ).length,
    [data.issues]
  );

  const handleContinueFix = () => {
    if (!currentTask) return;
    void handleFixAction(currentTask.id, () => {
      onScrollToIssue(currentTask!.id);
      setExpandedIssue(currentTask!.id);
    }).then((result) => {
      if (result === "quota_exceeded") setShowQuotaModal(true);
    });
  };

  const handleEmailSubmit = async () => {
    if (!email.includes("@")) return;
    // Fire-and-forget — UX shows success regardless of API outcome
    setEmailSent(true);
    try {
      await fetch("/api/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, domain: data.domain, auditData: data }),
      });
    } catch {
      // silently fail — user already saw success state
    }
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:overflow-x-hidden [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-white/20"
    >
      {/* Current task card */}
      {currentTask && (
        <div className="audit-card p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--accent-primary)]">
            Current Task
          </p>
          <h3 className="mt-1 font-display text-base font-semibold text-[var(--text-primary)] line-clamp-2 break-words">
            {currentTask.title}
          </h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)] line-clamp-3 break-words">
            {currentTask.description.slice(0, 100)}...
          </p>

          {/* Inline SERP preview */}
          <div className="mt-3">
            <SerpPreview
              before={currentTask.serpBefore}
              after={currentTask.serpAfter}
            />
          </div>

          {/* Progress indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>Progress</span>
              <span className="font-mono-data">
                {completedCount}/{totalFree}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${totalFree > 0 ? (completedCount / totalFree) * 100 : 0}%`,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-success)]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleContinueFix}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-primary)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-primary)]/90"
          >
            <Play className="h-4 w-4" /> Continue Fix
          </button>
        </div>
      )}

      {/* Quick stats */}
      <div className="audit-card p-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Quick Stats
        </p>

        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Target className="h-4 w-4" /> Score
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono-data text-sm font-semibold text-[var(--text-primary)]">
                {adjustedScore}
              </span>
              {data.scoreHistory.length >= 2 && (
                <>
                  <span className="text-xs text-[var(--accent-success)]">
                    ↑ from {data.scoreHistory[data.scoreHistory.length - 2].score}
                  </span>
                  <ScoreHistory history={data.scoreHistory} width={60} height={24} />
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <AlertTriangle className="h-4 w-4" /> Issues
            </span>
            <span className="font-mono-data text-sm font-semibold text-[var(--text-primary)]">
              {openIssuesCount} remaining
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="flex shrink-0 items-center gap-2 text-sm text-[var(--text-secondary)]">
              <TrendingUp className="h-4 w-4" /> Est. gain
            </span>
            <span className="font-mono-data text-sm font-semibold text-[var(--accent-success)] truncate text-right">
              +{data.estimatedTrafficLoss.min.toLocaleString()}–
              {data.estimatedTrafficLoss.max.toLocaleString()}/mo
            </span>
          </div>
        </div>
      </div>

      {/* Email capture */}
      <div
        className="rounded-xl p-4"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <p className="text-[12px] font-semibold text-white">
          📧 Get this report by email
        </p>
        <p className="mt-1 text-[11px] text-[var(--text-muted)]">
          Plus weekly SEO tips for {data.domain}
        </p>

        {!emailSent ? (
          <div className="mt-3 space-y-2">
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
              className="w-full rounded-lg px-3 py-2 text-[12px] text-white outline-none placeholder:text-[var(--text-muted)] transition"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)";
                e.currentTarget.style.background = "rgba(99,102,241,0.06)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
            />
            <button
              type="button"
              onClick={handleEmailSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-[12px] font-semibold text-white transition hover:opacity-90"
              style={{ background: "#6366f1" }}
            >
              <Send className="h-3.5 w-3.5" /> Send Report →
            </button>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2">
            <Check className="h-4 w-4 text-[var(--accent-success)]" />
            <span className="text-[12px] text-[var(--text-secondary)]">
              Report sent! Check your inbox.
            </span>
          </div>
        )}
      </div>

      {showQuotaModal && <FixQuotaModal onClose={() => setShowQuotaModal(false)} />}

      {/* Action buttons */}
      <div className="audit-card p-5">
        <div className="space-y-1">
          {/* Share score card button */}
          <div className="flex w-full items-center gap-2 rounded-lg px-3 py-2">
            <ShareScoreCard />
          </div>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-white/[0.04]"
          >
            <Share2 className="h-4 w-4" /> Share Report
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-white/[0.04]"
          >
            <Download className="h-4 w-4" /> Download PDF
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
