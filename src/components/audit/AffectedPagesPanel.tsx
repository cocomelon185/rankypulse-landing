"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, ExternalLink, ArrowUpDown, Filter } from "lucide-react";
import { track } from "@/lib/analytics";
import type { AffectedPage, PageType } from "@/lib/audit-issue-presentation";

interface AffectedPagesPanelProps {
  issueId: string;
  affectedPages: AffectedPage[];
  totalCount: number;
  onPageSelect: (page: AffectedPage) => void;
}

const PAGE_TYPE_STYLES: Record<PageType, string> = {
  Home: "bg-violet-50 text-violet-700 border-violet-200",
  Pricing: "bg-blue-50 text-blue-700 border-blue-200",
  Product: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Blog: "bg-amber-50 text-amber-700 border-amber-200",
  Contact: "bg-gray-50 text-gray-600 border-gray-200",
  Other: "bg-gray-50 text-gray-600 border-gray-200",
};

const PAGE_TYPE_PRIORITY: Record<PageType, number> = {
  Home: 0,
  Pricing: 1,
  Product: 2,
  Blog: 3,
  Contact: 4,
  Other: 5,
};

const ALL_PAGE_TYPES: PageType[] = ["Home", "Pricing", "Product", "Blog", "Contact", "Other"];
const INITIAL_VISIBLE = 5;

type SortMode = "priority" | "alpha";

function extractPath(url: string): string {
  try {
    return new URL(url).pathname || "/";
  } catch {
    return url;
  }
}

function getFilteredSorted(pages: AffectedPage[], filterType: PageType | "all", sortMode: SortMode): AffectedPage[] {
  let result = filterType === "all" ? pages : pages.filter((p) => p.pageType === filterType);

  if (sortMode === "priority") {
    result = [...result].sort((a, b) => PAGE_TYPE_PRIORITY[a.pageType] - PAGE_TYPE_PRIORITY[b.pageType]);
  } else {
    result = [...result].sort((a, b) => extractPath(a.url).localeCompare(extractPath(b.url)));
  }

  return result;
}

export function AffectedPagesPanel({ issueId, affectedPages, totalCount, onPageSelect }: AffectedPagesPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [filterType, setFilterType] = useState<PageType | "all">("all");
  const [sortMode, setSortMode] = useState<SortMode>("priority");
  const [showControls, setShowControls] = useState(false);
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (trackedRef.current !== issueId) {
      trackedRef.current = issueId;
      track("affected_pages_viewed", { issueId, countShown: Math.min(INITIAL_VISIBLE, affectedPages.length) });
    }
  }, [issueId, affectedPages.length]);

  const availableTypes = ALL_PAGE_TYPES.filter((t) =>
    affectedPages.some((p) => p.pageType === t),
  );

  const processedPages = getFilteredSorted(affectedPages, filterType, sortMode);
  const visiblePages = expanded ? processedPages : processedPages.slice(0, INITIAL_VISIBLE);

  return (
    <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50/50 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-700">
          Affects {totalCount} page{totalCount !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowControls(!showControls)}
            className="inline-flex items-center gap-0.5 rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-[9px] font-medium text-gray-500 hover:border-gray-300"
            title="Filter & sort"
          >
            <Filter className="h-2.5 w-2.5" />
            <ArrowUpDown className="h-2.5 w-2.5" />
          </button>
          <span className="rounded-full bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[9px] font-medium text-amber-600">
            sample pages
          </span>
        </div>
      </div>

      {showControls && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-gray-100 bg-white p-2">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-medium text-gray-400 uppercase">Type:</span>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as PageType | "all");
                track("affected_pages_filtered", { issueId, filterType: e.target.value });
              }}
              className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-600 focus:border-[#4318ff] focus:outline-none"
            >
              <option value="all">All</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-medium text-gray-400 uppercase">Sort:</span>
            <select
              value={sortMode}
              onChange={(e) => {
                setSortMode(e.target.value as SortMode);
                track("affected_pages_sorted", { issueId, sortMode: e.target.value });
              }}
              className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-600 focus:border-[#4318ff] focus:outline-none"
            >
              <option value="priority">Priority</option>
              <option value="alpha">A-Z</option>
            </select>
          </div>
        </div>
      )}

      <ul className="mt-2 space-y-1">
        {visiblePages.map((page) => (
          <li key={page.url}>
            <button
              type="button"
              onClick={() => {
                track("page_preview_opened", { issueId, url: page.url });
                onPageSelect(page);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-white hover:shadow-sm transition-all group"
            >
              <span
                className={`inline-flex shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-medium ${PAGE_TYPE_STYLES[page.pageType]}`}
              >
                {page.pageType}
              </span>
              <span className="truncate text-[11px] font-mono text-gray-600 group-hover:text-[#4318ff]">
                {extractPath(page.url)}
              </span>
              <ExternalLink className="h-3 w-3 shrink-0 text-gray-300 group-hover:text-[#4318ff] ml-auto" />
            </button>
          </li>
        ))}
        {processedPages.length === 0 && (
          <li className="text-[11px] text-gray-400 py-1 px-2">No pages match this filter.</li>
        )}
      </ul>

      {processedPages.length > INITIAL_VISIBLE && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#4318ff] hover:underline"
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? "Show less" : `Show all ${processedPages.length} pages`}
        </button>
      )}
    </div>
  );
}
