import type { Metadata } from "next";
import AboutClientPage from "./AboutClientPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: "/about" },
    robots: { index: true, follow: true },
  };
}

export default function AboutPage() {
  return <AboutClientPage />;
}
