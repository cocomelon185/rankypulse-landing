import type { Metadata } from "next";
import FreelancerSEOClient from "./FreelancerSEOClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "SEO Audit Tool for Freelancers | Audit Clients in 60 Seconds | RankyPulse";
  const description =
    "RankyPulse is the SEO audit tool built for freelance SEO consultants. Run a full technical audit in 60 seconds, generate white-label PDF reports, and impress clients from day one. Free to start.";

  return {
    title,
    description,
    alternates: { canonical: "https://rankypulse.com/seo-audit-for-freelancers" },
    robots: { index: true, follow: true },
    keywords: [
      "SEO audit for freelancers",
      "freelance SEO tool",
      "SEO consultant tool",
      "white label SEO report",
      "technical SEO audit tool",
      "free SEO audit",
    ],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/seo-audit-for-freelancers",
      siteName: "RankyPulse",
      type: "website",
      images: [
        {
          url: "https://rankypulse.com/og.jpg",
          width: 1200,
          height: 630,
          alt: "SEO Audit Tool for Freelancers | RankyPulse",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://rankypulse.com/og.jpg"],
    },
  };
}

export default function Page() {
  return <FreelancerSEOClient />;
}
