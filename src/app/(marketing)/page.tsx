import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { SocialProofSection } from "@/components/SocialProofSection";
import { BeforeAfterSection } from "@/components/BeforeAfterSection";
import { ProblemSection } from "@/components/ProblemSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { ProductPreviewSection } from "@/components/ProductPreviewSection";
import { PricingTeaserSection } from "@/components/PricingTeaserSection";
import { FinalCTASection } from "@/components/FinalCTASection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        <HeroSection />
        <SocialProofSection />
        <BeforeAfterSection />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <ProductPreviewSection />
        <PricingTeaserSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}
