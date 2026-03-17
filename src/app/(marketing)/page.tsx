import { AppNavbar } from "@/components/layout/Navbar";
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

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "RankyPulse",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://rankypulse.com",
  description:
    "Free SEO audit tool that scans your website for technical errors, broken links, missing meta tags, Core Web Vitals issues, and more — with a prioritised fix list.",
  featureList: [
    "Full site SEO audit",
    "Technical SEO error detection",
    "Core Web Vitals analysis",
    "Broken link checker",
    "On-page SEO scoring",
  ],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free plan — up to 50 pages per audit",
  },
  screenshot: "https://rankypulse.com/og-image.png",
  provider: {
    "@type": "Organization",
    name: "RankyPulse",
    url: "https://rankypulse.com",
  },
};

export default function HomePage() {
  return (
    <div className="bg-background min-h-screen text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
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
