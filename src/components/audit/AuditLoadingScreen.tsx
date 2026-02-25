"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = [
  { id: 1, label: "Connecting to site...",        duration: 1200 },
  { id: 2, label: "Reading page structure...",     duration: 1400 },
  { id: 3, label: "Checking meta tags...",         duration: 1000 },
  { id: 4, label: "Testing canonical URLs...",     duration: 900  },
  { id: 5, label: "Fetching Core Web Vitals...",   duration: 2000 },
  { id: 6, label: "Checking Open Graph tags...",   duration: 800  },
  { id: 7, label: "Benchmarking competitors...",   duration: 1200 },
  { id: 8, label: "Calculating traffic impact...", duration: 900  },
  { id: 9, label: "Building your report...",       duration: 600  },
];

interface AuditLoadingScreenProps {
  domain: string;
  /** Called if the parent never clears the loading state within maxWaitMs */
  onTimeout?: () => void;
  /** Absolute maximum display time in ms before calling onTimeout (default 50s) */
  maxWaitMs?: number;
}

export function AuditLoadingScreen({
  domain,
  onTimeout,
  maxWaitMs = 50_000,
}: AuditLoadingScreenProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState<number[]>([]);

  useEffect(() => {
    let elapsed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    STAGES.forEach((stage, i) => {
      const t = setTimeout(() => {
        setCurrentStage(i);
        if (i > 0) {
          setCompletedStages((prev) => [...prev, i - 1]);
        }
      }, elapsed);
      timers.push(t);
      elapsed += stage.duration;
    });

    // Mark ALL stages complete after the last one ends — stays on this state
    // until the parent (AuditDomainClient) transitions away via isLoading=false
    const finalT = setTimeout(() => {
      setCompletedStages(STAGES.map((_, i) => i));
    }, elapsed + 400);
    timers.push(finalT);

    // Absolute safety valve: if parent never sets isLoading=false, fire onTimeout
    if (onTimeout) {
      const safetyT = setTimeout(onTimeout, maxWaitMs);
      timers.push(safetyT);
    }

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = Math.round((completedStages.length / STAGES.length) * 100);

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: "#0d0f14" }}
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/8 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
            <span className="font-['DM_Mono'] text-xs uppercase tracking-widest text-indigo-400">
              Scanning
            </span>
          </div>
          <h1 className="mb-2 font-['Fraunces'] text-3xl font-bold text-white">
            Auditing {domain}
          </h1>
          <p className="font-['DM_Sans'] text-sm text-gray-500">
            Checking {STAGES.length} SEO factors...
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8 h-1 overflow-hidden rounded-full bg-white/6">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #6366f1, #10b981)" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Stage list */}
        <div className="space-y-3">
          {STAGES.map((stage, i) => {
            const isDone = completedStages.includes(i);
            const isCurrent = currentStage === i && !isDone;
            const isPending = !isDone && !isCurrent;

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex items-center gap-3"
              >
                {/* Status bubble */}
                <div
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                    isDone
                      ? "border border-emerald-500/40 bg-emerald-500/20"
                      : isCurrent
                        ? "border border-indigo-500/40 bg-indigo-500/20"
                        : "border border-white/10 bg-white/5"
                  }`}
                >
                  {isDone && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                    >
                      <path
                        d="M2 5l2.5 2.5L8 3"
                        stroke="#10b981"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </motion.svg>
                  )}
                  {isCurrent && (
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
                  )}
                </div>

                {/* Label */}
                <AnimatePresence mode="wait">
                  <span
                    className={`font-['DM_Sans'] text-sm transition-colors duration-300 ${
                      isDone
                        ? "text-gray-600 line-through"
                        : isCurrent
                          ? "font-medium text-white"
                          : "text-gray-700"
                    }`}
                  >
                    {stage.label}
                  </span>
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom note */}
        <p className="mt-10 text-center font-['DM_Mono'] text-xs uppercase tracking-wider text-gray-700">
          Takes 15–30 seconds · Don&apos;t close this tab
        </p>
      </div>
    </div>
  );
}
