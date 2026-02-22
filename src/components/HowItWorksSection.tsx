"use client";

import { Card } from "@/components/horizon";
import { Link2, Zap, TrendingUp } from "lucide-react";

const steps = [
  {
    title: "Enter your URL",
    description: "Paste your website URL and we analyze it in seconds. No signup required for the free trial.",
    icon: Link2,
    step: 1,
  },
  {
    title: "Get instant SEO fixes",
    description: "Receive copy-ready fixes, schema suggestions, meta improvements, and AI-generated recommendations.",
    icon: Zap,
    step: 2,
  },
  {
    title: "Improve rankings & track growth",
    description: "Apply fixes and monitor your discoverability score over time. See the impact of every change.",
    icon: TrendingUp,
    step: 3,
  },
];

export function HowItWorksSection() {
  return (
    <section className="section-padding px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-[#1B2559] md:text-4xl">
            How it works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Three simple steps to better SEO
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
            <Card
              key={i}
              extra="relative p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[14px_17px_40px_4px_rgba(112,144,176,0.15)]"
              default={true}
            >
              <div className="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4318ff] to-[#7551ff] text-sm font-bold text-white shadow-lg">
                {step.step}
              </div>
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eff6ff] to-[#e0e7ff] text-[#4318ff]">
                <Icon className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-[#1B2559]">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
            </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
