"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";

const STAGES = [
  "Crawling pages...",
  "Checking canonicals...",
  "Scanning meta tags...",
  "Analyzing performance...",
  "Calculating score...",
  "Audit complete! ✓",
];

interface ReauditButtonProps {
  onComplete?: () => void;
}

export function ReauditButton({ onComplete }: ReauditButtonProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);

  const runAudit = async () => {
    setIsRunning(true);
    setProgress(0);
    setStage(0);

    for (let i = 0; i < STAGES.length; i++) {
      setStage(i);
      setProgress(Math.round((i / (STAGES.length - 1)) * 100));
      await new Promise<void>((r) =>
        setTimeout(r, 500 + Math.random() * 400)
      );
    }

    await new Promise<void>((r) => setTimeout(r, 400));
    setIsRunning(false);
    onComplete?.();
  };

  if (!isRunning) {
    return (
      <button
        type="button"
        onClick={runAudit}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono-data text-[11px] tracking-widest text-[var(--accent-primary)] transition hover:bg-[var(--accent-primary)]/10"
      >
        <RefreshCw className="h-3 w-3" />
        RE-RUN AUDIT
      </button>
    );
  }

  return (
    <div
      className="min-w-[220px] rounded-xl p-4"
      style={{
        background: "rgba(99,102,241,0.06)",
        border: "1px solid rgba(99,102,241,0.2)",
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono-data text-[10px] tracking-widest text-[var(--accent-primary)]">
          SCANNING
        </span>
        <span className="font-mono-data text-[10px] text-[var(--text-muted)]">
          {progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="mb-2 h-[3px] overflow-hidden rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #6366f1, #10b981)",
          }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={stage}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="text-[11px] text-[var(--text-secondary)]"
        >
          {STAGES[stage]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
