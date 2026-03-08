"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Globe, Search, Zap, ArrowRight, X } from "lucide-react";

const STEPS = [
  {
    icon: Globe,
    title: "Add your domain",
    description: "Tell us which website you want to improve. We'll set up your project.",
    cta: "Add my domain",
    href: "/app/projects",
  },
  {
    icon: Search,
    title: "Run your first audit",
    description: "We crawl your site and check for issues that are hurting your Google rankings.",
    cta: "Run audit",
    href: "/app/projects",
  },
  {
    icon: Zap,
    title: "Fix issues in priority order",
    description: "Your Action Center shows exactly what to fix first — with step-by-step guidance.",
    cta: "Go to Action Center",
    href: "/action-center",
  },
];

const STORAGE_KEY = "rankypulse_onboarding_seen";

interface OnboardingModalProps {
  onClose: () => void;
}

export function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    onClose();
  };

  const handleCta = () => {
    if (isLast) {
      localStorage.setItem(STORAGE_KEY, "1");
      onClose();
      router.push(current.href);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleGetStarted = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    onClose();
    router.push(STEPS[0].href);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={handleDismiss}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "#0D1424", border: "1px solid #1E2940" }}
      >
        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-500 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div
            className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-5"
            style={{ background: "rgba(255,100,45,0.12)", border: "1px solid rgba(255,100,45,0.2)" }}
          >
            <current.icon size={28} style={{ color: "#FF642D" }} />
          </div>

          <div className="flex justify-center gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === step ? "24px" : "8px",
                  background: i === step ? "#FF642D" : "#1E2940",
                }}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{ color: "#FF642D" }}
              >
                Step {step + 1} of {STEPS.length}
              </p>
              <h2 className="text-xl font-black text-white mb-3">{current.title}</h2>
              <p className="text-sm leading-relaxed" style={{ color: "#6B7A99" }}>
                {current.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex flex-col gap-3">
          <button
            onClick={isLast ? handleGetStarted : handleCta}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}
          >
            {isLast ? "Get started" : current.cta}
            <ArrowRight size={15} />
          </button>
          {!isLast && (
            <button
              onClick={handleDismiss}
              className="text-xs text-center py-1"
              style={{ color: "#4A5568" }}
            >
              Skip for now
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export { STORAGE_KEY as ONBOARDING_STORAGE_KEY };
