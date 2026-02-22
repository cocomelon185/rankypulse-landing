"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/horizon";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Target, Zap, BarChart3 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <PageHeader
          icon={<Target className="h-7 w-7" />}
          title="About RankyPulse"
          subtitle="RankyPulse helps website owners and marketing teams fix SEO issues in minutes, not weeks. Our AI-powered audits deliver copy-ready fixes and track your discoverability score over time."
        />

        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-3">
            <Card extra="p-6 md:p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[14px_17px_40px_4px_rgba(112,144,176,0.12)]" default={true}>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eff6ff] to-[#e0e7ff]">
                <Target className="h-8 w-8 text-[#4318ff]" />
              </div>
              <h3 className="font-semibold text-[#1B2559]">Mission</h3>
              <p className="mt-2 text-sm text-gray-600">
                Make SEO accessible and actionable for everyone.
              </p>
            </Card>
            <Card extra="p-6 md:p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[14px_17px_40px_4px_rgba(112,144,176,0.12)]" default={true}>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eff6ff] to-[#e0e7ff]">
                <Zap className="h-8 w-8 text-[#4318ff]" />
              </div>
              <h3 className="font-semibold text-[#1B2559]">Speed</h3>
              <p className="mt-2 text-sm text-gray-600">
                Get instant audits and copy-ready fixes in seconds.
              </p>
            </Card>
            <Card extra="p-6 md:p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[14px_17px_40px_4px_rgba(112,144,176,0.12)]" default={true}>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eff6ff] to-[#e0e7ff]">
                <BarChart3 className="h-8 w-8 text-[#4318ff]" />
              </div>
              <h3 className="font-semibold text-[#1B2559]">Transparency</h3>
              <p className="mt-2 text-sm text-gray-600">
                Understand exactly what to fix and why it matters.
              </p>
            </Card>
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link href="https://rankypulse.com/audit">
              <Button size="lg">Run Free Audit</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg">← Back to home</Button>
            </Link>
          </div>
        </div>
      </PageLayout>
      <Footer />
    </div>
  );
}
