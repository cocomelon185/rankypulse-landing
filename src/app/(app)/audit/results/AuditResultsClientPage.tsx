"use client";

/**
 * UI REGRESSION GUARD — Do NOT break:
 * - No backdrop-blur on main wrappers; no transform/scale on layout
 * - Keep 2-column layout (left: results, right: sticky actions)
 * - Keep: success state, share link, sticky mobile bar, trust chips
 * - Preserve visual stability: contain:layout, no zoom/jitter on scroll
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { track, toSafeDomain, initVariantFromSearchParams } from "@/lib/analytics";
import { isValidEmail } from "@/lib/email-validation";
import { Card } from "@/components/horizon";
import { Zap, Mail, Shield, MailCheck, Link2, ExternalLink, RotateCcw } from "lucide-react";
import { IssueRow } from "@/components/audit/IssueRow";
import { AuditActionsPanel, type EmailSubmitStatus } from "@/components/audit/AuditActionsPanel";
import { UnlockUpsellSection } from "@/components/audit/UnlockUpsellSection";
import { ScoreDoughnutChart } from "@/components/audit/ScoreDoughnutChart";
import { AuditMetricCards } from "@/components/audit/AuditMetricCards";
import { BenchmarkBarChart } from "@/components/audit/BenchmarkBarChart";

type AuditIssue = {
  id: string;
  code: string;
  title: string;
  severity: string;
  effortMinutes?: number;
  category?: string;
  suggestedFix?: string;
};

type AuditData = {
  url: string;
  hostname: string;
  summary: string;
  scores: { seo: number };
  issues: AuditIssue[];
};

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

function isSignedIn(): boolean {
  return safeGet("rankypulse_is_signed_in") === "1";
}

function isValidHttpUrl(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function getIssuesSummary(issues: AuditIssue[]): string {
  if (!issues.length) return "No critical issues found";
  const high = issues.filter((i) => i.severity.toUpperCase() === "HIGH").length;
  const med = issues.filter((i) => ["MED", "MEDIUM"].includes(i.severity.toUpperCase())).length;
  const low = issues.length - high - med;
  const parts: string[] = [];
  if (high) parts.push(`${high} critical`);
  if (med) parts.push(`${med} medium`);
  if (low) parts.push(`${low} low`);
  return `${parts.join(", ")} issue${issues.length !== 1 ? "s" : ""} detected`;
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  return "Needs work";
}

const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MED", "MEDIUM", "LOW"] as const;

function sortIssuesBySeverity<T extends { severity: string }>(issues: T[]): T[] {
  return [...issues].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(b.severity.toUpperCase() as (typeof SEVERITY_ORDER)[number]) -
      SEVERITY_ORDER.indexOf(a.severity.toUpperCase() as (typeof SEVERITY_ORDER)[number])
  );
}

/** Short impact text for "What happens next" roadmap summary. */
function getShortImpactForRoadmap(issue: AuditIssue): string {
  const cat = (issue.category ?? "").toLowerCase();
  const code = (issue.code ?? "").toLowerCase();
  if (cat.includes("canonical") || code.includes("canonical")) return "improves crawlability";
  if (cat.includes("meta") || code.includes("meta") || code.includes("title")) return "improves click-through rate";
  if (cat.includes("performance") || code.includes("performance") || code.includes("image")) return "improves page speed";
  if (cat.includes("schema") || code.includes("schema") || cat.includes("heading") || code.includes("heading") || cat.includes("link") || code.includes("link")) return "improves visibility";
  return "improves SEO";
}

function getImpactText(issue: AuditIssue): string {
  if (issue.suggestedFix?.trim()) {
    const s = issue.suggestedFix.trim();
    const clean = s.startsWith("Impact:") ? s.replace(/^Impact:\s*/i, "").trim() : s;
    return clean.length > 60 ? clean.slice(0, 60).trim() + "…" : clean;
  }
  const cat = (issue.category ?? "").toLowerCase();
  const code = (issue.code ?? "").toLowerCase();
  if (cat.includes("canonical") || code.includes("canonical")) return "Improves crawlability and avoids duplicate content.";
  if (cat.includes("meta") || code.includes("meta")) return "Improves ranking signals and click-through.";
  if (cat.includes("schema") || code.includes("schema")) return "Improves rich results and search visibility.";
  if (cat.includes("performance") || code.includes("performance") || code.includes("core")) return "Improves page experience and Core Web Vitals.";
  if (cat.includes("heading") || code.includes("heading")) return "Improves structure and readability for search.";
  if (cat.includes("image") || code.includes("image")) return "Improves image indexing and accessibility.";
  if (cat.includes("link") || code.includes("link")) return "Improves link equity and user navigation.";
  return "Improves SEO and page experience.";
}

function getWhyItMatters(issue: AuditIssue): string | null {
  const cat = (issue.category ?? "").toLowerCase();
  const code = (issue.code ?? "").toLowerCase();
  if (cat.includes("canonical") || code.includes("canonical")) return "Search engines prioritize canonical URLs to index the right content.";
  if (cat.includes("meta") || code.includes("meta")) return "Titles and descriptions influence rankings and click-through in search.";
  if (cat.includes("schema") || code.includes("schema")) return "Structured data helps Google show rich snippets and answer boxes.";
  if (cat.includes("performance") || code.includes("performance") || code.includes("core")) return "Core Web Vitals affect ranking and user trust.";
  if (cat.includes("heading") || code.includes("heading")) return "Proper headings help crawlers understand page structure.";
  if (cat.includes("image") || code.includes("image")) return "Alt text and filenames help images rank and improve accessibility.";
  if (cat.includes("link") || code.includes("link")) return "Healthy links pass authority and improve navigation.";
  return null;
}

function truncateDomain(domain: string, maxLen = 28): string {
  if (domain.length <= maxLen) return domain;
  return domain.slice(0, maxLen - 3) + "…";
}

const RESEND_COOLDOWN_MS = 15_000;

function getSampleAuditData(url: string): AuditData {
  let hostname = "example.com";
  try {
    hostname = new URL(url).hostname;
  } catch {}
  return {
    url,
    hostname,
    summary: "Sample report — realistic issues for demo.",
    scores: { seo: 68 },
    issues: [
      {
        id: "meta_desc_home",
        code: "meta_description_missing",
        title: "Missing meta description on homepage",
        severity: "MED",
        effortMinutes: 5,
        category: "Meta",
        suggestedFix:
          "Add a concise meta description (140–160 chars) that summarizes your homepage. Include primary keyword and value proposition.",
      },
      {
        id: "canonical_non_preferred",
        code: "canonical_mismatch",
        title: "Canonical tag points to a non-preferred URL",
        severity: "HIGH",
        effortMinutes: 15,
        category: "Canonical",
        suggestedFix:
          "Update the canonical tag to point to your preferred URL (with or without trailing slash). Ensure consistency across internal links.",
      },
      {
        id: "img_dimensions",
        code: "image_dimensions_missing",
        title: "Large images without width/height cause layout shifts",
        severity: "MED",
        effortMinutes: 10,
        category: "Performance",
        suggestedFix:
          "Add explicit width and height attributes to img tags, or use aspect-ratio in CSS. This prevents Cumulative Layout Shift (CLS) and improves Core Web Vitals.",
      },
    ],
  };
}

export default function AuditResultsClientPage() {
  const searchParams = useSearchParams();
  const sampleMode = (searchParams ? searchParams.get("sample") : null) === "1";
  const queryUrl = searchParams ? searchParams.get("url") || "" : "";

  // Variant selection: ?variant=a|b → localStorage, else read from storage, else "a"
  useEffect(() => {
    initVariantFromSearchParams(searchParams);
  }, [searchParams]);

  const url = useMemo(() => {
    const fromQuery = queryUrl.trim();
    if (isValidHttpUrl(fromQuery)) return fromQuery;

    const fromStorage = safeGet("rankypulse_last_url");
    if (isValidHttpUrl(fromStorage)) return fromStorage;

    return "https://example.com";
  }, [queryUrl]);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AuditData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scannedAt, setScannedAt] = useState<Date | null>(null);

  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<EmailSubmitStatus>("idle");
  const [emailTouched, setEmailTouched] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [lastSentAt, setLastSentAt] = useState<number | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const successMessageRef = useRef<HTMLDivElement>(null);

  const emailValid = isValidEmail(email.trim());
  const emailError = emailTouched && email.trim() && !emailValid ? "Please enter a valid email address." : null;

  const displayData = useMemo(() => {
    if (sampleMode && !data && !loading) return getSampleAuditData(url);
    return data;
  }, [sampleMode, data, loading, url]);

  const domain = toSafeDomain(url);
  const truncatedDomain = truncateDomain(domain);
  const showUnlockCard = (sampleMode || !isSignedIn()) && !unlocked;
  const hasData = displayData !== null && !loading && !error;

  const [resendTick, setResendTick] = useState(0);
  const canResend =
    lastSentAt !== null &&
    Date.now() - lastSentAt >= RESEND_COOLDOWN_MS;

  useEffect(() => {
    if (lastSentAt === null) return;
    const remaining = RESEND_COOLDOWN_MS - (Date.now() - lastSentAt);
    if (remaining <= 0) {
      setResendTick((t) => t + 1);
      return;
    }
    const t = setTimeout(() => setResendTick((x) => x + 1), remaining);
    return () => clearTimeout(t);
  }, [lastSentAt, resendTick]);

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

    try {
      safeSet("rankypulse_last_url", url);
      safeSet("rankypulse_autorun_audit", "1");
    } catch {}

    runAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, sampleMode]);

  useEffect(() => {
    if (hasData && displayData) {
      const issues = displayData.issues ?? [];
      const issuesCritical = issues.filter((i) =>
        ["CRITICAL", "HIGH"].includes(i.severity.toUpperCase())
      ).length;
      const issuesMedium = issues.filter((i) =>
        ["MED", "MEDIUM"].includes(i.severity.toUpperCase())
      ).length;
      track("audit_results_view", {
        mode: sampleMode ? "sample" : "live",
        score: Math.round(displayData.scores.seo ?? 0),
        issuesTotal: issues.length,
        issuesCritical,
        issuesMedium,
      });
    }
  }, [hasData, displayData, sampleMode]);

  useEffect(() => {
    if (emailStatus === "success") {
      successMessageRef.current?.focus({ preventScroll: true });
    }
  }, [emailStatus]);

  const reportUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/audit/results?url=${encodeURIComponent(url)}`
      : "";

  async function sendReportEmail() {
    if (!email.trim()) return;
    track("email_submit_clicked");
    setEmailStatus("submitting");
    try {
      const res = await fetch("/api/email-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          reportUrl,
          siteUrl: url,
          summary: displayData ? { score: displayData.scores.seo, current: displayData.scores.seo } : undefined,
          issues: displayData?.issues.slice(0, 10).map((i) => ({
            title: i.title,
            severity: i.severity,
            eta: i.effortMinutes ? `${i.effortMinutes} min` : undefined,
          })),
        }),
      });

      if (!res.ok) throw new Error("email_failed");

      setEmailStatus("success");
      setLastSentAt(Date.now());
      setUnlocked(true);
      safeSet("rankypulse_has_audit", "1");
      track("email_submit_success");
    } catch (err) {
      setEmailStatus("error");
      const reason =
        err instanceof Error && err.message === "email_failed"
          ? "api_error"
          : "send_failed";
      track("email_submit_error", { reason });
    }
  }

  async function resendReportEmail() {
    if (!email.trim() || !canResend) return;
    await sendReportEmail();
    setLastSentAt(Date.now());
  }

  const topIssues = displayData?.issues.slice(0, 3) ?? [];
  const remainingIssues = displayData?.issues.slice(3) ?? [];
  const isUnlocked = unlocked || isSignedIn();
  const quickWinCount = displayData?.issues.filter((i) => (i.effortMinutes ?? 10) <= 10).length ?? 0;
  const topQuickWin = useMemo(() => {
    const qw = (displayData?.issues ?? [])
      .filter((i) => (i.effortMinutes ?? 10) <= 10)
      .sort((a, b) => (a.effortMinutes ?? 10) - (b.effortMinutes ?? 10))[0];
    return qw ? { title: qw.title, effortMinutes: qw.effortMinutes ?? 5 } : null;
  }, [displayData?.issues]);

  const score = displayData?.scores.seo ?? 0;
  const scoreLabel = getScoreLabel(Math.round(score));
  const executiveSummary = useMemo(() => {
    const issues = displayData?.issues ?? [];
    const topHighCritical = issues.find(
      (i) => ["HIGH", "CRITICAL"].includes(i.severity.toUpperCase())
    );
    if (topHighCritical) {
      const maxTitleLen = 110 - "Biggest risk: . Fixing it should improve crawlability and rankings.".length;
      const title = topHighCritical.title.length > maxTitleLen
        ? topHighCritical.title.slice(0, maxTitleLen - 1).trim() + "…"
        : topHighCritical.title;
      const s = `Biggest risk: ${title}. Fixing it should improve crawlability and rankings.`;
      return s.length > 110 ? s.slice(0, 107) + "…" : s;
    }
    return "Your site is in good shape — fixing the items below can improve visibility and clicks.";
  }, [displayData?.issues]);
  const lastScannedText = scannedAt
    ? `Last scanned ${scannedAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })} at ${scannedAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`
    : "Just scanned";

  return (
    <div
      className="audit-results-page audit-bg min-h-screen"
      style={{ contain: "layout", transition: "none" }}
    >
      <main
        className={`mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 ${
          showUnlockCard && emailStatus !== "success" && (hasData || sampleMode)
            ? "pb-24 sm:pb-8 md:pb-12"
            : ""
        }`}
      >
        {/* Premium header bar */}
        {(hasData || sampleMode) && (
          <header
            className="mb-3 flex flex-col gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-[var(--audit-card-shadow,0_4px_12px_rgba(0,0,0,0.04))] sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            style={{ contain: "layout" }}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Link
                href="/"
                className="audit-heading flex shrink-0 items-center gap-1.5 rounded-lg py-1 pr-2 hover:bg-gray-50/80"
                aria-label="RankyPulse home"
              >
                <img src="/favicon.ico" alt="" className="h-5 w-5 shrink-0 rounded" width={20} height={20} />
                <span className="text-sm font-semibold text-[#1B2559]">RankyPulse</span>
              </Link>
              <span className="hidden shrink-0 text-gray-300 sm:inline" aria-hidden>|</span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 items-center gap-2 truncate rounded-lg hover:bg-gray-50/80"
                aria-label={`Open ${domain} in new tab`}
              >
                <img
                  src={`https://www.google.com/s2/favicons?sz=24&domain=${encodeURIComponent(url)}`}
                  alt=""
                  className="h-5 w-5 shrink-0 rounded"
                  width={20}
                  height={20}
                />
                <span className="truncate text-sm font-medium text-[#1B2559]">{truncatedDomain}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
              </a>
            </div>
            {hasData && (
              <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-6">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4318ff]/10"
                    style={{ contain: "layout" }}
                  >
                    <span className="text-lg font-bold text-[#4318ff]">{Math.round(score)}</span>
                  </div>
                    <div>
                    <span className="audit-heading text-sm font-semibold text-[#1B2559]">{scoreLabel}</span>
                    <p className="text-xs text-gray-500">{displayData!.summary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{lastScannedText}</span>
                  <button
                    type="button"
                    onClick={runAudit}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                    Re-run audit
                  </button>
                </div>
              </div>
            )}
          </header>
        )}

        {loading && (
          <div className="mt-4 min-h-[120px] rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-[#1B2559]">Running audit…</div>
            <div className="mt-1 text-sm text-gray-500">This usually takes a few seconds.</div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="text-sm font-semibold text-red-700">{error}</div>
            <button
              type="button"
              onClick={runAudit}
              className="mt-3 inline-flex rounded-xl bg-[#4318ff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3311db]"
            >
              Try again
            </button>
          </div>
        )}

        {(hasData || sampleMode) && (
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:gap-6">
            {/* Left column: results */}
            <div className="min-w-0 flex-1 space-y-3">
              {hasData && (
                <div
                  className="overflow-hidden rounded-xl border p-4"
                  style={{
                    backgroundColor: "var(--audit-hero-bg)",
                    borderColor: "var(--audit-hero-border)",
                    boxShadow: "var(--audit-hero-shadow)",
                    contain: "layout",
                  }}
                  role="region"
                  aria-label="Hero summary"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-gray-200/70 bg-white/80 p-4">
                      <div className="audit-heading text-sm font-semibold text-gray-500">SEO Score</div>
                      <div className="mt-1 flex items-center gap-3">
                        <ScoreDoughnutChart score={displayData!.scores.seo} size={56} />
                        <p className="min-w-0 text-sm text-gray-600">{displayData!.summary}</p>
                      </div>
                      <p className="mt-1.5 text-xs text-gray-600">{executiveSummary}</p>
                      {displayData!.issues.some((i) => ["HIGH", "CRITICAL"].includes(i.severity.toUpperCase())) && (
                        <p className="mt-1 text-xs text-gray-500">Fixing your top issue could improve search visibility within days.</p>
                      )}
                    </div>
                    <div className="rounded-lg border border-gray-200/70 bg-white/80 p-4">
                      <div className="audit-heading text-sm font-semibold text-gray-500">Overview</div>
                      <p className="mt-1 text-sm text-gray-700">{displayData!.summary}</p>
                    </div>
                  </div>
                  {/* Metric cards */}
                  {displayData!.issues.length > 0 && (
                    <div className="mt-4">
                      <AuditMetricCards issues={displayData!.issues} />
                    </div>
                  )}
                  {/* What happens next */}
                  {sortIssuesBySeverity(displayData!.issues).slice(0, 3).length > 0 && (
                    <div className="mt-4 rounded-xl border border-gray-200/70 bg-white/80 p-4">
                      <h3 className="audit-heading text-sm font-semibold text-[#1B2559]">What happens next</h3>
                      <p className="mt-0.5 text-xs text-gray-500">Fixing these issues helps your site grow step by step.</p>
                      <div className="mt-3 space-y-1.5">
                        {sortIssuesBySeverity(displayData!.issues).slice(0, 3).map((i, idx) => (
                          <div key={i.id} className="flex items-center gap-2 text-sm">
                            <span className="shrink-0 font-medium text-gray-600">Fix #{idx + 1}</span>
                            <span className="text-gray-400">→</span>
                            <span className="text-gray-700">{getShortImpactForRoadmap(i)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Top fixes – within Hero Summary */}
                  {topIssues.length > 0 && (
                    <div className="mt-4 border-t border-gray-200/70 pt-4">
                      <h2 className="audit-heading text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Top fixes (highest impact first)
                      </h2>
                      <div className="mt-2.5 space-y-2">
                        {topIssues.slice(0, 3).map((i) => (
                          <IssueRow
                            key={i.id}
                            issue={i}
                            showFixAction
                            compact
                            scrollTargetId={`issue-${i.id}`}
                            impactText={getImpactText(i)}
                            whyItMattersText={getWhyItMatters(i)}
                            pageTitle={displayData!.hostname}
                            pageDisplayUrl={`${displayData!.hostname} › page`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Top issues – before Email CTA so user sees fixes first */}
              {hasData && (
                <Card extra="p-4 border border-gray-200/90 shadow-[var(--audit-card-shadow)]" default>
                  <div className="flex items-center justify-between">
                    <span className="audit-heading text-xs font-semibold uppercase tracking-wider text-[#1B2559]">Top issues</span>
                    <span className="text-xs text-gray-500">{getIssuesSummary(displayData!.issues)}</span>
                  </div>
                  <div className="mt-2.5 space-y-2">
                    {topIssues.length === 0 ? (
                      <p className="rounded-lg border border-gray-100 bg-gray-50/50 p-4 text-sm text-gray-600">
                        No critical issues found. Your site looks good!
                      </p>
                    ) : (
                      <>
                        {topIssues.slice(0, 2).map((i) => (
                          <IssueRow
                            key={i.id}
                            issue={i}
                            showFixAction
                            id={`issue-${i.id}`}
                            pageTitle={displayData!.hostname}
                            pageDisplayUrl={`${displayData!.hostname} › page`}
                          />
                        ))}
                        {topIssues.length >= 3 && (
                          <div className="relative rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden" style={{ contain: "layout" }}>
                            <div
                              className="absolute inset-0 z-10 pointer-events-none"
                              style={{
                                background: "linear-gradient(to bottom, transparent 40%, rgba(255,255,255,0.92) 70%, white 85%)",
                              }}
                            />
                            <div className="relative p-4 opacity-70">
                              <IssueRow
                                issue={topIssues[2]}
                                showFixAction
                                id={`issue-${topIssues[2].id}`}
                                pageTitle={displayData!.hostname}
                                pageDisplayUrl={`${displayData!.hostname} › page`}
                              />
                            </div>
                            <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-center pointer-events-auto">
                              <Link
                                href="/pricing?source=audit"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#4318ff] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3311db]"
                              >
                                Unlock to see the rest of the fixes
                              </Link>
                            </div>
                          </div>
                        )}
                        {remainingIssues.length > 0 && (
                          <Link
                            href="/dashboard?view=quickwins"
                            className="mt-2 block text-center text-sm font-semibold text-[#4318ff] hover:underline"
                          >
                            View all {displayData!.issues.length} issues →
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                  {/* Sample fixes: 2 full, 3rd blurred */}
                  {topIssues.length >= 2 && (
                    <div className="mt-4 space-y-2">
                      {topIssues.slice(0, 2).map((fix) =>
                        fix.suggestedFix ? (
                          <div key={fix.id} className="rounded-lg border-l-4 border-[#4318ff] bg-[#eff6ff] p-3">
                            <div className="text-xs font-semibold uppercase tracking-wider text-[#4318ff]">
                              Sample fix — {fix.title}
                            </div>
                            <p className="mt-1 text-sm text-gray-700">{fix.suggestedFix}</p>
                          </div>
                        ) : null
                      )}
                      {topIssues.length >= 3 && topIssues[2].suggestedFix && (
                        <div className="relative overflow-hidden rounded-lg border-l-4 border-[#4318ff] bg-[#eff6ff] p-3">
                          <div
                            className="absolute inset-0 z-10"
                            style={{
                              background: "linear-gradient(to bottom, transparent 30%, rgba(239,246,255,0.95) 60%)",
                            }}
                          />
                          <div className="relative opacity-60">
                            <div className="text-xs font-semibold uppercase tracking-wider text-[#4318ff]">
                              Sample fix — {topIssues[2].title}
                            </div>
                            <p className="mt-1 text-sm text-gray-700 line-clamp-2">{topIssues[2].suggestedFix}</p>
                          </div>
                          <div className="relative z-20 mt-2">
                            <Link
                              href="/pricing?source=audit"
                              className="text-xs font-semibold text-[#4318ff] hover:underline"
                            >
                              Unlock to see the rest of the fixes
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )}

              {/* Primary CTA: Email full report – after Top fixes + Top issues */}
              {showUnlockCard && (
                <Card
                  extra="overflow-hidden border-2 border-[#4318ff]/25 bg-gradient-to-br from-[#eff6ff] to-white p-4 shadow-[var(--audit-primary-card-shadow)]"
                  default
                  role="region"
                  aria-labelledby="unlock-heading"
                  aria-describedby="unlock-desc"
                  style={{ minHeight: 220 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4318ff] text-white">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 id="unlock-heading" className="audit-heading text-lg font-bold text-[#1B2559]">
                        Want this roadmap in your inbox?
                      </h2>
                      {emailStatus === "success" ? (
                        <div
                          ref={successMessageRef}
                          tabIndex={-1}
                          role="status"
                          aria-live="polite"
                          aria-label="Report sent successfully"
                          className="mt-3 rounded-lg border border-green-200/80 bg-green-50/50 p-3 focus:outline-none focus:ring-2 focus:ring-[#4318ff]/20"
                        >
                          <p className="text-sm font-medium text-green-800">
                            Report link sent to {email}
                          </p>
                          <p className="mt-1 text-xs text-green-700/90">Check spam or promotions if you don&apos;t see it.</p>
                          <button
                            type="button"
                            onClick={resendReportEmail}
                            disabled={!canResend}
                            className="mt-2 text-xs font-medium text-[#4318ff] hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                          >
                            Didn&apos;t get it? Resend
                          </button>
                        </div>
                      ) : (
                        <>
                          <p id="unlock-desc" className="mt-1 text-sm text-gray-600">
                            We&apos;ll send you a secure link to your full SEO roadmap in ~10 seconds.
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500" role="list" aria-label="Trust guarantees">
                            <span className="inline-flex items-center gap-1" role="listitem"><Shield className="h-3.5 w-3.5 text-gray-400" aria-hidden /> Secure & private</span>
                            <span className="inline-flex items-center gap-1" role="listitem"><MailCheck className="h-3.5 w-3.5 text-gray-400" aria-hidden /> No spam</span>
                            <span className="inline-flex items-center gap-1" role="listitem"><Link2 className="h-3.5 w-3.5 text-gray-400" aria-hidden /> Shareable link</span>
                            <span className="text-xs text-gray-400" role="listitem">Used by 1,200+ sites</span>
                          </div>

                          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                            <div className="relative flex-1">
                              <label htmlFor="unlock-email" className="sr-only">
                                Your email address
                              </label>
                              <input
                                ref={emailInputRef}
                                id="unlock-email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => setEmailTouched(true)}
                                placeholder="you@example.com"
                                disabled={emailStatus === "submitting"}
                                aria-invalid={emailStatus === "error" || !!emailError}
                                aria-describedby={
                                  emailError || emailStatus === "error"
                                    ? "unlock-email-error"
                                    : undefined
                                }
                                className={`h-11 w-full rounded-xl border-2 px-4 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4318ff]/20 disabled:opacity-60 ${
                                  emailError || emailStatus === "error"
                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                                    : "border-gray-200 focus:border-[#4318ff]"
                                }`}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={sendReportEmail}
                              disabled={!emailValid || emailStatus === "submitting"}
                              className="h-11 shrink-0 rounded-xl bg-[#4318ff] px-6 text-sm font-semibold text-white hover:bg-[#3311db] disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {emailStatus === "submitting" ? "Sending…" : "Email my roadmap"}
                            </button>
                          </div>

                          {(emailError || emailStatus === "error") && (
                            <p id="unlock-email-error" className="mt-2 text-sm text-red-600" role="alert">
                              {emailError || "Could not send. Try again."}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Quick Wins – inline for mobile */}
              <Card extra="p-4 border border-gray-200/90 shadow-[var(--audit-card-shadow)]" default className="lg:hidden">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[#4318ff]" aria-hidden />
                  <span className="audit-heading text-sm font-semibold text-[#1B2559]">Quick Wins</span>
                </div>
                {topQuickWin ? (
                  <>
                    <p className="mt-1 text-sm text-gray-600">
                      Next win: <span className="font-medium text-[#1B2559]">{topQuickWin.title}</span>
                    </p>
                    <span className="mt-1 inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      ~{topQuickWin.effortMinutes} min
                    </span>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Link
                        href="/dashboard?view=quickwins"
                        className="inline-flex justify-center rounded-xl bg-[#4318ff] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3311db]"
                      >
                        Fix next quick win
                      </Link>
                      <Link
                        href="/dashboard?view=quickwins"
                        className="text-center text-sm font-medium text-[#4318ff] hover:underline"
                      >
                        Browse all quick wins
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-1 text-sm text-gray-600">
                      Fix the next issue in minutes. {quickWinCount > 0 ? `${quickWinCount} fix${quickWinCount !== 1 ? "es" : ""} ready.` : ""}
                    </p>
                    <Link
                      href="/dashboard?view=quickwins"
                      className="mt-3 inline-flex rounded-xl border-2 border-[#4318ff] bg-[#4318ff]/5 px-4 py-2 text-sm font-semibold text-[#4318ff] hover:bg-[#4318ff]/10"
                    >
                      Browse all quick wins
                    </Link>
                  </>
                )}
              </Card>

              {/* Remaining issues – when unlocked */}
              {hasData && remainingIssues.length > 0 && isUnlocked && (
                <Card extra="p-4 border border-gray-200/90 shadow-[var(--audit-card-shadow)]" default>
                  <div className="audit-heading text-sm font-semibold text-[#1B2559]">Remaining issues</div>
                  <div className="mt-3 space-y-3">
                    {remainingIssues.map((i) => (
                      <IssueRow key={i.id} issue={i} showFixAction />
                    ))}
                  </div>
                </Card>
              )}

              {/* Unlock upsell – clean list, no blur */}
              {hasData && !isUnlocked && (
                <UnlockUpsellSection
                  additionalIssuesCount={remainingIssues.length}
                  totalIssuesCount={displayData!.issues.length}
                  topIssues={displayData!.issues.map((i) => ({
                    id: i.id,
                    title: i.title,
                    severity: i.severity,
                  }))}
                  yourScore={Math.round(score)}
                />
              )}
            </div>

            {/* Right column: sticky actions – desktop */}
            <div className="hidden lg:block lg:w-72 lg:shrink-0">
              <div className="sticky top-24">
                <AuditActionsPanel
                  url={url}
                  canonicalReportUrl={reportUrl || null}
                  isUnlocked={isUnlocked}
                  firstIssueId={topIssues[0]?.id ?? null}
                  firstIssueMinutes={topIssues[0]?.effortMinutes ?? 5}
                  showEmailForm={showUnlockCard}
                  email={email}
                  onEmailChange={setEmail}
                  onEmailBlur={() => setEmailTouched(true)}
                  isEmailValid={emailValid}
                  emailError={emailError ?? (emailStatus === "error" ? "Could not send. Try again." : null)}
                  emailStatus={emailStatus}
                  onSendReport={sendReportEmail}
                  onResend={resendReportEmail}
                  canResend={canResend}
                  quickWinCount={quickWinCount}
                  topQuickWin={topQuickWin}
                  score={score}
                  hasCompetitorData={false}
                  competitorAvgEstimate={sampleMode ? 74 : null}
                  additionalIssuesCount={remainingIssues.length}
                />
              </div>
            </div>
          </div>
        )}

        {sampleMode && hasData && (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-sm font-semibold text-[#1B2559]">Sample mode</div>
            <div className="mt-1 text-sm text-gray-600">Fix the next issue in minutes.</div>
            <Link
              href="/dashboard?view=quickwins"
              className="mt-3 inline-flex rounded-xl bg-[#4318ff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3311db]"
            >
              Open Quick Wins
            </Link>
          </div>
        )}

        {/* Mobile sticky bottom bar – Send my report CTA */}
        {showUnlockCard &&
          emailStatus !== "success" &&
          (hasData || sampleMode) && (
            <div
              className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200/80 bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] backdrop-blur sm:hidden"
              style={{ contain: "layout" }}
            >
              <button
                type="button"
                onClick={() => {
                  emailInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                  emailInputRef.current?.focus();
                }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4318ff] text-sm font-semibold text-white shadow-md hover:bg-[#3311db]"
              >
                <Mail className="h-5 w-5" aria-hidden />
                Send my report
              </button>
            </div>
          )}
      </main>
    </div>
  );
}
