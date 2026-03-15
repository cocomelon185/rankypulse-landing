import type { Metadata } from "next";
import { GrowthRoadmapClient } from "./GrowthRoadmapClient";

export const metadata: Metadata = {
  title: "30-Day Growth Roadmap | RankyPulse",
  description:
    "Your personalised 30-day SEO sprint — synthesised from audit, link, and keyword data.",
};

export default function RoadmapPage() {
  return <GrowthRoadmapClient />;
}
