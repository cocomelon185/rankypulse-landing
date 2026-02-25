"use client";

import { motion } from "framer-motion";

const STATS = [
  { number: "12,400+", label: "Sites audited" },
  { number: "4.8★", label: "Average rating" },
  { number: "3.2 min", label: "Avg. fix time" },
  { number: "89%", label: "See traffic gains in 30 days" },
];

const TESTIMONIALS = [
  {
    quote:
      "Fixed my canonical issue in 4 minutes. Organic traffic up 40% in 3 weeks.",
    author: "Sarah K.",
    role: "E-commerce founder",
    avatar: "SK",
  },
  {
    quote:
      "Finally an SEO tool that tells me exactly what to do, not just what's broken.",
    author: "Marcus T.",
    role: "Marketing director",
    avatar: "MT",
  },
];

export function SocialProofStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.2, duration: 0.5 }}
    >
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2 + idx * 0.08, duration: 0.4 }}
            className="rounded-xl p-4 text-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p className="font-display text-xl font-bold text-white sm:text-2xl">
              {stat.number}
            </p>
            <p className="mt-1 font-mono-data text-[10px] tracking-wide text-[var(--text-muted)]">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Mini testimonials */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {TESTIMONIALS.map((t, idx) => (
          <motion.div
            key={t.author}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5 + idx * 0.1, duration: 0.4 }}
            className="rounded-xl p-4"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="mb-2 flex items-center gap-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                }}
              >
                {t.avatar}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white">{t.author}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{t.role}</p>
              </div>
              <p className="ml-auto shrink-0 text-xs" style={{ color: "#fbbf24" }}>
                ★★★★★
              </p>
            </div>
            <p className="text-xs italic leading-relaxed text-[var(--text-secondary)]">
              &ldquo;{t.quote}&rdquo;
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
