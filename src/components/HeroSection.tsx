"use client";

import Link from "next/link";
import { Card, CircularProgress } from "@/components/horizon";
import { Search, FileText, Shield } from "lucide-react";

function AuditPreviewCard() {
  return (
    <Card
      extra="w-full max-w-[380px] overflow-hidden transition-all duration-300 hover:shadow-[14px_17px_40px_4px_rgba(112,144,176,0.15)] hover:-translate-y-2"
      default={true}
    >
      <div className="bg-gradient-to-br from-[#eff6ff] to-white p-6">
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
  const benefits = [
    "Copy-ready SEO fixes",
    "AI competitor insights",
    "Discoverability score tracking",
  ];

  return (
    <section className="hero-gradient relative overflow-hidden py-16 px-4 md:py-24 md:px-8">
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(67, 24, 255, 0.08) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <div className="flex flex-col items-center gap-8 text-center lg:items-start lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4318ff]/20 bg-white/80 px-4 py-2 text-sm font-medium text-[#4318ff] shadow-sm">
              <Shield className="h-4 w-4" />
              Trusted by 1,000+ websites
            </div>
            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-[#1B2559] md:text-5xl lg:text-6xl">
              Fix your SEO in minutes — not weeks.
            </h1>
            <p className="max-w-xl text-lg text-gray-600 md:text-xl">
              RankyPulse audits your site, shows exactly what to fix, and predicts
              how your score improves. Copy-ready fixes, AI insights, and growth tracking.
            </p>
            <ul className="flex flex-col gap-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">✓</span>
                  <span className="font-medium text-gray-700">{b}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link
                href="/audit"
                className="inline-flex h-14 items-center justify-center rounded-xl bg-gradient-to-r from-[#4318ff] to-[#7551ff] px-10 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-95"
              >
                <Search className="mr-2 h-5 w-5" />
                Start Free Audit
              </Link>
              <Link
                href="/audit?sample=1"
                className="inline-flex h-14 items-center justify-center rounded-xl border-2 border-gray-300 bg-white px-10 text-base font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
              >
                <FileText className="mr-2 h-5 w-5" />
                View Sample Report
              </Link>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <AuditPreviewCard />
          </div>
        </div>
      </div>
    </section>
  );
}
