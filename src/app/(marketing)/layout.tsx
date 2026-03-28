import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://rankypulse.com"),
  title: {
    default: "RankyPulse — Free SEO Audit Tool",
    template: "%s | RankyPulse",
  },
  description:
    "Get a free SEO audit in 30 seconds. Find every issue hurting your traffic and get step-by-step fix guides. No signup required.",
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
    "site seo audit",
    "check website seo",
    "seo analysis tool",
    "seo analysis website",
    "website audit tool",
    "site audit tool",
    "seo audit for website",
    "website seo audit tool",
    "seo site audit free",
    "free seo audit tool",
  ],
  authors: [{ name: "RankyPulse" }],
  creator: "RankyPulse",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    url: "https://rankypulse.com",
    title: "RankyPulse — Free Site SEO Audit & Website Audit Tool",
    description:
      "Enter any domain. Get a free site SEO audit with step-by-step fix guides and real traffic estimates. Find exactly what to fix in 30 seconds.",
    siteName: "RankyPulse",
    images: [
      {
        url: "https://rankypulse.com/og.jpg",
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
    images: ["https://rankypulse.com/og.jpg"],
    creator: "@rankypulse",
  },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
