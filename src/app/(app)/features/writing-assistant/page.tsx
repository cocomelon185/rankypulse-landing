import type { Metadata } from "next";
import WritingAssistantClient from "./WritingAssistantClient";

export const metadata: Metadata = {
    title: "SEO Writing Assistant | RankyPulse",
    description: "Grade your content in real-time for SEO, readability, tone of voice, and originality.",
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
