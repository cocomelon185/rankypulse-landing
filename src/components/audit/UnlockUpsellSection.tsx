"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart2, Search, FileCheck, X } from "lucide-react";
import { track } from "@/lib/analytics";

type TopIssue = { id: string; title: string; severity: string };

interface UnlockUpsellSectionProps {
  onUpgrade?: () => void;
  /** Number of issues beyond the top 3 shown */
  additionalIssuesCount?: number;
  /** Total issues in audit */
  totalIssuesCount?: number;
  /** Top issues (by severity) for 7-day roadmap preview */
  topIssues?: TopIssue[];
  /** Current SEO score for competitor chart thumbnail */
  yourScore?: number;
}

const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MED", "MEDIUM", "LOW"] as const;

function sortBySeverity<T extends { severity: string }>(issues: T[]): T[] {
  return [...issues].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(b.severity.toUpperCase() as (typeof SEVERITY_ORDER)[number]) -
      SEVERITY_ORDER.indexOf(a.severity.toUpperCase() as (typeof SEVERITY_ORDER)[number])
  );
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

interface UpgradePreviewModalProps {
  onClose: () => void;
  additionalIssuesCount: number;
  yourScore: number;
}

function UpgradePreviewModal({ onClose, additionalIssuesCount, yourScore }: UpgradePreviewModalProps) {
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
            {additionalIssuesCount > 0
              ? `${additionalIssuesCount} additional issue${additionalIssuesCount !== 1 ? "s" : ""}`
              : "All remaining issues"}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#4318ff]">•</span>
            Competitor benchmark
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#4318ff]">•</span>
            Full page-level roadmap
          </li>
        </ul>

        <div className="mt-3">
          <CompetitorChartThumbnail yourScore={yourScore} />
        </div>

        <Link
          href="/pricing?source=audit"
          onClick={() => {
            track("modal_continue");
            onClose();
          }}
          className="mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-[#4318ff] text-sm font-semibold text-white hover:bg-[#3311db]"
        >
          Continue to pricing
        </Link>
      </div>
    </div>
  );
}

export function UnlockUpsellSection({
  onUpgrade,
  additionalIssuesCount = 0,
  totalIssuesCount = 3,
  topIssues = [],
  yourScore = 68,
}: UnlockUpsellSectionProps) {
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const sortedIssues = sortBySeverity(topIssues);
  const roadmapDays = sortedIssues.slice(0, 3);

  const pricingStartsAt = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_PRICING_STARTS_AT : undefined;
  const ctaMicrocopy = pricingStartsAt
    ? `Plans start at $${pricingStartsAt}/mo`
    : "Unlock takes < 1 minute · Cancel anytime";

  const unlockItems = [
    additionalIssuesCount > 0
      ? `Unlock: ${additionalIssuesCount} additional issue${additionalIssuesCount !== 1 ? "s" : ""}`
      : "Unlock: all issues",
    "+ competitor benchmark",
    "+ page-level roadmap",
  ];

  const supportingCopy =
    additionalIssuesCount > 0
      ? `See ${additionalIssuesCount} more issues, competitor benchmarks, and step-by-step fixes.`
      : "See all issues, competitor benchmarks, and page-level fixes.";

  const icons = [BarChart2, Search, FileCheck];

  const handleCtaClick = (e: React.MouseEvent) => {
    track("roadmap_cta_click");
    onUpgrade?.();
    setShowPreviewModal(true);
    track("modal_open");
    e.preventDefault();
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
          Get my personalized SEO Roadmap
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

        {/* 7-day SEO Roadmap preview */}
        {roadmapDays.length > 0 && (
          <div className="mt-3 rounded-lg border border-gray-200/80 bg-white/80 p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              7-day SEO Roadmap (preview)
            </h3>
            <div className="mt-2 space-y-1.5">
              {roadmapDays.map((issue, i) => (
                <div key={issue.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-12 shrink-0 font-medium text-[#4318ff]">Day {i + 1}:</span>
                  <span className="line-clamp-1">{issue.title}</span>
                </div>
              ))}
              <div className="relative overflow-hidden rounded-md border border-gray-100 bg-gray-50/70 py-2 pl-14 pr-2 pb-8">
                <div className="space-y-1.5 blur-[3px] select-none">
                  <div className="h-3.5 w-full max-w-[85%] rounded bg-gray-200" />
                  <div className="h-3.5 w-full max-w-[70%] rounded bg-gray-200" />
                  <div className="h-3.5 w-full max-w-[90%] rounded bg-gray-200" />
                  <div className="h-3.5 w-full max-w-[60%] rounded bg-gray-200" />
                </div>
                <p className="absolute inset-x-0 bottom-2 text-center text-xs font-semibold text-[#4318ff]">
                  Unlock to see the full 7-day roadmap
                </p>
              </div>
            </div>
          </div>
        )}

        <p className="mt-2 text-xs text-gray-500">
          You&apos;re viewing the summary. Unlock for the full roadmap.
        </p>
        <a
          href="/pricing?source=audit"
          onClick={handleCtaClick}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#4318ff] text-sm font-semibold text-white hover:bg-[#3311db]"
        >
          Get my personalized SEO Roadmap
        </a>
        <p className="mt-1.5 text-center text-xs text-gray-500">{ctaMicrocopy}</p>
      </div>

      {showPreviewModal && (
        <UpgradePreviewModal
          onClose={() => setShowPreviewModal(false)}
          additionalIssuesCount={additionalIssuesCount}
          yourScore={yourScore}
        />
      )}
    </>
  );
}
