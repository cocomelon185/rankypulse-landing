import type { Metadata } from "next";
import SMBSEOClient from "./SMBSEOClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "SEO Audit for Small Business | Affordable Strategy | RankyPulse";
  const description = "Small business SEO audit focused on realistic, high-ROI tactics. Get visible in local search, compete with bigger players, and attract local customers with proven strategies.";

  return {
    title,
    description,
    alternates: { canonical: "https://rankypulse.com/seo-audit-for-small-business" },
    robots: { index: true, follow: true },
    keywords: ["SEO audit for small business", "small business SEO", "local SEO", "SMB SEO strategy", "affordable SEO"],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/seo-audit-for-small-business",
      siteName: "RankyPulse",
      type: "website",
      images: [
        {
          url: "https://rankypulse.com/og/seo-audit-small-business.png",
          width: 1200,
          height: 630,
          alt: "SEO Audit for Small Business",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://rankypulse.com/og/seo-audit-small-business.png"],
    },
  };
}

export default function SMBSEOPage() {
  return <SMBSEOClient />;
}
