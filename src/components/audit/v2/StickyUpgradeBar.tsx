"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuditStore } from "@/lib/use-audit";

export function StickyUpgradeBar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();
  const data = useAuditStore((s) => s.data);

  const lockedCount = data.roadmap.filter((r) => r.isLocked).length;
  const lockedIssues = data.issues.filter((i) => i.status === "locked");
  const extraMin = lockedIssues.reduce((s, i) => s + i.trafficImpact.min, 0);
  const extraMax = lockedIssues.reduce((s, i) => s + i.trafficImpact.max, 0);

  useEffect(() => {
    // Use IntersectionObserver on the findings section so the bar appears
    // only after the user has actually scrolled PAST the findings — not at
    // an arbitrary pixel offset that breaks at different viewport heights.
    const findingsEl = document.getElementById("findings-section");
    if (!findingsEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show bar when findings section has scrolled above the viewport
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      },
      { threshold: 0, rootMargin: "0px 0px 0px 0px" }
    );

    observer.observe(findingsEl);
    return () => observer.disconnect();
  }, []);

  if (lockedCount === 0 || dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="pointer-events-none fixed inset-x-0 z-[200] flex justify-center"
          style={{ bottom: "24px" }}
        >
          <div
            className="pointer-events-auto flex items-center gap-4 rounded-full px-5 py-3"
            style={{
              background: "rgba(13,15,20,0.95)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(99,102,241,0.35)",
              boxShadow:
                "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)",
            }}
          >
            {/* Pulse dot */}
            <span
              className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
              style={{
                background: "#818cf8",
                animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
              }}
            />

            <p className="whitespace-nowrap text-[13px] text-[var(--text-secondary)]">
              <span className="font-semibold text-white">
                🔒 {lockedCount} {lockedCount === 1 ? "fix" : "fixes"} still locked
              </span>
              {" — "}fix {lockedCount === 1 ? "it" : "them"} to gain +{extraMin}–{extraMax} visits/mo
            </p>

            <button
              type="button"
              onClick={() => router.push("/pricing")}
              className="flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-all duration-150 hover:scale-105 hover:opacity-90 active:scale-100"
              style={{ background: "#6366f1" }}
            >
              Start Free Trial →
            </button>

            {/* Dismiss */}
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 text-lg leading-none text-gray-600 transition-colors hover:text-gray-400"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
