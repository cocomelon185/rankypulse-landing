import type { Metadata } from "next";
import ShopifySEOClient from "./ShopifySEOClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "SEO Audit for Shopify | E-commerce SEO Guide | RankyPulse";
  const description = "Shopify SEO audit with e-commerce specific strategies. Optimize product pages, fix canonical issues, improve site speed, and rank better in product search.";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "https://rankypulse.com/seo-audit-for-shopify" },
    robots: { index: true, follow: true },
    keywords: ["SEO audit for Shopify", "Shopify SEO", "e-commerce SEO", "product page optimization", "Shopify ranking"],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/seo-audit-for-shopify",
      siteName: "RankyPulse",
      type: "website",
      images: [{url: "https://rankypulse.com/og/seo-audit-shopify.png", width: 1200, height: 630, alt: "SEO Audit for Shopify"}],
    },
    twitter: {card: "summary_large_image", title, description, images: ["https://rankypulse.com/og/seo-audit-shopify.png"]},
  };
}

export default function ShopifySEOPage() {
  return <ShopifySEOClient />;
}
