import type { Metadata } from "next";
import KeywordGapClient from "./KeywordGapClient";

export const metadata: Metadata = {
    title: "Keyword Gap - Find Keywords Your Competitors Rank For | RankyPulse",
    description: "Discover missing keyword opportunities by comparing your domain with competitors.",
};

export default function KeywordGapPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-white tracking-tight">Keyword Gap</h1>
                <p className="text-sm text-gray-500">Compare your domain's keyword profile against competitors to find new opportunities</p>
            </div>

            <KeywordGapClient />
        </div>
    );
}
