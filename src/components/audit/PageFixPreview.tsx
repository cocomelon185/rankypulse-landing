"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { X, Copy, Check, Sparkles, Lock } from "lucide-react";
import { track } from "@/lib/analytics";
import type { AffectedPage, PageType } from "@/lib/audit-issue-presentation";

interface PageFixPreviewProps {
  open: boolean;
  page: AffectedPage | null;
  issueId: string;
  hostname: string;
  onClose: () => void;
  isPaid?: boolean;
}

type VariantStyle = "Keyword-first" | "Benefit-first" | "CTA-first";

function inferKeyword(url: string): string {
  try {
    const path = new URL(url).pathname;
    const slug = path.split("/").filter(Boolean).pop() || "";
    if (!slug) return "Your Brand";
    return slug
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return "Your Primary Keyword";
  }
}

function generateVariants(
  page: AffectedPage,
  hostname: string,
  tone: string,
  cta: string,
): { label: VariantStyle; text: string }[] {
  const brand = hostname.replace(/^www\./, "").split(".")[0];
  const brandCap = brand.charAt(0).toUpperCase() + brand.slice(1);
  const keyword = inferKeyword(page.url);
  const toneAdj = tone ? ` ${tone.trim()}` : "";
  const ctaSuffix = cta ? ` ${cta.trim()}` : "";

  const templates: Record<PageType, { label: VariantStyle; text: string }[]> = {
    Home: [
      { label: "Keyword-first", text: `${keyword}${toneAdj} solutions \u2014 ${brandCap} is trusted by thousands. Get started free and see results in minutes.${ctaSuffix}` },
      { label: "Benefit-first", text: `Discover how ${brandCap} helps you achieve your goals.${toneAdj ? ` ${toneAdj.trim()} approach.` : ""} Simple, fast, and effective.${ctaSuffix || " Try it today."}` },
      { label: "CTA-first", text: `${ctaSuffix || "Start your free trial now"} \u2014 ${keyword}${toneAdj} made simple with ${brandCap}. Join thousands of satisfied customers.` },
    ],
    Pricing: [
      { label: "Keyword-first", text: `${keyword} pricing \u2014 compare ${brandCap} plans.${toneAdj ? ` ${toneAdj.trim()} and` : ""} Find the perfect plan for your needs.${ctaSuffix || " Start free today."}` },
      { label: "Benefit-first", text: `Transparent pricing for ${brandCap}. No hidden fees.${toneAdj ? ` ${toneAdj.trim()} plans.` : ""} Choose what fits your budget.${ctaSuffix}` },
      { label: "CTA-first", text: `${ctaSuffix || "Get started free"} \u2014 ${brandCap} pricing: affordable${toneAdj} plans. Upgrade anytime as you grow.` },
    ],
    Product: [
      { label: "Keyword-first", text: `${keyword} by ${brandCap} \u2014${toneAdj} the complete solution for modern teams.${ctaSuffix || " See features and get started."}` },
      { label: "Benefit-first", text: `Explore ${brandCap}\u2019s ${keyword.toLowerCase()} features.${toneAdj ? ` ${toneAdj.trim()} tools.` : " Powerful tools."} Designed for results.${ctaSuffix || " Try free."}` },
      { label: "CTA-first", text: `${ctaSuffix || "Try free today"} \u2014 discover ${keyword.toLowerCase()}${toneAdj} capabilities with ${brandCap}. Built for speed.` },
    ],
    Blog: [
      { label: "Keyword-first", text: `${keyword}:${toneAdj} a complete guide with practical strategies.${ctaSuffix || ` Read more on the ${brandCap} blog.`}` },
      { label: "Benefit-first", text: `Learn about ${keyword.toLowerCase()} \u2014${toneAdj} expert insights and actionable tips from ${brandCap}.${ctaSuffix}` },
      { label: "CTA-first", text: `${ctaSuffix || "Read the full guide"} \u2014 everything about ${keyword.toLowerCase()}.${toneAdj ? ` ${toneAdj.trim()} insights.` : ""} Data-driven from ${brandCap}.` },
    ],
    Contact: [
      { label: "Keyword-first", text: `Contact ${brandCap} \u2014${toneAdj} support for your ${keyword.toLowerCase()} questions. We respond within 24 hours.${ctaSuffix}` },
      { label: "Benefit-first", text: `Get in touch with ${brandCap}.${toneAdj ? ` ${toneAdj.trim()} team.` : ""} We\u2019re ready to help with your needs.${ctaSuffix}` },
      { label: "CTA-first", text: `${ctaSuffix || "Reach out now"} \u2014 ${brandCap}\u2019s${toneAdj} team is here to help you succeed. Fast, friendly support.` },
    ],
    Other: [
      { label: "Keyword-first", text: `${keyword} \u2014${toneAdj} ${brandCap} resources and tools. Trusted by thousands.${ctaSuffix}` },
      { label: "Benefit-first", text: `Discover ${keyword.toLowerCase()}${toneAdj} with ${brandCap}. Expert resources designed for real results.${ctaSuffix}` },
      { label: "CTA-first", text: `${ctaSuffix || "Get started today"} \u2014 ${keyword.toLowerCase()}${toneAdj} solutions from ${brandCap}. See the difference.` },
    ],
  };

  return templates[page.pageType] || templates.Other;
}

function CharacterCount({ length }: { length: number }) {
  const color =
    length >= 140 && length <= 160
      ? "text-emerald-600"
      : length > 160
        ? "text-red-500"
        : "text-amber-500";
  const label =
    length >= 140 && length <= 160
      ? "Optimal"
      : length > 160
        ? "Too long"
        : "Too short";

  return (
    <span className={`text-[10px] font-medium ${color}`}>
      {length} chars \u00b7 {label}
    </span>
  );
}

function storageKey(issueId: string, url: string) {
  try {
    return `rankypulse_snippet_${issueId}_${btoa(url).slice(0, 20)}`;
  } catch {
    return `rankypulse_snippet_${issueId}`;
  }
}

function toneStorageKey() {
  return "rankypulse_tone";
}

function ctaStorageKey() {
  return "rankypulse_cta";
}

const VARIANT_STYLE_COLORS: Record<VariantStyle, string> = {
  "Keyword-first": "bg-blue-50 text-blue-700 border-blue-200",
  "Benefit-first": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "CTA-first": "bg-violet-50 text-violet-700 border-violet-200",
};

export function PageFixPreview({ open, page, issueId, hostname, onClose, isPaid }: PageFixPreviewProps) {
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState(() => {
    try { return localStorage.getItem(toneStorageKey()) ?? ""; } catch { return ""; }
  });
  const [cta, setCta] = useState(() => {
    try { return localStorage.getItem(ctaStorageKey()) ?? ""; } catch { return ""; }
  });

  const variants = useMemo(() => {
    if (!page) return [];
    return generateVariants(page, hostname, isPaid ? tone : "", isPaid ? cta : "");
  }, [page, hostname, tone, cta, isPaid]);

  useEffect(() => {
    if (!page || !open) return;
    try {
      const saved = localStorage.getItem(storageKey(issueId, page.url));
      if (saved !== null) {
        const idx = Number(saved);
        if (idx >= 0 && idx < variants.length) setSelectedVariant(idx);
      }
    } catch {}
    track("snippet_variant_generated", { issueId, url: page.url });
  }, [page?.url, issueId, open, variants.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!page || selectedVariant === null) return;
    try {
      localStorage.setItem(storageKey(issueId, page.url), String(selectedVariant));
    } catch {}
  }, [selectedVariant, page, issueId]);

  useEffect(() => {
    if (!open) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  const handleCopy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        track("snippet_copied", { type: "description", issueId, url: page?.url ?? "" });
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    },
    [issueId, page],
  );

  function handleToneChange(v: string) {
    setTone(v);
    try { localStorage.setItem(toneStorageKey(), v); } catch {}
  }

  function handleCtaChange(v: string) {
    setCta(v);
    try { localStorage.setItem(ctaStorageKey(), v); } catch {}
  }

  if (!open || !page) return null;

  const keyword = inferKeyword(page.url);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Page fix preview"
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white p-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#1B2559]">Page Fix Preview</h3>
            <p className="mt-0.5 text-[11px] font-mono text-gray-500 truncate max-w-[350px]">
              {page.url}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-gray-100 shrink-0 ml-2"
            aria-label="Close preview"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Current state */}
        <div className="rounded-lg border border-red-100 bg-red-50/50 p-3 mb-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-red-400 mb-1.5">
            Current
          </p>
          <p className="text-xs text-gray-800">
            <span className="font-medium">Title:</span>{" "}
            <span className="text-gray-400 italic">Not available</span>
          </p>
          <p className="mt-1 text-xs text-gray-800">
            <span className="font-medium">Meta description:</span>{" "}
            <span className="text-red-500 font-semibold">Missing</span>
          </p>
        </div>

        {/* Keyword context */}
        <div className="flex items-center gap-2 mb-3 rounded-lg border border-[#4318ff]/10 bg-[#4318ff]/[0.02] px-3 py-2">
          <Sparkles className="h-3.5 w-3.5 text-[#4318ff] shrink-0" />
          <p className="text-[11px] text-gray-600">
            Primary intent:{" "}
            <span className="font-semibold text-[#1B2559]">{keyword}</span>
            <span className="text-gray-400 ml-1">(inferred from URL)</span>
          </p>
        </div>

        {/* Tone + CTA inputs (paid gate) */}
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50/50 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
              Customize suggestions
            </p>
            {!isPaid && (
              <span className="inline-flex items-center gap-1 text-[9px] font-medium text-gray-400">
                <Lock className="h-2.5 w-2.5" />
                Pro
              </span>
            )}
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-gray-500" htmlFor="tone-input">Brand tone (e.g. friendly, professional)</label>
              <input
                id="tone-input"
                type="text"
                value={tone}
                onChange={(e) => handleToneChange(e.target.value)}
                disabled={!isPaid}
                placeholder="e.g. friendly, authoritative"
                className="mt-0.5 w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 placeholder:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:border-[#4318ff] focus:outline-none focus:ring-1 focus:ring-[#4318ff]/20"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500" htmlFor="cta-input">Custom CTA (e.g. Book a demo)</label>
              <input
                id="cta-input"
                type="text"
                value={cta}
                onChange={(e) => handleCtaChange(e.target.value)}
                disabled={!isPaid}
                placeholder="e.g. Start your free trial"
                className="mt-0.5 w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 placeholder:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:border-[#4318ff] focus:outline-none focus:ring-1 focus:ring-[#4318ff]/20"
              />
            </div>
          </div>
        </div>

        {/* Suggested variants */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-600">
            Suggested variants
          </p>
          {variants.map((variant, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedVariant(idx)}
              className={`w-full rounded-lg border p-3 text-left transition-all ${
                selectedVariant === idx
                  ? "border-[#4318ff] bg-[#4318ff]/5 shadow-sm ring-1 ring-[#4318ff]/20"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`inline-flex rounded border px-1.5 py-0.5 text-[9px] font-medium ${VARIANT_STYLE_COLORS[variant.label]}`}>
                  {variant.label}
                </span>
                <CharacterCount length={variant.text.length} />
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{variant.text}</p>
            </button>
          ))}
        </div>

        {/* Character guide */}
        <div className="mt-3 flex items-center gap-3 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            140\u2013160 optimal
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            &lt;140 short
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            &gt;160 truncated
          </span>
        </div>

        {/* Copy selected */}
        {selectedVariant !== null && (
          <button
            type="button"
            onClick={() => handleCopy(variants[selectedVariant].text)}
            className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#4318ff] text-sm font-semibold text-white hover:bg-[#3311db] transition-colors"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy selected variant"}
          </button>
        )}
      </div>
    </div>
  );
}
