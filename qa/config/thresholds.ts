/**
 * /qa/config/thresholds.ts
 *
 * Performance, accessibility, and quality thresholds for QA
 * Used by Lighthouse, API health, and visual regression checks
 */

// ── Lighthouse Scores (0-100) ───────────────────────────────────────────
export const LIGHTHOUSE_THRESHOLDS = {
  staging: {
    performance: 75,
    accessibility: 90,
    bestPractices: 85,
    seo: 90,
    pwa: 70,
  },
  production: {
    // Slightly lower for production (real data, user impact)
    performance: 70,
    accessibility: 90,
    bestPractices: 85,
    seo: 90,
    pwa: 70,
  },
};

// ── Core Web Vitals & Performance Metrics ───────────────────────────────
export const CWV_THRESHOLDS = {
  lcp: 2500, // Largest Contentful Paint (ms)
  fid: 100, // First Input Delay (ms)
  inp: 200, // Interaction to Next Paint (ms)
  cls: 0.1, // Cumulative Layout Shift (unitless)
  ttfb: 600, // Time to First Byte (ms)
  speedIndex: 4500, // Speed Index (ms)
};

// ── API Response Times (ms, p99) ────────────────────────────────────────
export const API_THRESHOLDS = {
  critical: 2000, // Critical paths: auth, projects, audits
  standard: 3000, // Standard endpoints
  slow: 5000, // Slower operations: crawl polling, heavy computations
};

// ── API Health ──────────────────────────────────────────────────────────
export const API_HEALTH = {
  timeoutMs: 5000,
  retries: 3,
  retryDelayMs: 1000,
  requiredStatus: [200, 201, 204, 206], // 2xx or 206 Partial Content
};

// ── Visual Regression ───────────────────────────────────────────────────
export const VISUAL_THRESHOLDS = {
  pixelDiffThreshold: 0.05, // 5% pixel difference = regression
  minPixelDiff: 10, // Ignore diffs < 10 pixels (noise)
  ignoreRegions: [
    // Common regions to ignore: timestamps, random IDs, etc.
    /updated.*ago/i, // "updated 5 minutes ago" changes constantly
    /\d{1,2}:\d{2}(:\d{2})?/i, // Time strings
    /loading|pending/i, // Status strings
  ],
};

// ── Browser Automation (Playwright) ─────────────────────────────────────
export const BROWSER_THRESHOLDS = {
  navigationTimeout: 30000, // 30s to load page
  actionTimeout: 10000, // 10s to complete action
  waitForTimeout: 5000, // 5s to wait for element
  networkTimeout: 15000, // 15s for network requests
};

// ── Accessibility (axe-core) ────────────────────────────────────────────
export const A11Y_THRESHOLDS = {
  critical: 0, // Must have zero critical issues
  serious: 0, // Should have zero serious issues
  moderate: 5, // Warn if more than 5 moderate issues
  minor: 20, // Warn if more than 20 minor issues
};

// ── SEO (crawl) ─────────────────────────────────────────────────────────
export const SEO_THRESHOLDS = {
  missingTitle: 0, // Every page must have title
  missingMetaDescription: 5, // Warn if more than 5 missing
  missingH1: 0, // Every page should have H1
  brokenLinks: 0, // No broken internal links
  missingAltText: 10, // Warn if more than 10 images missing alt
  validHreflang: true, // hreflang tags should be valid
  canonicalIssues: 0, // No canonical URL issues
  softErrors: 10, // Max soft 404s allowed
};

// ── Conversion Funnel Timeouts ──────────────────────────────────────────
export const FUNNEL_TIMEOUTS = {
  pageLoad: 30000,
  formSubmit: 10000,
  authRedirect: 5000,
  contentLoad: 15000,
};

// ── Device Profiles (for Lighthouse, visual regression) ─────────────────
export const DEVICE_PROFILES = {
  desktop: { width: 1280, height: 720, deviceScaleFactor: 1 },
  tablet: { width: 768, height: 1024, deviceScaleFactor: 1 },
  mobile: { width: 375, height: 667, deviceScaleFactor: 2 },
};

// ── Helper: Get threshold by environment ────────────────────────────────
export function getLighthouseThreshold(
  metric: keyof typeof LIGHTHOUSE_THRESHOLDS.staging,
  env: "staging" | "production" = "staging"
): number {
  return LIGHTHOUSE_THRESHOLDS[env][metric];
}

// ── Helper: Get API threshold by endpoint type ──────────────────────────
export function getApiThreshold(
  endpointType: "critical" | "standard" | "slow"
): number {
  return API_THRESHOLDS[endpointType];
}
