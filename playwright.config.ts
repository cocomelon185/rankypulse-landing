import { defineConfig, devices } from "@playwright/test";

const LOCAL = "http://localhost:3000";
const PROD = "https://rankypulse.com";

// Set PLAYWRIGHT_BASE_URL=https://rankypulse.com to run against production
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? LOCAL;
const IS_PROD = BASE_URL.includes("rankypulse.com");

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: IS_PROD ? 2 : 0,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Don't run a webServer for production tests
  ...(IS_PROD ? {} : {
    webServer: {
      command: `export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin" && npm run dev`,
      url: LOCAL,
      reuseExistingServer: true,
      timeout: 120_000,
      env: { PATH: "/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin" },
    },
  }),
});
