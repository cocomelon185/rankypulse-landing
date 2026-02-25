"use client";

import { useState } from "react";
import { Copy, Check, ArrowRight } from "lucide-react";
import { track } from "@/lib/analytics";

interface SerpSnippetPreviewProps {
  hostname: string;
  currentTitle: string | null;
  currentDescription: string | null;
  suggestedTitle: string | null;
  suggestedDescription: string | null;
}

function CopyButton({ text, onCopy }: { text: string; onCopy: () => void }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-500 hover:border-[#4318ff] hover:text-[#4318ff] transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function SnippetBlock({
  label,
  title,
  description,
  displayUrl,
  variant,
}: {
  label: string;
  title: string;
  description: string;
  displayUrl: string;
  variant: "current" | "improved";
}) {
  const isImproved = variant === "improved";
  return (
    <div className={`rounded-lg p-3 ${isImproved ? "border border-emerald-200 bg-emerald-50/40" : "border border-gray-200 bg-gray-50/60"}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${isImproved ? "text-emerald-600" : "text-gray-400"}`}>
          {label}
        </span>
        {isImproved && (
          <div className="flex items-center gap-1.5">
            <CopyButton text={title} onCopy={() => track("serp_snippet_copied", { type: "title" })} />
          </div>
        )}
      </div>
      <p className={`mt-1.5 text-base leading-snug truncate ${isImproved ? "text-[#1a0dab] font-medium" : "text-[#1a0dab]/60"}`}>
        {title}
      </p>
      <p className="text-sm text-[#006621] truncate mt-0.5">{displayUrl}</p>
      <div className="flex items-start justify-between gap-2 mt-0.5">
        <p className={`text-sm line-clamp-2 ${isImproved ? "text-gray-700" : "text-gray-400"}`}>
          {description}
        </p>
        {isImproved && description && (
          <CopyButton text={description} onCopy={() => track("serp_snippet_copied", { type: "description" })} />
        )}
      </div>
    </div>
  );
}

export function SerpSnippetPreview({
  hostname,
  currentTitle,
  currentDescription,
  suggestedTitle,
  suggestedDescription,
}: SerpSnippetPreviewProps) {
  const displayUrl = `${hostname} › page`;
  const hasImprovement = !!(suggestedTitle || suggestedDescription);

  const currTitle = currentTitle || `${hostname} — Page Title`;
  const currDesc = currentDescription || "No meta description set. Google may auto-generate a snippet from page content.";
  const suggTitle = suggestedTitle || currTitle;
  const suggDesc = suggestedDescription || "Add a concise 140–160 character meta description that includes your primary keyword and value proposition.";

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-[#1B2559]">SERP Snippet Preview</h3>
      <p className="mt-0.5 text-xs text-gray-500">How Google likely shows your page in search results.</p>

      <div className="mt-3 space-y-3">
        <SnippetBlock
          label="Current"
          title={currTitle}
          description={currDesc}
          displayUrl={displayUrl}
          variant="current"
        />

        {hasImprovement && (
          <>
            <div className="flex items-center justify-center">
              <ArrowRight className="h-4 w-4 text-emerald-500" aria-hidden />
            </div>
            <SnippetBlock
              label="After fix"
              title={suggTitle}
              description={suggDesc}
              displayUrl={displayUrl}
              variant="improved"
            />
          </>
        )}
      </div>
    </section>
  );
}
