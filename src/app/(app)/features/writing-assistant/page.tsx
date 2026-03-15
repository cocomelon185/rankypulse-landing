import type { Metadata } from "next";
import WritingAssistantClient from "./WritingAssistantClient";

export const metadata: Metadata = {
    title: "AI Writing Assistant - Grade Content for SEO | RankyPulse",
    description: "Grade your content in real-time for SEO, readability, tone of voice, and originality.",
    alternates: { canonical: "https://rankypulse.com/app/features/writing-assistant" },
    robots: { index: false, follow: false },
};

export default function WritingAssistantPage() {
    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
            <div className="flex flex-col gap-1 shrink-0">
                <h1 className="text-2xl font-bold text-white tracking-tight">SEO Writing Assistant</h1>
                <p className="text-sm text-gray-500">Ensure your content meets quality standards before you hit publish.</p>
            </div>

            <WritingAssistantClient />
        </div>
    );
}
