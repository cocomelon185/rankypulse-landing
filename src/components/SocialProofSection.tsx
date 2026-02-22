"use client";

import { Sparkles, CheckCircle2, Cloud } from "lucide-react";

const badges = [
  { label: "AI powered", icon: Sparkles },
  { label: "Actionable fixes", icon: CheckCircle2 },
  { label: "No installation required", icon: Cloud },
];

export function SocialProofSection() {
  return (
    <section className="section-padding px-4 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-gray-200/80 bg-white px-8 py-12 shadow-[14px_17px_40px_4px_rgba(112,144,176,0.06)]">
          <p className="mb-8 text-center text-xl font-semibold text-gray-700">
            Built for founders, agencies, and growth teams
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {badges.map((badge, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50/50 px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-[#4318ff]/30 hover:bg-[#eff6ff]/50"
              >
                <badge.icon className="h-5 w-5 text-[#4318ff]" />
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
