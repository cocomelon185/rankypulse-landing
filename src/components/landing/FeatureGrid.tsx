"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Clock, Eye, BarChart2, ListChecks, Share2 } from "lucide-react";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const FEATURES = [
  {
    icon: TrendingUp,
    color: "#10b981",
    title: "Traffic-first priorities",
    description:
      "Every issue shows the exact visits/month you're losing. Fix the highest-impact issues first — not the longest list.",
  },
  {
    icon: Clock,
    color: "#6366f1",
    title: "5-minute fix guides",
    description:
      "Every issue has a time estimate and step-by-step instructions. No Googling required. Copy-paste ready.",
  },
  {
    icon: Eye,
    color: "#a5b4fc",
    title: "SERP before/after preview",
    description:
      "See exactly how Google will display your page before and after you apply the fix. No more guessing.",
  },
  {
    icon: BarChart2,
    color: "#f59e0b",
    title: "Competitor benchmark",
    description:
      "See where you rank across 6 SEO dimensions vs. your top 5 competitors. Know exactly where to focus.",
  },
  {
    icon: ListChecks,
    color: "#34d399",
    title: "Fix queue UX",
    description:
      "One fix at a time. No overwhelm. A clear next action is always in front of you — and you can see your score climb.",
    hasMiniDemo: true,
  },
  {
    icon: Share2,
    color: "#c084fc",
    title: "Score sharing",
    description:
      "Share a branded score card to Twitter or LinkedIn in one click. Built-in viral loop, zero effort.",
  },
];

const STEPPER_STEPS = [
  { num: 1, status: "DONE", label: "Redirect chain fixed", color: "emerald" },
  { num: 2, status: "NEXT", label: "Fix canonical URL",    color: "indigo"  },
  { num: 3, status: "TODO", label: "Add meta description", color: "gray"    },
] as const;

function LiveStepper() {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => (s === STEPPER_STEPS.length ? 1 : s + 1));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-4 space-y-2">
      {STEPPER_STEPS.map((step) => {
        const isActive = activeStep === step.num;
        return (
          <motion.div
            key={step.num}
            animate={{ opacity: isActive ? 1 : 0.45, scale: isActive ? 1.02 : 1 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-all duration-300 ${
              isActive
                ? "border-indigo-500/25 bg-indigo-500/10"
                : "border-white/5 bg-white/2"
            }`}
          >
            <div
              className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                step.color === "emerald"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : step.color === "indigo"
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "bg-white/8 text-gray-500"
              }`}
            >
              {step.color === "emerald" ? "✓" : step.num}
            </div>
            <span
              className="font-['DM_Mono'] text-[9px] tracking-wider"
              style={{ color: isActive ? "#a5b4fc" : "#475569" }}
            >
              {step.status}
            </span>
            <span
              className="flex-1 truncate font-['DM_Sans'] text-xs"
              style={{ color: isActive ? "#f1f5f9" : "#475569" }}
            >
              {step.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center"
      >
        <p className="mb-3 font-['DM_Mono'] text-xs uppercase tracking-widest text-gray-600">
          What makes it different
        </p>
        <h2
          className="font-['Fraunces'] font-bold leading-tight tracking-tight text-white"
          style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
        >
          Most SEO tools tell you what&apos;s broken.
          <br />
          <span className="italic text-indigo-400">RankyPulse tells you how to fix it.</span>
        </h2>
      </motion.div>

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="group rounded-2xl border border-white/6 bg-white/3 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/12 hover:bg-white/5"
              style={{
                boxShadow: "0 0 0 0 transparent",
              }}
            >
              {/* Icon */}
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `${feature.color}18`, border: `1px solid ${feature.color}30` }}
              >
                <Icon size={18} style={{ color: feature.color }} />
              </div>

              <h3 className="mb-2 font-['DM_Sans'] text-base font-semibold text-white">
                {feature.title}
              </h3>
              <p className="font-['DM_Sans'] text-sm leading-relaxed text-gray-500">
                {feature.description}
              </p>

              {feature.hasMiniDemo && <LiveStepper />}
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
