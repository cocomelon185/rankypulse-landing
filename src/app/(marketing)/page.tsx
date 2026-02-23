import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { TrustStrip } from "@/components/TrustStrip";
import { ReportPreviewSection } from "@/components/ReportPreviewSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { ProblemSection } from "@/components/ProblemSection";
import { PricingTeaserSection } from "@/components/PricingTeaserSection";
import { FinalCTASection } from "@/components/FinalCTASection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        <HeroSection />
        <TrustStrip />
        <ReportPreviewSection />
        <FeaturesSection />
        <ProblemSection />
        <PricingTeaserSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}
