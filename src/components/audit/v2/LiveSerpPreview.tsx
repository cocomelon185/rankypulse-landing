"use client";

import { Globe, MoreVertical, Search } from "lucide-react";

interface LiveSerpPreviewProps {
  title: string;
  description: string;
  url?: string;
}

const TITLE_MAX = 60;
const DESC_MAX = 160;
const TITLE_MIN = 30;
const DESC_MIN = 120;

function LengthBar({
  label,
  value,
  max,
  min,
}: {
  label: string;
  value: number;
  max: number;
  min: number;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const isTooLong = value > max;
  const isTooShort = value > 0 && value < min;
  const isGood = value >= min && value <= max;

  const barColor = isTooLong || isTooShort ? "bg-orange-500" : "bg-emerald-500";
  const countColor = isTooLong
    ? "text-orange-400"
    : isTooShort
      ? "text-orange-400"
      : "text-emerald-400";

  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{label}</p>
      <div className="flex items-center gap-2">
        <div className="w-24 h-1.5 bg-[#1E2940] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={`text-[10px] font-mono ${countColor}`}>
          {value}/{max}
        </span>
        {isGood && (
          <span className="text-[9px] font-medium text-emerald-500 uppercase tracking-wider">✓ Good</span>
        )}
        {isTooLong && (
          <span className="text-[9px] font-medium text-orange-400 uppercase tracking-wider">Too long</span>
        )}
        {isTooShort && (
          <span className="text-[9px] font-medium text-orange-400 uppercase tracking-wider">Too short</span>
        )}
      </div>
    </div>
  );
}

export function LiveSerpPreview({
  title,
  description,
  url = "https://rankypulse.com",
}: LiveSerpPreviewProps) {
  // Simulate Google's pixel-width truncation at word boundaries
  const displayTitle =
    title.length > TITLE_MAX
      ? title.slice(0, TITLE_MAX - 1).replace(/\s+\S*$/, "").trimEnd() + "…"
      : title;

  const displayDesc =
    description.length > DESC_MAX
      ? description.slice(0, DESC_MAX - 1).replace(/\s+\S*$/, "").trimEnd() + "…"
      : description;

  // Clean display URL: strip protocol, cap at ~60 chars
  const displayUrl = url
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .slice(0, 60);

  return (
    <div className="w-full bg-[#151B27] border border-[#1E2940] rounded-xl p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 text-slate-500">
        <Search size={13} />
        <span className="text-[10px] font-semibold uppercase tracking-widest">
          Google Search Preview
        </span>
      </div>

      {/* SERP result mockup */}
      <div className="space-y-0.5 group cursor-default">
        {/* Site identity row */}
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-6 h-6 rounded-full bg-[#1E2940] flex items-center justify-center shrink-0">
            <Globe size={12} className="text-slate-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-slate-300 font-medium leading-none truncate">
              {displayUrl.split("/")[0]}
            </span>
            <span className="text-[10px] text-slate-500 leading-tight truncate">
              {displayUrl}
            </span>
          </div>
          <MoreVertical size={13} className="text-slate-700 ml-auto shrink-0" />
        </div>

        {/* Blue title */}
        <h3 className="text-[18px] leading-[1.3] text-[#8ab4f8] font-normal group-hover:underline truncate">
          {displayTitle || (
            <span className="text-slate-600 italic text-sm">Your page title goes here…</span>
          )}
        </h3>

        {/* Description */}
        <p className="text-[13px] leading-[1.58] text-[#bdc1c6] line-clamp-2 min-h-[2.5em]">
          {displayDesc || (
            <span className="text-slate-600 italic">
              Enter a meta description to improve click-through rate. This is what searchers see.
            </span>
          )}
        </p>
      </div>

      {/* Length indicators */}
      <div className="mt-5 pt-4 border-t border-[#1E2940] flex flex-wrap gap-x-6 gap-y-3">
        <LengthBar label="Title length" value={title.length} max={TITLE_MAX} min={TITLE_MIN} />
        <LengthBar label="Description length" value={description.length} max={DESC_MAX} min={DESC_MIN} />
      </div>
    </div>
  );
}
