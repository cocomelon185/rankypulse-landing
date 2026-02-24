"use client";

import { useRef, useEffect, useState } from "react";
import { Zap, ChevronDown, ChevronRight, Mail, Link2, Shield, MailCheck, Lock } from "lucide-react";
import { toast } from "sonner";
import { track, getVariant } from "@/lib/analytics";
import { BenchmarkBarChart } from "./BenchmarkBarChart";

export type EmailSubmitStatus = "idle" | "submitting" | "success" | "error";

interface AuditActionsPanelProps {
  /** URL of the audited site */
  url: string;
  /** Optional canonical report URL from data; falls back to window.location.href */
  canonicalReportUrl?: string | null;
  /** Whether user has unlocked (email sent or signed in) */
  isUnlocked: boolean;
  /** First issue ID for scroll-to (Next best action) */
  firstIssueId?: string | null;
  /** First issue effort minutes for Next best action text */
  firstIssueMinutes?: number;
  /** Whether to show the email capture form */
  showEmailForm: boolean;
  email: string;
  onEmailChange: (v: string) => void;
  onEmailBlur?: () => void;
  /** Whether email passes validation */
  isEmailValid?: boolean;
  /** Validation or send error message */
  emailError?: string | null;
  emailStatus: EmailSubmitStatus;
  onSendReport: () => void;
  /** Resend report to same email; rate-limited client-side (15s) */
  onResend?: () => void;
  /** Whether resend is allowed (after cooldown) */
  canResend?: boolean;
  /** Number of quick wins available */
  quickWinCount: number;
  /** Top quick win for "Next win" CTA */
  topQuickWin?: { title: string; effortMinutes: number } | null;
  /** SEO score for benchmark chart */
  score?: number;
  /** When true, show fake benchmark preview; otherwise locked if no competitor data */
  hasCompetitorData?: boolean;
  /** In sample mode, show estimated competitor avg for preview */
  competitorAvgEstimate?: number | null;
  /** Additional issues count for unlock teaser */
  additionalIssuesCount?: number;
  /** Opens the Roadmap preview modal before navigating to pricing */
  onOpenRoadmapModal?: () => void;
  /** When true, use simplified sidebar: Next best action primary, More actions collapsible */
  useConversionB?: boolean;
  /** For analytics: safe domain (sidebar_more_actions_expand) */
  analyticsUrl?: string;
  /** For analytics: issue count */
  analyticsIssueCount?: number;
  /** For analytics: top fix id */
  analyticsTopFixId?: string;
}

const RESEND_COOLDOWN_MS = 15_000;

export function AuditActionsPanel({
  url,
  canonicalReportUrl,
  isUnlocked,
  firstIssueId,
  firstIssueMinutes = 5,
  showEmailForm,
  email,
  onEmailChange,
  onEmailBlur,
  isEmailValid = false,
  emailError,
  emailStatus,
  onSendReport,
  onResend,
  canResend = false,
  quickWinCount,
  topQuickWin,
  score = 0,
  hasCompetitorData = false,
  competitorAvgEstimate = null,
  additionalIssuesCount = 0,
  onOpenRoadmapModal,
  useConversionB = false,
  analyticsUrl,
  analyticsIssueCount,
  analyticsTopFixId,
}: AuditActionsPanelProps) {
  const successRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [moreActionsExpanded, setMoreActionsExpanded] = useState(false);

  const reportUrl =
    canonicalReportUrl ||
    (typeof window !== "undefined" ? window.location.href : "#");

  useEffect(() => {
    if (emailStatus === "success" && successRef.current) {
      successRef.current.focus({ preventScroll: true });
    }
  }, [emailStatus]);

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(reportUrl);
      setCopied(true);
      toast.success("Link copied to clipboard", { duration: 2000 });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  }

  const showSuccessPanel = showEmailForm && emailStatus === "success";
  const isSubmitting = emailStatus === "submitting";

  function scrollToFirstIssue() {
    if (firstIssueId && typeof document !== "undefined") {
      const el = document.getElementById(`issue-${firstIssueId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function handleMoreActionsToggle() {
    if (!moreActionsExpanded) {
      track("sidebar_more_actions_expand", {
        url: analyticsUrl ?? "",
        issue_count: analyticsIssueCount ?? 0,
        top_fix_id: analyticsTopFixId ?? "",
        variant: getVariant(),
      });
    }
    setMoreActionsExpanded((v) => !v);
  }

  const moreActionsContent = (
    <div className="space-y-3">
      {/* Share link */}
      <div className="rounded-lg border border-gray-200/80 bg-gray-50/50 p-3">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-gray-500" aria-hidden />
          <span className="text-xs font-semibold text-[#1B2559]">Share link</span>
        </div>
        <button
          type="button"
          onClick={copyShareLink}
          aria-live="polite"
          aria-label={copied ? "Link copied" : "Copy share link"}
          className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <Link2 className="h-3.5 w-3.5 shrink-0" />
          {copied ? "Copied" : "Copy share link"}
        </button>
      </div>
      {/* Email roadmap */}
      {showEmailForm && (
        <div className="rounded-lg border border-gray-200/80 bg-gray-50/50 p-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#4318ff]" aria-hidden />
            <span className="text-xs font-semibold text-[#1B2559]">Email roadmap</span>
          </div>
          {showSuccessPanel ? (
            <div ref={successRef} className="mt-2 rounded-lg border border-green-200/80 bg-green-50/50 p-2 text-xs text-green-800">
              Roadmap sent. Check spam if needed.
              {onResend && (
                <button type="button" onClick={onResend} disabled={!canResend} className="ml-1 text-[#4318ff] hover:underline disabled:opacity-50">
                  Resend
                </button>
              )}
            </div>
          ) : (
            <>
              <label htmlFor="panel-email" className="sr-only">Email</label>
              <input
                id="panel-email"
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                onBlur={onEmailBlur}
                placeholder="you@example.com"
                disabled={isSubmitting}
                aria-invalid={!!emailError || emailStatus === "error"}
                className={`mt-2 h-9 w-full rounded-lg border px-3 text-xs ${
                  emailError || emailStatus === "error" ? "border-red-300" : "border-gray-200"
                }`}
              />
              <button
                type="button"
                onClick={onSendReport}
                disabled={!isEmailValid || isSubmitting}
                className="mt-2 flex h-9 w-full items-center justify-center rounded-lg bg-[#4318ff] text-xs font-semibold text-white hover:bg-[#3311db] disabled:opacity-60"
              >
                {isSubmitting ? "Sending…" : "Email roadmap"}
              </button>
              {emailError && <p className="mt-1 text-[10px] text-red-600">{emailError}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <aside
      className="flex flex-col gap-3"
      style={{ contain: "layout" }}
      aria-label="Audit actions"
    >
      {useConversionB ? (
        <>
          {/* 1) Next best action – primary card */}
          {firstIssueId && (
            <div className="rounded-xl border-2 border-[#4318ff]/20 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
              <h3 className="audit-heading text-sm font-semibold text-[#1B2559]">Next best action</h3>
              <p className="mt-1 text-xs text-gray-600">
                Fix your #1 issue first for the fastest lift.
              </p>
              <button
                type="button"
                onClick={scrollToFirstIssue}
                className="mt-3 flex h-10 w-full items-center justify-center rounded-xl bg-[#4318ff] text-sm font-semibold text-white hover:bg-[#3311db]"
              >
                Go to #1 fix
              </button>
            </div>
          )}

          {/* 2) Benchmark */}
          <div className="rounded-xl border border-gray-200/90 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            <h3 className="audit-heading text-xs font-semibold uppercase tracking-wider text-gray-500">Benchmark (preview)</h3>
            <div className="mt-2">
              <BenchmarkBarChart
                yourScore={Math.round(score)}
                competitorAvg={hasCompetitorData || competitorAvgEstimate != null ? (competitorAvgEstimate ?? 72) : null}
                isLocked={!hasCompetitorData && competitorAvgEstimate == null}
              />
            </div>
          </div>

          {/* 3) More actions – collapsible */}
          <div className="rounded-xl border border-gray-200/90 bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            <button
              type="button"
              onClick={handleMoreActionsToggle}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
              aria-expanded={moreActionsExpanded}
            >
              <span className="text-xs font-semibold text-[#1B2559]">More actions</span>
              {moreActionsExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" aria-hidden />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" aria-hidden />
              )}
            </button>
            {moreActionsExpanded && <div className="border-t border-gray-100 px-4 pb-4 pt-2">{moreActionsContent}</div>}
          </div>

          {/* 4) Quick Wins – text link only */}
          <a
            href="/dashboard?view=quickwins"
            className="text-xs font-medium text-[#4318ff] hover:underline"
          >
            Quick Wins {quickWinCount > 0 ? `(${quickWinCount})` : ""} →
          </a>
        </>
      ) : (
        <>
          {/* Original: Email report – primary CTA */}
          <div
            className="rounded-xl border border-gray-200/90 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
            style={{ minHeight: showEmailForm ? 220 : undefined }}
          >
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#4318ff]" aria-hidden />
              <h3 className="audit-heading text-sm font-semibold text-[#1B2559]">Start my SEO improvement plan</h3>
            </div>
            {showEmailForm ? (
              showSuccessPanel ? (
                <div
                  ref={successRef}
                  tabIndex={-1}
                  role="status"
                  aria-live="polite"
                  className="mt-3 rounded-lg border border-green-200/80 bg-green-50/50 p-3"
                >
                  <p className="text-sm font-medium text-green-800">
                    You&apos;ll receive your SEO improvement roadmap with steps you can follow this week.
                  </p>
                  <p className="mt-1 text-xs text-green-700/90">Check spam or promotions if you don&apos;t see it.</p>
                  {onResend && (
                    <button type="button" onClick={onResend} disabled={!canResend} className="mt-2 text-xs font-medium text-[#4318ff] hover:underline disabled:opacity-50">
                      Didn&apos;t get it? Resend
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <p className="mt-2 text-xs text-gray-600">This creates your step-by-step plan to increase visibility.</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500">
                    <span className="inline-flex items-center gap-0.5"><Shield className="h-3 w-3" aria-hidden /> Secure</span>
                    <span className="inline-flex items-center gap-0.5"><MailCheck className="h-3 w-3" aria-hidden /> No spam</span>
                    <span className="text-[10px] text-gray-400">Used by 1,200+ sites</span>
                  </div>
                  <label htmlFor="panel-email" className="sr-only">Your email</label>
                  <input
                    id="panel-email"
                    type="email"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    onBlur={onEmailBlur}
                    placeholder="you@example.com"
                    disabled={isSubmitting}
                    aria-invalid={!!emailError || emailStatus === "error"}
                    className={`mt-3 h-11 w-full rounded-xl border-2 px-4 text-sm ${
                      emailError || emailStatus === "error" ? "border-red-300" : "border-gray-200 focus:border-[#4318ff]"
                    } focus:outline-none focus:ring-2 focus:ring-[#4318ff]/20`}
                  />
                  <button
                    type="button"
                    onClick={onSendReport}
                    disabled={!isEmailValid || isSubmitting}
                    className="mt-3 flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#4318ff] to-[#6d4cff] text-sm font-semibold text-white shadow-md hover:from-[#3311db] hover:to-[#5a3dd9] disabled:opacity-60"
                  >
                    {isSubmitting ? "Sending…" : "Start my SEO improvement plan"}
                  </button>
                  {emailError && <p id="panel-email-error" className="mt-2 text-xs font-medium text-red-600" role="alert">{emailError}</p>}
                </>
              )
            ) : emailStatus === "success" || isUnlocked ? (
              <p className="mt-2 text-xs text-green-700">Report link sent to your email.</p>
            ) : null}
          </div>

          <div className="rounded-xl border border-gray-200/90 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            <h3 className="audit-heading text-xs font-semibold uppercase tracking-wider text-gray-500">Benchmark (preview)</h3>
            <div className="mt-2">
              <BenchmarkBarChart
                yourScore={Math.round(score)}
                competitorAvg={hasCompetitorData || competitorAvgEstimate != null ? (competitorAvgEstimate ?? 72) : null}
                isLocked={!hasCompetitorData && competitorAvgEstimate == null}
              />
            </div>
          </div>

          {firstIssueId && (
            <div className="rounded-xl border border-gray-200/90 bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
              <p className="text-xs font-medium text-gray-600">Next best action</p>
              <p className="mt-0.5 text-sm font-semibold text-[#1B2559]">Fix your #1 issue (~{firstIssueMinutes} min)</p>
              <button
                type="button"
                onClick={scrollToFirstIssue}
                className="mt-2 flex h-10 w-full items-center justify-center rounded-xl bg-[#4318ff] text-sm font-semibold text-white hover:bg-[#3311db]"
              >
                Go to fix
              </button>
            </div>
          )}

          <div className="rounded-xl border border-gray-200/90 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#4318ff]" aria-hidden />
              <h3 className="audit-heading text-sm font-semibold text-[#1B2559]">Quick Wins</h3>
            </div>
            {topQuickWin ? (
              <>
                <p className="mt-1 text-xs text-gray-600">Next win: <span className="font-medium text-[#1B2559]">{topQuickWin.title}</span></p>
                <span className="mt-0.5 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">~{topQuickWin.effortMinutes} min</span>
                <a href="/dashboard?view=quickwins" className="mt-3 flex h-10 w-full items-center justify-center rounded-xl bg-[#4318ff] text-sm font-semibold text-white hover:bg-[#3311db]">Fix next quick win</a>
                <a href="/dashboard?view=quickwins" className="mt-2 block text-center text-xs font-medium text-[#4318ff] hover:underline">Browse all quick wins</a>
              </>
            ) : (
              <>
                <p className="mt-1 text-xs text-gray-600">Fix the next issue in minutes. {quickWinCount > 0 ? `${quickWinCount} fix${quickWinCount !== 1 ? "es" : ""} ready.` : ""}</p>
                <a href="/dashboard?view=quickwins" className="mt-3 flex h-10 w-full items-center justify-center rounded-xl border-2 border-[#4318ff] bg-[#4318ff]/5 text-sm font-semibold text-[#4318ff] hover:bg-[#4318ff]/10">Browse all quick wins</a>
              </>
            )}
          </div>

          <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-gray-500" aria-hidden />
              <h3 className="audit-heading text-sm font-semibold text-[#1B2559]">Share link</h3>
            </div>
            <p className="mt-1 text-xs text-gray-600">Copy a link to this report.</p>
            <button
              type="button"
              onClick={copyShareLink}
              aria-live="polite"
              aria-label={copied ? "Link copied" : "Copy share link"}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            >
              <Link2 className="h-4 w-4 shrink-0" />
              <span className="min-w-[5ch]">{copied ? "Copied" : "Copy share link"}</span>
            </button>
          </div>

          {!isUnlocked && (
            <div className="rounded-xl border border-[#4318ff]/25 bg-[#eff6ff]/60 p-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#4318ff]" aria-hidden />
                <h3 className="audit-heading text-sm font-semibold text-[#1B2559]">Start my SEO improvement plan</h3>
              </div>
              <p className="mt-1 text-xs text-gray-600">This creates your step-by-step plan to increase visibility.</p>
              <a
                href="/pricing?source=audit"
                onClick={(e) => {
                  if (onOpenRoadmapModal) {
                    e.preventDefault();
                    track("roadmap_cta_click");
                    track("modal_open");
                    onOpenRoadmapModal();
                  }
                }}
                className="mt-2 flex h-9 w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#4318ff] to-[#6d4cff] text-xs font-semibold text-white shadow-md hover:from-[#3311db] hover:to-[#5a3dd9]"
              >
                Start my SEO improvement plan
              </a>
            </div>
          )}
        </>
      )}
    </aside>
  );
}
