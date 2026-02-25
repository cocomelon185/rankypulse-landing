"use client";

import { motion } from "framer-motion";

interface SerpSnippet {
  title: string;
  url: string;
  description: string;
}

interface SerpPreviewProps {
  before: SerpSnippet;
  after: SerpSnippet;
}

function SerpCard({ snippet, variant }: { snippet: SerpSnippet; variant: "before" | "after" }) {
  const isBefore = variant === "before";

  return (
    <div className="min-w-0 overflow-hidden">
      <p
        className="text-[10px] font-medium truncate"
        style={{ color: isBefore ? "#94a3b8" : "#818cf8" }}
        title={snippet.url}
      >
        {snippet.url}
      </p>
      <h4
        className="mt-0.5 text-[12px] font-semibold leading-snug line-clamp-2"
        style={{ color: isBefore ? "#94a3b8" : "#a5b4fc" }}
      >
        {snippet.title}
      </h4>
      <p
        className="mt-1 text-[11px] leading-relaxed line-clamp-3"
        style={{ color: isBefore ? "#64748b" : "#94a3b8" }}
      >
        {snippet.description || "No meta description — Google will auto-generate a snippet."}
      </p>
    </div>
  );
}

export function SerpPreview({ before, after }: SerpPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-4 overflow-hidden"
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        SERP Preview
      </p>

      <div
        className="overflow-hidden rounded-xl"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Current snippet */}
        <div className="p-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span
            className="mb-1.5 inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest"
            style={{
              background: "rgba(239,68,68,0.12)",
              color: "#fca5a5",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            CURRENT
          </span>
          <SerpCard snippet={before} variant="before" />
        </div>

        {/* Divider arrow */}
        <div
          className="flex items-center justify-center gap-2 py-2"
          style={{
            background: "rgba(99,102,241,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="h-px flex-1" style={{ background: "rgba(99,102,241,0.3)" }} />
          <span className="text-[9px] font-mono-data tracking-widest text-[var(--accent-primary)]">
            ↓ AFTER FIX
          </span>
          <div className="h-px flex-1" style={{ background: "rgba(99,102,241,0.3)" }} />
        </div>

        {/* After fix snippet */}
        <div className="p-3">
          <span
            className="mb-1.5 inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest"
            style={{
              background: "rgba(16,185,129,0.12)",
              color: "#6ee7b7",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            AFTER FIX
          </span>
          <SerpCard snippet={after} variant="after" />
        </div>
      </div>
    </motion.div>
  );
}
