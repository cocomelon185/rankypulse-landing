import type { Metadata } from "next";
import PricingClientPage from "./PricingClientPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: "/pricing" },
    robots: { index: true, follow: true },
  };
}

export default function PricingPage() {
  return <PricingClientPage />;
}
