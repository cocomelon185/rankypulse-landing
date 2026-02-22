"use client";

import { Card, CircularProgress } from "@/components/horizon";
import { ArrowRight } from "lucide-react";

const beforeItems = [
  "Missing meta description",
  "Weak title (< 30 chars)",
  "No schema markup",
];

const afterItems = [
  "Optimized title (50–60 chars)",
  "Improved score (+14 pts)",
  "Structured data added",
];

export function BeforeAfterSection() {
  return (
    <section className="section-padding bg-gradient-to-b from-gray-50 to-white px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-[#1B2559] md:text-4xl">
            Before / After impact
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            See the difference RankyPulse makes
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-3 lg:items-center">
          <Card extra="p-8 border-2 border-red-200/60" default={true}>
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-red-600">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">✗</span>
              Before RankyPulse
            </h3>
            <ul className="space-y-4">
              {beforeItems.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
          <div className="flex flex-col items-center justify-center">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
              <CircularProgress percentage={82} title="Score" size={160} />
            </div>
            <p className="mt-6 text-center text-lg font-semibold text-gray-700">
              68 → 82 after quick fixes
            </p>
            <ArrowRight className="mt-4 h-8 w-8 text-[#4318ff]" />
          </div>
          <Card extra="p-8 border-2 border-green-200/60" default={true}>
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-green-600">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">✓</span>
              After RankyPulse
            </h3>
            <ul className="space-y-4">
              {afterItems.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
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
