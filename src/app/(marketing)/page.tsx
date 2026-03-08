import { AppNavbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { Testimonials } from "@/components/landing/Testimonials";
import { PricingTeaser } from "@/components/landing/PricingTeaser";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { ProofBar } from "@/components/landing/ProofBar";

export default function HomePage() {
  return (
    <div className="bg-background min-h-screen text-foreground">
      <AppNavbar />
      {/* pt-16 accounts for the fixed 64px navbar */}
      <div className="pt-16">
        <Hero />
        <ProofBar />
        <FeatureGrid />
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
