"use client";

import Link from "next/link";
import { Card } from "@/components/horizon";

const problemBullets = [
  "They give you scores instead of actions.",
  "They overwhelm you with noise instead of priorities.",
  "They don't connect fixes to real growth.",
];

export function ProblemSection() {
  return (
    <section className="py-14 px-4 md:px-8 bg-white" aria-labelledby="problem-heading">
      <div className="mx-auto max-w-3xl">
        <h2 id="problem-heading" className="mb-6 text-center text-2xl font-bold text-[#1B2559] md:text-3xl">
          Why most SEO audits don&apos;t improve rankings
        </h2>
        <Card extra="p-6 md:p-8" default={true}>
          <ul className="mb-6 space-y-3">
            {problemBullets.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-base text-gray-700 md:text-lg">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <p className="mb-6 text-center text-base font-semibold text-[#4318ff] md:text-lg">
            RankyPulse was built to solve exactly that.
          </p>
          <div className="flex justify-center">
            <Link
              href="https://rankypulse.com/audit"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[#4318ff] px-6 text-base font-semibold text-white shadow-md transition-all hover:bg-[#3311db] hover:shadow-lg"
            >
              Run free audit
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}
