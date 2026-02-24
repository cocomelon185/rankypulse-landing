"use client";

import { useEffect } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles } from "lucide-react";

interface AiFixesUpgradeModalProps {
  onClose: () => void;
  /** Called when user chooses "Continue without AI" – keeps them exploring */
  onContinueWithout?: () => void;
}

const BENEFITS = [
  "Step-by-step fixes for every issue",
  "Rewrite suggestions for title & meta tags",
  "Technical guidance tailored to your site",
  "Copy-ready snippets you can implement instantly",
];

export function AiFixesUpgradeModal({ onClose, onContinueWithout }: AiFixesUpgradeModalProps) {
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
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#4318ff]/20 to-[#7551ff]/20">
            <Sparkles className="h-6 w-6 text-[#4318ff]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1B2559]">
              AI Fixes are part of Pro
            </h2>
            <p className="mt-0.5 text-sm text-gray-600">
              $19/month · Pro plan
            </p>
          </div>
        </div>

        <p className="mb-6 text-gray-600">
          Get step-by-step fixes, rewritten tags, and technical guidance for every issue.
        </p>

        <ul className="mb-6 space-y-3">
          {BENEFITS.map((benefit, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-sm text-gray-700"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              {benefit}
            </li>
          ))}
        </ul>

        <div className="space-y-3">
          <Link
            href="https://rankypulse.com/pricing"
            className="block"
            onClick={() => {
              track("upgrade_click", { plan: "Pro", placement: "ai_fixes_modal" });
              onClose();
            }}
          >
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-[#4318ff] to-[#7551ff] text-white hover:opacity-90"
            >
              Unlock AI Fixes
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => {
              onContinueWithout?.();
              onClose();
            }}
            className="block w-full text-center text-sm font-medium text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
          >
            Continue without AI
          </button>
        </div>
      </div>
    </div>
  );
}
