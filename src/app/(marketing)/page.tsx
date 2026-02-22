import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { BeforeAfterSection } from "@/components/BeforeAfterSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { ProductPreviewSection } from "@/components/ProductPreviewSection";
import { PricingSection } from "@/components/PricingSection";
import { SocialProofSection } from "@/components/SocialProofSection";
import { FinalCTASection } from "@/components/FinalCTASection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <BeforeAfterSection />
        <FeaturesSection />
        <ProductPreviewSection />
        <PricingSection />
        <SocialProofSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}
