"use client";

import { useState } from "react";
import { Copy, Check, Lock, Zap } from "lucide-react";
import { getIssueContent } from "@/lib/quickwins/issueCatalog";
import { useSession } from "next-auth/react";

interface FixAssistantDrawerProps {
  issueId: string;
  issueTitle?: string;
}

export function FixAssistantDrawer({ issueId, issueTitle }: FixAssistantDrawerProps) {
  const { data: session } = useSession();
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const userPlan = (session?.user as { plan?: string } | undefined)?.plan ?? "free";
  const isPro = userPlan === "pro";

  const content = getIssueContent(issueId, issueTitle);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      // Clipboard not available (non-secure context)
    }
  };

  return (
    <div className="mt-5 rounded-xl border border-white/[0.06] bg-black/30">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
        <Zap className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
        <span className="text-xs font-semibold text-[var(--text-primary)]">Fix Assistant</span>
        {!isPro && (
          <span className="ml-auto flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
            <Lock className="h-2.5 w-2.5" /> Pro
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Preview / Full fix */}
        {isPro ? (
          <div className="space-y-3">
            <p className="text-xs font-medium text-[var(--text-secondary)]">{content.aiFixPreview}</p>
            {content.aiFixFull && (
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-emerald-300">
                {content.aiFixFull}
              </pre>
            )}
          </div>
        ) : (
          <div className="relative">
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">{content.aiFixPreview}</p>
            {/* Blur overlay for full content */}
            <div className="pointer-events-none mt-2 select-none overflow-hidden rounded-lg">
              <pre className="blur-sm select-none whitespace-pre-wrap rounded-lg bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-emerald-300 opacity-50">
                {content.aiFixFull?.slice(0, 120)}...
              </pre>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
              <Lock className="h-3.5 w-3.5 shrink-0 text-amber-400" />
              <p className="text-xs text-[var(--text-secondary)]">
                Full code fix available on{" "}
                <a href="/pricing" className="font-semibold text-amber-400 hover:underline">
                  Pro plan
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Template snippet (shown to all if available) */}
        {content.templateSnippet && (
          <div className="mt-3">
            <div className="flex items-center justify-between rounded-t-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                Template
              </span>
              <button
                type="button"
                onClick={() => handleCopy(content.templateSnippet!)}
                className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)] transition hover:bg-white/[0.06] hover:text-white"
              >
                {copyState === "copied" ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto rounded-b-lg border border-t-0 border-white/[0.08] bg-black/40 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-sky-300">
              {content.templateSnippet}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
