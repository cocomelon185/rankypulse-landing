"use client";

import Link from "next/link";
import { Card, CircularProgress } from "@/components/horizon";

function AuditPreviewCard() {
  return (
    <Card
      extra="w-full max-w-[380px] overflow-hidden transition-all duration-300 hover:shadow-[14px_17px_40px_4px_rgba(112,144,176,0.15)] hover:-translate-y-2"
      default={true}
    >
      <div className="bg-[#f8fafc] p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-[#4318ff]/10 px-3 py-1 text-xs font-semibold text-[#4318ff]">
            Live Preview
          </span>
          <CircularProgress percentage={78} size={72} />
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Score improvement</p>
          <p className="text-2xl font-bold text-[#1B2559]">62 → 78 <span className="text-green-600">+16 pts</span></p>
          <div className="mt-4 space-y-2">
            <p className="flex items-center gap-2 text-sm text-gray-700">
              <span className="h-2 w-2 rounded-full bg-green-500" /> Add meta description
            </p>
            <p className="flex items-center gap-2 text-sm text-gray-700">
              <span className="h-2 w-2 rounded-full bg-green-500" /> Optimize title length
            </p>
            <p className="flex items-center gap-2 text-sm text-gray-700">
              <span className="h-2 w-2 rounded-full bg-green-500" /> Add schema markup
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function HeroSection() {
  return (
    <section className="hero-gradient relative overflow-hidden py-14 px-4 md:px-8 lg:py-16">
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(67, 24, 255, 0.08) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-[#1B2559] md:text-5xl lg:text-6xl">
              Find the SEO mistakes costing you traffic — in 30 seconds
            </h1>
            <p className="max-w-xl text-lg text-gray-600 md:text-xl">
              Get a prioritized action plan that tells you exactly what to fix to improve rankings, traffic, and conversions.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link
                href="https://rankypulse.com/audit"
                className="inline-flex h-14 items-center justify-center rounded-xl bg-[#4318ff] px-10 text-base font-semibold text-white shadow-lg transition-all hover:bg-[#3311db] hover:shadow-xl"
              >
                Run free audit
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              No signup required • Results in 30s • Used by founders &amp; agencies
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <AuditPreviewCard />
          </div>
        </div>
      </div>
    </section>
  );
}
