"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart2, Search, FileCheck, X, ArrowUpRight, Link2, FileText, Zap } from "lucide-react";
import { track, getVariant } from "@/lib/analytics";

export type RoadmapIssue = {
  id: string;
  title: string;
  severity: string;
  /** Derived impact label, e.g. "improves crawlability" */
  impactLabel?: string;
};

interface UnlockUpsellSectionProps {
  onUpgrade?: () => void;
  /** When true, opens the preview modal instead of navigating directly */
  onOpenRoadmapModal?: () => void;
  /** Number of issues beyond the top 3 shown */
  additionalIssuesCount?: number;
  /** Total issues in audit */
  totalIssuesCount?: number;
  /** Top issues for roadmap timeline (title, severity, impactLabel) */
  topIssues?: RoadmapIssue[];
  /** Current SEO score for competitor chart thumbnail */
  yourScore?: number;
  /** When true, use outcome-driven copy and value bullets */
  useConversionB?: boolean;
  /** For analytics: safe domain */
  analyticsUrl?: string;
  /** For analytics: issue count */
  analyticsIssueCount?: number;
  /** For analytics: top fix id */
  analyticsTopFixId?: string;
}

const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MED", "MEDIUM", "LOW"] as const;

function sortBySeverity<T extends { severity: string }>(issues: T[]): T[] {
  return [...issues].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(b.severity.toUpperCase() as (typeof SEVERITY_ORDER)[number]) -
      SEVERITY_ORDER.indexOf(a.severity.toUpperCase() as (typeof SEVERITY_ORDER)[number])
  );
}

/** Map issue to small icon for roadmap step */
function getStepIcon(issue: RoadmapIssue): typeof Link2 {
  const title = (issue.title ?? "").toLowerCase();
  const impact = (issue.impactLabel ?? "").toLowerCase();
  if (impact.includes("crawlability") || title.includes("canonical")) return Link2;
  if (impact.includes("ctr") || impact.includes("click") || title.includes("meta")) return FileText;
  if (impact.includes("speed") || title.includes("image")) return Zap;
  return FileCheck;
}

/** Minimal competitor chart thumbnail for modal preview */
function CompetitorChartThumbnail({ yourScore }: { yourScore: number }) {
  const comp = Math.min(100, yourScore + 8);
  const max = Math.max(yourScore, comp, 60);
  const yourW = Math.round((yourScore / max) * 100);
  const compW = Math.round((comp / max) * 100);
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50/80 p-2.5">
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className="w-14 shrink-0 text-[10px] text-gray-500">Your site</span>
          <div className="h-3 flex-1 overflow-hidden rounded bg-gray-200">
            <div className="h-full rounded bg-[#4318ff]" style={{ width: `${yourW}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-14 shrink-0 text-[10px] text-gray-500">Competitor</span>
          <div className="h-3 flex-1 overflow-hidden rounded bg-gray-200">
            <div className="h-full rounded bg-gray-400" style={{ width: `${compW}%` }} />
          </div>
        </div>
      </div>
      <p className="mt-1 text-[9px] text-gray-400">Unlock to see real data</p>
    </div>
  );
}

export interface UpgradePreviewModalProps {
  onClose: () => void;
  additionalIssuesCount: number;
  yourScore: number;
  /** For analytics: safe domain */
  analyticsUrl?: string;
  /** For analytics: issue count */
  analyticsIssueCount?: number;
  /** For analytics: top fix id */
  analyticsTopFixId?: string;
}

export function UpgradePreviewModal({
  onClose,
  additionalIssuesCount,
  yourScore,
  analyticsUrl,
  analyticsIssueCount,
  analyticsTopFixId,
}: UpgradePreviewModalProps) {
  const router = useRouter();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function handleContinue() {
    track("cta_unlock_roadmap_click", {
      placement: "upgrade_modal",
      url: analyticsUrl ?? "",
      issue_count: analyticsIssueCount ?? 0,
      top_fix_id: analyticsTopFixId ?? "",
      variant: getVariant(),
    });
    onClose();
    track("modal_continue");
    router.push("/pricing?source=audit");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-preview-title"
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 id="upgrade-preview-title" className="pr-8 text-base font-bold text-[#1B2559]">
          What you&apos;ll unlock
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          <li className="flex items-center gap-2">
            <span className="text-[#4318ff]">•</span>
            All issue checks (not just preview)
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#4318ff]">•</span>
            Competitor gap benchmark
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#4318ff]">•</span>
            Page-level weekly action plan
          </li>
        </ul>

        <div className="mt-3">
          <CompetitorChartThumbnail yourScore={yourScore} />
        </div>

        <button
          type="button"
          onClick={handleContinue}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4318ff] to-[#6d4cff] text-sm font-semibold text-white shadow-md hover:from-[#3311db] hover:to-[#5a3dd9]"
        >
          Unlock your full 7-day SEO roadmap
        </button>
      </div>
    </div>
  );
}

export function UnlockUpsellSection({
  onUpgrade,
  onOpenRoadmapModal,
  additionalIssuesCount = 0,
  totalIssuesCount = 3,
  topIssues = [],
  yourScore = 68,
  useConversionB = false,
  analyticsUrl,
  analyticsIssueCount,
  analyticsTopFixId,
}: UnlockUpsellSectionProps) {
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const sortedIssues = sortBySeverity(topIssues);
  const roadmapDays = sortedIssues.slice(0, 3);

  const pricingStartsAt = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_PRICING_STARTS_AT : undefined;
  const ctaMicrocopy = pricingStartsAt
    ? `Plans start at $${pricingStartsAt}/mo`
    : "Unlock takes < 1 minute · Cancel anytime";

  const unlockItems = useConversionB
    ? [
        "All issue checks (not just preview)",
        "Competitor gap benchmark",
        "Page-level weekly action plan",
      ]
    : [
        additionalIssuesCount > 0
          ? `Unlock: ${additionalIssuesCount} additional issue${additionalIssuesCount !== 1 ? "s" : ""}`
          : "Unlock: all issues",
        "+ competitor benchmark",
        "+ page-level roadmap",
      ];

  const supportingCopy = useConversionB
    ? "Unlock your full 7-day SEO roadmap and see every fix, benchmark, and action plan."
    : additionalIssuesCount > 0
      ? `See ${additionalIssuesCount} more issues, competitor benchmarks, and step-by-step fixes.`
      : "See all issues, competitor benchmarks, and page-level fixes.";

  const icons = [BarChart2, Search, FileCheck];

  const handleCtaClick = (e: React.MouseEvent) => {
    track("cta_unlock_roadmap_click", {
      placement: "unlock_upsell",
      url: analyticsUrl ?? "",
      issue_count: analyticsIssueCount ?? 0,
      top_fix_id: analyticsTopFixId ?? "",
      variant: getVariant(),
    });
    track("roadmap_cta_click");
    onUpgrade?.();
    if (onOpenRoadmapModal) {
      onOpenRoadmapModal();
      e.preventDefault();
    } else {
      setShowPreviewModal(true);
      e.preventDefault();
    }
    track("modal_open");
  };

  return (
    <>
      <div
        className="rounded-xl border-2 border-[#4318ff]/25 bg-gradient-to-br from-[#eff6ff] to-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
        style={{ contain: "layout" }}
        role="region"
        aria-labelledby="unlock-upsell-heading"
      >
        <h2 id="unlock-upsell-heading" className="text-base font-bold text-[#1B2559]">
          {useConversionB ? "Unlock your full 7-day SEO roadmap" : "Start my SEO improvement plan"}
        </h2>
        <p className="mt-1 text-sm text-gray-600">{supportingCopy}</p>
        <ul className="mt-2.5 space-y-2" aria-label="What you unlock">
          {unlockItems.map((label, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <li key={label} className="flex items-center gap-3 text-sm text-gray-600">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4318ff]/10 text-[#4318ff]">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                {label}
              </li>
            );
          })}
        </ul>

        {/* Roadmap timeline – step-by-step plan, not a list */}
        {roadmapDays.length > 0 && (
          <div className="mt-4 rounded-xl border-2 border-[#4318ff]/15 bg-white/90 p-4 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1B2559]">
              Your improvement roadmap
            </h3>
            <div className="mt-3 border-l-2 border-[#4318ff]/25 pl-5">
              {roadmapDays.map((issue, i) => {
                const Icon = getStepIcon(issue);
                const impact = issue.impactLabel ?? "improves SEO";
                return (
                  <div key={issue.id} className="relative -ml-[22px] mb-4 last:mb-0">
                    <div className="absolute left-0 top-0 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-2 border-[#4318ff]/30 bg-white shadow-sm text-[#4318ff]">
                      <Icon className="h-4 w-4" aria-hidden />
                    </div>
                    <div className="pl-4">
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 font-bold text-[#4318ff]">Day {i + 1}</span>
                        <span
                          className="inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
                          style={{
                            backgroundColor: "rgba(67,24,255,0.06)",
                            borderColor: "rgba(67,24,255,0.2)",
                          }}
                        >
                          {issue.severity}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm font-semibold text-[#1B2559]">{issue.title}</p>
                      <p className="mt-0.5 text-xs text-gray-600">→ {impact}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#4318ff]/5 px-3 py-2">
              <ArrowUpRight className="h-4 w-4 shrink-0 text-[#4318ff]" aria-hidden />
              <p className="text-xs font-medium text-[#4318ff]">
                Expected: Improved visibility within 3–7 days
              </p>
            </div>
          </div>
        )}

        <p className="mt-2 text-xs text-gray-500">
          You&apos;re viewing the summary. Unlock for the full roadmap.
        </p>
        <a
          href="/pricing?source=audit"
          onClick={handleCtaClick}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4318ff] to-[#6d4cff] text-sm font-semibold text-white shadow-md hover:from-[#3311db] hover:to-[#5a3dd9]"
        >
          {useConversionB ? "Unlock full roadmap in < 1 minute" : "Start my SEO improvement plan"}
        </a>
        <p className="mt-2 text-center text-xs text-gray-600">
          {useConversionB ? "Cancel anytime · Used by 1,200+ sites" : "This creates your step-by-step plan to increase visibility."}
        </p>
        {!useConversionB && (
          <p className="mt-0.5 text-center text-[10px] text-gray-400">{ctaMicrocopy}</p>
        )}
      </div>

      {showPreviewModal && !onOpenRoadmapModal && (
        <UpgradePreviewModal
          onClose={() => setShowPreviewModal(false)}
          additionalIssuesCount={additionalIssuesCount}
          yourScore={yourScore}
          analyticsUrl={analyticsUrl}
          analyticsIssueCount={analyticsIssueCount}
          analyticsTopFixId={analyticsTopFixId}
        />
      )}
    </>
  );
}
