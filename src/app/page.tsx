import type { Metadata } from "next";
import MarketingHome from "@/app/(marketing)/page";

export const metadata: Metadata = {
  title: { absolute: "RankyPulse — Free SEO Audit & Fix Tool" },
  description:
    "Get a free SEO audit in 30 seconds. Find every issue hurting your traffic and get step-by-step fix guides. No signup required.",
  alternates: { canonical: "https://rankypulse.com" },
};

export default function Page() {
  return <MarketingHome />;
}
