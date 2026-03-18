const path = require("path");

/** @type {import('next').NextConfig} */
module.exports = {
  // Ensures all URLs are canonical — no trailing-slash variants
  trailingSlash: false,

  async headers() {
    return [
      {
        source: "/robots.txt",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // www → non-www (permanent 301) — prevents www/non-www canonical split
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.rankypulse.com" }],
        destination: "https://rankypulse.com/:path*",
        permanent: true,
      },
    ];
  },
};
