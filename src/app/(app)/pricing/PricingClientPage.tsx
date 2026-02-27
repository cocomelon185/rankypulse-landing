"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { RazorpayCheckoutButton } from "@/components/RazorpayCheckoutButton";
import { ChevronDown, Zap } from "lucide-react";
import { track } from "@/lib/analytics";

// ── Plan data ──────────────────────────────────────────────────────────────────

const plans = [
  {
    name: "Free",
    priceUsd: "$0",
    priceInr: "Free",
    audits: "3 audits / month",
    tagline: "Start improving your SEO today",
    features: [
      "Basic SEO audit",
      "Copy-ready fixes",
      "SERP before/after preview",
      "Top 3 issues per audit",
    ],
    cta: "Start free",
    href: "/",
    popular: false,
    isPaid: false,
  },
  {
    name: "Starter",
    priceUsd: "$9",
    priceInr: "₹999",
    audits: "25 audits / month",
    tagline: "For founders tracking their site",
    features: [
      "Everything in Free",
      "Discoverability dashboard",
      "Score tracking over time",
      "Email reports",
      "All issues unlocked",
    ],
    cta: "Buy Starter",
    href: "/auth/signup",
    popular: true,
    isPaid: true,
  },
  {
    name: "Pro",
    priceUsd: "$29",
    priceInr: "₹2,600",
    audits: "Unlimited audits",
    tagline: "For agencies and power users",
    features: [
      "Everything in Starter",
      "Competitor gap finder",
      "Growth tracker",
      "PDF exports",
      "Priority support",
    ],
    cta: "Buy Pro",
    href: "/auth/signup",
    popular: false,
    isPaid: true,
  },
] as const;

const faqs = [
  {
    q: "Can I change plans later?",
    a: "Yes, you can upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes! The Free plan includes 3 audits per month with no credit card required. Try it as long as you like.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards via Razorpay (USD & INR). Enterprise customers can pay by invoice.",
  },
  {
    q: "Do audit result pages get cached?",
    a: "Yes — results are cached for 1 hour so re-running the same domain doesn't burn through your monthly quota.",
  },
];

// ── SVG check icon — consistent across OS/browser ─────────────────────────────

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" className="flex-shrink-0" aria-hidden>
    <circle cx="7.5" cy="7.5" r="7" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.35)" />
    <path d="M4.5 7.5l2 2 4-4" stroke="#10b981" strokeWidth="1.5"
      fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Animation helpers ──────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const } },
};
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

// ── Analytics util ────────────────────────────────────────────────────────────

function getPricingViewSource(): "audit" | "direct" {
  if (typeof window === "undefined") return "direct";
  const params = new URLSearchParams(window.location.search);
  if (params.get("source") === "audit") return "audit";
  try {
    if ((document.referrer || "").includes("/audit/results")) return "audit";
  } catch {
    // ignore
  }
  return "direct";
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PricingClientPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");

  useEffect(() => {
    track("pricing_view", { source: getPricingViewSource() });
  }, []);

  return (
    <main
      className="relative min-h-screen px-6 pb-24 pt-24"
      style={{ background: "#0d0f14" }}
    >
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-500/7 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-5xl">

        {/* ── Heading ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-14 text-center"
        >
          <p className="mb-4 font-['DM_Mono'] text-xs uppercase tracking-widest text-indigo-400">
            Pricing
          </p>
          <h1
            className="font-['Fraunces'] font-bold leading-tight tracking-tight text-white"
            style={{ fontSize: "clamp(32px, 5vw, 52px)" }}
          >
            Start free.{" "}
            <span className="italic text-indigo-400">Upgrade when you&apos;re ready.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg font-['DM_Sans'] text-base text-gray-400">
            Most users fix their top issues on the free plan.
            Pro unlocks the full audit depth.
          </p>
        </motion.div>

        {/* ── Currency toggle ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-12 flex justify-center"
        >
          <div
            className="inline-flex rounded-xl border border-white/8 p-1"
            style={{ background: "#13161f" }}
          >
            {(["USD", "INR"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`rounded-lg px-6 py-2 font-['DM_Mono'] text-sm font-semibold transition-all ${currency === c
                  ? "bg-indigo-500 text-white shadow"
                  : "text-gray-500 hover:text-gray-300"
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Plan cards ── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mb-16 grid gap-6 md:grid-cols-3"
        >
          {plans.map((plan) => {
            const isPopular = plan.popular;
            return (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 ${isPopular
                  ? "border-indigo-500/40 hover:-translate-y-1"
                  : "border-white/6 hover:-translate-y-0.5 hover:border-white/12"
                  }`}
                style={{
                  background: isPopular ? "rgba(99,102,241,0.07)" : "#13161f",
                  boxShadow: isPopular
                    ? "0 0 0 1px rgba(99,102,241,0.3), 0 24px 60px rgba(99,102,241,0.12)"
                    : undefined,
                }}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 rounded-full bg-indigo-500 px-4 py-1.5 font-['DM_Mono'] text-xs font-semibold tracking-wider text-white shadow-lg shadow-indigo-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                      MOST POPULAR
                    </div>
                  </div>
                )}

                {/* Plan name + tagline */}
                <div className="mb-6">
                  <h2 className="mb-1 font-['Fraunces'] text-2xl font-bold text-white">
                    {plan.name}
                  </h2>
                  <p className="font-['DM_Sans'] text-sm text-gray-500">{plan.tagline}</p>
                </div>

                {/* Price */}
                <div className="mb-2 flex items-end gap-2">
                  <span
                    className="font-['Fraunces'] font-bold text-white"
                    style={{ fontSize: "clamp(40px, 5vw, 52px)", lineHeight: 1 }}
                  >
                    {currency === "USD" ? plan.priceUsd : plan.priceInr}
                  </span>
                  {plan.isPaid && (
                    <span className="mb-1.5 font-['DM_Sans'] text-sm text-gray-500">
                      / month
                    </span>
                  )}
                </div>

                {/* Equivalence note */}
                {plan.isPaid && (
                  <p className="mb-1 font-['DM_Mono'] text-xs text-gray-600">
                    ≈ {currency === "USD" ? plan.priceInr : plan.priceUsd} equivalent
                  </p>
                )}

                {/* Audit quota */}
                <p className="mb-6 font-['DM_Mono'] text-xs uppercase tracking-wider text-indigo-400">
                  {plan.audits}
                </p>

                {/* Feature list */}
                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 font-['DM_Sans'] text-sm text-gray-300">
                      <CheckIcon />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.isPaid ? (
                  <>
                    <RazorpayCheckoutButton
                      plan={plan.name as "Starter" | "Pro"}
                      planSlug={plan.name.toLowerCase() as "starter" | "pro"}
                      currency={currency}
                      variant={isPopular ? "primary" : "secondary"}
                      className="w-full"
                      onClick={() => {
                        track("upgrade_click", { plan: plan.name, placement: "pricing" });
                        track("checkout_start", { planId: plan.name, billingCycle: "monthly" });
                      }}
                    >
                      {plan.cta}
                    </RazorpayCheckoutButton>
                    <p className="mt-3 text-center font-['DM_Mono'] text-xs text-gray-600">
                      Razorpay · {currency}
                    </p>
                  </>
                ) : (
                  <Link
                    href={plan.href}
                    onClick={() => track("free_cta_click", { placement: "pricing" })}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-3 font-['DM_Sans'] text-sm font-semibold text-gray-300 transition-all hover:bg-white/5 hover:text-white"
                  >
                    <Zap size={13} />
                    {plan.cta}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Trust strip ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-6 flex flex-wrap items-center justify-center gap-8 rounded-2xl border border-white/6 px-8 py-6"
          style={{ background: "#13161f" }}
        >
          {[
            "No credit card required",
            "Cancel anytime",
            "Secure payment",
            "Refunds within 7 days",
          ].map((badge) => (
            <div key={badge} className="flex items-center gap-2">
              <CheckIcon />
              <span className="font-['DM_Sans'] text-sm text-gray-400">{badge}</span>
            </div>
          ))}
        </motion.div>

        <p className="mb-20 text-center font-['DM_Sans'] text-sm text-gray-600">
          Questions?{" "}
          <a
            href="mailto:support@rankypulse.com"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            support@rankypulse.com
          </a>
        </p>

        {/* ── FAQ ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mx-auto max-w-2xl"
        >
          <h2
            className="mb-8 text-center font-['Fraunces'] font-bold text-white"
            style={{ fontSize: "clamp(22px, 3vw, 32px)" }}
          >
            Frequently asked questions
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="overflow-hidden rounded-2xl border border-white/6"
                style={{ background: "#13161f" }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-white/3"
                >
                  <span className="font-['DM_Sans'] font-semibold text-white">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`flex-shrink-0 text-gray-500 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""
                      }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="border-t border-white/5 px-6 py-5 font-['DM_Sans'] text-sm leading-relaxed text-gray-400">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Bottom CTA ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <p className="mb-6 font-['DM_Sans'] text-base text-gray-400">
            Not sure yet?{" "}
            <span className="text-white">Run a free audit first.</span>
          </p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 font-['DM_Sans'] font-semibold text-sm text-white transition-all hover:-translate-y-0.5 hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/25"
          >
            <Zap size={14} />
            Try free — no signup
          </button>
        </motion.div>

      </div>


    </main>
  );
}
