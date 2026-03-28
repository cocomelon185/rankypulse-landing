"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

type Availability = true | false | "partial";

interface FeatureRow {
  feature: string;
  free: Availability;
  pro: Availability;
  business: Availability;
}

interface CategoryBlock {
  category: string;
  rows: FeatureRow[];
}

const PRICING: CategoryBlock[] = [
  {
    category: "Core Features",
    rows: [
      { feature: "Full SEO Audit", free: true, pro: true, business: true },
      { feature: "Glossary Tooltips", free: true, pro: true, business: true },
      { feature: "Top Issues Report", free: "partial", pro: true, business: true },
      { feature: "SERP Before/After Preview", free: false, pro: true, business: true },
    ],
  },
  {
    category: "AI & Insights",
    rows: [
      { feature: "Traffic Opportunity ROI", free: false, pro: true, business: true },
      { feature: "AI Fix Assistant (code snippets)", free: false, pro: true, business: true },
      { feature: "Score Sparklines & History", free: false, pro: true, business: true },
      { feature: "Effort / Impact Scoring", free: false, pro: true, business: true },
      { feature: "Priority Metrics Dashboard", free: false, pro: true, business: true },
    ],
  },
  {
    category: "Agency Tools",
    rows: [
      { feature: "White-Label Reports", free: false, pro: false, business: true },
      { feature: "Custom Logo & Brand Colors", free: false, pro: false, business: true },
      { feature: "Secure Share Links", free: false, pro: false, business: true },
      { feature: "Niche Benchmarking", free: false, pro: false, business: true },
      { feature: "Competitor Comparison", free: false, pro: false, business: true },
      { feature: "Priority Support", free: false, pro: false, business: true },
    ],
  },
];

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    sub: "No credit card",
    cta: "Get started free",
    ctaVariant: "secondary" as const,
    highlight: false,
    ringClass: "",
    glowClass: "",
    badgeText: null,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    sub: "/month",
    cta: "Start free trial",
    ctaVariant: "primary" as const,
    highlight: true,
    ringClass: "ring-2 ring-[#FF642D]/60",
    glowClass: "bg-[#FF642D]/5",
    badgeText: "Most Popular",
  },
  {
    id: "business",
    name: "Business",
    price: "$49",
    sub: "/month",
    cta: "Start free trial",
    ctaVariant: "secondary" as const,
    highlight: false,
    ringClass: "ring-2 ring-[#7B5CF5]/40",
    glowClass: "bg-[#7B5CF5]/5",
    badgeText: "For Agencies",
  },
];

function AvailabilityCell({ value, colIdx }: { value: Availability; colIdx: number }) {
  const colors = ["text-slate-500", "text-[#FF642D]", "text-[#7B5CF5]"];
  const col = colors[colIdx] ?? "text-slate-400";

  if (value === true) {
    return <Check size={16} className={col} />;
  }
  if (value === false) {
    return <X size={14} className="text-white/15" />;
  }
  // partial
  return (
    <span className="rounded-sm border border-slate-600/40 bg-slate-700/30 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
      Top 3
    </span>
  );
}

export function PricingTeaser() {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  let rowIdx = 0;

  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <p className="mb-3 font-['DM_Mono'] text-xs uppercase tracking-widest text-slate-600">
          Pricing
        </p>
        <h2
          className="font-['Fraunces'] font-bold leading-tight tracking-tight text-white"
          style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
        >
          Start free.{" "}
          <span className="italic text-[#FF642D]">Upgrade when you&apos;re ready.</span>
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-base text-slate-400">
          All plans include a free 7-day trial. No credit card required to start.
        </p>
      </motion.div>

      {/* Table */}
      <div ref={ref} className="overflow-hidden rounded-2xl border border-white/[0.06]">
        {/* Header row */}
        <div className="grid grid-cols-4 border-b border-white/[0.06]">
          {/* Empty first cell */}
          <div className="p-5" />

          {PLANS.map((plan, pi) => (
            <div
              key={plan.id}
              className={`relative p-5 text-center ${plan.highlight ? "bg-[#FF642D]/5" : plan.glowClass}`}
            >
              {plan.badgeText && (
                <span
                  className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    pi === 1
                      ? "bg-[#FF642D] text-white"
                      : "border border-[#7B5CF5]/40 bg-[#7B5CF5]/10 text-[#7B5CF5]"
                  }`}
                >
                  {plan.badgeText}
                </span>
              )}
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                {plan.name}
              </p>
              <div className="flex items-end justify-center gap-1">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="mb-1 text-xs text-slate-500">{plan.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Feature rows */}
        {PRICING.map((block) => (
          <div key={block.category}>
            {/* Category separator */}
            <div className="grid grid-cols-4 border-b border-white/[0.04] bg-white/[0.01]">
              <div className="col-span-4 px-5 py-2.5">
                <span className="font-['DM_Mono'] text-[10px] uppercase tracking-[2px] text-slate-600">
                  {block.category}
                </span>
              </div>
            </div>

            {block.rows.map((row) => {
              const currentIdx = rowIdx++;
              return (
                <motion.div
                  key={row.feature}
                  initial={{ opacity: 0, x: -8 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                  transition={{ delay: 0.05 + currentIdx * 0.04, duration: 0.35 }}
                  className="grid grid-cols-4 border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-center px-5 py-3.5">
                    <span className="text-sm text-slate-400">{row.feature}</span>
                  </div>
                  {([row.free, row.pro, row.business] as Availability[]).map((val, ci) => (
                    <div
                      key={ci}
                      className={`flex items-center justify-center py-3.5 ${
                        ci === 1 ? "bg-[#FF642D]/[0.03]" : ci === 2 ? "bg-[#7B5CF5]/[0.02]" : ""
                      }`}
                    >
                      <AvailabilityCell value={val} colIdx={ci} />
                    </div>
                  ))}
                </motion.div>
              );
            })}
          </div>
        ))}

        {/* CTA row */}
        <div className="grid grid-cols-4">
          <div className="p-5" />
          {PLANS.map((plan, pi) => (
            <div
              key={plan.id}
              className={`p-5 ${pi === 1 ? "bg-[#FF642D]/5" : pi === 2 ? "bg-[#7B5CF5]/5" : ""}`}
            >
              <button
                onClick={() => router.push(plan.id === "free" ? "/" : "/auth/signup")}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
                  pi === 1
                    ? "bg-[#FF642D] text-white hover:bg-[#E8541F]"
                    : pi === 2
                    ? "border border-[#7B5CF5]/40 bg-[#7B5CF5]/10 text-[#7B5CF5] hover:bg-[#7B5CF5]/20"
                    : "border border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {pi === 1 && <Zap size={14} />}
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-center text-sm italic text-slate-600"
      >
        &ldquo;Most freelancers fix their top 3 issues free. Pro pays for itself in one client retainer. Business closes the deal.&rdquo;
      </motion.p>
    </section>
  );
}
