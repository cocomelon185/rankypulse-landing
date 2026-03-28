"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, TrendingUp, ChevronDown, Check } from "lucide-react";
import type { AuditIssueData } from "@/lib/audit-data";
import { SerpPreview } from "./SerpPreview";
import { fireFixConfetti } from "@/lib/confetti";
import { EffortImpactBadge } from "./EffortImpactBadge";
import { FixAssistantDrawer } from "./FixAssistantDrawer";
import { GlossaryTooltip, GLOSSARY } from "./GlossaryTooltip";
import { AddToRoadmapButton } from "./AddToRoadmapButton";

interface IssueCardProps {
  issue: AuditIssueData;
  isExpanded: boolean;
  isHighlighted: boolean;
  onToggleExpand: () => void;
  onMarkFixed: () => void;
}

const TERMS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
const TERM_REGEX = new RegExp(
  `(${TERMS.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
  "gi"
);

function highlightTerms(text: string): React.ReactNode[] {
  if (!text) return [];
  const parts = text.split(TERM_REGEX);
  return parts.map((part, i) => {
    const matchedKey = TERMS.find(t => t.toLowerCase() === part.toLowerCase());
    if (matchedKey) {
      return (
        <GlossaryTooltip key={i} term={matchedKey as keyof typeof GLOSSARY}>
          {part}
        </GlossaryTooltip>
      );
    }
    return part;
  });
}

const priorityConfig = {
  critical: { label: "Critical", className: "priority-critical", emoji: "🔴" },
  high: { label: "High", className: "priority-high", emoji: "🟡" },
  medium: { label: "Medium", className: "priority-medium", emoji: "🔵" },
  low: { label: "Low", className: "priority-low", emoji: "🟢" },
  opportunity: { label: "Opportunity", className: "priority-opportunity", emoji: "💡" },
};

export function IssueCard({
  issue,
  isExpanded,
  isHighlighted,
  onToggleExpand,
  onMarkFixed,
}: IssueCardProps) {
  const [isFixing, setIsFixing] = useState(false);
  const config = priorityConfig[issue.priority];

  const handleMarkFixed = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsFixing(true);
    // Fire confetti from the button's position so it never bursts off-screen
    fireFixConfetti(e.currentTarget);
    setTimeout(() => {
      onMarkFixed();
      setIsFixing(false);
    }, 400);
  };

  return (
    <motion.article
      id={`issue-${issue.id}`}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: isHighlighted
          ? "0 0 0 2px rgba(99,102,241,0.5), 0 0 20px rgba(99,102,241,0.2)"
          : "none",
      }}
      transition={{ duration: 0.4 }}
      className={`audit-card-elevated overflow-hidden transition-all ${isFixing ? "!border-[var(--accent-success)]/50 !bg-[var(--accent-success)]/5" : ""}`}
    >
      <button
        type="button"
        onClick={onToggleExpand}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${config.className}`}>
              {config.emoji} {config.label}
            </span>
            <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <Clock className="h-3 w-3" />
              {issue.timeEstimateMinutes} min
            </span>
            <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <TrendingUp className="h-3 w-3" />
              +{issue.trafficImpact.min}–{issue.trafficImpact.max} visits/mo
            </span>
            <EffortImpactBadge
              timeEstimateMinutes={issue.timeEstimateMinutes}
              impact={
                issue.priority === "critical" || issue.priority === "high"
                  ? "HIGH"
                  : issue.priority === "medium"
                  ? "MED"
                  : "LOW"
              }
            />
          </div>
          <h3 className="mt-2 font-display text-base font-semibold text-[var(--text-primary)]">
            {issue.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
            {highlightTerms(issue.description)}
          </p>
        </div>
        <ChevronDown
          className={`mt-1 h-5 w-5 shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.06] px-4 pb-4 pt-4">
              {/* SERP Preview */}
              <SerpPreview before={issue.serpBefore} after={issue.serpAfter} />

              {/* How to Fix */}
              <div className="mt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  How to Fix
                </p>
                <ol className="space-y-2">
                  {issue.howToFix.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[var(--text-secondary)]">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-primary)]/10 text-[10px] font-semibold text-[var(--accent-primary)]">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Fix Assistant */}
              <FixAssistantDrawer issueId={issue.id} issueTitle={issue.title} />

              {/* Affected pages */}
              {issue.affectedPages && issue.affectedPages.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Affected Pages
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {issue.affectedPages.map((page) => (
                      <span
                        key={page}
                        className="rounded-md bg-white/[0.04] px-2 py-1 font-mono-data text-xs text-[var(--text-secondary)]"
                      >
                        {page}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleMarkFixed}
                  disabled={isFixing}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-success)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-success)]/90 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  {isFixing ? "Marking..." : "Mark as Fixed"}
                </button>
                <AddToRoadmapButton
                  task={{
                    id: `issue-${issue.id}`,
                    type: "TECHNICAL",
                    title: issue.title,
                    description: issue.description,
                    impact:
                      issue.priority === "critical" || issue.priority === "high"
                        ? "HIGH"
                        : "MED",
                    effort: `${issue.timeEstimateMinutes} min`,
                  }}
                />
                {issue.learnMoreUrl && (
                  <a
                    href={issue.learnMoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-primary)]/90"
                  >
                    Open Fix Guide
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
