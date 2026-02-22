"use client";

import Link from "next/link";
import { Card } from "@/components/horizon";
import { Sparkles, BarChart3, Users, TrendingUp, ListChecks } from "lucide-react";

const features = [
  {
    title: "AI Fix Generator",
    description: "Get copy-ready meta titles, descriptions, and schema markup tailored to your content.",
    icon: Sparkles,
    href: "/audit",
    badge: "Popular",
  },
  {
    title: "Discoverability Dashboard",
    description: "Track your SEO score over time and see exactly what moves the needle.",
    icon: BarChart3,
    href: "/features/discoverability",
  },
  {
    title: "Competitor Gap Finder",
    description: "See how you stack up against competitors and identify quick wins.",
    icon: Users,
    href: "/features/competitors",
  },
  {
    title: "Growth Tracker",
    description: "Monitor rankings and discoverability trends in one place.",
    icon: TrendingUp,
    href: "/features/growth",
  },
  {
    title: "Action Plan",
    description: "Prioritized checklist of fixes with completion tracking and export.",
    icon: ListChecks,
    href: "/features/action-plan",
  },
];

export function FeaturesSection() {
  return (
    <section className="section-padding px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-[#1B2559] md:text-4xl">
            Core features
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Everything you need to fix and grow your SEO
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Card
              key={i}
              extra="group p-6 md:p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[14px_17px_40px_4px_rgba(112,144,176,0.15)]"
              default={true}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eff6ff] to-[#e0e7ff] text-[#4318ff]">
                  <feature.icon className="h-7 w-7" />
                </div>
                {feature.badge && (
                  <span className="rounded-full bg-gradient-to-r from-[#4318ff]/20 to-[#7551ff]/20 px-3 py-1 text-xs font-semibold text-[#4318ff]">
                    {feature.badge}
                  </span>
                )}
              </div>
              <h3 className="mb-3 text-xl font-bold text-[#1B2559]">
                {feature.title}
              </h3>
              <p className="mb-6 text-gray-600">{feature.description}</p>
              <Link
                href={feature.href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#4318ff] transition-colors hover:text-[#3311db] group-hover:gap-3"
              >
                Learn more →
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
