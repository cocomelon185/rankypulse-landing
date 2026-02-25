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

type ErrorKind = "unreachable" | "rate_limited" | "timeout" | "failed";

export function AuditDomainClient({ domain }: { domain: string }) {
  const { highlightedId, scrollToIssue } = useScrollToIssue();

  // ── Local loading state — decoupled from Zustand ──
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<ErrorKind | null>(null);

  // Prevent double-fetch in React StrictMode
  const hasFetched = useRef(false);
  // Track start time so we can enforce minimum display times
  const crawlStartTime = useRef(0);

  const setData = useAuditStore((s) => s.setData);

  // Delays a callback so the loading screen always shows for at least `minMs`
  const withMinTime = (minMs: number, fn: () => void) => {
    const elapsed = Date.now() - crawlStartTime.current;
    const remaining = Math.max(0, minMs - elapsed);
    setTimeout(fn, remaining);
  };

  const runCrawl = () => {
    hasFetched.current = true;
    crawlStartTime.current = Date.now();
    setIsLoading(true);
    setLoadError(null);

    const controller = new AbortController();
    // 45s hard timeout — PSI can be slow on cold starts
    const timeoutId = setTimeout(() => controller.abort(), 45_000);

    fetch(`/api/crawl?domain=${encodeURIComponent(domain)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        if (data.error === "unreachable") {
          // 2s minimum so the loading screen doesn't flash and vanish
          withMinTime(2_000, () => {
            setLoadError("unreachable");
            setIsLoading(false);
          });
          return;
        }

        if (data.error === "rate_limited") {
          withMinTime(2_000, () => {
            setLoadError("rate_limited");
            setIsLoading(false);
          });
          return;
        }

        // ✅ Success — 4s minimum so the staged animation always feels intentional
        withMinTime(4_000, () => {
          setData(data);
          setIsLoading(false);
        });
      })
      .catch((err: unknown) => {
        clearTimeout(timeoutId);
        const isAbort = err instanceof DOMException && err.name === "AbortError";
        withMinTime(2_000, () => {
          setLoadError(isAbort ? "timeout" : "failed");
          setIsLoading(false);
        });
      });
  };

  useEffect(() => {
    if (hasFetched.current) return;
    runCrawl();
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
          hasFetched.current = false;
          runCrawl();
        }}
      />
    );
  }

  if (loadError) {
    return (
      <GenericErrorState
        domain={domain}
        onRetry={() => {
          hasFetched.current = false;
          runCrawl();
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
