"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { RazorpayCheckoutButton } from "@/components/RazorpayCheckoutButton";
import { ChevronDown, Zap, Check, X } from "lucide-react";
import { track } from "@/lib/analytics";

// ── Plan data ──────────────────────────────────────────────────────────────────

const plans = [
  {
    name: "Free",
    monthlyUsd: 0,
    monthlyInr: 0,
    annualUsd: 0,
    annualInr: 0,
    priceLabel: { usd: "$0", inr: "Free" },
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
    monthlyUsd: 9,
    monthlyInr: 999,
    annualUsd: 7,
    annualInr: 799,
    priceLabel: { usd: "$9", inr: "₹999" },
    audits: "25 audits / month",
    tagline: "For founders tracking their site",
    features: [
      "Everything in Free",
      "Keyword Gap & Traffic Stealer",
      "Backlink Gap Authority tool",
      "On-Page SEO Checker targets",
      "Score & visibility tracking",
    ],
    cta: "Start 7-day free trial",
    href: "/auth/signup",
    popular: true,
    isPaid: true,
  },
  {
    name: "Pro",
    monthlyUsd: 29,
    monthlyInr: 2600,
    annualUsd: 23,
    annualInr: 2080,
    priceLabel: { usd: "$29", inr: "₹2,600" },
    audits: "Unlimited audits",
    tagline: "For agencies and power users",
    features: [
      "Everything in Starter",
      "Position Tracking Scoreboard",
      "SEO Writing AI Assistant",
      "Topic Research & clustering",
      "White-label PDF exports",
    ],
    cta: "Start 7-day free trial",
    href: "/auth/signup",
    popular: false,
    isPaid: true,
  },
] as const;

// ── Comparison table data ─────────────────────────────────────────────────────

const comparisonFeatures = [
  { name: "Monthly audits", free: "3", starter: "25", pro: "Unlimited" },
  { name: "SEO score & issues", free: true, starter: true, pro: true },
  { name: "Copy-ready fix snippets", free: true, starter: true, pro: true },
  { name: "SERP preview", free: true, starter: true, pro: true },
  { name: "Top issues shown", free: "3 per audit", starter: "All", pro: "All" },
  { name: "Keyword Gap Analysis", free: false, starter: true, pro: true },
  { name: "Backlink Gap Authority", free: false, starter: true, pro: true },
  { name: "On-Page SEO Checker", free: false, starter: true, pro: true },
  { name: "Score tracking over time", free: false, starter: true, pro: true },
  { name: "Position Tracking", free: false, starter: false, pro: true },
  { name: "AI Writing Assistant", free: false, starter: false, pro: true },
  { name: "Topic Research & Clustering", free: false, starter: false, pro: true },
  { name: "White-label PDF exports", free: false, starter: false, pro: true },
  { name: "Priority support", free: false, starter: false, pro: true },
];

const faqs = [
  {
    q: "Can I change plans later?",
    a: "Yes, you can upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes! Paid plans include a 7-day free trial with full access. No credit card required for the Free plan.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards via Razorpay (USD & INR). Enterprise customers can pay by invoice.",
  },
  {
    q: "Do audit result pages get cached?",
    a: "Yes — results are cached for 1 hour so re-running the same domain doesn't burn through your monthly quota.",
  },
  {
    q: "What happens after the free trial?",
    a: "You'll be charged the plan price after 7 days. Cancel anytime before and you won't be charged.",
  },
  {
    q: "Can I get a refund?",
    a: "Absolutely. We offer full refunds within 7 days of any charge, no questions asked.",
  },
];

// ── SVG check icon ────────────────────────────────────────────────────────────

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

// ── Format price helper ───────────────────────────────────────────────────────

function formatPrice(amount: number, currency: "USD" | "INR"): string {
  if (amount === 0) return currency === "USD" ? "$0" : "Free";
  if (currency === "USD") return `$${amount}`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PricingClientPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  useEffect(() => {
    track("pricing_view", { source: getPricingViewSource() });
  }, []);

  const isAnnual = billing === "annual";

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
          className="mb-10 text-center"
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
            All paid plans include a 7-day free trial. No credit card required to start.
          </p>
        </motion.div>

        {/* ── Billing + Currency toggles ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6"
        >
          {/* Monthly / Annual toggle */}
          <div
            className="inline-flex rounded-xl border border-white/8 p-1"
            style={{ background: "#13161f" }}
          >
            {(["monthly", "annual"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`relative rounded-lg px-5 py-2 font-['DM_Mono'] text-sm font-semibold transition-all ${billing === b
                  ? "bg-indigo-500 text-white shadow"
                  : "text-gray-500 hover:text-gray-300"
                  }`}
              >
                {b === "monthly" ? "Monthly" : "Annual"}
                {b === "annual" && (
                  <span className="absolute -right-2 -top-2 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                    -20%
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Currency toggle */}
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
            const price = isAnnual
              ? (currency === "USD" ? plan.annualUsd : plan.annualInr)
              : (currency === "USD" ? plan.monthlyUsd : plan.monthlyInr);
            const monthlyEquiv = isAnnual
              ? (currency === "USD" ? plan.monthlyUsd : plan.monthlyInr)
              : null;

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
                    {formatPrice(price, currency)}
                  </span>
                  {plan.isPaid && (
                    <span className="mb-1.5 font-['DM_Sans'] text-sm text-gray-500">
                      / month
                    </span>
                  )}
                </div>

                {/* Annual savings note */}
                {plan.isPaid && isAnnual && monthlyEquiv && (
                  <p className="mb-1 font-['DM_Mono'] text-xs text-emerald-400">
                    Save {formatPrice(monthlyEquiv - price, currency)}/mo vs monthly
                  </p>
                )}

                {/* Trial badge for paid */}
                {plan.isPaid && (
                  <p className="mb-1 font-['DM_Mono'] text-xs text-indigo-400">
                    7-day free trial included
                  </p>
                )}

                {/* Audit quota */}
                <p className="mb-6 font-['DM_Mono'] text-xs uppercase tracking-wider text-indigo-400/70">
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
                      billing={billing}
                      variant={isPopular ? "primary" : "secondary"}
                      className="w-full"
                      onClick={() => {
                        track("upgrade_click", { plan: plan.name, placement: "pricing", billing });
                        track("checkout_start", { planId: plan.name, billingCycle: billing });
                      }}
                    >
                      {plan.cta}
                    </RazorpayCheckoutButton>
                    <p className="mt-3 text-center font-['DM_Mono'] text-xs text-gray-600">
                      Razorpay · {currency} · Cancel anytime
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

        {/* ── Social proof strip ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-10 rounded-2xl border border-white/6 px-8 py-8"
          style={{ background: "#13161f" }}
        >
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
            <div className="text-center">
              <p className="font-['Fraunces'] text-3xl font-bold text-white">12,000+</p>
              <p className="font-['DM_Sans'] text-sm text-gray-500">Audits run</p>
            </div>
            <div className="hidden h-8 w-px bg-white/10 sm:block" />
            <div className="text-center">
              <p className="font-['Fraunces'] text-3xl font-bold text-white">2,400+</p>
              <p className="font-['DM_Sans'] text-sm text-gray-500">Sites improved</p>
            </div>
            <div className="hidden h-8 w-px bg-white/10 sm:block" />
            <div className="text-center">
              <p className="font-['Fraunces'] text-3xl font-bold text-white">30 sec</p>
              <p className="font-['DM_Sans'] text-sm text-gray-500">Average audit time</p>
            </div>
            <div className="hidden h-8 w-px bg-white/10 sm:block" />
            <div className="text-center">
              <p className="font-['Fraunces'] text-3xl font-bold text-white">4.8★</p>
              <p className="font-['DM_Sans'] text-sm text-gray-500">User satisfaction</p>
            </div>
          </div>
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
            "7-day free trial",
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

        {/* ── Comparison table ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-20"
        >
          <h2
            className="mb-8 text-center font-['Fraunces'] font-bold text-white"
            style={{ fontSize: "clamp(22px, 3vw, 32px)" }}
          >
            Compare plans
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-white/6" style={{ background: "#13161f" }}>
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="px-6 py-4 text-left font-['DM_Sans'] text-sm font-semibold text-gray-400">
                    Feature
                  </th>
                  {(["Free", "Starter", "Pro"] as const).map((name) => (
                    <th key={name} className="px-6 py-4 text-center font-['DM_Sans'] text-sm font-semibold text-white">
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr key={i} className={i < comparisonFeatures.length - 1 ? "border-b border-white/4" : ""}>
                    <td className="px-6 py-3.5 font-['DM_Sans'] text-sm text-gray-300">
                      {row.name}
                    </td>
                    {([row.free, row.starter, row.pro] as (boolean | string)[]).map((val, j) => (
                      <td key={j} className="px-6 py-3.5 text-center">
                        {typeof val === "boolean" ? (
                          val ? (
                            <Check size={16} className="mx-auto text-emerald-400" />
                          ) : (
                            <X size={16} className="mx-auto text-gray-600" />
                          )
                        ) : (
                          <span className="font-['DM_Mono'] text-xs text-gray-300">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

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

      {/* ── FAQ Schema (structured data) ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
              },
            })),
          }),
        }}
      />
    </main>
  );
}
