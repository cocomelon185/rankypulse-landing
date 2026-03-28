import { redirect } from "next/navigation";

export const metadata = {
    title: "Competitor Analysis Tool | RankyPulse",
    description: "Track competitors, analyze their SEO strategies, and discover opportunities with RankyPulse's comprehensive competitor analysis tool.",
    robots: { index: true, follow: true },
    alternates: { canonical: "https://rankypulse.com/app/competitors" },
};

export default function CompetitorsPage() {
  redirect("/app/competitor-intelligence");
}
