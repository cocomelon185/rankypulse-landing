"use client";

import { Card } from "@/components/horizon";

const beforeItems = [
  "Slow pages hurting rankings",
  "Missing canonical tags",
  "Broken internal links",
  "Confusing SEO reports",
];

const afterItems = [
  "Clear prioritized fixes",
  "Faster pages & better indexing",
  "Clean internal structure",
  "Action plan you can execute today",
];

export function BeforeAfterSection() {
  return (
    <section className="py-14 px-4 md:px-8" aria-labelledby="before-after-heading">
      <div className="mx-auto max-w-7xl">
        <h2 id="before-after-heading" className="mb-6 text-center text-2xl font-bold text-[#1B2559] md:text-3xl">
          What you fix with RankyPulse vs. what other tools leave behind
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card extra="p-6 border-2 border-red-200/60" default={true}>
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-red-600">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600" aria-hidden>✗</span>
              Before
            </h3>
            <ul className="space-y-4">
              {beforeItems.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600">
                  <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
          <Card extra="p-6 border-2 border-green-200/60" default={true}>
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-green-600">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600" aria-hidden>✓</span>
              After
            </h3>
            <ul className="space-y-4">
              {afterItems.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}
