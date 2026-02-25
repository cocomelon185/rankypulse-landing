"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const STEPS = [
  {
    num: "①",
    title: "Enter your domain",
    body: "Any URL. No account needed. Works on any site, any size.",
    time: "⏱ 30 seconds",
    color: "#6366f1",
  },
  {
    num: "②",
    title: "See what's broken — and what it costs",
    body: "Every issue shows exactly how many visits/month you're missing because of it.",
    time: "⏱ 1 minute",
    color: "#f59e0b",
  },
  {
    num: "③",
    title: "Fix one issue at a time. Watch your score climb.",
    body: "Step-by-step guides. Most fixes take 5–15 minutes. No developer needed.",
    time: "⏱ 5–15 min each",
    color: "#10b981",
  },
];

export function HowItWorks() {
  const lineRef = useRef<SVGLineElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section className="relative py-24" style={{ background: "#0a0c10" }}>
      <div className="mx-auto max-w-5xl px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 font-['DM_Mono'] text-xs uppercase tracking-widest text-gray-600">
            How it works
          </p>
          <h2
            className="font-['Fraunces'] font-bold leading-tight tracking-tight text-white"
            style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
          >
            From broken to ranking{" "}
            <span className="italic text-indigo-400">in 3 steps</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div ref={sectionRef} className="relative">
          {/* Connecting line — desktop only */}
          <div className="absolute left-1/2 top-12 hidden h-[2px] w-[calc(100%-160px)] -translate-x-1/2 lg:block">
            <motion.div
              className="h-full origin-left rounded-full"
              style={{
                background: "linear-gradient(90deg, #6366f1, #f59e0b, #10b981)",
                scaleX: inView ? 1 : 0,
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: inView ? 1 : 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: 0.1 + i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Step number bubble */}
                <div className="relative mb-6 flex justify-center lg:justify-start">
                  <div
                    className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/10"
                    style={{ background: `${step.color}18` }}
                  >
                    <span
                      className="font-['Fraunces'] text-xl font-bold"
                      style={{ color: step.color }}
                    >
                      {step.num}
                    </span>
                  </div>
                </div>

                {/* Card */}
                <div
                  className="rounded-2xl border border-white/6 p-6"
                  style={{ background: "#13161f" }}
                >
                  <h3 className="mb-3 font-['Fraunces'] text-xl font-bold text-white leading-snug">
                    {step.title}
                  </h3>
                  <p className="mb-5 font-['DM_Sans'] text-sm leading-relaxed text-gray-500">
                    {step.body}
                  </p>
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
                    style={{ background: `${step.color}12`, border: `1px solid ${step.color}25` }}
                  >
                    <span className="font-['DM_Mono'] text-xs" style={{ color: step.color }}>
                      {step.time}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
