import type { Metadata } from "next";
import OnPageCheckerClient from "./OnPageCheckerClient";

export const metadata: Metadata = {
    title: "On-Page SEO Checker - Fix Pages to Rank Higher | RankyPulse",
    description: "Get actionable, page-level recommendations to improve rankings for your target keywords.",
    alternates: { canonical: "https://rankypulse.com/app/features/on-page-checker" },
    robots: { index: false, follow: false },
};

export default function OnPageCheckerPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-white tracking-tight">On-Page SEO Checker</h1>
                <p className="text-sm text-gray-500">Discover exactly what to change on your pages to climb from Page 2 to Page 1.</p>
            </div>

            <OnPageCheckerClient />
        </div>
    );
}
