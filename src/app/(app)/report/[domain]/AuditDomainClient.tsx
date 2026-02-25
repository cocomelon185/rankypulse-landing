"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { WifiOff } from "lucide-react";
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
import { useAuditStore } from "@/lib/use-audit";
import type { AuditData } from "@/lib/audit-data";

// Crawl API response can include an 'unreachable' error field
interface CrawlResponse extends Partial<AuditData> {
  error?: string;
  message?: string;
}

export function AuditDomainClient({ domain }: { domain: string }) {
  const { highlightedId, scrollToIssue } = useScrollToIssue();
  const router = useRouter();

  const setData = useAuditStore((s) => s.setData);
  const setLoading = useAuditStore((s) => s.setLoading);
  const setLoadError = useAuditStore((s) => s.setLoadError);
  const isLoading = useAuditStore((s) => s.isLoading);
  const loadError = useAuditStore((s) => s.loadError);

  useEffect(() => {
    if (!domain) return;
    let cancelled = false;

    async function fetchAudit() {
      setLoading(true);
      try {
        const base = window.location.origin;
        const res = await fetch(`${base}/api/crawl?domain=${encodeURIComponent(domain)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as CrawlResponse;

        if (cancelled) return;

        if (json.error === "unreachable") {
          setLoadError("unreachable");
          return;
        }

        // Cast to AuditData — the API shape matches if error is not 'unreachable'
        setData(json as AuditData);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Crawl failed");
        }
      }
    }

    fetchAudit();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  // ── Full-screen loading sequence ──
  if (isLoading) {
    return <AuditLoadingScreen domain={domain} />;
  }

  // ── Unreachable domain error state ──
  if (loadError === "unreachable") {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-6"
        style={{ background: "#0d0f14" }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/5 blur-[100px]" />
        </div>
        <div className="relative max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
            <WifiOff size={28} className="text-red-400" />
          </div>
          <h1 className="mb-3 font-['Fraunces'] text-2xl font-bold text-white">
            Couldn&apos;t reach {domain}
          </h1>
          <p className="mb-8 font-['DM_Sans'] text-sm leading-relaxed text-gray-400">
            This domain may be blocking automated crawlers, or it may not exist.
            Try a different domain, or check that the URL is correct.
          </p>
          <button
            onClick={() => router.push("/")}
            className="rounded-xl bg-indigo-500 px-6 py-3 font-['DM_Sans'] text-sm font-semibold text-white transition-colors hover:bg-indigo-400"
          >
            Try another domain →
          </button>
        </div>
      </div>
    );
  }

  // ── Partial crawl warning (non-critical errors) ──
  const partialWarning =
    loadError && loadError !== "unreachable" ? (
      <div className="mx-auto mb-2 max-w-xl px-4 pt-2 text-center">
        <p className="font-['DM_Sans'] text-xs text-amber-400">
          ⚠️ Showing estimated results — live crawl encountered an issue.
        </p>
      </div>
    ) : null;

  return (
    <div className="audit-dark min-h-screen">
      {partialWarning}

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main content */}
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

          {/* Sticky sidebar */}
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
