"use client";

import { useState, useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

export type CmsType = "WordPress" | "Shopify" | "Webflow" | "Wix" | "Custom";

interface CmsSelectorProps {
  hostname: string;
  onCmsChange: (cms: CmsType) => void;
  detectedCms?: string | null;
}

const CMS_OPTIONS: { value: CmsType; label: string; abbr: string }[] = [
  { value: "WordPress", label: "WordPress", abbr: "WP" },
  { value: "Shopify", label: "Shopify", abbr: "SH" },
  { value: "Webflow", label: "Webflow", abbr: "WF" },
  { value: "Wix", label: "Wix", abbr: "WX" },
  { value: "Custom", label: "Custom", abbr: "\u2699" },
];

function isValidCms(v: string): v is CmsType {
  return CMS_OPTIONS.some((o) => o.value === v);
}

function cmsStorageKey(hostname: string) {
  return `rankypulse_cms_${hostname}`;
}

const CMS_STEP_MAP: Record<CmsType, Record<string, string[]>> = {
  WordPress: {
    meta_description: [
      "Open the page in WordPress editor.",
      "Scroll to the Yoast SEO / RankMath meta box below the editor.",
      "Enter a unique 140\u2013160 character meta description with your target keyword.",
      "Click \u201cUpdate\u201d or \u201cPublish\u201d to save.",
    ],
    title: [
      "Open the page in WordPress editor.",
      "Edit the SEO title in the Yoast SEO / RankMath meta box.",
      "Trim to 50\u201360 characters with the primary keyword near the front.",
      "Click \u201cUpdate\u201d to save.",
    ],
    canonical: [
      "Open the page in WordPress editor.",
      "In Yoast SEO / RankMath advanced settings, set the canonical URL.",
      "Ensure internal links point to the preferred URL version.",
      "Click \u201cUpdate\u201d to save, then verify with a fresh crawl.",
    ],
  },
  Shopify: {
    meta_description: [
      "Go to Shopify Admin \u2192 Online Store \u2192 Pages (or Products).",
      "Click the page and expand \u201cSearch engine listing preview.\u201d",
      "Enter a unique 140\u2013160 character meta description.",
      "Click \u201cSave\u201d to publish the change.",
    ],
    title: [
      "Go to Shopify Admin \u2192 Online Store \u2192 Pages (or Products).",
      "Expand \u201cSearch engine listing preview\u201d and edit the page title.",
      "Trim to 50\u201360 characters with the primary keyword near the front.",
      "Click \u201cSave.\u201d",
    ],
    canonical: [
      "Go to Shopify Admin \u2192 Online Store \u2192 Pages.",
      "Check the URL handle matches the preferred version.",
      "Set up URL redirects for any duplicate versions.",
      "Save and verify with a fresh crawl.",
    ],
  },
  Webflow: {
    meta_description: [
      "Open the page in Webflow Designer \u2192 Settings tab (gear icon).",
      "Find the \u201cSEO Settings\u201d section.",
      "Enter a unique 140\u2013160 character meta description.",
      "Publish the site to apply changes.",
    ],
    title: [
      "Open the page in Webflow Designer \u2192 Settings tab.",
      "Edit the \u201cTitle Tag\u201d in the SEO Settings section.",
      "Trim to 50\u201360 characters with the primary keyword near the front.",
      "Publish the site.",
    ],
    canonical: [
      "Open page settings in Webflow Designer.",
      "Under SEO Settings, check or add the canonical URL.",
      "Ensure CMS collection items use consistent URLs.",
      "Publish and verify.",
    ],
  },
  Wix: {
    meta_description: [
      "Open the Wix Editor \u2192 click the page menu (Pages & Menu).",
      "Select the page \u2192 click \u201cSEO (Google)\u201d or \u201cSEO Basics.\u201d",
      "Enter a unique 140\u2013160 character meta description.",
      "Publish the site to save.",
    ],
    title: [
      "Open the Wix Editor \u2192 click the page menu.",
      "Select the page \u2192 click \u201cSEO (Google).\u201d",
      "Edit the title tag \u2014 trim to 50\u201360 characters.",
      "Publish the site.",
    ],
    canonical: [
      "Open Wix Dashboard \u2192 SEO settings for the page.",
      "Check the canonical URL in advanced SEO settings.",
      "Set the preferred URL version.",
      "Publish and verify with a fresh crawl.",
    ],
  },
  Custom: {
    meta_description: [
      "Open your page template or HTML file.",
      "Add a <meta name=\"description\" content=\"...\"> tag in the <head>.",
      "Write a unique 140\u2013160 character description with your target keyword.",
      "Deploy the updated page.",
    ],
    title: [
      "Open your page template or HTML file.",
      "Update the <title> tag to 50\u201360 characters.",
      "Keep the primary keyword near the front.",
      "Deploy the updated page.",
    ],
    canonical: [
      "Open the page template <head> section.",
      "Add or update <link rel=\"canonical\" href=\"...\"> to the preferred URL.",
      "Ensure server-side redirects match the canonical.",
      "Deploy and verify with a crawl.",
    ],
  },
};

export function getCmsSteps(cms: CmsType, issueKeyword: string): string[] | null {
  return CMS_STEP_MAP[cms]?.[issueKeyword] ?? null;
}

function getSavedCms(hostname: string): CmsType | null {
  try {
    const saved = localStorage.getItem(cmsStorageKey(hostname));
    if (saved && isValidCms(saved)) return saved;
  } catch {}
  return null;
}

export function CmsSelector({ hostname, onCmsChange, detectedCms }: CmsSelectorProps) {
  const [userChoice, setUserChoice] = useState<CmsType | null>(() => getSavedCms(hostname));
  const [showOverride, setShowOverride] = useState(false);
  const notifiedRef = useRef<string | null>(null);

  const selected = userChoice ?? (detectedCms && isValidCms(detectedCms) ? detectedCms : null);

  useEffect(() => {
    if (selected && notifiedRef.current !== selected) {
      notifiedRef.current = selected;
      onCmsChange(selected);
    }
  }, [selected, onCmsChange]);

  function handleSelect(cms: CmsType) {
    setUserChoice(cms);
    setShowOverride(false);
    track("cms_selected", { cms, hostname, wasDetected: cms === detectedCms });
    try {
      localStorage.setItem(cmsStorageKey(hostname), cms);
    } catch {}
  }

  const isDetected = !!detectedCms && isValidCms(detectedCms);
  const detectedLabel = isDetected ? detectedCms : null;

  return (
    <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50/50 p-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
          Your CMS
        </p>
        {detectedLabel && selected === detectedLabel && !showOverride && (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-medium text-emerald-700">
            Detected: {detectedLabel}
          </span>
        )}
      </div>

      {detectedLabel && !showOverride && selected === detectedLabel ? (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs font-medium text-gray-700">{detectedLabel}</span>
          <button
            type="button"
            onClick={() => setShowOverride(true)}
            className="text-[10px] text-[#4318ff] hover:underline"
          >
            Change
          </button>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {CMS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-all ${
                selected === opt.value
                  ? "border-[#4318ff] bg-[#4318ff]/5 text-[#4318ff]"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <span className="text-[9px]">{opt.abbr}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
