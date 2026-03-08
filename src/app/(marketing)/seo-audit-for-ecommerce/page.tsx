import type { Metadata } from "next";
import EcommerceSEOClient from "./EcommerceSEOClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "SEO Audit for E-commerce | Product Visibility Strategy | RankyPulse";
  const description = "E-commerce SEO audit covering product pages, category optimization, technical SEO, and content strategy to boost sales.";

  return {
    title,
    description,
    alternates: { canonical: "https://rankypulse.com/seo-audit-for-ecommerce" },
    robots: { index: true, follow: true },
    keywords: ["SEO audit ecommerce", "ecommerce SEO", "product ranking", "e-commerce optimization", "store SEO"],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/seo-audit-for-ecommerce",
      siteName: "RankyPulse",
      type: "website",
      images: [{url: "https://rankypulse.com/og/seo-audit-for-ecommerce.png", width: 1200, height: 630, alt: "SEO Audit for E-commerce | Product Visibility Strategy | RankyPulse"}],
    },
    twitter: {card: "summary_large_image", title, description, images: ["https://rankypulse.com/og/seo-audit-for-ecommerce.png"]},
  };
}

export default function Page() {
  return <EcommerceSEOClient />;
}
