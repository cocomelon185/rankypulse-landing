"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Copy } from "lucide-react";
import { track } from "@/lib/analytics";
import { toast } from "sonner";
import { SerpPreviewCard } from "./SerpPreviewCard";

type AuditIssue = {
  id: string;
  code: string;
  title: string;
  severity: string;
  effortMinutes?: number;
  category?: string;
  suggestedFix?: string;
  howToFix?: string[]; // optional, from API in future
};

function severityColor(severity: string): string {
  const s = severity.toUpperCase();
  if (s === "HIGH" || s === "CRITICAL") return "bg-amber-100 text-amber-800 border-amber-200";
  if (s === "MED" || s === "MEDIUM") return "bg-blue-50 text-blue-800 border-blue-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function getPotentialLift(severity: string): number {
  const s = severity.toUpperCase();
  if (s === "HIGH" || s === "CRITICAL") return 5;
  if (s === "MED" || s === "MEDIUM") return 3;
  return 1;
}

/** Derive fix steps from suggestedFix, howToFix, or safe template by category/code */
function getFixSteps(issue: AuditIssue): string[] {
  if (Array.isArray(issue.howToFix) && issue.howToFix.length > 0) {
    return issue.howToFix.filter((s) => typeof s === "string" && s.trim()).slice(0, 4);
  }
  if (issue.suggestedFix?.trim()) {
    const text = issue.suggestedFix.trim();
    const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
    if (sentences.length >= 1) return sentences.slice(0, 4);
  }
  const cat = (issue.category ?? "").toLowerCase();
  const code = (issue.code ?? "").toLowerCase();
  if (cat.includes("canonical") || code.includes("canonical")) {
    return [
      "Add a canonical tag to the page head pointing to the preferred URL.",
      "Ensure canonical URLs are consistent across internal links.",
    ];
  }
  if (cat.includes("meta") || code.includes("meta")) {
    return [
      "Add a unique meta title (50–60 chars) describing the page.",
      "Add a meta description (140–160 chars) summarizing the content.",
    ];
  }
  if (cat.includes("schema") || code.includes("schema")) {
    return [
      "Add structured data (JSON-LD) relevant to your content type.",
      "Validate markup with Google Rich Results Test.",
    ];
  }
  if (cat.includes("performance") || code.includes("performance") || code.includes("core")) {
    return [
      "Optimize images (compress, use modern formats).",
      "Minimize render-blocking resources where possible.",
    ];
  }
  if (cat.includes("heading") || code.includes("heading")) {
    return [
      "Use a single H1 per page with your target keyword.",
      "Structure content with logical H2/H3 hierarchy.",
    ];
  }
  if (cat.includes("image") || code.includes("image")) {
    return [
      "Add descriptive alt text to all images.",
      "Use concise, keyword-relevant filenames.",
    ];
  }
  if (cat.includes("link") || code.includes("link")) {
    return [
      "Fix broken links or replace with valid URLs.",
      "Ensure internal links use descriptive anchor text.",
    ];
  }
  return [
    "Review the issue in your CMS or code.",
    "Apply the recommended fix and re-run the audit.",
  ];
}

interface IssueRowProps {
  issue: AuditIssue;
  showFixAction?: boolean;
  /** Compact mode for Top fixes block */
  compact?: boolean;
  /** DOM id for scroll target (compact mode Fix button) */
  scrollTargetId?: string;
  /** Override impact text (compact mode) */
  impactText?: string;
  /** Optional "Why it matters" line (Top fixes block only) */
  whyItMattersText?: string | null;
  /** DOM id for scroll-into-view */
  id?: string;
  /** For Meta Description issues: page title for SERP preview */
  pageTitle?: string;
  /** For Meta Description issues: display URL (e.g., example.com › page) */
  pageDisplayUrl?: string;
  /** For Meta Description issues: current meta description if present */
  metaDescription?: string | null;
}

function isMetaDescriptionIssue(issue: AuditIssue): boolean {
  const cat = (issue.category ?? "").toLowerCase();
  const code = (issue.code ?? "").toLowerCase();
  return (cat.includes("meta") && code.includes("meta_description")) || code.includes("meta_description_missing");
}

export function IssueRow({
  issue,
  showFixAction = false,
  compact = false,
  scrollTargetId,
  impactText,
  whyItMattersText,
  id,
  pageTitle,
  pageDisplayUrl,
  metaDescription,
}: IssueRowProps) {
  const [expanded, setExpanded] = useState(false);
  const steps = getFixSteps(issue);
  const lift = getPotentialLift(issue.severity);

  const displayImpact = impactText ?? (issue.suggestedFix
    ? issue.suggestedFix.slice(0, 80) + (issue.suggestedFix.length > 80 ? "…" : "")
    : `Fixes in ${issue.effortMinutes ?? 5} minutes`);

  const actionLabel = compact && scrollTargetId ? "Go to fix" : "Fix now";
  const expandLabel = "View fix steps";

  function handleCopySteps() {
    const text = steps.join("\n• ").replace(/^/, "• ");
    navigator.clipboard.writeText(text).then(
      () => toast.success("Fix steps copied", { duration: 2000 }),
      () => toast.error("Could not copy")
    );
  }

  function handleFixClick() {
    track("fix_button_click", {
      issueId: issue.id,
      severity: issue.severity,
      category: issue.category ?? "",
    });
    if (scrollTargetId && typeof document !== "undefined") {
      const el = document.getElementById(scrollTargetId);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function handleLinkFixClick() {
    track("fix_button_click", {
      issueId: issue.id,
      severity: issue.severity,
      category: issue.category ?? "",
    });
  }

  return (
    <div
      id={id}
      className={`rounded-xl border border-gray-200 bg-white shadow-sm ${
        compact ? "p-3" : "p-4"
      }`}
      style={{ contain: "layout" }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${severityColor(issue.severity)}`}
            >
              {issue.severity}
            </span>
            {!compact && issue.category && (
              <span className="text-xs text-gray-500">{issue.category}</span>
            )}
            {!compact && (
              <span
                className="inline-flex items-center gap-1 text-[10px] text-gray-500"
                title="Estimated from severity and typical SEO impact."
              >
                Potential lift: +{lift}
                <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-600">Estimated</span>
              </span>
            )}
          </div>
          <h3 className="mt-1.5 text-sm font-semibold text-[#1B2559]">{issue.title}</h3>
          {compact ? (
            <div className="mt-1 space-y-0.5 text-xs text-gray-600">
              <p><span className="font-medium text-gray-500">Impact:</span> {displayImpact}</p>
              {whyItMattersText && (
                <p><span className="font-medium text-gray-500">Why it matters:</span> {whyItMattersText}</p>
              )}
            </div>
          ) : (
            <p className="mt-1 text-xs text-gray-600">{displayImpact}</p>
          )}
          {!compact && typeof issue.effortMinutes === "number" && (
            <span className="mt-1.5 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
              ~{issue.effortMinutes} min
            </span>
          )}
        </div>
        {showFixAction && (
          compact && scrollTargetId ? (
            <button
              type="button"
              onClick={handleFixClick}
              className="shrink-0 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4318ff]/20"
            >
              {actionLabel}
            </button>
          ) : (
            <Link
              href="/dashboard?view=quickwins"
              onClick={handleLinkFixClick}
              className="shrink-0 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4318ff]/20"
            >
              {actionLabel}
            </Link>
          )
        )}
      </div>

      {/* Expandable "How to fix" – hidden in compact mode */}
      {!compact && steps.length > 0 && (
        <div className="mt-2.5 border-t border-gray-100 pt-2">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#4318ff] hover:underline"
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            )}
            {expandLabel}
          </button>
          {expanded && (
            <div className="mt-2 space-y-1 pl-4">
              <ul className="list-disc space-y-0.5 text-xs text-gray-700">
                {steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
              <button
                type="button"
                onClick={handleCopySteps}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden />
                Copy fix steps
              </button>
            </div>
          )}
        </div>
      )}

      {/* SERP preview for Meta Description issues */}
      {isMetaDescriptionIssue(issue) && (pageTitle || pageDisplayUrl) && (
        <SerpPreviewCard
          title={pageTitle ?? "Page Title"}
          displayUrl={pageDisplayUrl ?? "example.com"}
          metaDescription={metaDescription}
          isMissing={!metaDescription?.trim()}
        />
      )}
    </div>
  );
}
