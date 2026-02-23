import type { Metadata } from "next";
import AboutClientPage from "./AboutClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const title = "About | RankyPulse";
  const description =
    "Fix SEO issues in minutes, not weeks. AI-powered audits with copy-ready fixes.";

  return {
    title,
    description,
    alternates: { canonical: "/about" },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: "/about",
      siteName: "RankyPulse",
      type: "website",
      images: [
        { url: "/og/about", width: 1200, height: 630, alt: "RankyPulse — About" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/about"],
    },
  };
}

export default function AboutPage() {
  return <AboutClientPage />;
}
