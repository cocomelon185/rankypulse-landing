"use client";

import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

const FREE_FEATURES = [
  "3 audits per month",
  "Basic SEO audit",
  "Copy-ready fixes",
  "Top 3 issues per audit",
];

const STARTER_FEATURES = [
  "25 audits per month",
  "Everything in Free",
  "Discoverability dashboard",
  "Score tracking",
];

const PRO_FEATURES = [
  "Unlimited audits",
  "Everything in Starter",
  "Competitor benchmarking",
  "Growth tracker",
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
        <p className="mb-3 small uppercase tracking-widest text-[var(--landing-text-muted)]">
          Pricing
        </p>
        <h2
          className="h2 text-white"
        >
          Start free.{" "}
          <span className="italic text-[var(--landing-accent-secondary)]">Upgrade when you&apos;re ready.</span>
        </h2>
      </motion.div>

      {/* Plans */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Free */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card"
          style={{ background: "var(--landing-card-bg)" }}
        >
          <div className="mb-6">
            <p className="mb-2 small uppercase tracking-widest text-[var(--landing-text-muted)]">
              Free forever
            </p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-white">$0</span>
            </div>
            <p className="mt-1 text-sm text-[var(--landing-text-muted)]">No credit card required</p>
          </div>

          <ul className="mb-8 space-y-3">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <Check size={14} className="flex-shrink-0 text-[var(--landing-text-muted)]" />
                <span className="text-sm text-[var(--landing-text-secondary)]">{f}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => router.push("/")}
            className="btn btn-secondary w-full"
          >
            Get started free
          </button>
        </motion.div>

        {/* Starter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative overflow-hidden card ring-2 ring-[var(--landing-accent-secondary)]"
          style={{ background: "rgba(99, 102, 241, 0.06)" }}
        >
          {/* Corner glow */}
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-indigo-500/15 blur-[60px]" />

          {/* Popular badge */}
          <div className="absolute right-4 top-4">
            <span className="rounded-full bg-[var(--landing-accent-secondary)] px-3 py-1 small font-semibold uppercase tracking-wider text-white">
              Popular
            </span>
          </div>

          <div className="relative mb-6">
            <p className="mb-2 small uppercase tracking-widest text-[var(--landing-accent-secondary)]">
              Starter
            </p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-white">$9</span>
              <span className="pb-2 text-sm text-[var(--landing-text-muted)]">/month</span>
            </div>
            <p className="mt-1 text-sm text-[var(--landing-text-muted)]">25 audits / month</p>
          </div>

          <ul className="relative mb-8 space-y-3">
            {STARTER_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <Check size={14} className="flex-shrink-0 text-[var(--landing-accent-secondary)]" />
                <span className="text-sm text-[var(--landing-text-secondary)]">{f}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => router.push("/auth/signup")}
            className="btn btn-primary w-full"
          >
            Start 7-day free trial
          </button>
          <p className="mt-3 text-center small text-[var(--landing-text-muted)]">
            No credit card required
          </p>
        </motion.div>

        {/* Pro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card"
          style={{ background: "var(--landing-card-bg)" }}
        >
          <div className="mb-6">
            <p className="mb-2 small uppercase tracking-widest text-[var(--landing-accent-secondary)]">
              Pro
            </p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-white">$29</span>
              <span className="pb-2 text-sm text-[var(--landing-text-muted)]">/month</span>
            </div>
            <p className="mt-1 text-sm text-[var(--landing-text-muted)]">Unlimited audits</p>
          </div>

          <ul className="relative mb-8 space-y-3">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <Check size={14} className="flex-shrink-0 text-[var(--landing-accent-secondary)]" />
                <span className="text-sm text-[var(--landing-text-secondary)]">{f}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => router.push("/auth/signup")}
            className="btn btn-primary w-full"
          >
            <Zap size={14} />
            Start 7-day free trial
          </button>
          <p className="mt-3 text-center small text-[var(--landing-text-muted)]">
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
        className="mt-8 text-center small italic text-[var(--landing-text-muted)]"
      >
        &ldquo;Most users fix their top 3 issues on the free plan. Starter is for growth-focused teams.&rdquo;
      </motion.p>
    </section>
  );
}
