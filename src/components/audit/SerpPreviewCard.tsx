"use client";

import { Card } from "@/components/horizon";

interface SerpPreviewCardProps {
  /** Page title or domain fallback */
  title: string;
  /** Display URL (e.g., example.com › page) */
  displayUrl: string;
  /** Meta description – if missing, show example "After fix" preview */
  metaDescription?: string | null;
  /** True when meta description is missing (show example) */
  isMissing?: boolean;
}

export function SerpPreviewCard({
  title,
  displayUrl,
  metaDescription,
  isMissing = false,
}: SerpPreviewCardProps) {
  const desc = metaDescription?.trim() || (isMissing
    ? "Add a concise meta description (140–160 chars) that summarizes your page. Include your primary keyword and value proposition."
    : null);

  return (
    <Card
      extra="p-3 mt-3 border border-gray-200/90 shadow-[var(--audit-card-shadow)] max-w-md rounded-lg"
      default
      role="region"
      aria-label="Google snippet preview"
    >
      <div className="space-y-1">
        <p className="text-base text-[#1a0dab] leading-snug truncate">
          {title}
        </p>
        <p className="text-sm text-[#006621] truncate">{displayUrl}</p>
        <p className={`text-sm text-gray-600 line-clamp-2 ${isMissing ? "italic text-gray-500" : ""}`}>
          {desc}
          {isMissing && (
            <span className="block mt-0.5 text-xs text-[#4318ff] font-medium not-italic">
              Example after fix
            </span>
          )}
        </p>
      </div>
    </Card>
  );
}
