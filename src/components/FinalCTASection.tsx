"use client";

import Link from "next/link";
import { Search, CreditCard } from "lucide-react";

export function FinalCTASection() {
  return (
    <section className="cta-gradient relative overflow-hidden py-20 px-4 md:py-28 md:px-8">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          Ready to fix your SEO today?
        </h2>
        <p className="mb-10 text-lg text-white/90 md:text-xl">
          Get instant audits and actionable fixes. No credit card required.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/audit"
            className="inline-flex h-14 items-center justify-center rounded-xl bg-white px-10 text-base font-semibold text-[#4318ff] shadow-xl transition-all hover:bg-gray-100"
          >
            <Search className="mr-2 h-5 w-5" />
            Run Free Audit
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-14 items-center justify-center rounded-xl border-2 border-white/60 px-10 text-base font-semibold text-white transition-all hover:bg-white/10"
          >
            <CreditCard className="mr-2 h-5 w-5" />
            View Pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
