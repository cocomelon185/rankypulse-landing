"use client";

import { Card } from "@/components/horizon";
import { Search, Target, Zap } from "lucide-react";

const steps = [
  {
    title: "Scan your website",
    description: "Enter your URL and get a full SEO analysis in seconds.",
    icon: Search,
    step: 1,
  },
  {
    title: "See what matters most",
    description: "We rank issues by real impact on rankings and traffic.",
    icon: Target,
    step: 2,
  },
  {
    title: "Fix what moves the needle",
    description: "Follow your action plan and start improving visibility immediately.",
    icon: Zap,
    step: 3,
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-14 px-4 md:px-8" aria-labelledby="how-it-works-heading">
      <div className="mx-auto max-w-7xl">
        <h2 id="how-it-works-heading" className="mb-6 text-center text-2xl font-bold text-[#1B2559] md:text-3xl">
          How it works
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Card
                key={i}
                extra="relative p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[14px_17px_40px_4px_rgba(112,144,176,0.15)]"
                default={true}
              >
                <div className="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#4318ff] text-sm font-bold text-white shadow-lg">
                  {step.step}
                </div>
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#4318ff]">
                  <Icon className="h-8 w-8" aria-hidden />
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
