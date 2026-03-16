/**
 * Metadata length helpers + constructMetadata factory
 * ─────────────────────────────────────────────────────────────────────────────
 * Google's recommended limits:
 *   Title:       50–60 chars (hard truncated at ~600px display width)
 *   Description: 120–160 chars (truncated in SERPs beyond ~920px)
 *
 * Both helpers truncate at the last full word boundary and append an ellipsis
 * so output never ends mid-word.
 */
import type { Metadata } from "next";

/**
 * Clamp a page title to `max` characters (default 60).
 * Appends "…" if truncated.
 *
 * @example
 * clampTitle("How to Do a Technical SEO Audit for SaaS Products | RankyPulse")
 * // → "How to Do a Technical SEO Audit for SaaS Products…"  (60 chars)
 */
export function clampTitle(title: string, max = 60): string {
  if (title.length <= max) return title;
  // Slice to max-1, then strip the last partial word
  return title.slice(0, max - 1).replace(/\s+\S*$/, "").trimEnd() + "…";
}

/**
 * Clamp a meta description to `max` characters (default 160).
 * Appends "…" if truncated.
 *
 * @example
 * clampDesc("An extremely long description that goes on and on beyond the SERP limit...")
 * // → first 159 chars at a word boundary + "…"
 */
export function clampDesc(desc: string, max = 160): string {
  if (desc.length <= max) return desc;
  return desc.slice(0, max - 1).replace(/\s+\S*$/, "").trimEnd() + "…";
}

interface ConstructMetadataProps {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  noIndex?: boolean;
}

/**
 * Centralised metadata factory.
 * Automatically clamps title to 60 chars and description to 160 chars,
 * sets OG/Twitter tags, and optionally marks a page as noindex.
 *
 * @example
 * export const metadata = constructMetadata({
 *   title: "How to Do an SEO Audit | RankyPulse",
 *   description: "Step-by-step guide...",
 *   canonical: "https://rankypulse.com/guides/how-to-do-seo-audit",
 * });
 */
export function constructMetadata({
  title = "RankyPulse | AI-Powered SEO Audit Tool",
  description = "Evolve your SEO with automated audits, AI fix assistants, and 30-day growth roadmaps.",
  image = "/og.jpg",
  canonical,
  noIndex = false,
}: ConstructMetadataProps = {}): Metadata {
  const optimizedTitle = clampTitle(title);
  const optimizedDescription = clampDesc(description);

  return {
    title: {
      default: optimizedTitle,
      template: "%s | RankyPulse",
    },
    description: optimizedDescription,
    metadataBase: new URL("https://rankypulse.com"),
    ...(canonical && { alternates: { canonical } }),
    openGraph: {
      title: optimizedTitle,
      description: optimizedDescription,
      images: [{ url: image, width: 1200, height: 630 }],
      siteName: "RankyPulse",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: optimizedTitle,
      description: optimizedDescription,
      images: [image],
      creator: "@rankypulse",
    },
    icons: "/favicon.ico",
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}
