import type { Metadata } from "next";
import DiscoverabilityClientPage from "./DiscoverabilityClientPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: "/features/discoverability" },
    robots: { index: true, follow: true },
  };
}

export default function DiscoverabilityPage() {
  return <DiscoverabilityClientPage />;
}
