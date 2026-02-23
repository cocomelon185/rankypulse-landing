"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/layout/SectionCard";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Copy,
  Lock,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import type { QuickWin } from "@/lib/quickwins/selectNextWin";

interface QuickWinCardProps {
  win: QuickWin;
  isPro: boolean;
  onMarkFixed: () => void;
}

export function QuickWinCard({ win, isPro, onMarkFixed }: QuickWinCardProps) {
  const [manualOpen, setManualOpen] = useState(false);

  const handleApplyAiFix = () => {
    if (isPro) {
      navigator.clipboard.writeText(win.aiFixFull);
      toast.success("Full fix copied to clipboard! Apply it to your site.");
    }
  };

  const handleCopySnippet = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard!");
  };

  return (
    <SectionCard className="overflow-hidden p-6">
      <h3 className="mb-4 text-lg font-semibold text-[#1B2559]">
        Fix next: {win.title}
      </h3>

      {/* Badges */}
      <div className="mb-4 flex flex-wrap gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            win.impact === "HIGH"
              ? "bg-red-100 text-red-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          Impact: {win.impact}
        </span>
        <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#4318ff]">
          ~{win.effortMinutes} min
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
          {win.category}
        </span>
      </div>

      <p className="mb-6 text-sm text-gray-600">{win.whyItMatters}</p>

      {/* Action area */}
      <div className="mb-6 flex flex-wrap gap-3">
        {isPro ? (
          <Button
            size="md"
            onClick={handleApplyAiFix}
            className="bg-gradient-to-r from-[#4318ff] to-[#7551ff]"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Apply AI Fix
          </Button>
        ) : (
          <Link href="/pricing">
            <Button
              size="md"
              className="bg-gradient-to-r from-[#4318ff] to-[#7551ff]"
            >
              <Lock className="mr-2 h-4 w-4" />
              Unlock AI Fix (Pro)
            </Button>
          </Link>
        )}
        <Button
          variant="secondary"
          size="md"
          onClick={() => setManualOpen((o) => !o)}
        >
          {manualOpen ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" />
              Hide manual steps
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" />
              Show manual steps
            </>
          )}
        </Button>
      </div>

      {/* Locked preview (Free users) */}
      {!isPro && (
        <div className="relative mb-6 overflow-hidden rounded-xl border border-[#4318ff]/20 bg-gradient-to-br from-[#eff6ff]/50 to-white p-4">
          <div className="relative">
            <p className="text-sm text-gray-700 leading-relaxed">
              {win.aiFixPreview}
            </p>
            <div className="pointer-events-none mt-2 h-12 bg-gradient-to-b from-transparent to-white/80" />
            <div className="flex items-center justify-between gap-2 pt-2">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4318ff] transition-colors hover:underline"
              >
                Upgrade to copy full fix
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Manual steps (collapsible) */}
      {manualOpen && (
        <div className="space-y-4 border-t border-gray-100 pt-6">
          <h4 className="font-semibold text-[#1B2559]">Manual steps</h4>
          <ol className="space-y-2">
            {win.manualSteps.map((step, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm text-gray-700"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4318ff]/15 text-xs font-bold text-[#4318ff]">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          {win.templateSnippet && (
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
              <p className="mb-2 text-xs font-semibold text-gray-600">
                Copy template
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <code className="flex-1 break-all rounded-lg bg-white px-3 py-2 text-sm text-gray-700">
                  {win.templateSnippet}
                </code>
                <button
                  onClick={() => handleCopySnippet(win.templateSnippet!)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#4318ff]/10 px-4 py-2.5 text-sm font-semibold text-[#4318ff] transition-colors hover:bg-[#4318ff]/20"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completion row */}
      <div className="mt-6 flex items-center border-t border-gray-100 pt-6">
        <Button variant="secondary" size="sm" onClick={onMarkFixed}>
          Mark as fixed
        </Button>
      </div>
    </SectionCard>
  );
}
