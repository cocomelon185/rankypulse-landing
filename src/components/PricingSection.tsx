"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/horizon";
import { Button } from "@/components/ui/button";
import { PricingModal } from "@/components/PricingModal";
import { Sparkles, Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    priceUsd: "$0",
    priceInr: "Free",
    audits: "3 audits/month",
    cta: "Run Free Audit",
    href: "/audit",
    popular: false,
  },
  {
    name: "Starter",
    priceUsd: "$9",
    priceInr: "₹999",
    audits: "20 audits/month",
    cta: "Buy Starter",
    href: "/pricing",
    popular: true,
  },
  {
    name: "Pro",
    priceUsd: "$19",
    priceInr: "₹1,699",
    audits: "75 audits/month",
    cta: "Buy Pro",
    href: "/pricing",
    popular: false,
  },
];

export function PricingSection() {
  const [showModal, setShowModal] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");

  return (
    <section className="section-padding bg-[#f8fafc] px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-[#1B2559] md:text-4xl">
            Pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Simple plans for every team size
          </p>
          <div className="mt-6 flex justify-center">
            <div className="inline-flex rounded-xl bg-white p-1 shadow-md">
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
                  currency === "USD" ? "bg-[#4318ff] text-white" : "text-gray-600"
                }`}
              >
                USD
              </button>
              <button
                type="button"
                onClick={() => setCurrency("INR")}
                className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
                  currency === "INR" ? "bg-[#4318ff] text-white" : "text-gray-600"
                }`}
              >
                INR
              </button>
            </div>
          </div>
          <p className="mb-8 mt-6 text-center">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-sm font-semibold text-[#4318ff] transition-colors hover:underline"
            >
              Compare all plans
            </button>
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              extra={`relative p-6 md:p-8 transition-all duration-300 hover:-translate-y-2 ${
                plan.popular
                  ? "ring-2 ring-[#4318ff] shadow-[14px_17px_40px_4px_rgba(112,144,176,0.15)]"
                  : "hover:shadow-[14px_17px_40px_4px_rgba(112,144,176,0.12)]"
              }`}
              default={true}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-gradient-to-r from-[#4318ff] to-[#7551ff] px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
                  <Sparkles className="h-3 w-3" />
                  Most popular
                </div>
              )}
              <h3 className="mb-2 text-xl font-bold text-[#1B2559]">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {currency === "USD" ? plan.priceUsd : plan.priceInr}
                </span>
                {plan.priceInr !== "Free" && (
                  <span className="ml-1 text-gray-500">/ mo</span>
                )}
              </div>
              <p className="mb-6 text-gray-600">{plan.audits}</p>
              <Link href={plan.href}>
                <Button
                  className="w-full"
                  variant={plan.popular ? "primary" : "secondary"}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Check className="h-4 w-4 text-green-500" />
            No credit card required
          </span>
          <span className="flex items-center gap-1">
            <Check className="h-4 w-4 text-green-500" />
            Cancel anytime
          </span>
        </div>
      </div>
      {showModal && <PricingModal onClose={() => setShowModal(false)} />}
    </section>
  );
}
