import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/audits",
          "/reports",
          "/billing",
          "/features/",
          "/position-tracking",
          "/auth/",
          "/api/",
          "/report/",          // dynamic audit reports — not for indexing
          "/audit/results",    // result page varies per session
          "/privacy-policy",   // canonical is /privacy
          "/terms-and-conditions", // canonical is /terms
        ],
      },
    ],
    sitemap: "https://rankypulse.com/sitemap.xml",
  };
}
