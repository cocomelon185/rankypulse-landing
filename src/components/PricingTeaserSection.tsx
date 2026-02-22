"use client";

import Link from "next/link";
import { Card } from "@/components/horizon";
import { Check } from "lucide-react";

export function PricingTeaserSection() {
  return (
    <section className="py-12 px-4 md:px-8" aria-labelledby="pricing-teaser-heading">
      <div className="mx-auto max-w-2xl">
        <h2 id="pricing-teaser-heading" className="mb-6 text-center text-xl font-bold text-[#1B2559] md:text-2xl">
          Simple pricing for every team
        </h2>
        <Card extra="p-8 text-center" default={true}>
          <p className="mb-6 text-lg text-gray-600">
            Start free. Upgrade when you need more audits.
          </p>
          <div className="mb-8 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" aria-hidden />
              Free tier available
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" aria-hidden />
              No credit card required
            </span>
          </div>
          <Link
            href="/pricing"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#4318ff] px-8 text-base font-semibold text-white transition-all hover:bg-[#3311db]"
          >
            View pricing
          </Link>
        </Card>
      </div>
    </section>
  );
}
