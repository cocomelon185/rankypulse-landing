const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Turbopack disabled via NEXT_DISABLE_TURBOPACK=1 in dev script to avoid cache corruption */
  turbopack: { root: path.join(__dirname) },
  async redirects() {
    return [
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/terms-and-conditions", destination: "/terms", permanent: true },
      { source: "/terms-conditions", destination: "/terms", permanent: true },
    ];
  },
};

module.exports = nextConfig;
