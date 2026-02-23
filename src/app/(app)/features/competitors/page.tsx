import type { Metadata } from "next";
import CompetitorsClientPage from "./CompetitorsClientPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: "/features/competitors" },
    robots: { index: true, follow: true },
  };
}

export default function CompetitorsPage() {
  return <CompetitorsClientPage />;
}
