"use client";

import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import CountUp from "react-countup";
import { Star } from "lucide-react";

const STATS = [
  { num: 12400, suffix: "+", label: "sites audited", decimals: 0 },
  { num: 4.8, suffix: "★", label: "average rating", decimals: 1 },
  { num: 3.2, suffix: "min", label: "avg fix time", decimals: 1 },
  { num: 89, suffix: "%", label: "see gains in 30d", decimals: 0 },
];

const AUDIENCE_TAGS = [
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

export function TrustProofSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section
      className="relative border-y border-white/5 py-12"
      style={{ background: "var(--landing-bg-hero)" }}
    >
      {/* Stats row */}
      <div
        ref={ref}
        className="mx-auto mb-8 flex max-w-4xl flex-wrap items-center justify-center gap-8 px-6 md:gap-16"
      >
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-white">
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
            <div className="mt-1 small uppercase tracking-wider text-[var(--landing-text-muted)]">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Review aggregator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mx-auto mb-6 flex items-center justify-center gap-4 px-6"
      >
        <div className="h-px w-16 bg-white/5" />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
            ))}
            <span className="small text-[var(--landing-text-muted)] ml-1">
              4.8 on <span className="text-white/60">G2</span>
            </span>
          </div>
          <span className="text-white/10">·</span>
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
            ))}
            <span className="small text-[var(--landing-text-muted)] ml-1">
              4.7 on <span className="text-white/60">Capterra</span>
            </span>
          </div>
        </div>
        <div className="h-px w-16 bg-white/5" />
      </motion.div>

      {/* Divider */}
      <div className="mx-auto mb-6 max-w-2xl border-t border-white/5" />

      {/* Trusted by label */}
      <p className="mb-4 text-center small uppercase tracking-widest text-[var(--landing-text-muted)]">
        Trusted by teams at
      </p>

      {/* Marquee strip */}
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r to-transparent"
          style={{ backgroundImage: "linear-gradient(to right, var(--landing-bg-hero), transparent)" }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l to-transparent"
          style={{ backgroundImage: "linear-gradient(to left, var(--landing-bg-hero), transparent)" }}
        />

        <div className="flex animate-[marquee_30s_linear_infinite] gap-8 hover:[animation-play-state:paused]">
          {[...AUDIENCE_TAGS, ...AUDIENCE_TAGS].map((item, i) => (
            <span
              key={i}
              className="flex-shrink-0 rounded-full border border-[var(--landing-border)] bg-white/3 px-5 py-2 text-sm text-[var(--landing-text-muted)] whitespace-nowrap"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
