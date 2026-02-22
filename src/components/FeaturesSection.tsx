"use client";

import { Card } from "@/components/horizon";
import { ListChecks, Cpu, BarChart3, Map } from "lucide-react";

const features = [
  {
    title: "Prioritized Action Plans",
    description: "Know exactly what to fix first — not just what's wrong.",
    icon: ListChecks,
  },
  {
    title: "Technical SEO Insights",
    description: "From indexing to speed, uncover issues blocking growth.",
    icon: Cpu,
  },
  {
    title: "Competitor Visibility Signals",
    description: "See how your site compares and where opportunities exist.",
    icon: BarChart3,
  },
  {
    title: "Clear Growth Roadmap",
    description: "Turn your audit into a repeatable SEO improvement process.",
    icon: Map,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-14 px-4 md:px-8" aria-labelledby="features-heading">
      <div className="mx-auto max-w-7xl">
        <h2 id="features-heading" className="mb-6 text-center text-2xl font-bold text-[#1B2559] md:text-3xl">
          Outcomes
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card
                key={i}
                extra="group p-6 md:p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[14px_17px_40px_4px_rgba(112,144,176,0.15)]"
                default={true}
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#4318ff]">
                  <Icon className="h-7 w-7" aria-hidden />
                </div>
                <h3 className="mb-3 text-xl font-bold text-[#1B2559]">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
