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
    },
    twitter: {
      card: "summary",
      title: "RankyPulse | Instant SEO Audit & Fix List",
      description: "Run a free SEO audit in ~30 seconds. Get prioritized issues, clear fixes, and a score you can track over time.",
    },
  };
}


export { default } from "./(marketing)/page";
