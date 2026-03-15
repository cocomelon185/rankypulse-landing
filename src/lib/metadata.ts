/**
 * Metadata length helpers
 * ─────────────────────────────────────────────────────────────────────────────
 * Google's recommended limits:
 *   Title:       50–60 chars (hard truncated at ~600px display width)
 *   Description: 120–160 chars (truncated in SERPs beyond ~920px)
 *
 * Both helpers truncate at the last full word boundary and append an ellipsis
 * so output never ends mid-word.
 */

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
