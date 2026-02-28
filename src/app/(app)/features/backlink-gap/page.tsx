import type { Metadata } from "next";
import BacklinkGapClient from "./BacklinkGapClient";

export const metadata: Metadata = {
    title: "Backlink Gap | RankyPulse",
    description: "Identify link-building opportunities by comparing your backlink profile with your competitors.",
};

export default function BacklinkGapPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-white tracking-tight">Backlink Gap</h1>
                <p className="text-sm text-gray-500">Uncover untapped link-building opportunities your competitors are already exploiting</p>
            </div>

            <BacklinkGapClient />
        </div>
    );
}
