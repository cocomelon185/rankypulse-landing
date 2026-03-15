import type { Metadata } from "next";
import PositionTrackingClient from "./PositionTrackingClient";

export const metadata: Metadata = {
    title: "Position Tracking - Monitor Keyword Rankings | RankyPulse",
    description: "Track your keyword rankings and visibility over time in Google search.",
    alternates: { canonical: "https://rankypulse.com/app/features/position-tracking" },
    robots: { index: false, follow: false },
};

export default function PositionTrackingPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-white tracking-tight">Position Tracking</h1>
                <p className="text-sm text-gray-500">Monitor your search visibility and keyword performance</p>
            </div>

            <PositionTrackingClient />
        </div>
    );
}
