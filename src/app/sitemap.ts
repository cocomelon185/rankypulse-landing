import type { MetadataRoute } from "next";

const BASE = "https://rankypulse.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Core pages
    { url: `${BASE}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/audit`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/tools`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    // Legal
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/cookies`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    // Tool pages
    { url: `${BASE}/seo-audit-tool`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/technical-seo-audit`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/meta-tag-checker`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/internal-link-checker`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/redirect-checker`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/competitor-seo-analysis`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    // Guides
    { url: `${BASE}/guides/technical-seo-checklist`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/guides/how-to-do-seo-audit`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/guides/seo-audit-template`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/guides/fix-core-web-vitals`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/guides/internal-linking-strategy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    // Solutions
    { url: `${BASE}/seo-audit-for-small-business`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/seo-audit-for-ecommerce`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/seo-audit-for-shopify`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/seo-audit-for-wordpress`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/seo-audit-for-saas`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/seo-audit-for-agencies`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/seo-audit-for-nonprofits`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/seo-audit-for-local-business`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    // NOTE: /audit/results, /report/*, /dashboard, /auth/*, and all app routes
    // are intentionally excluded — they require auth or are dynamic.
  ];
}
