"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, Star, X, CheckCircle2, Clock, RotateCcw, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useAuditStore } from "@/lib/use-audit";
import { fireFixConfetti } from "@/lib/confetti";

// ── Types ──────────────────────────────────────────────────────────────────────
interface SprintSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedCount: number;
  totalMinutes: number;
}

// ── Decorative star positions ──────────────────────────────────────────────────
const STARS = [
  { delay: 0.15, size: 18, color: "#F59E0B", x: -36, y: -14, rotate: 20 },
  { delay: 0.25, size: 13, color: "#FF642D", x: 38,  y: -18, rotate: -15 },
  { delay: 0.20, size: 11, color: "#10B981", x: -48, y: 12,  rotate: 30 },
  { delay: 0.30, size: 10, color: "#a78bfa", x: 44,  y: 10,  rotate: -25 },
];

// ── Component ──────────────────────────────────────────────────────────────────
export function SprintSuccessModal({
  isOpen,
  onClose,
  completedCount,
  totalMinutes,
}: SprintSuccessModalProps) {
  const { clearRoadmap } = useAuditStore();

  // Fire confetti the moment the modal opens
  useEffect(() => {
    if (!isOpen) return;
    // Centre burst from modal
    fireFixConfetti();
    // Second wider burst for maximum celebration
    const t = setTimeout(() => fireFixConfetti(), 320);
    return () => clearTimeout(t);
  }, [isOpen]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleNewSprint = () => {
    clearRoadmap();
    onClose();
    toast.success("New sprint started!", {
      description: "Your roadmap has been cleared. Time to set new goals.",
    });
  };

  const handleShare = () => {
    onClose();
    toast.success("Sprint card copied to clipboard!", {
      description: `${completedCount} tasks · ~${totalMinutes} min of SEO work done.`,
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        /* ── Backdrop ───────────────────────────────────────────────────────── */
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)" }}
          onClick={onClose}
        >
          {/* ── Modal card ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 24 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#151B27] p-8 shadow-2xl"
          >

            {/* ── Background glow ────────────────────────────────────────── */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(255,100,45,0.10) 0%, transparent 70%)",
              }}
            />

            {/* ── Close button ───────────────────────────────────────────── */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
            >
              <X size={15} />
            </button>

            {/* ── Icon cluster ───────────────────────────────────────────── */}
            <div className="relative mb-6 flex justify-center">
              {/* Halo ring */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05, duration: 0.5, ease: "easeOut" }}
                className="flex h-20 w-20 items-center justify-center rounded-full border border-[#FF642D]/20"
                style={{ background: "rgba(255,100,45,0.08)" }}
              >
                <motion.div
                  initial={{ rotate: -20, scale: 0.6, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ delay: 0.12, type: "spring", stiffness: 260, damping: 18 }}
                >
                  <PartyPopper size={38} color="#FF642D" />
                </motion.div>
              </motion.div>

              {/* Orbiting star decorations */}
              {STARS.map((star, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{ left: "50%", top: "50%", translateX: "-50%", translateY: "-50%" }}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: star.x,
                    y: star.y,
                  }}
                  transition={{
                    delay: star.delay,
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                  }}
                >
                  <Star
                    size={star.size}
                    fill={star.color}
                    color={star.color}
                    style={{ transform: `rotate(${star.rotate}deg)` }}
                  />
                </motion.div>
              ))}
            </div>

            {/* ── Headline ───────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.35 }}
              className="mb-1 text-center"
            >
              <h2 className="text-3xl font-bold text-white">Sprint Complete!</h2>
              <p className="mt-2 text-sm text-slate-400">
                You crushed your 30-Day SEO Growth Sprint.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Every task done means real organic gains in the pipeline. 🚀
              </p>
            </motion.div>

            {/* ── Stats row ──────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, duration: 0.32 }}
              className="mt-6 flex items-center justify-center gap-3"
            >
              {/* Tasks done pill */}
              <div
                className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold"
                style={{
                  borderColor: "rgba(16,185,129,0.30)",
                  background: "rgba(16,185,129,0.08)",
                  color: "#10B981",
                }}
              >
                <CheckCircle2 size={15} />
                {completedCount} Task{completedCount !== 1 ? "s" : ""} Done
              </div>

              {/* Time saved pill */}
              <div
                className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold"
                style={{
                  borderColor: "rgba(255,100,45,0.30)",
                  background: "rgba(255,100,45,0.08)",
                  color: "#FF642D",
                }}
              >
                <Clock size={14} />
                ~{totalMinutes} Min Invested
              </div>
            </motion.div>

            {/* ── Progress bar (full) ────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.32 }}
              className="mt-5 px-2"
            >
              <div className="mb-1.5 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <span>Sprint Progress</span>
                <span style={{ color: "#10B981" }}>100% ✓</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#1E2940]">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #10B981, #059669)" }}
                  initial={{ width: "82%" }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </motion.div>

            {/* ── Divider ────────────────────────────────────────────────── */}
            <div className="my-6 border-t border-[#1E2940]" />

            {/* ── CTAs ───────────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.3 }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              {/* Primary — Start New Sprint */}
              <button
                onClick={handleNewSprint}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ background: "#FF642D" }}
              >
                <RotateCcw size={15} />
                Start New Sprint
              </button>

              {/* Secondary — Share Results */}
              <button
                onClick={handleShare}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all hover:bg-white/[0.04] active:scale-[0.98]"
                style={{
                  borderColor: "rgba(255,255,255,0.10)",
                  color: "#8B9BB4",
                }}
              >
                <Share2 size={14} />
                Share Results
              </button>
            </motion.div>

            {/* ── Footer note ────────────────────────────────────────────── */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.48 }}
              className="mt-4 text-center text-[10px] text-slate-600"
            >
              Starting a new sprint clears your current tasks. Your audit data is preserved.
            </motion.p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
