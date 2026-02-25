"use client";

import { useState, useEffect, useRef } from "react";
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
import { StickyUpgradeBar } from "@/components/audit/v2/StickyUpgradeBar";
import { AuditLoadingScreen } from "@/components/audit/AuditLoadingScreen";
import {
  UnreachableErrorState,
  TimeoutErrorState,
  RateLimitedState,
  GenericErrorState,
} from "@/components/audit/ErrorStates";
import { useAuditStore } from "@/lib/use-audit";
import { MOCK_AUDIT } from "@/lib/audit-data";

type ErrorKind = "unreachable" | "rate_limited" | "timeout" | "failed";

export function AuditDomainClient({ domain: rawDomain }: { domain: string }) {
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

    const crawlUrl = `/api/crawl?domain=${encodeURIComponent(targetDomain)}`;
    if (typeof window !== "undefined") {
      console.log("[audit] Fetching crawl for domain:", targetDomain);
    }
    fetch(crawlUrl, {
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
      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <AuditHero />
            <AhaMomentBanner />
            <SocialProofStrip />
            <IssueRadar />
            <FindingsBoard highlightedId={highlightedId} />
            <TrafficOpportunity />
            <ActionRoadmap onScrollToIssue={scrollToIssue} />
            <CompetitorBenchmark />
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
