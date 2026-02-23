"use client";

import Link from "next/link";
import { Card } from "@/components/horizon";

export function ProblemSection() {
  return (
    <section
      className="py-8 px-4 md:px-8"
      aria-labelledby="problem-heading"
    >
      <div className="mx-auto max-w-2xl">
        <Card extra="p-6 text-center md:p-8" default={true}>
          <h2
            id="problem-heading"
            className="mb-3 text-xl font-bold text-[#1B2559] md:text-2xl"
          >
            Most SEO audits give you reports. Ours gives you an action plan.
          </h2>
          <p className="mb-5 text-gray-600">
            RankyPulse turns every audit into a clear, prioritized to-do list.
          </p>
          <Link
            href="/audit"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#4318ff] px-6 text-base font-semibold text-white shadow-md transition-all hover:bg-[#3311db] hover:shadow-lg"
            aria-label="Get your SEO action plan"
          >
            Get My SEO Score
          </Link>
        </Card>
      </div>
    </section>
  );
}
