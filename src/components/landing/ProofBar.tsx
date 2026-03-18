"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import CountUp from "react-countup";

const STATS = [
  { num: 12400, suffix: "+", label: "sites audited", decimals: 0 },
  { num: 4.8, suffix: "★", label: "user rating", decimals: 1 },
  { num: 3.2, suffix: "min", label: "avg fix time", decimals: 1 },
  { num: 89, suffix: "%", label: "see gains in 30 days", decimals: 0 },
];

const MARQUEE_ITEMS = [
  "Shopify store owners",
  "SaaS founders",
  "Marketing agencies",
  "Freelance developers",
  "Local businesses",
  "Content creators",
  "E-commerce brands",
  "Tech startups",
  "Consultants",
  "Digital agencies",
];

export function ProofBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section
      className="relative border-y border-white/5 py-12"
      style={{ background: "#0d0f14" }}
    >
      {/* Stats row */}
      <div
        ref={ref}
        className="mx-auto mb-8 flex max-w-4xl flex-wrap items-center justify-center gap-8 px-6 md:gap-16"
      >
        {STATS.map((stat, i) => (
          <div key={stat.label} className="text-center">
            <div className="font-['Fraunces'] text-3xl font-bold text-white">
              {inView ? (
                <CountUp
                  start={0}
                  end={stat.num}
                  duration={1.4}
                  delay={i * 0.1}
                  decimals={stat.decimals}
                  suffix={stat.suffix}
                  separator=","
                />
              ) : (
                "0"
              )}
            </div>
            <div className="mt-1 font-['DM_Mono'] text-xs uppercase tracking-wider text-gray-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-auto mb-6 max-w-2xl border-t border-white/5" />

      {/* Trusted by label */}
      <p className="mb-4 text-center font-['DM_Mono'] text-xs uppercase tracking-widest text-gray-400">
        Trusted by teams at
      </p>

      {/* Marquee strip */}
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#0d0f14] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#0d0f14] to-transparent" />

        <div className="flex animate-[marquee_30s_linear_infinite] gap-8 hover:[animation-play-state:paused]">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="flex-shrink-0 rounded-full border border-white/6 bg-white/3 px-5 py-2 font-['DM_Sans'] text-sm text-gray-300 whitespace-nowrap"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
