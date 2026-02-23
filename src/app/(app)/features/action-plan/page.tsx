import type { Metadata } from "next";
import ActionPlanClientPage from "./ActionPlanClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Action Plan | RankyPulse";
  const description =
    "Prioritized next steps for your SEO improvement.";

  return {
    title,
    description,
    alternates: { canonical: "/features/action-plan" },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: "/features/action-plan",
      siteName: "RankyPulse",
      type: "website",
      images: [
        { url: "/og/action-plan", width: 1200, height: 630, alt: "RankyPulse — Action Plan" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/action-plan"],
    },
  };
}

export default function ActionPlanPage() {
  return <ActionPlanClientPage />;
}
