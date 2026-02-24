"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { Card } from "@/components/horizon";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, X } from "lucide-react";

interface PricingModalProps {
  onClose: () => void;
}

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
    href: "/pricing",
    popular: true,
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
    href: "/pricing",
    popular: false,
  },
];

export function PricingModal({ onClose }: PricingModalProps) {
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="mb-2 text-2xl font-bold text-[#1B2559]">Choose your plan</h2>
        <p className="mb-6 text-gray-600">
          Simple plans for every team. Start free, upgrade when you need more.
        </p>

        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => setCurrency("USD")}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
                currency === "USD" ? "bg-white text-[#4318ff] shadow" : "text-gray-600"
              }`}
            >
              USD
            </button>
            <button
              onClick={() => setCurrency("INR")}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
                currency === "INR" ? "bg-white text-[#4318ff] shadow" : "text-gray-600"
              }`}
            >
              INR
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              extra={`relative p-6 transition-all ${
                plan.popular ? "ring-2 ring-[#4318ff] shadow-lg" : ""
              }`}
              default={true}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-gradient-to-r from-[#4318ff] to-[#7551ff] px-4 py-1.5 text-xs font-semibold text-white">
                  <Sparkles className="h-3 w-3" />
                  Most popular
                </div>
              )}
              <h3 className="mb-2 text-xl font-bold text-[#1B2559]">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {currency === "USD" ? plan.priceUsd : plan.priceInr}
                </span>
                {plan.priceUsd !== "$0" && (
                  <span className="ml-1 text-gray-500">/month</span>
                )}
              </div>
              <p className="mb-6 text-gray-600">{plan.audits}</p>
              <ul className="mb-6 space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 shrink-0 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                onClick={() => {
                  if (plan.name !== "Free") {
                    track("upgrade_click", { plan: plan.name, placement: "pricing_modal" });
                  }
                  onClose();
                }}
              >
                <Button
                  className="w-full"
                  variant={plan.popular ? "primary" : "secondary"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Check className="h-4 w-4 text-green-500" />
            No credit card required
          </span>
          <span className="flex items-center gap-1">
            <Check className="h-4 w-4 text-green-500" />
            Cancel anytime
          </span>
          <span className="flex items-center gap-1">
            <Check className="h-4 w-4 text-green-500" />
            Secure payment
          </span>
        </div>
      </div>
    </div>
  );
}
