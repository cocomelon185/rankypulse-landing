import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://rankypulse.com"),
  title: {
    default: "RankyPulse — Free SEO Audit Tool with Step-by-Step Fix Guides",
    template: "%s | RankyPulse",
  },
  description:
    "Get a complete SEO audit in 30 seconds. See exactly which issues are costing you traffic, how many visits you could gain, and how to fix each one in minutes. Free. No signup required.",
  keywords: [
    "free SEO audit",
    "SEO audit tool",
    "website SEO checker",
    "SEO fix guide",
    "site audit",
    "SEO score checker",
    "meta description checker",
    "canonical URL checker",
    "core web vitals checker",
    "free SEO checker",
  ],
  authors: [{ name: "RankyPulse" }],
  creator: "RankyPulse",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://rankypulse.com",
  },
  openGraph: {
    type: "website",
    url: "https://rankypulse.com",
    title: "RankyPulse — Free SEO Audit with Step-by-Step Fix Guides",
    description:
      "Enter any domain. Get a complete SEO audit with step-by-step fix guides and real traffic estimates. Free. Takes 30 seconds.",
    siteName: "RankyPulse",
    images: [
      {
        url: "https://rankypulse.com/og.png",
        width: 1200,
        height: 630,
        alt: "RankyPulse SEO Audit Tool — Enter your domain, get your score",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RankyPulse — Free SEO Audit Tool",
    description:
      "Get a complete SEO audit in 30 seconds. Step-by-step fix guides with real traffic estimates. Free.",
    images: ["https://rankypulse.com/og.png"],
    creator: "@rankypulse",
  },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
