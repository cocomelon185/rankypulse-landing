/**
 * playwright.qa.config.ts
 *
 * Playwright configuration for QA automation tests (qa/playwright/).
 * Separate from the existing playwright.config.ts (which covers e2e/).
 *
 * Usage:
 *   npm run qa:smoke    → smoke tests only
 *   npm run qa:full     → all qa/playwright tests
 *   npm run qa:auth     → auth tests only
 */

import { defineConfig, devices } from "@playwright/test";

const LOCAL = "http://localhost:3000";

// Priority: QA_BASE_URL > PLAYWRIGHT_BASE_URL > BASE_URL > localhost
const BASE_URL =
  process.env.QA_BASE_URL ??
  process.env.PLAYWRIGHT_BASE_URL ??
  process.env.BASE_URL ??
  LOCAL;

const IS_CI = !!process.env.CI;
const IS_PROD = BASE_URL.includes("rankypulse.com") && !BASE_URL.includes("staging");

export default defineConfig({
  testDir: "./qa/playwright",

  // Test timeout — generous for network calls to DataForSEO etc.
  timeout: IS_CI ? 60_000 : 45_000,

  // Assertion timeout
  expect: { timeout: IS_CI ? 15_000 : 10_000 },

  // Retry failed tests — integration tests against a live production server
  // can have timing-related flakiness (session checks, cold-start latency).
  retries: IS_CI ? 2 : 1,

  // Parallelism — sequential in CI (predictable), parallel locally
  workers: IS_CI ? 1 : undefined,
  fullyParallel: !IS_CI,

  // Fail fast in CI on first unexpected failure
  forbidOnly: IS_CI,

  // Reporters
  reporter: IS_CI
    ? [
        ["github"], // GitHub Actions annotations
        ["html", { open: "never", outputFolder: "qa/artifacts/playwright-report" }],
        ["json", { outputFile: "qa/artifacts/playwright-results.json" }],
      ]
    : [
        ["html", { open: "on-failure", outputFolder: "qa/artifacts/playwright-report" }],
        ["list"],
      ],

  // Output directory for screenshots/traces
  outputDir: "qa/artifacts/playwright-output",

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: IS_CI ? "retain-on-failure" : "off",
    ignoreHTTPSErrors: true,

    // Viewport for desktop-first testing
    viewport: { width: 1280, height: 720 },

    // Realistic user-agent
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36 RankyPulse-QA/1.0",

    // Extra HTTP headers
    extraHTTPHeaders: {
      Accept: "text/html,application/json",
    },
  },

  // Browser projects
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Firefox and WebKit — only run in full CI suite, not smoke
    ...(IS_CI && IS_PROD
      ? [
          {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
          },
          {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
          },
        ]
      : []),
  ],

  // Web server — start dev server if testing locally
  ...(IS_CI || process.env.SKIP_SERVER_START
    ? {} // CI: assumes server is already running
    : {
        webServer: {
          command: `export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin" && npm run dev`,
          url: LOCAL,
          reuseExistingServer: !IS_CI,
          timeout: 120_000,
          env: {
            PATH: "/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin",
          },
        },
      }),
});
