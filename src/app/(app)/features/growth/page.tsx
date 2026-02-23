import type { Metadata } from "next";
import GrowthClientPage from "./GrowthClientPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: "/features/growth" },
    robots: { index: true, follow: true },
  };
}

export default function GrowthPage() {
  return <GrowthClientPage />;
}
