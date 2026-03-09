/**
 * /qa/visual/capture.ts
 *
 * Phase 6: Visual Regression — Screenshot Capture
 *
 * Captures screenshots of key pages in multiple device profiles.
 * Saves to qa/visual/baselines/ (first run) or qa/artifacts/screenshots/ (subsequent runs).
 *
 * First run: establishes baselines
 * Subsequent runs: generates comparison screenshots (used by compare.ts)
 *
 * Usage:
 *   # Capture new baselines (first time or after intentional design changes)
 *   MODE=baseline BASE_URL=http://localhost:3000 tsx qa/visual/capture.ts
 *
 *   # Capture current screenshots for regression comparison
 *   MODE=current BASE_URL=http://localhost:3000 tsx qa/visual/capture.ts
 */

import * as fs from "fs";
import * as path from "path";
import { chromium, type Browser, type Page } from "playwright";
import { getEnvironmentConfig } from "../config/environments";
import { DEVICE_PROFILES } from "../config/thresholds";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CaptureConfig {
  name: string;
  path: string;
  device: "desktop" | "tablet" | "mobile";
  /** Clip to above-the-fold only */
  fullPage?: boolean;
  /** Extra wait time before screenshot (for animations) */
  waitMs?: number;
  /** CSS selector to wait for before screenshotting */
  waitForSelector?: string;
  /** Selectors to hide (timestamps, random IDs, etc.) */
  hideSelectors?: string[];
}

export interface CaptureResult {
  name: string;
  device: string;
  screenshotPath: string;
  success: boolean;
  error?: string;
}

// ── Page configurations ───────────────────────────────────────────────────────

export const CAPTURE_CONFIGS: CaptureConfig[] = [
  // Homepage — most critical visual anchor
  {
    name: "homepage",
    path: "/",
    device: "desktop",
    fullPage: false,
    waitMs: 500,
  },
  {
    name: "homepage",
    path: "/",
    device: "mobile",
    fullPage: false,
    waitMs: 500,
  },

  // Pricing page — revenue critical
  {
    name: "pricing",
    path: "/pricing",
    device: "desktop",
    fullPage: true,
    waitMs: 500,
  },
  {
    name: "pricing",
    path: "/pricing",
    device: "mobile",
    fullPage: false,
    waitMs: 500,
  },

  // Auth pages — conversion funnel
  {
    name: "signin",
    path: "/auth/signin",
    device: "desktop",
    fullPage: false,
    waitMs: 300,
  },
  {
    name: "signup",
    path: "/auth/signup",
    device: "desktop",
    fullPage: false,
    waitMs: 300,
  },

  // Features page
  {
    name: "features",
    path: "/features",
    device: "desktop",
    fullPage: false,
    waitMs: 300,
  },
];

// These selectors will be hidden before screenshotting
// to avoid flaky diffs from dynamic content
const HIDE_ALWAYS = [
  // Timestamps and relative dates
  "time",
  "[data-timestamp]",
  // Cookie banners (vary by consent)
  "[class*='cookie']",
  "[id*='cookie']",
  // Chat widgets
  "#crisp-chatbox",
  ".intercom-launcher",
  // Scroll progress indicators
  "[class*='scroll-indicator']",
];

// ── Screenshot capture ────────────────────────────────────────────────────────

async function capturePage(
  page: Page,
  baseUrl: string,
  config: CaptureConfig,
  outputDir: string
): Promise<CaptureResult> {
  const profile = DEVICE_PROFILES[config.device];
  const name = `${config.name}-${config.device}`;

  try {
    // Set viewport
    await page.setViewportSize({
      width: profile.width,
      height: profile.height,
    });

    // Navigate
    await page.goto(`${baseUrl}${config.path}`, {
      waitUntil: "networkidle",
      timeout: 20000,
    });

    // Wait for specific selector if defined
    if (config.waitForSelector) {
      await page.waitForSelector(config.waitForSelector, { timeout: 10000 });
    }

    // Extra wait for animations
    if (config.waitMs) {
      await page.waitForTimeout(config.waitMs);
    }

    // Hide dynamic elements
    const selectorsToHide = [...HIDE_ALWAYS, ...(config.hideSelectors ?? [])];
    for (const selector of selectorsToHide) {
      await page
        .evaluate(
          (sel) => {
            const elements = document.querySelectorAll(sel);
            elements.forEach((el) => {
              (el as HTMLElement).style.visibility = "hidden";
            });
          },
          selector
        )
        .catch(() => undefined); // Ignore if selector not found
    }

    // Take screenshot
    const screenshotPath = path.join(outputDir, `${name}.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: config.fullPage ?? false,
      type: "png",
    });

    return {
      name: config.name,
      device: config.device,
      screenshotPath,
      success: true,
    };
  } catch (err) {
    return {
      name: config.name,
      device: config.device,
      screenshotPath: "",
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ── Main capture function ─────────────────────────────────────────────────────

export async function captureScreenshots(options: {
  baseUrl?: string;
  outputDir: string;
  configs?: CaptureConfig[];
}): Promise<CaptureResult[]> {
  const env = getEnvironmentConfig();
  const resolvedBase = options.baseUrl ?? env.baseUrl;
  const configs = options.configs ?? CAPTURE_CONFIGS;

  console.log(`\n📸 Visual Capture\n`);
  console.log(`   Base URL:  ${resolvedBase}`);
  console.log(`   Output:    ${options.outputDir}`);
  console.log(`   Pages:     ${configs.length}\n`);

  fs.mkdirSync(options.outputDir, { recursive: true });

  const browser: Browser = await chromium.launch({ headless: true });
  const results: CaptureResult[] = [];

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      process.stdout.write(
        `\r📷 Capturing [${i + 1}/${configs.length}] ${config.name} (${config.device})...`
      );

      const result = await capturePage(page, resolvedBase, config, options.outputDir);
      results.push(result);

      if (!result.success) {
        console.log(`\n   ❌ Failed: ${result.error}`);
      }
    }

    console.log("\n");
  } finally {
    await browser.close();
  }

  const successful = results.filter((r) => r.success).length;
  console.log(
    `✅ Captured ${successful}/${results.length} screenshots to ${options.outputDir}`
  );

  return results;
}

// ── CLI entry point ───────────────────────────────────────────────────────────

if (require.main === module) {
  const mode = process.env.MODE ?? "current";
  const baseUrl = process.env.BASE_URL;

  // Baselines go to qa/visual/baselines/ (tracked in git)
  // Current screenshots go to qa/artifacts/screenshots/ (gitignored)
  const outputDir =
    mode === "baseline"
      ? path.join(process.cwd(), "qa/visual/baselines")
      : path.join(process.cwd(), "qa/artifacts/screenshots");

  captureScreenshots({ baseUrl, outputDir })
    .then((results) => {
      const failed = results.filter((r) => !r.success);
      if (failed.length > 0) {
        console.error(`❌ ${failed.length} captures failed`);
        failed.forEach((r) =>
          console.error(`   ${r.name} (${r.device}): ${r.error}`)
        );
      }
      console.log(
        mode === "baseline"
          ? "\n✅ Baselines saved. Commit qa/visual/baselines/ to track them."
          : "\n✅ Current screenshots saved. Run compare.ts to check for regressions."
      );
      process.exit(failed.length > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error("❌ Capture failed:", err);
      process.exit(1);
    });
}
