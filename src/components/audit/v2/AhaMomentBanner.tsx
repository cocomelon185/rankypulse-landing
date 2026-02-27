"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuditStore } from "@/lib/use-audit";
import { useFixGate } from "@/hooks/useFixGate";
import { FixQuotaModal } from "../FixQuotaModal";

export function AhaMomentBanner() {
  const data = useAuditStore((s) => s.data);
  const setExpandedIssue = useAuditStore((s) => s.setExpandedIssue);
  const { handleFixAction } = useFixGate();
  const [showQuotaModal, setShowQuotaModal] = useState(false);

  const topIssue = data.issues.find(
    (i) => i.status === "open" || i.status === "in-progress"
  );

  const { min: trafficMin, max: trafficMax } = data.estimatedTrafficLoss;

  const handleFixItNow = () => {
    if (!topIssue) return;
    void handleFixAction(topIssue.id, () => {
      setExpandedIssue(topIssue.id);
      setTimeout(() => {
        document.getElementById(`issue-${topIssue.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    }).then((result) => {
      if (result === "quota_exceeded") setShowQuotaModal(true);
    });
  };

  if (!topIssue) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.8, duration: 0.5 }}
    >
      <div
        className="relative overflow-hidden rounded-2xl p-5"
        style={{
          background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.3)",
        }}
      >
        {/* Animated gradient background */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.06), transparent)",
          }}
        />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <span className="shrink-0 text-3xl" role="img" aria-label="warning">
            ⚠️
          </span>

          <div className="min-w-0 flex-1">
            <p className="font-display text-[16px] font-bold leading-snug text-white sm:text-[18px]">
              <span className="text-[var(--accent-primary)]">{data.domain}</span> is leaving{" "}
              <span
                style={{ color: "#a5b4fc" }}
              >
                {trafficMin.toLocaleString()}–{trafficMax.toLocaleString()} visits/month
              </span>{" "}
              on the table
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-secondary)]">
              Your top issue —{" "}
              <span className="font-medium text-white">{topIssue.title}</span> — is the
              fastest fix with the highest return. Most users resolve it in under{" "}
              {topIssue.timeEstimateMinutes} minutes.
            </p>
          </div>

          <button
            type="button"
            onClick={handleFixItNow}
            className="shrink-0 self-start rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(99,102,241,0.4)] active:translate-y-0"
            style={{ background: "#6366f1" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#818cf8")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#6366f1")
            }
          >
            Fix it now →
          </button>
        </div>
      </div>

      {showQuotaModal && <FixQuotaModal onClose={() => setShowQuotaModal(false)} />}
    </motion.div>
  );
}
