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
          "/position-tracking",
          "/api/",
          "/report/",            // dynamic audit reports — not for indexing
          "/audit/results",      // result page varies per session
          "/privacy-policy",     // canonical is /privacy
          "/terms-and-conditions", // canonical is /terms
          "/auth/callback",      // OAuth callback — not for indexing
          "/auth/verify",        // email verify — not for indexing
          "/auth/reset-password", // password reset — not for indexing
          "/auth/forgot-password",
          "/auth/forgot-username",
        ],
      },
    ],
    sitemap: "https://rankypulse.com/sitemap.xml",
  };
}
