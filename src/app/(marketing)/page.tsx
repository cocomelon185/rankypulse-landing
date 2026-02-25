import { AppNavbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";
import { LiveDemo } from "@/components/landing/LiveDemo";
import { ProofBar } from "@/components/landing/ProofBar";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { Testimonials } from "@/components/landing/Testimonials";
import { PricingTeaser } from "@/components/landing/PricingTeaser";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function HomePage() {
  return (
    <div style={{ background: "#0d0f14", minHeight: "100vh" }}>
      <AppNavbar />
      {/* pt-16 accounts for the fixed 64px navbar */}
      <div className="pt-16">
        <Hero />
        <LiveDemo />
        <ProofBar />
        <FeatureGrid />
        <HowItWorks />
        <ComparisonTable />
        <Testimonials />
        <PricingTeaser />
        <FinalCTA />
        <LandingFooter />
      </div>
    </div>
  );
}
