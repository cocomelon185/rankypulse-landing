"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useScrollToIssue } from "@/hooks/useScrollToIssue";
import { AuditHero } from "@/components/audit/v2/AuditHero";
import { IssueRadar } from "@/components/audit/v2/IssueRadar";
import { FindingsBoard } from "@/components/audit/v2/FindingsBoard";
import { TrafficOpportunity } from "@/components/audit/v2/TrafficOpportunity";
import { ActionRoadmap } from "@/components/audit/v2/ActionRoadmap";
import { AuditSidebar } from "@/components/audit/v2/AuditSidebar";
import { CompetitorBenchmark } from "@/components/audit/v2/CompetitorBenchmark";
import { AhaMomentBanner } from "@/components/audit/v2/AhaMomentBanner";
import { SocialProofStrip } from "@/components/audit/v2/SocialProofStrip";
import { FullAuditProgress } from "@/components/audit/FullAuditProgress";
import { StickyUpgradeBar } from "@/components/audit/v2/StickyUpgradeBar";
import { AuditLoadingScreen } from "@/components/audit/AuditLoadingScreen";
import {
  UnreachableErrorState,
  TimeoutErrorState,
  RateLimitedState,
  GenericErrorState,
} from "@/components/audit/ErrorStates";
import { useAuditStore } from "@/lib/use-audit";
import { useAuth } from "@/hooks/useAuth";
import { incrementAuditsUsed } from "@/lib/billing-store";
import { MOCK_AUDIT } from "@/lib/audit-data";
import { ExportPdfButton } from "@/components/audit/ExportPdfButton";
import { PdfCoverPage } from "@/components/audit/PdfCoverPage";

type ErrorKind = "unreachable" | "rate_limited" | "timeout" | "failed";

export function AuditDomainClient({ domain: rawDomain }: { domain: string }) {
  const searchParams = useSearchParams();
  const domain = rawDomain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .toLowerCase()
    .trim();
  const { highlightedId, scrollToIssue } = useScrollToIssue();

  // ── Local loading state — decoupled from Zustand ──
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<ErrorKind | null>(null);

  // Prevent double-fetch in React StrictMode, but allow re-fetch when domain changes
  const fetchedDomain = useRef<string | null>(null);
  // Track start time so we can enforce minimum display times
  const crawlStartTime = useRef(0);
  // Abort in-flight fetch when domain changes or on unmount
  const controllerRef = useRef<AbortController | null>(null);
  // Current domain we're displaying — guard against stale fetch overwriting store
  const currentDomainRef = useRef(domain);
  currentDomainRef.current = domain;

  const setData = useAuditStore((s) => s.setData);
  const auditData = useAuditStore((s) => s.data);
  const setExpandedIssue = useAuditStore((s) => s.setExpandedIssue);
  const { isAuthenticated } = useAuth();
  const isAuthenticatedRef = useRef(isAuthenticated);
  isAuthenticatedRef.current = isAuthenticated;

  // After sign-in return: auto-open the fix that user intended
  const processedCallbackRef = useRef(false);
  useEffect(() => {
    const action = searchParams?.get("action");
    const issueId = searchParams?.get("issueId");
    if (action === "fix" && issueId && !isLoading && !processedCallbackRef.current) {
      processedCallbackRef.current = true;
      setExpandedIssue(issueId);
      scrollToIssue(issueId);
    }
  }, [searchParams, isLoading, setExpandedIssue, scrollToIssue]);

  // Delays a callback so the loading screen always shows for at least `minMs`
  const withMinTime = (minMs: number, fn: () => void) => {
    const elapsed = Date.now() - crawlStartTime.current;
    const remaining = Math.max(0, minMs - elapsed);
    setTimeout(fn, remaining);
  };

  const runCrawl = (targetDomain: string) => {
    crawlStartTime.current = Date.now();
    setIsLoading(true);
    setLoadError(null);

    // Abort any previous in-flight fetch
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    // 45s hard timeout — PSI can be slow on cold starts
    const timeoutId = setTimeout(() => controller.abort(), 45_000);

    fetch(`/api/crawl?domain=${encodeURIComponent(targetDomain)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        clearTimeout(timeoutId);
        controllerRef.current = null;

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        // Only apply result if we're still showing this domain (prevents stale fetch overwriting)
        const stillRelevant = data.domain === currentDomainRef.current;

        if (data.error === "unreachable") {
          if (stillRelevant) {
            withMinTime(2_000, () => {
              setLoadError("unreachable");
              setIsLoading(false);
            });
          }
          return;
        }

        if (data.error === "rate_limited") {
          if (stillRelevant) {
            withMinTime(2_000, () => {
              setLoadError("rate_limited");
              setIsLoading(false);
            });
          }
          return;
        }

        // Success — only update store if user hasn't navigated away
        if (stillRelevant) {
          withMinTime(4_000, () => {
            setData(data);
            if (isAuthenticatedRef.current) incrementAuditsUsed();
            setIsLoading(false);
          });
        }
      })
      .catch((err: unknown) => {
        clearTimeout(timeoutId);
        controllerRef.current = null;
        const isAbort = err instanceof DOMException && err.name === "AbortError";
        // Only update state if we're still on this domain
        if (targetDomain === currentDomainRef.current) {
          withMinTime(2_000, () => {
            setLoadError(isAbort ? "timeout" : "failed");
            setIsLoading(false);
          });
        }
      });
  };

  useEffect(() => {
    if (fetchedDomain.current === domain) return;
    fetchedDomain.current = domain;
    setData({ ...MOCK_AUDIT, domain });
    runCrawl(domain);
    return () => {
      controllerRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  // ── Loading ──
  if (isLoading) {
    return (
      <AuditLoadingScreen
        domain={domain}
        maxWaitMs={45_000}
        onTimeout={() => {
          setLoadError("timeout");
          setIsLoading(false);
        }}
      />
    );
  }

  // ── Error states ──
  if (loadError === "unreachable") {
    return <UnreachableErrorState domain={domain} />;
  }

  if (loadError === "rate_limited") {
    return <RateLimitedState />;
  }

  if (loadError === "timeout") {
    return (
      <TimeoutErrorState
        domain={domain}
        onRetry={() => {
          fetchedDomain.current = null;
          runCrawl(domain);
        }}
      />
    );
  }

  if (loadError) {
    return (
      <GenericErrorState
        domain={domain}
        onRetry={() => {
          fetchedDomain.current = null;
          runCrawl(domain);
        }}
      />
    );
  }

  // ── Success: render full audit page ──
  return (
    <div className="audit-dark min-h-screen">
      {/* Hidden PDF cover page — off-screen capture target */}
      <PdfCoverPage domain={domain} score={auditData?.score ?? 0} />

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            {/* Export button row */}
            <div className="flex justify-end">
              <ExportPdfButton domain={domain} />
            </div>
            <div id="pdf-hero"><AuditHero /></div>
            <AhaMomentBanner />
            <SocialProofStrip />
            <IssueRadar />
            <div id="pdf-findings"><FindingsBoard highlightedId={highlightedId} /></div>
            <FullAuditProgress domain={domain} />
            <TrafficOpportunity />
            <div id="pdf-roadmap"><ActionRoadmap onScrollToIssue={scrollToIssue} /></div>
            <CompetitorBenchmark />
            <SaveDomainTracker domain={domain} />
            <EmailCaptureBanner domain={domain} />
            <ShareReportBar domain={domain} />
          </div>

          <div className="hidden lg:block">
            <AuditSidebar onScrollToIssue={scrollToIssue} />
          </div>
        </div>

        <MobileDrawer onScrollToIssue={scrollToIssue} />
      </main>

      <StickyUpgradeBar />
    </div>
  );
}

function MobileDrawer({ onScrollToIssue }: { onScrollToIssue: (id: string) => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <details className="group">
        <summary className="flex cursor-pointer items-center justify-center gap-2 rounded-t-2xl bg-[var(--bg-elevated)] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
          <div className="h-1 w-8 rounded-full bg-white/20" />
          <span className="text-sm font-medium text-[var(--text-secondary)]">View Progress</span>
        </summary>
        <div className="max-h-[70vh] overflow-y-auto bg-[var(--bg-elevated)] px-4 pb-6">
          <AuditSidebar onScrollToIssue={onScrollToIssue} />
        </div>
      </details>
    </div>
  );
}

function SaveDomainTracker({ domain }: { domain: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "saved" | "error">("idle");
  const { isAuthenticated } = useAuth();

  const handleSave = async () => {
    if (!isAuthenticated) {
      // Redirect to sign-in and return here after
      window.location.href = `/auth/signin?callbackUrl=/report/${domain}`;
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/save-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      setStatus(res.ok ? "saved" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "saved") {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
        <p className="font-['DM_Sans'] text-sm text-emerald-400">
          ✓ Domain saved! You&apos;ll receive weekly SEO progress reports for <strong>{domain}</strong>.
        </p>
        <p className="mt-2 font-['DM_Sans'] text-xs text-[var(--text-muted)]">
          Pro members also get keyword ranking alerts and competitor diff reports.{" "}
          <a href="/pricing" className="text-[var(--accent-primary)] hover:underline">
            Upgrade to Pro →
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-['DM_Sans'] font-semibold text-[var(--text-primary)]">
            📊 Track weekly SEO progress
          </p>
          <p className="font-['DM_Sans'] text-sm text-[var(--text-secondary)] mt-1">
            Save this domain to your account. We'll crawl it automatically every Monday and email you a delta report.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={status === "loading"}
          className="whitespace-nowrap rounded-lg bg-[var(--accents-indigo)] px-5 py-2.5 font-['DM_Sans'] text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {status === "loading" ? "Saving..." : isAuthenticated ? "Activate Weekly Scans" : "Sign in to Track"}
        </button>
      </div>
    </div>
  );
}

function EmailCaptureBanner({ domain }: { domain: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const reportUrl = typeof window !== "undefined" ? window.location.href : "";
      const res = await fetch("/api/email-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, domain, reportUrl, siteUrl: `https://${domain}` }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
        <p className="font-['DM_Sans'] text-sm text-emerald-400">
          ✓ Report sent! Check your inbox for the full audit of <strong>{domain}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-['DM_Sans'] font-semibold text-white">
            📧 Get this report in your inbox
          </p>
          <p className="font-['DM_Sans'] text-sm text-gray-400">
            We&apos;ll email you a copy of this audit so you can reference it later.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 font-['DM_Sans'] text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors w-full sm:w-auto"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="whitespace-nowrap rounded-lg bg-indigo-500 px-5 py-2.5 font-['DM_Sans'] text-sm font-semibold text-white transition-all hover:bg-indigo-400 disabled:opacity-50"
          >
            {status === "loading" ? "Sending..." : "Email me"}
          </button>
        </form>
      </div>
      {status === "error" && (
        <p className="mt-2 font-['DM_Sans'] text-xs text-red-400">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}

function ShareReportBar({ domain }: { domain: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = `${window.location.origin}/report/${domain}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-[#13161f] px-6 py-4">
      <p className="font-['DM_Sans'] text-sm text-gray-400">
        🔗 Share this report with your team or client
      </p>
      <button
        onClick={handleCopy}
        className="rounded-lg border border-white/10 px-4 py-2 font-['DM_Sans'] text-sm font-semibold text-white transition-all hover:bg-white/5"
      >
        {copied ? "✓ Copied!" : "Copy link"}
      </button>
    </div>
  );
}
