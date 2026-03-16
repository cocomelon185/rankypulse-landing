import type { Metadata } from "next";
import { AppNavbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: { absolute: "RankyPulse — Free SEO Audit & Fix Tool" },
  description:
    "Get a free SEO audit in 30 seconds. Find every issue hurting your traffic and get step-by-step fix guides. No signup required.",
  alternates: { canonical: "https://rankypulse.com" },
};
import { Hero } from "@/components/landing/Hero";
import { TrustProofSection } from "@/components/landing/TrustProofSection";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { PersonaTabs } from "@/components/landing/PersonaTabs";
import { AuditPreviewSection } from "@/components/landing/AuditPreviewSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { PricingTeaser } from "@/components/landing/PricingTeaser";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function HomePage() {
  return (
    <div className="bg-background min-h-screen text-foreground">
      <AppNavbar />
      {/* pt-16 accounts for the fixed 64px navbar */}
      <div className="pt-16">
        <Hero />
        <TrustProofSection />
        <FeatureGrid />
        <PersonaTabs />
        <AuditPreviewSection />
        <HowItWorks />
        <Testimonials />
        <ComparisonTable />
        <PricingTeaser />
        <FinalCTA />
        <LandingFooter />
      </div>
    </div>
  );
}
