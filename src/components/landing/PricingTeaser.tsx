"use client";

import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

const FREE_FEATURES = [
  "1 audit per day",
  "Up to 3 fixes unlocked",
  "SERP before/after preview",
  "Traffic impact estimates",
];

const PRO_FEATURES = [
  "Unlimited audits",
  "All fixes unlocked",
  "Competitor benchmarking",
  "PDF report downloads",
  "Email report delivery",
  "Priority support",
];

export function PricingTeaser() {
  const router = useRouter();

  return (
    <section className="mx-auto max-w-4xl px-6 py-24">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <p className="mb-3 font-['DM_Mono'] text-xs uppercase tracking-widest text-gray-600">
          Pricing
        </p>
        <h2
          className="font-['Fraunces'] font-bold leading-tight tracking-tight text-white"
          style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
        >
          Start free.{" "}
          <span className="italic text-indigo-400">Upgrade when you&apos;re ready.</span>
        </h2>
      </motion.div>

      {/* Plans */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Free */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-white/6 p-8"
          style={{ background: "#13161f" }}
        >
          <div className="mb-6">
            <p className="mb-2 font-['DM_Mono'] text-xs uppercase tracking-widest text-gray-600">
              Free forever
            </p>
            <div className="flex items-end gap-2">
              <span className="font-['Fraunces'] text-5xl font-bold text-white">$0</span>
            </div>
            <p className="mt-1 font-['DM_Sans'] text-sm text-gray-600">No credit card required</p>
          </div>

          <ul className="mb-8 space-y-3">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <Check size={14} className="flex-shrink-0 text-gray-600" />
                <span className="font-['DM_Sans'] text-sm text-gray-400">{f}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => router.push("/")}
            className="w-full rounded-xl border border-white/8 py-3 font-['DM_Sans'] text-sm font-semibold text-gray-400 transition-all duration-200 hover:border-white/15 hover:bg-white/4 hover:text-white"
          >
            Get started free
          </button>
        </motion.div>

        {/* Pro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl border border-indigo-500/30 p-8"
          style={{ background: "rgba(99,102,241,0.06)" }}
        >
          {/* Corner glow */}
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-indigo-500/15 blur-[60px]" />

          {/* Popular badge */}
          <div className="absolute right-4 top-4">
            <span className="rounded-full bg-indigo-500 px-3 py-1 font-['DM_Mono'] text-[10px] font-semibold uppercase tracking-wider text-white">
              Popular
            </span>
          </div>

          <div className="relative mb-6">
            <p className="mb-2 font-['DM_Mono'] text-xs uppercase tracking-widest text-indigo-400">
              Pro
            </p>
            <div className="flex items-end gap-2">
              <span className="font-['Fraunces'] text-5xl font-bold text-white">$29</span>
              <span className="pb-2 font-['DM_Sans'] text-sm text-gray-500">/month</span>
            </div>
            <p className="mt-1 font-['DM_Sans'] text-sm text-gray-600">Cancel anytime</p>
          </div>

          <ul className="relative mb-8 space-y-3">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <Check size={14} className="flex-shrink-0 text-indigo-400" />
                <span className="font-['DM_Sans'] text-sm text-gray-300">{f}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => router.push("/pricing")}
            className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3 font-['DM_Sans'] text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/30"
          >
            <Zap size={14} />
            Upgrade to Pro →
          </button>
          <p className="mt-3 text-center font-['DM_Sans'] text-xs text-gray-700">
            30-day money-back guarantee
          </p>
        </motion.div>
      </div>

      {/* Honest copy */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-center font-['DM_Sans'] text-sm italic text-gray-600"
      >
        &ldquo;Most users fix their top 3 issues on the free plan. Pro is for when you&apos;re
        ready to go deeper.&rdquo;
      </motion.p>
    </section>
  );
}
