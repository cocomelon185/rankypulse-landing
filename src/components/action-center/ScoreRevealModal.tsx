"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, TrendingUp, Clock, Zap, Share2, ArrowRight, Star } from "lucide-react";
import { fireFixConfetti } from "@/lib/confetti";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FixedTaskSummary {
    issueId: string;
    title: string;
    estimatedPoints: number;
    severity: "error" | "warning" | "notice";
}

interface ScoreRevealModalProps {
    isOpen: boolean;
    onClose: () => void;
    oldScore: number;   // cached/real score from last crawl
    newScore: number;   // projected score with fixes applied
    fixedTasks: FixedTaskSummary[];
    domain: string;
}

// ── Animated counter ──────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1600, active = false) {
    const [count, setCount] = useState(target);
    const raf = useRef<number | null>(null);
    const start = useRef<number | null>(null);

    useEffect(() => {
        if (!active) { setCount(target); return; }
        const from = count; // start from wherever we are
        start.current = null;

        const tick = (now: number) => {
            if (!start.current) start.current = now;
            const elapsed = now - start.current;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out-cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(from + (target - from) * eased));
            if (progress < 1) raf.current = requestAnimationFrame(tick);
        };

        raf.current = requestAnimationFrame(tick);
        return () => { if (raf.current) cancelAnimationFrame(raf.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target, active]);

    return count;
}

// ── Severity colour ───────────────────────────────────────────────────────────

const SEV_COLOR: Record<string, string> = {
    error:   "#FF3D3D",
    warning: "#FF9800",
    notice:  "#00B0FF",
};

// ── Verification timeline ─────────────────────────────────────────────────────

const TIMELINE_STEPS = [
    { label: "Fixes Deployed",    sublabel: "Live on Vercel",                icon: Zap,         done: true  },
    { label: "Awaiting Re-crawl", sublabel: "Google crawls within ~24h",     icon: Clock,       done: false },
    { label: "Score Verified",    sublabel: "Permanent ranking improvement",  icon: TrendingUp,  done: false },
];

// ── Main component ────────────────────────────────────────────────────────────

export function ScoreRevealModal({
    isOpen, onClose, oldScore, newScore, fixedTasks, domain,
}: ScoreRevealModalProps) {
    const delta = newScore - oldScore;
    const scoreColor = newScore >= 80 ? "#00C853" : newScore >= 60 ? "#FF9800" : "#FF3D3D";

    // Animated score — starts from oldScore, counts up to newScore
    const [counting, setCounting] = useState(false);
    const displayed = useCountUp(newScore, 1500, counting);

    // Fire confetti + start counter when modal opens
    useEffect(() => {
        if (!isOpen) { setCounting(false); return; }
        const t1 = setTimeout(() => { setCounting(true); fireFixConfetti(); }, 200);
        const t2 = setTimeout(() => fireFixConfetti(), 550);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [isOpen]);

    // SVG ring for the big score display
    const size = 180;
    const sw = 10;
    const r = (size - sw) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (newScore / 100) * circ;
    const oldOffset = circ - (oldScore / 100) * circ;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[600] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 backdrop-blur-md"
                        style={{ background: "rgba(6,8,15,0.85)" }}
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        className="relative w-full max-w-md rounded-2xl border overflow-hidden"
                        style={{ background: "#0E1320", borderColor: "#1E2940" }}
                        initial={{ scale: 0.88, opacity: 0, y: 24 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: 16 }}
                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    >
                        {/* Header glow */}
                        <div
                            className="absolute top-0 left-0 right-0 h-1"
                            style={{ background: "linear-gradient(90deg, #FF642D, #7B5CF5)" }}
                        />

                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg flex items-center justify-center transition hover:bg-white/[0.06]"
                            style={{ color: "#6B7A99" }}
                        >
                            <X size={16} />
                        </button>

                        <div className="p-6 pb-5">
                            {/* Title */}
                            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "#FF642D" }}>
                                Fixes Applied
                            </p>
                            <h2 className="text-lg font-black text-white leading-tight mb-5">
                                Your Score Just Levelled Up 🚀
                            </h2>

                            {/* Score ring area */}
                            <div className="flex items-center justify-center gap-8 mb-6">
                                {/* Old score (small, dimmed) */}
                                <div className="flex flex-col items-center gap-1.5 opacity-50">
                                    <div className="relative" style={{ width: 72, height: 72 }}>
                                        <svg width={72} height={72} className="-rotate-90">
                                            <circle cx={36} cy={36} r={31} stroke="#1E2940" strokeWidth={6} fill="none" />
                                            <circle cx={36} cy={36} r={31}
                                                stroke="#6B7A99" strokeWidth={6} fill="none"
                                                strokeLinecap="round"
                                                strokeDasharray={2 * Math.PI * 31}
                                                strokeDashoffset={2 * Math.PI * 31 - (oldScore / 100) * 2 * Math.PI * 31}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-sm font-black text-white">{oldScore}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-medium" style={{ color: "#6B7A99" }}>Before</span>
                                </div>

                                {/* Arrow */}
                                <motion.div
                                    initial={{ x: -8, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    style={{ color: "#00C853" }}
                                >
                                    <ArrowRight size={22} />
                                </motion.div>

                                {/* New score (big, animated) */}
                                <div className="flex flex-col items-center gap-1.5">
                                    <div className="relative" style={{ width: size, height: size }}>
                                        <svg width={size} height={size} className="-rotate-90">
                                            <circle cx={size / 2} cy={size / 2} r={r}
                                                stroke="#1E2940" strokeWidth={sw} fill="none" />
                                            <motion.circle
                                                cx={size / 2} cy={size / 2} r={r}
                                                stroke={scoreColor} strokeWidth={sw} fill="none"
                                                strokeLinecap="round"
                                                style={{ strokeDasharray: circ, filter: `drop-shadow(0 0 8px ${scoreColor}66)` }}
                                                initial={{ strokeDashoffset: oldOffset }}
                                                animate={{ strokeDashoffset: offset }}
                                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <motion.span
                                                className="text-5xl font-black tabular-nums"
                                                style={{ color: scoreColor, lineHeight: 1 }}
                                            >
                                                {displayed}
                                            </motion.span>
                                            <span className="text-[11px] font-semibold mt-1" style={{ color: "#6B7A99" }}>/&nbsp;100</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-medium" style={{ color: "#6B7A99" }}>Projected</span>
                                </div>

                                {/* Delta pill */}
                                <motion.div
                                    className="flex flex-col items-center gap-1.5"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", delay: 0.8, stiffness: 300 }}
                                >
                                    <div
                                        className="px-3 py-2 rounded-xl flex flex-col items-center"
                                        style={{ background: "rgba(0,200,83,0.12)", border: "1px solid rgba(0,200,83,0.25)" }}
                                    >
                                        <span className="text-xl font-black" style={{ color: "#00C853" }}>
                                            +{delta}
                                        </span>
                                        <span className="text-[9px] font-bold tracking-wide uppercase mt-0.5" style={{ color: "#00C853" }}>
                                            pts
                                        </span>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {[0, 1, 2].map(i => (
                                            <motion.div key={i}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 1.0 + i * 0.12, type: "spring" }}
                                            >
                                                <Star size={10} fill="#FF642D" style={{ color: "#FF642D" }} />
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Fixed tasks list */}
                            {fixedTasks.length > 0 && (
                                <div className="mb-5">
                                    <p className="text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: "#6B7A99" }}>
                                        Issues Resolved
                                    </p>
                                    <div className="space-y-1.5 max-h-[130px] overflow-y-auto pr-1">
                                        {fixedTasks.map((t, i) => (
                                            <motion.div
                                                key={t.issueId}
                                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                                                style={{ background: "#151B27" }}
                                                initial={{ opacity: 0, x: -12 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 + i * 0.07 }}
                                            >
                                                <CheckCircle size={13} style={{ color: "#00C853", flexShrink: 0 }} />
                                                <span className="text-[12px] font-medium text-white flex-1 truncate">{t.title}</span>
                                                <span
                                                    className="text-[11px] font-bold px-1.5 py-0.5 rounded"
                                                    style={{
                                                        color: SEV_COLOR[t.severity] ?? "#6B7A99",
                                                        background: `${SEV_COLOR[t.severity] ?? "#6B7A99"}18`,
                                                    }}
                                                >
                                                    +{t.estimatedPoints}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Verification timeline */}
                            <div
                                className="rounded-xl p-3 mb-4"
                                style={{ background: "#0B0F1A", border: "1px solid #1E2940" }}
                            >
                                <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: "#6B7A99" }}>
                                    Verification Progress
                                </p>
                                <div className="flex flex-col gap-2.5">
                                    {TIMELINE_STEPS.map((step, i) => {
                                        const Icon = step.icon;
                                        return (
                                            <motion.div
                                                key={step.label}
                                                className="flex items-center gap-3"
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 + i * 0.1 }}
                                            >
                                                {/* Step icon */}
                                                <div
                                                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                                                    style={{
                                                        background: step.done ? "rgba(0,200,83,0.15)" : "rgba(107,122,153,0.12)",
                                                        border: `1px solid ${step.done ? "rgba(0,200,83,0.3)" : "#1E2940"}`,
                                                    }}
                                                >
                                                    <Icon size={11} style={{ color: step.done ? "#00C853" : "#6B7A99" }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-semibold" style={{ color: step.done ? "#fff" : "#8B9BB4" }}>
                                                        {step.label}
                                                        {i === 1 && (
                                                            <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded"
                                                                style={{ background: "rgba(255,152,0,0.12)", color: "#FF9800" }}>
                                                                Pending
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-[10px]" style={{ color: "#4A5568" }}>{step.sublabel}</p>
                                                </div>
                                                {/* Progress dot */}
                                                {step.done && (
                                                    <CheckCircle size={13} style={{ color: "#00C853", flexShrink: 0 }} />
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Pulsing progress bar */}
                                <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "#1E2940" }}>
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ background: "linear-gradient(90deg, #00C853, #FF642D)" }}
                                        initial={{ width: "0%" }}
                                        animate={{ width: "35%" }}
                                        transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                                    />
                                </div>
                                <p className="text-[10px] mt-1.5 text-center" style={{ color: "#4A5568" }}>
                                    Step 1 of 3 complete · Google verifies within 24 h
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2.5">
                                <button
                                    onClick={onClose}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                                    style={{ background: "linear-gradient(135deg, #FF642D, #FF8C42)" }}
                                >
                                    <Zap size={14} />
                                    Keep Fixing
                                </button>
                                <button
                                    onClick={() => {
                                        const text = `My site ${domain} just hit an SEO score of ${newScore}/100 after fixing ${fixedTasks.length} issue${fixedTasks.length !== 1 ? "s" : ""} with RankyPulse! 🚀`;
                                        if (navigator.share) {
                                            navigator.share({ text }).catch(() => {});
                                        } else {
                                            navigator.clipboard.writeText(text).catch(() => {});
                                        }
                                    }}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition hover:bg-white/[0.06]"
                                    style={{ color: "#8B9BB4", border: "1px solid #1E2940" }}
                                >
                                    <Share2 size={13} />
                                    Share
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
