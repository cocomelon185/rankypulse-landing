"use client";

import { Card } from "@/components/horizon";
import { Search, ListChecks, TrendingUp } from "lucide-react";

const benefits = [
  {
    title: "Know what's holding rankings back",
    description: "Find the issues that block Google from trusting your pages.",
    icon: Search,
  },
  {
    title: "Fix faster with clear actions",
    description: "Get prioritized fixes you can implement today.",
    icon: ListChecks,
  },
  {
    title: "Track improvements over time",
    description: "Re-run audits and see progress as you ship changes.",
    icon: TrendingUp,
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-10 px-4 md:px-8"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-7xl">
        <h2
          id="features-heading"
          className="mb-5 text-center text-xl font-bold text-[#1B2559] md:text-2xl"
        >
          What you get
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={i}
                extra="p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[14px_17px_40px_4px_rgba(112,144,176,0.12)]"
                default={true}
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eff6ff] text-[#4318ff]">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#1B2559]">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
