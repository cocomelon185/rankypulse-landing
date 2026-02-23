import type { Metadata } from "next";
import DashboardClientPage from "./DashboardClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Dashboard | RankyPulse";
  const description =
    "Track scores, view audit history, and manage your sites.";

  return {
    title,
    description,
    alternates: { canonical: "/dashboard" },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: "/dashboard",
      siteName: "RankyPulse",
      type: "website",
      images: [
        { url: "/og/dashboard", width: 1200, height: 630, alt: "RankyPulse — Dashboard" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/dashboard"],
    },
  };
}

export default function DashboardPage() {
  return <DashboardClientPage />;
}
