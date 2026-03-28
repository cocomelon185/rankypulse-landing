"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  CheckCircle2,
  ArrowRight,
  X,
  ScanSearch,
  Network,
  FileText,
  CalendarDays,
  ChevronUp,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Star,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { fireFixConfetti } from "@/lib/confetti";
import { useAuditStore } from "@/lib/use-audit";

// ── Constants ──────────────────────────────────────────────────────────────────
const LS_KEY = "rankypulse_onboarding_v1";

const CARD_BG    = "#151B27";
const BORDER     = "#1E2940";
const ACCENT     = "#FF642D";
const EMERALD    = "#10B981";
const TEXT_MUTED = "#64748B";
const TEXT_DIM   = "#8B9BB4";

// ── Step definitions ───────────────────────────────────────────────────────────
interface Step {
  id: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  href: string;
  cta: string;
  /** pathname substring that auto-completes this step */
  autoPath?: string;
}

const STEPS: Step[] = [
  {
    id: "audit",
    icon: ScanSearch,
    title: "Deep Audit",
    desc: "Identify every technical blocker on your site.",
    href: "/app/audit",
    cta: "Run Audit",
    autoPath: "/app/audit",
  },
  {
    id: "links",
    icon: Network,
    title: "Link Architecture",
    desc: "Fix orphan pages and boost internal link equity.",
    href: "/app/internal-links",
    cta: "View Links",
    autoPath: "/app/internal-links",
  },
  {
    id: "content",
    icon: FileText,
    title: "Content Brief",
    desc: "Turn a gap keyword into a ready-to-write brief.",
    href: "/app/content",
    cta: "Open Generator",
    autoPath: "/app/content",
  },
  {
    id: "roadmap",
    icon: CalendarDays,
    title: "30-Day Sprint",
    desc: "Add tasks and activate your growth plan.",
    href: "/roadmap",
    cta: "View Roadmap",
    autoPath: "/roadmap",
  },
];

// ── Persisted state helpers ────────────────────────────────────────────────────
interface OnboardingState {
  step: number;       // 0-3 active step, 4 = complete
  dismissed: boolean;
  completed: boolean;
}

function loadState(): OnboardingState {
  if (typeof window === "undefined") return { step: 0, dismissed: false, completed: false };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as OnboardingState;
  } catch {}
  return { step: 0, dismissed: false, completed: false };
}

function saveState(state: OnboardingState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {}
}

// ── Launch Modal (inline) ──────────────────────────────────────────────────────
const LAUNCH_STARS = [
  { delay: 0.12, size: 16, color: "#F59E0B", x: -40, y: -16 },
  { delay: 0.20, size: 11, color: "#FF642D", x: 42,  y: -20 },
  { delay: 0.18, size: 10, color: "#10B981", x: -50, y: 14  },
  { delay: 0.28, size: 9,  color: "#a78bfa", x: 46,  y: 12  },
];

function LaunchModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    fireFixConfetti();
    const t = setTimeout(() => fireFixConfetti(), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 28 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] p-8 shadow-2xl"
        style={{ background: CARD_BG }}
      >
        {/* Glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 70% 55% at 50% -5%, ${ACCENT}14 0%, transparent 65%)`,
          }}
        />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
        >
          <X size={15} />
        </button>

        {/* Icon cluster */}
        <div className="relative mb-6 flex justify-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.06, duration: 0.45, ease: "easeOut" }}
            className="flex h-20 w-20 items-center justify-center rounded-full border"
            style={{
              borderColor: `${ACCENT}25`,
              background: `${ACCENT}0D`,
            }}
          >
            <motion.div
              initial={{ rotate: -15, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ delay: 0.14, type: "spring", stiffness: 260, damping: 18 }}
            >
              <Rocket size={40} color={ACCENT} />
            </motion.div>
          </motion.div>

          {LAUNCH_STARS.map((s, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: "50%", top: "50%", translateX: "-50%", translateY: "-50%" }}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{ opacity: 1, scale: 1, x: s.x, y: s.y }}
              transition={{ delay: s.delay, type: "spring", stiffness: 400, damping: 20 }}
            >
              <Star size={s.size} fill={s.color} color={s.color} />
            </motion.div>
          ))}
        </div>

        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.20 }}
          className="text-center"
        >
          <div
            className="mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
            style={{
              borderColor: `${ACCENT}30`,
              background: `${ACCENT}0D`,
              color: ACCENT,
            }}
          >
            <Sparkles size={10} />
            Sprint Activated
          </div>

          <h2 className="mb-2 text-2xl font-bold text-white">
            You&rsquo;re officially ahead of{" "}
            <span style={{ color: ACCENT }}>90%</span> of site owners.
          </h2>

          <p className="text-sm leading-relaxed" style={{ color: TEXT_DIM }}>
            Your 30-day roadmap is now live. We&rsquo;ve synthesised your technical
            fixes, link opportunities, and content needs into a single execution plan.
          </p>
          <p className="mt-2 text-xs" style={{ color: TEXT_MUTED }}>
            Check your dashboard daily for your next move. SEO compounds — every
            completed task brings you closer to page one.
          </p>
        </motion.div>

        {/* Progress: all done */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32 }}
          className="my-5 px-1"
        >
          <div className="mb-1 flex justify-between text-[10px] font-semibold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
            <span>Mission Progress</span>
            <span style={{ color: EMERALD }}>4 / 4 ✓</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full" style={{ background: BORDER }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${EMERALD}, #059669)` }}
              initial={{ width: "75%" }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        <div className="my-5 border-t" style={{ borderColor: BORDER }} />

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/app/dashboard"
            onClick={onClose}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ background: ACCENT }}
          >
            Go to Dashboard
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/roadmap"
            onClick={onClose}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all hover:bg-white/[0.04] active:scale-[0.98]"
            style={{ borderColor: "rgba(255,255,255,0.10)", color: TEXT_DIM }}
          >
            View Roadmap
            <ExternalLink size={13} />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── Main widget ────────────────────────────────────────────────────────────────
export function PulseOnboarding() {
  const pathname = usePathname();
  const { roadmapTasks } = useAuditStore();

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<OnboardingState>({ step: 0, dismissed: false, completed: false });
  const [collapsed, setCollapsed] = useState(false);
  const [showLaunch, setShowLaunch] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    setMounted(true);
  }, []);

  // Auto-advance step based on current pathname
  useEffect(() => {
    if (!mounted || state.dismissed || state.completed) return;
    const activeStep = STEPS[state.step];
    if (!activeStep?.autoPath) return;
    if (pathname.startsWith(activeStep.autoPath)) {
      // User visited the page for this step — advance after a short delay
      const t = setTimeout(() => advance(state.step), 1800);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, mounted]);

  // Auto-advance roadmap step when tasks exist
  useEffect(() => {
    if (!mounted || state.dismissed || state.completed) return;
    if (state.step === 3 && roadmapTasks.length > 0) {
      const t = setTimeout(() => advance(3), 1200);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadmapTasks.length, mounted]);

  // Helpers
  const update = (patch: Partial<OnboardingState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      saveState(next);
      return next;
    });
  };

  const advance = (fromStep: number) => {
    setState((prev) => {
      if (prev.step !== fromStep) return prev; // guard against double-fire
      const nextStep = fromStep + 1;
      const completed = nextStep >= STEPS.length;
      const next: OnboardingState = { ...prev, step: nextStep, completed };
      saveState(next);
      if (completed) {
        setTimeout(() => setShowLaunch(true), 300);
      } else {
        toast.success(`Step ${fromStep + 1} complete!`, {
          description: `Next: ${STEPS[nextStep]?.title}`,
        });
      }
      return next;
    });
  };

  const dismiss = () => {
    update({ dismissed: true });
  };

  // Don't render until hydrated, dismissed, or completed + launch closed
  if (!mounted) return null;
  if (state.dismissed) return null;
  if (state.completed && !showLaunch) return null;

  const completedSteps = Math.min(state.step, STEPS.length);
  const progressPct = (completedSteps / STEPS.length) * 100;

  return (
    <>
      {/* ── Launch modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showLaunch && (
          <LaunchModal
            onClose={() => {
              setShowLaunch(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Floating widget (hidden while launch modal is open) ───────────── */}
      {!showLaunch && !state.completed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-[490] w-72 overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          style={{
            background: CARD_BG,
            border: `1px solid ${ACCENT}35`,
          }}
        >
          {/* ── Thin progress bar at very top ─────────────────────────────── */}
          <div className="h-0.5 w-full" style={{ background: BORDER }}>
            <motion.div
              className="h-full"
              style={{ background: ACCENT }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* ── Header ────────────────────────────────────────────────────── */}
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ background: `${ACCENT}0D`, borderColor: `${ACCENT}20` }}
          >
            <div className="flex items-center gap-2">
              <Rocket size={14} color={ACCENT} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                Your Growth Mission
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCollapsed((c) => !c)}
                className="flex h-6 w-6 items-center justify-center rounded text-slate-500 transition-colors hover:text-slate-300"
              >
                {collapsed ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
              <button
                onClick={dismiss}
                className="flex h-6 w-6 items-center justify-center rounded text-slate-500 transition-colors hover:text-slate-300"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* ── Collapsible body ──────────────────────────────────────────── */}
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* Step list */}
                <div className="space-y-1 px-4 py-3">
                  {STEPS.map((step, i) => {
                    const StepIcon = step.icon;
                    const isCompleted = i < state.step;
                    const isActive = i === state.step;
                    const isFuture = i > state.step;

                    return (
                      <div
                        key={step.id}
                        className="flex items-start gap-3 rounded-xl px-2 py-2 transition-colors"
                        style={{
                          background: isActive ? `${ACCENT}0A` : "transparent",
                          opacity: isFuture ? 0.38 : 1,
                        }}
                      >
                        {/* Status icon */}
                        <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 size={15} color={EMERALD} />
                          ) : (
                            <div
                              className={`flex h-[15px] w-[15px] items-center justify-center rounded-full border ${
                                isActive ? "border-[#FF642D]" : "border-slate-700"
                              }`}
                              style={isActive ? { boxShadow: `0 0 6px ${ACCENT}60` } : {}}
                            >
                              {isActive && (
                                <motion.div
                                  className="h-[7px] w-[7px] rounded-full"
                                  style={{ background: ACCENT }}
                                  animate={{ scale: [1, 1.3, 1] }}
                                  transition={{ repeat: Infinity, duration: 1.4 }}
                                />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Step info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <StepIcon size={10} style={{ color: isActive ? ACCENT : TEXT_MUTED }} />
                            <span
                              className="text-[11px] font-bold"
                              style={{ color: isCompleted ? TEXT_DIM : isActive ? "#fff" : TEXT_MUTED }}
                            >
                              {step.title}
                            </span>
                            <span
                              className="ml-auto text-[9px] font-bold"
                              style={{ color: TEXT_MUTED }}
                            >
                              {i + 1}/4
                            </span>
                          </div>

                          <AnimatePresence>
                            {isActive && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-0.5 text-[10px] leading-snug"
                                style={{ color: TEXT_MUTED }}
                              >
                                {step.desc}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Step counter */}
                <div className="px-4 pb-1">
                  <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                    <span>{completedSteps} of {STEPS.length} steps complete</span>
                    <span style={{ color: ACCENT }}>{Math.round(progressPct)}%</span>
                  </div>
                </div>

                {/* ── Action footer ────────────────────────────────────────── */}
                <div className="px-4 pb-4 pt-2">
                  {state.step < STEPS.length && (
                    <div className="flex gap-2">
                      {/* Navigate to step page */}
                      <Link
                        href={STEPS[state.step].href}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-[11px] font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
                        style={{ background: ACCENT }}
                      >
                        {STEPS[state.step].cta}
                        <ArrowRight size={12} />
                      </Link>

                      {/* Manual "Mark Done" (skip/self-confirm) */}
                      <button
                        onClick={() => advance(state.step)}
                        className="rounded-lg border px-3 py-2.5 text-[10px] font-semibold transition-all hover:bg-white/[0.04]"
                        style={{ borderColor: BORDER, color: TEXT_MUTED }}
                        title="Mark this step as done"
                      >
                        Done ✓
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </>
  );
}
