const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Turbopack disabled via NEXT_DISABLE_TURBOPACK=1 in dev script to avoid cache corruption */
  turbopack: { root: path.join(__dirname) },
};

module.exports = nextConfig;
