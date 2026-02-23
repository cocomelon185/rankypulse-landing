"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card } from "@/components/horizon";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { RazorpayCheckoutButton } from "@/components/RazorpayCheckoutButton";
import { RazorpayComingSoonModal } from "@/components/RazorpayComingSoonModal";
import { Check, ChevronDown, Sparkles, CreditCard } from "lucide-react";
import { track } from "@/lib/analytics";

const plans = [
  {
    name: "Free",
    priceUsd: "$0",
    priceInr: "Free",
    audits: "3 audits/month",
    features: ["Basic SEO audit", "Copy-ready fixes", "Sample reports"],
    cta: "Get started",
    href: "/audit",
    popular: false,
    isPaid: false,
  },
  {
    name: "Starter",
    priceUsd: "$9",
    priceInr: "₹999",
    audits: "20 audits/month",
    features: [
      "Everything in Free",
      "Discoverability dashboard",
      "Score tracking",
    ],
    cta: "Buy Starter",
    href: "/auth/signup",
    popular: true,
    isPaid: true,
  },
  {
    name: "Pro",
    priceUsd: "$19",
    priceInr: "₹1,699",
    audits: "75 audits/month",
    features: [
      "Everything in Starter",
      "Competitor gap finder",
      "Growth tracker",
      "Priority support",
    ],
    cta: "Buy Pro",
    href: "/auth/signup",
    popular: false,
    isPaid: true,
  },
];

const faqs = [
  {
    q: "Can I change plans later?",
    a: "Yes, you can upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes! The Free plan includes 3 audits per month with no credit card required.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards, PayPal, and Razorpay for INR. Enterprise customers can also pay via invoice.",
  },
];

export default function PricingClientPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [currency, setCurrency] = useState<"USD" | "INR">("INR");
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayModalPlan, setRazorpayModalPlan] = useState<string>("Starter");

  useEffect(() => {
    track("pricing_view");
  }, []);

  return (
    <PageLayout>
      <PageHeader
        icon={<CreditCard className="h-7 w-7" />}
        title="Pricing"
        subtitle="Simple plans for every team. Start free, upgrade when you need more."
      />

      {/* Currency toggle */}
      <div className="mb-12 flex justify-center">
        <div className="inline-flex rounded-xl bg-white p-1 shadow-md">
          <button
            onClick={() => setCurrency("USD")}
            className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${
              currency === "USD"
                ? "bg-gradient-to-r from-[#4318ff] to-[#7551ff] text-white shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            USD
          </button>
          <button
            onClick={() => setCurrency("INR")}
            className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${
              currency === "INR"
                ? "bg-gradient-to-r from-[#4318ff] to-[#7551ff] text-white shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            INR
          </button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            extra={`relative p-6 md:p-8 transition-all duration-300 ${
              plan.popular
                ? "ring-2 ring-[#4318ff] shadow-[14px_17px_40px_4px_rgba(112,144,176,0.15)] scale-[1.02] hover:scale-[1.03]"
                : "hover:shadow-[14px_17px_40px_4px_rgba(112,144,176,0.12)] hover:-translate-y-1"
            }`}
            default={true}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-gradient-to-r from-[#4318ff] to-[#7551ff] px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
                <Sparkles className="h-3 w-3" />
                Most popular
              </div>
            )}
            <h2 className="mb-2 text-xl font-bold text-[#1B2559]">{plan.name}</h2>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">
                {currency === "USD" ? plan.priceUsd : plan.priceInr}
              </span>
              {plan.priceUsd !== "$0" && (
                <span className="ml-1 text-gray-500">/month</span>
              )}
              {plan.priceUsd !== "$0" && (
                <p className="mt-1 text-xs text-gray-500">
                  Billing: monthly · {currency === "USD" ? `≈ ${plan.priceInr}` : `≈ ${plan.priceUsd}`} equivalent
                </p>
              )}
            </div>
            <p className="mb-6 text-gray-600">{plan.audits}</p>
            <ul className="mb-8 space-y-3">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                  <Check className="h-5 w-5 shrink-0 text-green-500" />
                  {f}
                </li>
              ))}
            </ul>
            {plan.isPaid ? (
              currency === "INR" ? (
                <RazorpayCheckoutButton
                  plan={plan.name as "Starter" | "Pro"}
                  planSlug={plan.name.toLowerCase() as "starter" | "pro"}
                  currency="INR"
                  variant={plan.popular ? "primary" : "secondary"}
                  className="w-full"
                  onClick={() => track("pricing_cta_click", { plan: plan.name })}
                >
                  {plan.cta}
                </RazorpayCheckoutButton>
              ) : (
                <Button
                  className="w-full"
                  variant={plan.popular ? "primary" : "secondary"}
                  size="lg"
                  onClick={() => {
                    track("pricing_cta_click", { plan: plan.name });
                    setRazorpayModalPlan(plan.name);
                    setShowRazorpayModal(true);
                  }}
                >
                  {plan.cta}
                </Button>
              )
            ) : (
              <Link
                href={plan.href}
                className="inline-flex h-12 w-full items-center justify-center rounded-xl px-8 text-base font-semibold transition-all bg-gray-100 text-gray-800 hover:bg-gray-200 md:h-12"
                onClick={() => track("pricing_cta_click", { plan: plan.name })}
              >
                {plan.cta}
              </Link>
            )}
            {plan.priceUsd !== "$0" && (
              <p className="mt-4 text-center text-xs text-gray-500">
                {currency === "INR" ? "Razorpay (INR)" : "Stripe (USD)"}
              </p>
            )}
          </Card>
        ))}
      </div>

      {/* Trust badges */}
      <div className="mt-16 flex flex-wrap items-center justify-center gap-8 rounded-2xl border border-gray-200/80 bg-white px-8 py-8 shadow-[14px_17px_40px_4px_rgba(112,144,176,0.06)]">
        <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Check className="h-5 w-5 text-green-500" />
          No credit card required
        </span>
        <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Check className="h-5 w-5 text-green-500" />
          Cancel anytime
        </span>
        <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Check className="h-5 w-5 text-green-500" />
          Secure payment
        </span>
      </div>

      {/* Refund / Support note */}
      <p className="mt-8 text-center text-sm text-gray-500">
        Refunds available within 7 days. Contact support@rankypulse.com for help.
      </p>

      {/* FAQ accordion */}
      <div className="mx-auto mt-16 max-w-2xl">
        <h2 className="mb-8 text-center text-2xl font-bold text-[#1B2559]">
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left font-semibold text-gray-900 transition-colors hover:bg-gray-50"
              >
                {faq.q}
                <ChevronDown
                  className={`h-5 w-5 shrink-0 transition-transform ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="border-t border-gray-100 px-6 py-5 text-gray-600">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {showRazorpayModal && (
        <RazorpayComingSoonModal
          onClose={() => setShowRazorpayModal(false)}
          planName={razorpayModalPlan}
          paymentType={currency === "USD" ? "stripe" : "razorpay"}
        />
      )}
    </PageLayout>
  );
}
