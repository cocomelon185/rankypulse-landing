"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { track, toSafeDomain } from "@/lib/analytics";
import { Card } from "@/components/horizon";
import { Zap, Lock, Mail } from "lucide-react";

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

export default function AuditResultsClientPage() {
  const searchParams = useSearchParams();
  const sampleMode = (searchParams ? searchParams.get("sample") : null) === "1";
  const queryUrl = searchParams ? searchParams.get("url") || "" : "";

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

  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "err">("idle");
  const [unlocked, setUnlocked] = useState(false);

  const domain = toSafeDomain(url);
  const showUnlockCard = (sampleMode || !isSignedIn()) && !unlocked;
  const hasData = data && !loading && !error;

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
    if (hasData) {
      track("audit_results_viewed", {
        url_domain: domain,
        score: Math.round(data!.scores.seo),
        issues_count: data!.issues.length,
      });
    }
  }, [hasData, domain, data]);

  async function sendReportEmail() {
    if (!email.trim()) return;
    setEmailStatus("sending");
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://rankypulse.com";
      const reportUrl = `${origin}/audit/results?url=${encodeURIComponent(url)}`;
      const res = await fetch("/api/email-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          reportUrl,
          siteUrl: url,
          summary: data ? { score: data.scores.seo, current: data.scores.seo } : undefined,
          issues: data?.issues.slice(0, 10).map((i) => ({
            title: i.title,
            severity: i.severity,
            eta: i.effortMinutes ? `${i.effortMinutes} min` : undefined,
          })),
        }),
      });

      if (!res.ok) throw new Error("email_failed");

      setEmailStatus("sent");
      setUnlocked(true);
      safeSet("rankypulse_has_audit", "1");
      track("email_capture_submitted", { url_domain: domain });
    } catch {
      setEmailStatus("err");
    }
  }

  const topIssues = data?.issues.slice(0, 3) ?? [];
  const remainingIssues = data?.issues.slice(3) ?? [];
  const sampleFixIssue = topIssues.find((i) => i.suggestedFix) ?? topIssues[0];
  const isUnlocked = unlocked || isSignedIn();

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-[#1B2559]">Audit results</h1>

      <div className="mt-4 rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
        <div className="text-sm text-gray-600">
          Site: <span className="font-semibold text-[#1B2559]">{url}</span>
        </div>
        <div className="mt-3 text-sm font-semibold text-[#1B2559]">Current score</div>
        <div className="mt-1 text-sm text-gray-500">
          Overview · Issues · Title &amp; Meta · Schema · Quick Wins
        </div>
      </div>

      {loading && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <div className="text-sm font-semibold text-[#1B2559]">Running audit…</div>
          <div className="mt-1 text-sm text-gray-500">This usually takes a few seconds.</div>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="text-sm font-semibold text-red-700">{error}</div>
          <button
            type="button"
            onClick={runAudit}
            className="mt-3 inline-flex rounded-xl bg-[#4318ff] px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      )}

      {(hasData || sampleMode) && (
        <div className="mt-6 space-y-6">
          {/* Score + overview - visible when we have data */}
          {hasData && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card extra="p-5" default>
              <div className="text-sm font-semibold text-gray-500">SEO Score</div>
              <div className="mt-1 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#4318ff]/10">
                  <span className="text-2xl font-bold text-[#4318ff]">{Math.round(data!.scores.seo)}</span>
                </div>
                <p className="text-sm text-gray-600">{data!.summary}</p>
              </div>
            </Card>
            <Card extra="p-5" default>
              <div className="text-sm font-semibold text-gray-500">Overview</div>
              <p className="mt-1 text-sm text-gray-700">{data!.summary}</p>
            </Card>
          </div>
          )}

          {/* Top 3 issues - visible when we have data */}
          {hasData && (
          <Card extra="p-5" default>
            <div className="text-sm font-semibold text-[#1B2559]">Top issues</div>
            <div className="mt-3 space-y-2">
              {topIssues.map((i) => (
                <div key={i.id} className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                  <div className="text-sm font-semibold text-[#1B2559]">{i.title}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    Severity: {i.severity}
                    {typeof i.effortMinutes === "number" ? ` · ETA: ${i.effortMinutes} min` : ""}
                  </div>
                </div>
              ))}
            </div>
            {sampleFixIssue?.suggestedFix && (
              <div className="mt-4 rounded-lg border-l-4 border-[#4318ff] bg-[#eff6ff] p-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#4318ff]">
                  Sample fix — {sampleFixIssue.title}
                </div>
                <p className="mt-1 text-sm text-gray-700">{sampleFixIssue.suggestedFix}</p>
              </div>
            )}
          </Card>
          )}

          {/* Unlock full report card - show for sample mode or when we have data */}
          {showUnlockCard && (
            <Card
              extra="overflow-hidden border-2 border-[#4318ff]/20 bg-gradient-to-br from-[#eff6ff] to-white p-6"
              default
              role="region"
              aria-labelledby="unlock-heading"
              aria-describedby="unlock-desc"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4318ff] text-white">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 id="unlock-heading" className="text-lg font-bold text-[#1B2559]">
                    Email me the full report
                  </h2>
                  <p id="unlock-desc" className="mt-1 text-sm text-gray-600">
                    We&apos;ll email the report link. No spam.
                  </p>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <label htmlFor="unlock-email" className="sr-only">
                      Your email address
                    </label>
                    <input
                      id="unlock-email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={emailStatus === "sending"}
                      aria-invalid={emailStatus === "err"}
                      aria-describedby={emailStatus === "sent" ? "unlock-success" : emailStatus === "err" ? "unlock-error" : undefined}
                      className="h-11 w-full rounded-xl border-2 border-gray-200 px-4 text-base text-gray-900 placeholder-gray-400 focus:border-[#4318ff] focus:outline-none focus:ring-2 focus:ring-[#4318ff]/20"
                    />
                    <button
                      type="button"
                      onClick={sendReportEmail}
                      disabled={!email.trim() || emailStatus === "sending"}
                      className="h-11 shrink-0 rounded-xl bg-[#4318ff] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#3311db] disabled:opacity-60"
                    >
                      {emailStatus === "sending" ? "Sending…" : "Send Full Report"}
                    </button>
                  </div>

                  <div
                    id="unlock-success"
                    role="status"
                    aria-live="polite"
                    className="mt-3"
                  >
                    {emailStatus === "sent" && (
                      <p className="text-sm font-medium text-green-700">Sent! Check your inbox.</p>
                    )}
                    {emailStatus === "err" && (
                      <p id="unlock-error" className="text-sm font-medium text-red-600">
                        Could not send. Try again.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Locked / remaining issues */}
          {hasData && remainingIssues.length > 0 && !isUnlocked && (
            <div className="relative overflow-hidden rounded-xl">
              <div className="pointer-events-none select-none blur-sm">
                <Card extra="p-5" default>
                  <div className="text-sm font-semibold text-[#1B2559]">Remaining issues</div>
                  <div className="mt-2 space-y-2">
                    {remainingIssues.map((i) => (
                      <div key={i.id} className="rounded-lg border p-3">
                        <div className="text-sm font-semibold">{i.title}</div>
                        <div className="mt-1 text-xs text-gray-500">Severity: {i.severity}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/20 backdrop-blur-[2px]">
                <div className="flex flex-col items-center gap-2 rounded-xl bg-white/95 px-6 py-4 shadow-lg">
                  <Lock className="h-8 w-8 text-[#4318ff]" />
                  <span className="text-sm font-semibold text-[#1B2559]">Unlock full report</span>
                  <span className="text-xs text-gray-500">Enter your email above</span>
                </div>
              </div>
            </div>
          )}

          {/* Full issues list - when unlocked */}
          {hasData && remainingIssues.length > 0 && isUnlocked && (
            <Card extra="p-5" default>
              <div className="text-sm font-semibold text-[#1B2559]">Remaining issues</div>
              <div className="mt-2 space-y-2">
                {remainingIssues.map((i) => (
                  <div key={i.id} className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                    <div className="text-sm font-semibold text-[#1B2559]">{i.title}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      Severity: {i.severity}
                      {typeof i.effortMinutes === "number" ? ` · ETA: ${i.effortMinutes} min` : ""}
                    </div>
                    {i.suggestedFix && (
                      <div className="mt-2 text-sm text-gray-700">{i.suggestedFix}</div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Locked Export / Action plan - when not unlocked */}
          {hasData && !isUnlocked && (
            <div className="relative overflow-hidden rounded-xl">
              <div className="pointer-events-none select-none blur-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card extra="p-5" default>
                    <div className="text-sm font-semibold">Export PDF / Email full report</div>
                    <p className="mt-1 text-sm text-gray-500">Download or email the complete report.</p>
                  </Card>
                  <Card extra="p-5" default>
                    <div className="text-sm font-semibold">Action plan</div>
                    <p className="mt-1 text-sm text-gray-500">Prioritized steps to improve your SEO.</p>
                  </Card>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/10 backdrop-blur-[2px]">
                <div className="flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2 shadow">
                  <Lock className="h-5 w-5 text-[#4318ff]" />
                  <span className="text-sm font-semibold text-[#1B2559]">Unlock above</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Wins */}
          <Card extra="p-5" default>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#4318ff]" />
              <span className="text-sm font-semibold text-[#1B2559]">Quick Wins</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">Fix the next issue in minutes.</p>
            <Link
              href="/dashboard?view=quickwins"
              className="mt-3 inline-flex rounded-xl bg-[#4318ff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3311db]"
            >
              Open Quick Wins
            </Link>
          </Card>
        </div>
      )}

      {sampleMode && hasData && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-sm font-semibold text-[#1B2559]">Sample mode</div>
          <div className="mt-1 text-sm text-gray-600">Fix the next issue in minutes.</div>
          <Link
            href="/dashboard?view=quickwins"
            className="mt-3 inline-flex rounded-xl bg-[#4318ff] px-4 py-2 text-sm font-semibold text-white"
          >
            Open Quick Wins
          </Link>
        </div>
      )}
    </main>
  );
}
