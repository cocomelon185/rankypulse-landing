"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Copy, Check, Sparkles, CheckCircle2, ArrowRight, Download, Lock } from "lucide-react";
import { track } from "@/lib/analytics";
import type { PresentedIssue, AffectedPage } from "@/lib/audit-issue-presentation";
import { getIssueKeyword } from "@/lib/audit-issue-presentation";
import { ProgressTracker } from "@/components/audit/ProgressTracker";
import { AffectedPagesPanel } from "@/components/audit/AffectedPagesPanel";
import { PageFixPreview } from "@/components/audit/PageFixPreview";
import { CmsSelector, getCmsSteps, type CmsType } from "@/components/audit/CmsSelector";
import { VerifyFixButton } from "@/components/audit/VerifyFixButton";
import type { FixStatus } from "@/components/audit/ProgressProof";
import { exportAsCSV, exportAsMarkdown, downloadFile } from "@/lib/export-tasks";
import { LiveSerpPreview } from "@/components/audit/v2/LiveSerpPreview";

interface FixWorkspacePanelProps {
  currentTask: PresentedIssue | null;
  completedCount: number;
  totalCount: number;
  riskReducedPercent: number;
  recoveredVisits: string;
  isLocked: boolean;
  completedSteps: Record<string, boolean[]>;
  onStepToggle: (issueId: string, stepIndex: number) => void;
  onMarkComplete: (issueId: string) => void;
  onUpgradeRequest: () => void;
  reportUrl: string;
  hostname: string;
  pendingVerifyId: string | null;
  onVerifySuccess: (issueId: string) => void;
  onVerifyFailed: (issueId: string, remainingCount: number) => void;
  verifiedFixIds: string[];
  completedFixIds: string[];
  allIssues: PresentedIssue[];
  isPaid?: boolean;
  onCmsDetected?: (cms: string) => void;
  detectedCms?: string | null;
}

function CopySnippetButton({ text, label, onCopy }: { text: string; label: string; onCopy: () => void }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 text-xs text-gray-700 font-mono leading-relaxed">{text}</p>
      <button
        type="button"
        onClick={handleCopy}
        className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-600 hover:border-[#4318ff] hover:text-[#4318ff]"
      >
        {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function ConfettiReward({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
      <Sparkles className="mx-auto h-5 w-5 text-emerald-500" aria-hidden />
      <p className="mt-1 text-sm font-semibold text-emerald-800">Fix completed!</p>
    </div>
  );
}

function getFixStatus(issueId: string, completedFixIds: string[], verifiedFixIds: string[]): FixStatus {
  if (verifiedFixIds.includes(issueId)) return "verified";
  if (completedFixIds.includes(issueId)) return "done_unverified";
  return "not_started";
}

export function FixWorkspacePanel({
  currentTask,
  completedCount,
  totalCount,
  riskReducedPercent,
  recoveredVisits,
  isLocked,
  completedSteps,
  onStepToggle,
  onMarkComplete,
  onUpgradeRequest,
  reportUrl,
  hostname,
  pendingVerifyId,
  onVerifySuccess,
  onVerifyFailed,
  verifiedFixIds,
  completedFixIds,
  allIssues,
  isPaid,
  onCmsDetected,
  detectedCms,
}: FixWorkspacePanelProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevCompleted, setPrevCompleted] = useState(completedCount);
  const [selectedCms, setSelectedCms] = useState<CmsType | null>(null);
  const [previewPage, setPreviewPage] = useState<AffectedPage | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    if (completedCount > prevCompleted) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      setPrevCompleted(completedCount);
      return () => clearTimeout(timer);
    }
    setPrevCompleted(completedCount);
  }, [completedCount, prevCompleted]);

  const issueKeyword = currentTask ? getIssueKeyword(currentTask) : "";

  const effectiveSteps = useMemo(() => {
    if (!currentTask) return [];
    if (selectedCms) {
      const cmsSteps = getCmsSteps(selectedCms, issueKeyword);
      if (cmsSteps) return cmsSteps;
    }
    return currentTask.steps;
  }, [currentTask, selectedCms, issueKeyword]);

  const stepStates = currentTask
    ? (completedSteps[currentTask.id] ?? effectiveSteps.map(() => false))
    : [];
  const allStepsChecked = stepStates.length > 0 && stepStates.every(Boolean);

  const handleSnippetCopy = useCallback(
    (type: string) => {
      track("serp_snippet_copied", { type, issueId: currentTask?.id ?? "" });
    },
    [currentTask?.id],
  );

  const handleCmsChange = useCallback((cms: CmsType) => {
    setSelectedCms(cms);
  }, []);

  const handlePageSelect = useCallback((page: AffectedPage) => {
    setPreviewPage(page);
  }, []);

  const handleCmsDetected = useCallback((cms: string) => {
    onCmsDetected?.(cms);
  }, [onCmsDetected]);

  const handleExport = useCallback((format: "csv" | "markdown") => {
    if (!isPaid) {
      onUpgradeRequest();
      return;
    }
    const enrichedIssues = allIssues.map((issue) => ({
      ...issue,
      fixStatus: getFixStatus(issue.id, completedFixIds, verifiedFixIds),
    }));
    const date = new Date().toISOString().slice(0, 10);
    if (format === "csv") {
      const content = exportAsCSV(enrichedIssues);
      downloadFile(content, `rankypulse-tasks-${hostname}-${date}.csv`, "text/csv");
    } else {
      const content = exportAsMarkdown(enrichedIssues, hostname);
      downloadFile(content, `rankypulse-tasks-${hostname}-${date}.md`, "text/markdown");
    }
    track("export_tasks", { format, hostname, issueCount: allIssues.length });
    setShowExportMenu(false);
  }, [isPaid, allIssues, completedFixIds, verifiedFixIds, hostname, onUpgradeRequest]);

  const isPendingVerify = !!currentTask && pendingVerifyId === currentTask.id;

  return (
    <aside className="space-y-3">
      {/* Progress tracker */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <ProgressTracker
          completed={completedCount}
          total={totalCount}
          riskReducedPercent={riskReducedPercent}
        />
        {completedCount > 0 && (
          <p className="mt-2 text-xs text-emerald-600 font-medium">
            You already recovered ~{recoveredVisits} visits/mo
          </p>
        )}
      </div>

      <ConfettiReward show={showConfetti} />

      {/* Verify UI (after completing a fix, before advancing) */}
      {currentTask && !isLocked && isPendingVerify && (
        <div className="rounded-xl border-2 border-emerald-300/40 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-emerald-800">
              {currentTask.displayTitle}
            </h3>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Fix marked complete. Verify your changes went live.
          </p>

          <VerifyFixButton
            issueId={currentTask.id}
            affectedPages={currentTask.affectedPages}
            onVerifySuccess={onVerifySuccess}
            onVerifyFailed={onVerifyFailed}
            onCmsDetected={handleCmsDetected}
          />

          <button
            type="button"
            onClick={() => onVerifySuccess(currentTask.id)}
            className="mt-2 flex w-full items-center justify-center gap-1.5 text-[11px] text-gray-400 hover:text-[#4318ff] transition-colors"
          >
            Skip verification <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Active task card (normal fix flow) */}
      {currentTask && !isLocked && !isPendingVerify && (
        <div className="rounded-xl border-2 border-[#4318ff]/20 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded border border-[#4318ff]/20 bg-[#4318ff]/5 px-1.5 py-0.5 text-[10px] font-medium text-[#4318ff]">
              {currentTask.categoryTag}
            </span>
            <span className="text-[10px] text-gray-400">
              ~{currentTask.effortMinutes} min · {currentTask.difficulty}
            </span>
          </div>
          <h3 className="mt-2 text-sm font-bold text-[#1B2559]">
            {currentTask.displayTitle}
          </h3>

          {/* CMS Selector */}
          <CmsSelector hostname={hostname} onCmsChange={handleCmsChange} detectedCms={detectedCms} />

          {/* Affected Pages */}
          <AffectedPagesPanel
            issueId={currentTask.id}
            affectedPages={currentTask.affectedPages}
            totalCount={currentTask.affectedUrlsCount}
            onPageSelect={handlePageSelect}
          />

          {/* Step checklist */}
          <ol className="mt-3 space-y-2">
            {effectiveSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onStepToggle(currentTask.id, idx);
                    track("workspace_step_checked", {
                      issueId: currentTask.id,
                      step: idx,
                      checked: !stepStates[idx],
                    });
                  }}
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    stepStates[idx]
                      ? "border-[#4318ff] bg-[#4318ff]"
                      : "border-gray-300 bg-white hover:border-[#4318ff]"
                  }`}
                  aria-label={stepStates[idx] ? `Uncheck step ${idx + 1}` : `Check step ${idx + 1}`}
                >
                  {stepStates[idx] && <Check className="h-3 w-3 text-white" />}
                </button>
                <span
                  className={`text-xs leading-relaxed ${
                    stepStates[idx] ? "text-gray-400 line-through" : "text-gray-700"
                  }`}
                >
                  {step}
                </span>
              </li>
            ))}
          </ol>

          {currentTask.snippetSuggestion && (
            <CopySnippetButton
              text={currentTask.snippetSuggestion.suggested}
              label={`Suggested ${currentTask.snippetSuggestion.type === "title" ? "title" : "meta description"}`}
              onCopy={() => handleSnippetCopy(currentTask.snippetSuggestion!.type)}
            />
          )}

          {/* Live SERP preview for title / meta-description issues */}
          {currentTask.snippetSuggestion && (
            <div className="mt-3">
              <LiveSerpPreview
                title={
                  currentTask.snippetSuggestion.type === "title"
                    ? currentTask.snippetSuggestion.suggested
                    : (currentTask.snippetSuggestion.current ?? hostname)
                }
                description={
                  currentTask.snippetSuggestion.type === "meta_description"
                    ? currentTask.snippetSuggestion.suggested
                    : (currentTask.snippetSuggestion.current ?? "")
                }
                url={`https://${hostname}`}
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => onMarkComplete(currentTask.id)}
            disabled={!allStepsChecked}
            className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-[#4318ff] text-sm font-semibold text-white hover:bg-[#3311db] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {allStepsChecked
              ? "Mark complete"
              : `Complete all steps (${stepStates.filter(Boolean).length}/${stepStates.length})`}
          </button>
        </div>
      )}

      {/* Locked state */}
      {currentTask && isLocked && (
        <div className="rounded-xl border border-[#4318ff]/20 bg-gradient-to-br from-[#f8f6ff] to-white p-4 shadow-sm">
          <h3 className="text-sm font-bold text-[#1B2559]">Unlock remaining fixes</h3>
          <p className="mt-1 text-xs text-gray-600">
            Unlock remaining fixes for this site + competitor benchmark + page-level roadmap
          </p>
          {completedCount > 0 && (
            <p className="mt-2 text-xs font-medium text-emerald-600">
              You already recovered ~{recoveredVisits} visits/mo
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              track("upgrade_clicked", { source: "workspace_panel", placement: "fix_locked" });
              onUpgradeRequest();
            }}
            className="mt-3 flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#4318ff] to-[#6d4cff] text-sm font-semibold text-white shadow-md hover:from-[#3311db] hover:to-[#5a3dd9]"
          >
            Recover lost traffic
          </button>
        </div>
      )}

      {/* All complete */}
      {!currentTask && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <Sparkles className="mx-auto h-6 w-6 text-emerald-500" aria-hidden />
          <p className="mt-2 text-sm font-semibold text-emerald-800">All priority fixes completed!</p>
          <p className="mt-1 text-xs text-emerald-600">
            Estimated risk reduced by {riskReducedPercent}%
          </p>
        </div>
      )}

      {/* Footer links */}
      <div className="space-y-1.5 text-xs text-gray-500 px-1">
        <a
          href={`mailto:?subject=RankyPulse%20SEO%20report&body=${encodeURIComponent(reportUrl)}`}
          className="block hover:text-[#4318ff]"
        >
          Share report
        </a>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              if (!isPaid) {
                track("export_tasks_gate", { hostname });
                onUpgradeRequest();
                return;
              }
              setShowExportMenu(!showExportMenu);
            }}
            className="inline-flex items-center gap-1.5 hover:text-[#4318ff] transition-colors"
          >
            <Download className="h-3 w-3" />
            Export tasks
            {!isPaid && <Lock className="h-2.5 w-2.5 text-gray-300" />}
          </button>
          {showExportMenu && isPaid && (
            <div className="absolute bottom-full left-0 mb-1 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-10 min-w-[140px]">
              <button
                type="button"
                onClick={() => handleExport("csv")}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
              >
                Export as CSV
              </button>
              <button
                type="button"
                onClick={() => handleExport("markdown")}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
              >
                Export as Markdown
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Page Fix Preview modal */}
      <PageFixPreview
        open={!!previewPage}
        page={previewPage}
        issueId={currentTask?.id ?? ""}
        hostname={hostname}
        onClose={() => setPreviewPage(null)}
        isPaid={isPaid}
      />
    </aside>
  );
}
