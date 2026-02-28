"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ArrowRight, Zap, Gift } from "lucide-react";

const HOOKS = [
    {
        icon: "🔥",
        title: "850 keywords your competitors rank for — you don't.",
        subtitle: "Upgrade to Starter to instantly steal their traffic.",
        cta: "See the keywords →",
        color: "from-orange-500/10 to-rose-500/10 border-orange-500/20",
        badge: "Keyword Gap",
    },
    {
        icon: "🏆",
        title: "5 high-authority sites link to both competitors but not you.",
        subtitle: "Upgrade to unlock the Backlink Authority tool & pitch them today.",
        cta: "Find my link gaps →",
        color: "from-indigo-500/10 to-purple-500/10 border-indigo-500/20",
        badge: "Backlink Gap",
    },
    {
        icon: "⚡",
        title: "Your site has 12 quick-win SEO fixes worth +1,200 visits/mo.",
        subtitle: "Upgrade to unlock On-Page Checker with copy-ready fixes.",
        cta: "Fix them now →",
        color: "from-emerald-500/10 to-cyan-500/10 border-emerald-500/20",
        badge: "Quick Wins",
    },
];

export function UpgradeBanner() {
    const [visible, setVisible] = useState(false);
    const [hookIdx, setHookIdx] = useState(0);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Small delay to not flash immediately
        const t = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(t);
    }, []);

    // Rotate hooks every 8 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setHookIdx((prev) => (prev + 1) % HOOKS.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    if (dismissed) return null;

    const hook = HOOKS[hookIdx];

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key={hookIdx}
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.45 }}
                    className={`relative mx-4 mt-3 mb-1 rounded-xl border bg-gradient-to-r ${hook.color} px-5 py-3 flex items-center justify-between gap-4 group overflow-hidden`}
                >
                    {/* Animated shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-2xl shrink-0">{hook.icon}</span>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                                    {hook.badge}
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-white leading-snug truncate">{hook.title}</p>
                            <p className="text-xs text-gray-400 leading-snug hidden sm:block">{hook.subtitle}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Link
                            href="/pricing"
                            className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded-lg transition-all shadow-lg shadow-indigo-500/20 whitespace-nowrap"
                        >
                            <Zap size={12} />
                            {hook.cta}
                        </Link>
                        <button
                            onClick={() => setDismissed(true)}
                            className="text-gray-500 hover:text-white transition-colors p-1 rounded"
                            aria-label="Dismiss"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* Progress dots */}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                        {HOOKS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setHookIdx(i)}
                                className={`w-1 h-1 rounded-full transition-all ${i === hookIdx ? "bg-indigo-400 w-3" : "bg-white/20"}`}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
