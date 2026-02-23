import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "RankyPulse | Instant SEO Audit & Fix List",
    description: "Run a free SEO audit in ~30 seconds. Get prioritized issues, clear fixes, and a score you can track over time.",
    alternates: { canonical: "/" },
    openGraph: {
      title: "RankyPulse | Instant SEO Audit & Fix List",
      description: "Run a free SEO audit in ~30 seconds. Get prioritized issues, clear fixes, and a score you can track over time.",
      url: "/",
      siteName: "RankyPulse",
      type: "website",
      images: [
        { url: "https://rankypulse.com/og.png", width: 1200, height: 630, alt: "RankyPulse — Instant SEO Audit" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "RankyPulse | Instant SEO Audit & Fix List",
      description: "Run a free SEO audit in ~30 seconds. Get prioritized issues, clear fixes, and a score you can track over time.",
      images: ["https://rankypulse.com/og.png"],
    },
  };
}


export { default } from "./(marketing)/page";
