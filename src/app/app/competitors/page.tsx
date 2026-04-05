import { permanentRedirect } from "next/navigation";

export const metadata = {
    title: "Competitor Analysis Tool | RankyPulse",
    description: "Track competitors, analyze their SEO strategies, and discover opportunities with RankyPulse's comprehensive competitor analysis tool.",
    robots: { index: false, follow: false },
    alternates: { canonical: "https://rankypulse.com/app/competitor-intelligence" },
};

export default function CompetitorsPage() {
  permanentRedirect("/app/competitor-intelligence");
}
