"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink, RotateCcw } from "lucide-react";
import { track, toSafeDomain } from "@/lib/analytics";
import { isValidEmail } from "@/lib/email-validation";
import { estimateTrafficLossRange } from "@/components/audit/AuditMetricCards";
import { ActionPanel } from "@/components/audit/ActionPanel";
import { IssueCard } from "@/components/audit/IssueCard";
import { FixDrawer } from "@/components/audit/FixDrawer";
import { PaywallGate } from "@/components/audit/PaywallGate";
import { AuditActionsPanel, type EmailSubmitStatus } from "@/components/audit/AuditActionsPanel";
import { enrichIssues, issueWeight, type AuditIssue, type PresentedIssue } from "@/lib/audit-issue-presentation";

type AuditData = {
  url: string;
  hostname: string;
  summary: string;
  scores: { seo: number };
  issues: AuditIssue[];
};

const FREE_FIX_LIMIT_ENV = Number(process.env.NEXT_PUBLIC_AUDIT_FREE_FIX_LIMIT ?? "2");
const FREE_FIX_LIMIT = Math.max(1, Math.min(2, Number.isFinite(FREE_FIX_LIMIT_ENV) ? FREE_FIX_LIMIT_ENV : 2));
const USE_ONE_CTA_SIDEBAR = process.env.NEXT_PUBLIC_AUDIT_ONE_CTA_SIDEBAR !== "0";
const HEADLINE_MODE = process.env.NEXT_PUBLIC_AUDIT_HEADLINE_MODE ?? "visits_lost";
const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MED", "MEDIUM", "LOW"] as const;

function sortIssuesBySeverity<T extends { severity: string }>(issues: T[]): T[] {
  return [...issues].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity.toUpperCase() as (typeof SEVERITY_ORDER)[number]) -
      SEVERITY_ORDER.indexOf(b.severity.toUpperCase() as (typeof SEVERITY_ORDER)[number])
  );
}

function safeGet(key: string): string {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function isValidHttpUrl(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function getSampleAuditData(url: string): AuditData {
  let hostname = "example.com";
  try {
    hostname = new URL(url).hostname;
  } catch {}
  return {
    url,
    hostname,
    summary: "Opportunities identified",
    scores: { seo: 68 },
    issues: [
      { id: "canonical_non_preferred", code: "canonical_mismatch", title: "Canonical mismatch", severity: "HIGH", effortMinutes: 15, category: "Canonical" },
      { id: "meta_desc_home", code: "meta_description_missing", title: "Missing meta description", severity: "MED", effortMinutes: 8, category: "Meta" },
      { id: "title_long", code: "title_too_long", title: "Title tag too long", severity: "MED", effortMinutes: 10, category: "Meta" },
      { id: "img_dimensions", code: "image_dimensions_missing", title: "Image dimensions missing", severity: "LOW", effortMinutes: 8, category: "Performance" },
    ],
  };
}

export default function AuditResultsClientPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sampleMode = (searchParams?.get("sample") ?? "") === "1";
  const queryUrl = searchParams?.get("url") || "";
  const reportViewedRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AuditData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scannedAt, setScannedAt] = useState<Date | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeIssue, setActiveIssue] = useState<PresentedIssue | null>(null);
  const [completedFixIds, setCompletedFixIds] = useState<string[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [guidedDismissed, setGuidedDismissed] = useState(false);

  const [legacyEmail, setLegacyEmail] = useState("");
  const [legacyEmailStatus, setLegacyEmailStatus] = useState<EmailSubmitStatus>("idle");

  const url = useMemo(() => {
    const fromQuery = queryUrl.trim();
    if (isValidHttpUrl(fromQuery)) return fromQuery;
    const fromStorage = safeGet("rankypulse_last_url");
    if (isValidHttpUrl(fromStorage)) return fromStorage;
    return "https://example.com";
  }, [queryUrl]);

  const displayData = useMemo(() => {
    if (sampleMode && !data && !loading) return getSampleAuditData(url);
    return data;
  }, [sampleMode, data, loading, url]);

  const hasData = !!displayData && !loading && !error;
  const domain = toSafeDomain(url);
  const reportUrl = typeof window !== "undefined" ? `${window.location.origin}/audit/results?url=${encodeURIComponent(url)}` : "";

  const issues = useMemo(() => {
    if (!displayData) return [];
    return enrichIssues(sortIssuesBySeverity(displayData.issues), displayData.hostname);
  }, [displayData]);
  const top3 = issues.slice(0, 3);
  const currentTask = top3.find((i) => !completedFixIds.includes(i.id)) ?? top3[0] ?? null;
  const completedCount = top3.filter((i) => completedFixIds.includes(i.id)).length;

  const totalWeight = top3.reduce((sum, issue) => sum + issueWeight(issue), 0);
  const completedWeight = top3.filter((i) => completedFixIds.includes(i.id)).reduce((sum, issue) => sum + issueWeight(issue), 0);
  const riskReducedPercent = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
  const trafficRange = useMemo(() => estimateTrafficLossRange(issues), [issues]);
  const trafficLossText = trafficRange ? `${trafficRange.min}-${trafficRange.max}` : "50-200";

  const topQuickWin = useMemo(
    () =>
      issues
        .filter((i) => (i.effortMinutes ?? 0) <= 10)
        .sort((a, b) => (a.effortMinutes ?? 0) - (b.effortMinutes ?? 0))[0] ?? null,
    [issues]
  );

  useEffect(() => {
    setGuidedDismissed(safeGet("rankypulse_guide_dismissed") === "1");
    const stored = safeGet("rankypulse_completed_fixes");
    if (stored) {
      try {
        setCompletedFixIds(JSON.parse(stored));
      } catch {}
    }
  }, []);

  useEffect(() => {
    const upgradeStatus = searchParams?.get("upgrade");
    if (upgradeStatus === "success") track("upgrade_completed", { source: "audit_results" });
  }, [searchParams]);

  async function runAudit() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("bad_response");
      const json = (await res.json()) as { ok: boolean; data?: AuditData };
      if (!json.ok || !json.data) throw new Error("bad_payload");
      setData(json.data);
      setScannedAt(new Date());
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (sampleMode) return;
    safeSet("rankypulse_last_url", url);
    runAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, sampleMode]);

  useEffect(() => {
    if (!hasData || !displayData || reportViewedRef.current) return;
    reportViewedRef.current = true;
    track("report_viewed", {
      mode: sampleMode ? "sample" : "live",
      score: Math.round(displayData.scores.seo || 0),
      issuesTotal: displayData.issues.length,
    });
  }, [hasData, displayData, sampleMode]);

  useEffect(() => {
    if (!showPaywall) return;
    track("upgrade_viewed", {
      placement: "audit_results_gate",
      remainingFixes: Math.max(0, issues.length - FREE_FIX_LIMIT),
    });
  }, [showPaywall, issues.length]);

  function openFix(issue: PresentedIssue, source: "next_best_action" | "top_fixes" | "action_panel") {
    const index = top3.findIndex((i) => i.id === issue.id);
    const isLocked = index >= FREE_FIX_LIMIT && !completedFixIds.includes(issue.id);
    if (isLocked) {
      setShowPaywall(true);
      return;
    }
    setActiveIssue(issue);
    setDrawerOpen(true);
    track("fix_drawer_opened", { issueId: issue.id, source });
  }

  function handlePrimaryFixClick() {
    if (!top3[0]) return;
    track("primary_cta_clicked", { cta: "fix_1_now", issueId: top3[0].id });
    openFix(top3[0], "next_best_action");
  }

  function markFixDone(issueId: string) {
    if (!completedFixIds.includes(issueId)) {
      const next = [...completedFixIds, issueId];
      setCompletedFixIds(next);
      safeSet("rankypulse_completed_fixes", JSON.stringify(next));
      track("fix_marked_done", { issueId, completedCount: next.length, completedTop3: top3.filter((i) => next.includes(i.id)).length });
    }
    setDrawerOpen(false);
  }

  function handleUpgradeClick() {
    track("upgrade_clicked", { source: "audit_results_gate" });
    router.push("/pricing?source=audit");
  }

  async function sendLegacyReportEmail() {
    if (!isValidEmail(legacyEmail)) return;
    setLegacyEmailStatus("submitting");
    try {
      const res = await fetch("/api/email-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: legacyEmail, reportUrl, siteUrl: url }),
      });
      if (!res.ok) throw new Error("failed");
      setLegacyEmailStatus("success");
    } catch {
      setLegacyEmailStatus("error");
    }
  }

  const lastScannedText = scannedAt ? `Last scanned ${scannedAt.toLocaleDateString()}` : "Just scanned";

  return (
    <div className="audit-results-page audit-bg min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 md:px-8">
        {(hasData || sampleMode) && (
          <header className="mb-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <a href={url} target="_blank" rel="noopener noreferrer" className="truncate text-sm font-semibold text-[#1B2559]">
                {displayData?.hostname ?? domain}
              </a>
              <ExternalLink className="h-3.5 w-3.5 text-gray-400" aria-hidden />
              <span className="rounded-full bg-[#4318ff]/10 px-2 py-0.5 text-xs font-semibold text-[#4318ff]">
                Score {Math.round(displayData?.scores.seo ?? 0)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                track("rerun_audit_clicked", { source: "header" });
                runAudit();
              }}
              className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Re-run audit
            </button>
          </header>
        )}

        {loading && <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600">Running audit...</div>}
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>}

        {hasData && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-5">
              {!guidedDismissed && completedCount === 0 && (
                <section className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Guided mode</p>
                      <ol className="mt-2 space-y-1 text-sm text-gray-700">
                        <li>Step 1: Fix #1</li>
                        <li>Step 2: Re-run audit</li>
                        <li>Step 3: See improvement</li>
                      </ol>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setGuidedDismissed(true);
                        safeSet("rankypulse_guide_dismissed", "1");
                      }}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </section>
              )}

              <section className="rounded-xl border border-[#4318ff]/20 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Next best action</p>
                <h1 className="mt-1 text-xl font-semibold text-[#1B2559]">
                  {currentTask ? currentTask.displayTitle : "Start with your highest-impact fix"}
                </h1>
                <p className="mt-1 text-sm text-gray-700">
                  {currentTask?.whyItMatters ?? "Fix #1 first to create momentum and improve visibility quickly."}
                </p>
                <button
                  type="button"
                  onClick={handlePrimaryFixClick}
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-[#4318ff] px-5 text-sm font-semibold text-white hover:bg-[#3311db]"
                >
                  Fix #1 now
                </button>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-4">
                <h2 className="text-lg font-semibold text-[#1B2559]">Top fixes (3)</h2>
                <p className="mt-1 text-sm text-gray-600">Prioritized by likely ranking impact.</p>
                <div className="mt-3 space-y-3">
                  {top3.map((issue, idx) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      primaryAction={idx === 0}
                      onPrimaryAction={() => openFix(issue, "top_fixes")}
                      onSecondaryAction={() => openFix(issue, "top_fixes")}
                    />
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-4">
                <h2 className="text-lg font-semibold text-[#1B2559]">Expected impact</h2>
                <p className="mt-2 text-2xl font-semibold text-[#1B2559]">
                  {HEADLINE_MODE === "score"
                    ? `SEO score: ${Math.round(displayData!.scores.seo)}`
                    : `You could be missing ${trafficLossText} visits/month`}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5">Confidence: Medium</span>
                  <button
                    type="button"
                    title="Estimate is derived from issue severity, typical CTR effects, and benchmark ranges."
                    className="text-[#4318ff] hover:underline"
                  >
                    How we estimate this
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {completedCount > 0
                    ? `Great momentum: ${completedCount}/3 fixes done and estimated traffic risk reduced by ${riskReducedPercent}%.`
                    : "Complete the first fix to unlock your first measurable win before deciding to upgrade."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    track("rerun_audit_clicked", { source: "progress_loop" });
                    runAudit();
                  }}
                  className="mt-3 text-sm font-medium text-[#4318ff] hover:underline"
                >
                  Re-run audit
                </button>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-4">
                <h2 className="text-lg font-semibold text-[#1B2559]">Roadmap</h2>
                <p className="mt-1 text-sm text-gray-600">Preview your next actions with real task titles.</p>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {issues.slice(0, 6).map((issue) => (
                    <li key={issue.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2">
                      <span className="truncate">{issue.displayTitle}</span>
                      <span className="text-xs text-gray-500">{issue.impactLabel} impact</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setShowPaywall(true)}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-[#4318ff] px-4 text-sm font-semibold text-white hover:bg-[#3311db]"
                  >
                    Unlock remaining fixes ({Math.max(0, issues.length - FREE_FIX_LIMIT)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaywall(true)}
                    className="text-sm font-medium text-[#4318ff] hover:underline"
                  >
                    View competitor benchmark
                  </button>
                </div>
              </section>

              <div className="text-xs text-gray-500">Opportunities identified · {lastScannedText}</div>
            </div>

            <div className="lg:sticky lg:top-24 lg:h-fit">
              {USE_ONE_CTA_SIDEBAR ? (
                <ActionPanel
                  currentTask={currentTask}
                  completedCount={completedCount}
                  totalCount={top3.length}
                  riskReducedPercent={riskReducedPercent}
                  onPrimaryClick={handlePrimaryFixClick}
                  reportUrl={reportUrl}
                />
              ) : (
                <AuditActionsPanel
                  url={url}
                  canonicalReportUrl={reportUrl}
                  isUnlocked={false}
                  firstIssueId={currentTask?.id ?? null}
                  firstIssueMinutes={currentTask?.effortMinutes ?? 10}
                  showEmailForm={false}
                  email={legacyEmail}
                  onEmailChange={setLegacyEmail}
                  isEmailValid={isValidEmail(legacyEmail)}
                  emailError={legacyEmailStatus === "error" ? "Could not send. Try again." : null}
                  emailStatus={legacyEmailStatus}
                  onSendReport={sendLegacyReportEmail}
                  quickWinCount={issues.filter((i) => (i.effortMinutes ?? 0) <= 10).length}
                  topQuickWin={
                    topQuickWin
                      ? { title: topQuickWin.displayTitle, effortMinutes: topQuickWin.effortMinutes ?? 10 }
                      : null
                  }
                  score={displayData!.scores.seo}
                  hasCompetitorData={false}
                  additionalIssuesCount={Math.max(0, issues.length - 1)}
                />
              )}
            </div>
          </div>
        )}
      </main>

      <FixDrawer
        issue={activeIssue}
        open={drawerOpen}
        isLocked={!!activeIssue && top3.findIndex((i) => i.id === activeIssue.id) >= FREE_FIX_LIMIT}
        onClose={() => setDrawerOpen(false)}
        onMarkDone={markFixDone}
        onUpgradeRequest={() => setShowPaywall(true)}
      />

      <PaywallGate
        open={showPaywall}
        remainingFixes={Math.max(0, issues.length - FREE_FIX_LIMIT)}
        estimatedVisits={trafficLossText}
        onClose={() => setShowPaywall(false)}
        onUpgradeClick={handleUpgradeClick}
      />
    </div>
  );
}
