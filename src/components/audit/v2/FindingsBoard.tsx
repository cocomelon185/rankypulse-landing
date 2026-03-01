"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, PartyPopper, LayoutGrid, TableIcon } from "lucide-react";
import { useAuditStore } from "@/lib/use-audit";
import { IssueCard } from "./IssueCard";
import { IssueCommandCenter } from "./IssueCommandCenter";
import { SectionHeading } from "./SectionHeading";
import { FixQuotaModal } from "../FixQuotaModal";
import { useFixGate } from "@/hooks/useFixGate";
import type { AuditIssueData } from "@/lib/audit-data";

interface ColumnProps {
  title: string;
  count: number;
  color: string;
  emoji: string;
  issues: AuditIssueData[];
  expandedIssueId: string | null;
  highlightedId: string | null;
  onToggleExpand: (id: string) => void;
  onMarkFixed: (id: string) => void;
}

function Column({
  title,
  count,
  color,
  emoji,
  issues,
  expandedIssueId,
  highlightedId,
  onToggleExpand,
  onMarkFixed,
}: ColumnProps) {
  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-base">{emoji}</span>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{ background: `${color}20`, color }}
        >
          {count}
        </span>
      </div>

      <div className="space-y-3">
        {issues.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="audit-card-elevated flex flex-col items-center justify-center py-10 text-center"
          >
            {title === "CRITICAL" || title === "HIGH" ? (
              <>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-success)]/10">
                  <CheckCircle2 className="h-6 w-6 text-[var(--accent-success)]" />
                </div>
                <p className="text-sm font-medium text-[var(--accent-success)]">All clear!</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">No {title.toLowerCase()} issues</p>
              </>
            ) : title === "FIXED" ? (
              <>
                <PartyPopper className="mb-2 h-8 w-8 text-[var(--accent-success)]" />
                <p className="text-sm text-[var(--text-muted)]">Fixed items appear here</p>
              </>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">None found</p>
            )}
          </motion.div>
        )}

        {issues.map((issue, idx) => (
          <motion.div
            key={issue.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
          >
            <IssueCard
              issue={issue}
              isExpanded={expandedIssueId === issue.id}
              isHighlighted={highlightedId === issue.id}
              onToggleExpand={() => onToggleExpand(issue.id)}
              onMarkFixed={() => onMarkFixed(issue.id)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function FindingsBoard({ highlightedId }: { highlightedId: string | null }) {
  const data = useAuditStore((s) => s.data);
  const expandedIssueId = useAuditStore((s) => s.expandedIssueId);
  const setExpandedIssue = useAuditStore((s) => s.setExpandedIssue);
  const markFixed = useAuditStore((s) => s.markFixed);
  const { handleFixAction } = useFixGate();
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "diagnostic">("kanban");

  const handleToggleExpand = (id: string) => {
    if (expandedIssueId === id) {
      setExpandedIssue(null);
    } else {
      void handleFixAction(id, () => setExpandedIssue(id)).then((result) => {
        if (result === "quota_exceeded") setShowQuotaModal(true);
      });
    }
  };

  const columns = useMemo(() => {
    const critical = data.issues.filter(
      (i) => i.priority === "critical" && i.status !== "fixed" && i.status !== "locked"
    );
    const high = data.issues.filter(
      (i) => i.priority === "high" && i.status !== "fixed" && i.status !== "locked"
    );
    const medium = data.issues.filter(
      (i) =>
        (i.priority === "medium" || i.priority === "low" || i.priority === "opportunity") &&
        i.status !== "fixed" &&
        i.status !== "locked"
    );
    const fixed = data.issues.filter((i) => i.status === "fixed");

    return { critical, high, medium, fixed };
  }, [data.issues]);

  const allOpenIssues = useMemo(
    () => data.issues.filter((i) => i.status !== "fixed" && i.status !== "locked"),
    [data.issues]
  );

  return (
    <motion.section
      id="findings-section"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      {/* Heading + view mode toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <SectionHeading
          title="Findings"
          subtitle="Priority-sorted issues with inline fix guides and SERP previews"
        />
        <div className="flex shrink-0 items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
          <button
            type="button"
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${viewMode === "kanban"
              ? "bg-[var(--accent-primary)] text-white shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Kanban
          </button>
          <button
            type="button"
            onClick={() => setViewMode("diagnostic")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${viewMode === "diagnostic"
              ? "bg-[var(--accent-primary)] text-white shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
          >
            <TableIcon className="h-3.5 w-3.5" />
            Diagnostic
          </button>
        </div>
      </div>


      {/* Diagnostic mode */}
      {viewMode === "diagnostic" && (
        <IssueCommandCenter
          issues={allOpenIssues}
          onMarkFixed={markFixed}
        />
      )}

      {/* Kanban mode — Desktop columns */}
      {viewMode === "kanban" && (
        <>
          <div className="hidden lg:grid lg:grid-cols-4 lg:gap-4">
            <Column
              title="CRITICAL"
              count={columns.critical.length}
              color="#ef4444"
              emoji="🔴"
              issues={columns.critical}
              expandedIssueId={expandedIssueId}
              highlightedId={highlightedId}
              onToggleExpand={handleToggleExpand}
              onMarkFixed={markFixed}
            />
            <Column
              title="HIGH"
              count={columns.high.length}
              color="#f97316"
              emoji="🟡"
              issues={columns.high}
              expandedIssueId={expandedIssueId}
              highlightedId={highlightedId}
              onToggleExpand={handleToggleExpand}
              onMarkFixed={markFixed}
            />
            <Column
              title="MEDIUM"
              count={columns.medium.length}
              color="#6366f1"
              emoji="🔵"
              issues={columns.medium}
              expandedIssueId={expandedIssueId}
              highlightedId={highlightedId}
              onToggleExpand={handleToggleExpand}
              onMarkFixed={markFixed}
            />
            <Column
              title="FIXED"
              count={columns.fixed.length}
              color="#10b981"
              emoji="✅"
              issues={columns.fixed}
              expandedIssueId={expandedIssueId}
              highlightedId={highlightedId}
              onToggleExpand={handleToggleExpand}
              onMarkFixed={markFixed}
            />
          </div>

          {/* Mobile: Stacked list, highest priority first */}
          <div className="space-y-3 lg:hidden">
            {[...columns.critical, ...columns.high, ...columns.medium, ...columns.fixed].map(
              (issue, idx) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                >
                  <IssueCard
                    issue={issue}
                    isExpanded={expandedIssueId === issue.id}
                    isHighlighted={highlightedId === issue.id}
                    onToggleExpand={() => handleToggleExpand(issue.id)}
                    onMarkFixed={() => markFixed(issue.id)}
                  />
                </motion.div>
              )
            )}
          </div>
        </>
      )}

      {showQuotaModal && <FixQuotaModal onClose={() => setShowQuotaModal(false)} />}
    </motion.section>
  );
}
