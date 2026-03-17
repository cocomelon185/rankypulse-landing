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
