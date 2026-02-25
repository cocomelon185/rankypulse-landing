"use client";

import { useRouter } from "next/navigation";

interface FixQuotaModalProps {
  onClose: () => void;
}

export function FixQuotaModal({ onClose }: FixQuotaModalProps) {
  const router = useRouter();

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative max-w-md rounded-2xl p-6 shadow-xl"
        style={{ background: "#13161f", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
            <span className="text-xl">🔒</span>
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-white">
              Fix limit reached
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              Free plan: 3 fix guides per month
            </p>
          </div>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-[var(--text-secondary)]">
          Upgrade to Starter or Pro for unlimited access to step-by-step fix guides,
          or wait until next month for your quota to reset.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-white/5"
          >
            Maybe later
          </button>
          <button
            type="button"
            onClick={() => router.push("/pricing")}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition"
            style={{ background: "#6366f1" }}
          >
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}
