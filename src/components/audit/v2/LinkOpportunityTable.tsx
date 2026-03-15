"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Copy,
  Check,
  CheckCircle2,
  Zap,
  Filter,
  TrendingUp,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { AddToRoadmapButton } from "./AddToRoadmapButton";

// ── Styling constants (matching InternalLinksClient.tsx palette) ───────────────
const CARD_BG   = "#151B27";
const BORDER    = "#1E2940";
const ACCENT    = "#FF642D";
const TEXT_MUTED = "#64748B";
const TEXT_DIM   = "#8B9BB4";

// ── Types ─────────────────────────────────────────────────────────────────────
interface LinkSuggestion {
  id: string;
  sourcePage: string;
  contextSnippet: string;   // full snippet; anchorText appears inside it
  anchorText: string;        // substring highlighted orange
  targetPage: string;
  powerBoost: string;        // "+12% Equity"
  impact: number;            // 0-100 for sort
  depth: number;             // page depth for sort
  isOrphanFix: boolean;
}

type SortKey = "impact" | "depth";

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_SUGGESTIONS: LinkSuggestion[] = [
  {
    id: "s1",
    sourcePage: "/blog/what-is-seo",
    contextSnippet: "…to improve your SEO audit strategy with a professional tool…",
    anchorText: "SEO audit",
    targetPage: "/seo-audit-tool",
    powerBoost: "+18% Equity",
    impact: 88,
    depth: 2,
    isOrphanFix: false,
  },
  {
    id: "s2",
    sourcePage: "/guides/technical-seo-checklist",
    contextSnippet: "…pages with hreflang errors often lose multilingual ranking signal…",
    anchorText: "hreflang errors",
    targetPage: "/features/on-page-checker",
    powerBoost: "+14% Equity",
    impact: 74,
    depth: 2,
    isOrphanFix: false,
  },
  {
    id: "s3",
    sourcePage: "/blog/canonical-tags-explained",
    contextSnippet: "…understanding canonical tags is essential before reviewing your pricing…",
    anchorText: "canonical tags",
    targetPage: "/pricing",
    powerBoost: "+9% Equity",
    impact: 61,
    depth: 3,
    isOrphanFix: false,
  },
  {
    id: "s4",
    sourcePage: "/blog/core-web-vitals-guide",
    contextSnippet: "…Core Web Vitals directly affect your search rankings and UX score…",
    anchorText: "Core Web Vitals",
    targetPage: "/guides/fix-core-web-vitals",
    powerBoost: "+21% Equity",
    impact: 92,
    depth: 2,
    isOrphanFix: true,
  },
  {
    id: "s5",
    sourcePage: "/features/competitors",
    contextSnippet: "…compare backlink gaps alongside your internal link architecture…",
    anchorText: "internal link architecture",
    targetPage: "/internal-link-checker",
    powerBoost: "+16% Equity",
    impact: 80,
    depth: 2,
    isOrphanFix: true,
  },
  {
    id: "s6",
    sourcePage: "/seo-audit-for-ecommerce",
    contextSnippet: "…ecommerce sites benefit most from a structured action plan for fixes…",
    anchorText: "action plan",
    targetPage: "/features/action-plan",
    powerBoost: "+11% Equity",
    impact: 67,
    depth: 3,
    isOrphanFix: true,
  },
  {
    id: "s7",
    sourcePage: "/guides/how-to-do-seo-audit",
    contextSnippet: "…rank tracking gives you the data to validate every optimization…",
    anchorText: "rank tracking",
    targetPage: "/position-tracking",
    powerBoost: "+8% Equity",
    impact: 53,
    depth: 3,
    isOrphanFix: false,
  },
  {
    id: "s8",
    sourcePage: "/blog/orphan-pages-seo",
    contextSnippet: "…Orphan Pages often carry hidden ranking potential once discovered…",
    anchorText: "Orphan Pages",
    targetPage: "/seo-audit-tool",
    powerBoost: "+24% Equity",
    impact: 95,
    depth: 4,
    isOrphanFix: true,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function pathLabel(url: string) {
  return url.replace(/^https?:\/\/[^/]+/, "") || "/";
}

/** Splits snippet into [before, anchor, after] for coloring */
function splitSnippet(
  snippet: string,
  anchor: string
): [string, string, string] {
  const idx = snippet.toLowerCase().indexOf(anchor.toLowerCase());
  if (idx === -1) return [snippet, "", ""];
  return [
    snippet.slice(0, idx),
    snippet.slice(idx, idx + anchor.length),
    snippet.slice(idx + anchor.length),
  ];
}

// ── Empty / AI Discovery state ────────────────────────────────────────────────
function AIDiscoveryState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4 rounded-2xl border border-[#FF642D]/20 bg-[#FF642D]/5 px-8 py-14 text-center"
    >
      <div
        className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl"
        style={{ background: "rgba(255,100,45,0.12)" }}
      >
        <Zap size={26} style={{ color: ACCENT }} />
      </div>
      <p className="text-base font-semibold text-white">
        AI Link Discovery in progress…
      </p>
      <p className="max-w-sm text-sm" style={{ color: TEXT_DIM }}>
        We are scanning your anchor text distribution to find ranking shortcuts.
        Results usually appear within 60 seconds.
      </p>
      <div className="mt-1 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: ACCENT }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function LinkOpportunityTable() {
  const [implementedIds, setImplementedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("impact");
  const [orphanOnly, setOrphanOnly] = useState(false);

  const handleCopyHTML = async (s: LinkSuggestion) => {
    const html = `<a href="${s.targetPage}">${s.anchorText}</a>`;
    await navigator.clipboard.writeText(html);
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("HTML copied to clipboard!");
  };

  const handleImplemented = (id: string) => {
    setImplementedIds((prev) => [...prev, id]);
    toast.success("Link implemented ✓", {
      description: "Great work — PageRank will flow on your next crawl.",
    });
  };

  const visible = MOCK_SUGGESTIONS.filter(
    (s) => !implementedIds.includes(s.id) && (!orphanOnly || s.isOrphanFix)
  ).sort((a, b) =>
    sortKey === "impact" ? b.impact - a.impact : a.depth - b.depth
  );

  return (
    <div className="space-y-4">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter size={13} style={{ color: TEXT_MUTED }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
            Sort by
          </span>
          {(
            [
              { key: "impact" as SortKey, label: "Potential Impact", icon: TrendingUp },
              { key: "depth" as SortKey, label: "Page Depth", icon: Layers },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all"
              style={
                sortKey === key
                  ? { borderColor: ACCENT, background: `${ACCENT}18`, color: ACCENT }
                  : { borderColor: BORDER, background: CARD_BG, color: TEXT_DIM }
              }
            >
              <Icon size={11} />
              {label}
            </button>
          ))}
        </div>

        {/* Orphan filter */}
        <button
          onClick={() => setOrphanOnly((v) => !v)}
          className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-all"
          style={
            orphanOnly
              ? { borderColor: "#7B5CF5", background: "rgba(123,92,245,0.12)", color: "#a78bfa" }
              : { borderColor: BORDER, background: CARD_BG, color: TEXT_DIM }
          }
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: orphanOnly ? "#a78bfa" : TEXT_MUTED }}
          />
          Orphan Fixes Only
        </button>
      </div>

      {/* Summary count */}
      <p className="text-xs" style={{ color: TEXT_MUTED }}>
        {visible.length} link suggestion{visible.length !== 1 ? "s" : ""} —
        add these to recover potential equity and ranking signal.
      </p>

      {/* Rows */}
      {visible.length === 0 ? (
        <AIDiscoveryState />
      ) : (
        <AnimatePresence initial={false}>
          {visible.map((s) => {
            const [before, anchor, after] = splitSnippet(s.contextSnippet, s.anchorText);
            const isCopied = copiedId === s.id;

            return (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: "hidden" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="rounded-xl border p-4"
                style={{ background: CARD_BG, borderColor: BORDER }}
              >
                {/* Top row: source → target + boost badge */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {s.isOrphanFix && (
                    <span className="rounded-full border border-[#7B5CF5]/30 bg-[#7B5CF5]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#a78bfa]">
                      Orphan Fix
                    </span>
                  )}
                  <code
                    className="max-w-[180px] truncate rounded px-2 py-0.5 font-mono text-[11px]"
                    style={{ background: "#0D1424", color: "#94A3B8" }}
                    title={s.sourcePage}
                  >
                    {pathLabel(s.sourcePage)}
                  </code>
                  <ArrowRight size={13} style={{ color: ACCENT, flexShrink: 0 }} />
                  <code
                    className="max-w-[180px] truncate rounded px-2 py-0.5 font-mono text-[11px]"
                    style={{ background: "#0D1424", color: "#94A3B8" }}
                    title={s.targetPage}
                  >
                    {pathLabel(s.targetPage)}
                  </code>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    {s.powerBoost}
                  </span>
                </div>

                {/* Context snippet with highlighted anchor text */}
                <p className="mb-3 text-[12px] leading-relaxed" style={{ color: TEXT_DIM }}>
                  {before}
                  <span className="font-semibold" style={{ color: ACCENT }}>
                    {anchor}
                  </span>
                  {after}
                </p>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCopyHTML(s)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                    style={
                      isCopied
                        ? { background: "rgba(34,197,94,0.12)", color: "#22C55E" }
                        : { background: BORDER, color: TEXT_DIM }
                    }
                  >
                    {isCopied ? (
                      <><Check size={12} /> Copied</>
                    ) : (
                      <><Copy size={12} /> Copy Link HTML</>
                    )}
                  </button>
                  <button
                    onClick={() => handleImplemented(s.id)}
                    className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80"
                    style={{ borderColor: "#22C55E40", background: "rgba(34,197,94,0.06)", color: "#22C55E" }}
                  >
                    <CheckCircle2 size={12} />
                    Mark as Implemented
                  </button>
                  <AddToRoadmapButton
                    task={{
                      id: `link-${s.id}`,
                      type: "LINK",
                      title: `Add link: ${s.anchorText} → ${s.targetPage}`,
                      description: `From ${s.sourcePage}: ${s.contextSnippet}`,
                      impact: s.impact >= 75 ? "HIGH" : "MED",
                      effort: "15 min",
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
}
