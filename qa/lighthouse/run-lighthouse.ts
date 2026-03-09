/**
 * /qa/lighthouse/run-lighthouse.ts
 *
 * Phase 5: Lighthouse Performance & SEO Audits
 *
 * Runs Google Lighthouse on key pages and validates scores against thresholds.
 * Measures: Performance, Accessibility, Best Practices, SEO
 * Also captures Core Web Vitals: LCP, CLS, INP, TTFB, Speed Index
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 tsx qa/lighthouse/run-lighthouse.ts
 *   BASE_URL=https://rankypulse.com tsx qa/lighthouse/run-lighthouse.ts
 */

import * as fs from "fs";
import * as path from "path";
import { getEnvironmentConfig } from "../config/environments";
import { LIGHTHOUSE_THRESHOLDS, CWV_THRESHOLDS, DEVICE_PROFILES } from "../config/thresholds";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LighthousePageConfig {
  name: string;
  path: string;
  device: "desktop" | "mobile";
  /** Page importance for reporting */
  importance: "critical" | "high" | "normal";
}

export interface LighthouseScores {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

export interface CoreWebVitals {
  lcp: number | null;       // Largest Contentful Paint (ms)
  cls: number | null;       // Cumulative Layout Shift
  inp: number | null;       // Interaction to Next Paint (ms)
  ttfb: number | null;      // Time to First Byte (ms)
  fcp: number | null;       // First Contentful Paint (ms)
  speedIndex: number | null; // Speed Index (ms)
}

export interface LighthouseResult {
  name: string;
  url: string;
  device: "desktop" | "mobile";
  scores: LighthouseScores;
  cwv: CoreWebVitals;
  passed: boolean;
  failures: string[];
  warnings: string[];
  reportPath?: string;
}

export interface LighthouseRunResult {
  runAt: string;
  baseUrl: string;
  environment: string;
  thresholdEnv: "staging" | "production";
  totalPages: number;
  passedPages: number;
  failedPages: number;
  results: LighthouseResult[];
  overallPassed: boolean;
}

// ── Pages to audit ────────────────────────────────────────────────────────────

export const LIGHTHOUSE_PAGES: LighthousePageConfig[] = [
  // Critical — user-facing, revenue-impacting
  {
    name: "Homepage",
    path: "/",
    device: "desktop",
    importance: "critical",
  },
  {
    name: "Homepage (Mobile)",
    path: "/",
    device: "mobile",
    importance: "critical",
  },
  {
    name: "Pricing",
    path: "/pricing",
    device: "desktop",
    importance: "critical",
  },
  // High — conversion funnel
  {
    name: "Sign In",
    path: "/auth/signin",
    device: "desktop",
    importance: "high",
  },
  {
    name: "Sign Up",
    path: "/auth/signup",
    device: "desktop",
    importance: "high",
  },
  // Normal — supporting pages
  {
    name: "Features",
    path: "/features",
    device: "desktop",
    importance: "normal",
  },
];

// ── Run Lighthouse on a single page ───────────────────────────────────────────

async function runLighthouseOnPage(
  url: string,
  pageConfig: LighthousePageConfig,
  outputDir: string,
  thresholdEnv: "staging" | "production"
): Promise<LighthouseResult> {
  // Dynamically import lighthouse (avoid loading at module level since it's heavy)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const lighthouse = require("lighthouse");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const chromeLauncher = require("chrome-launcher");

  const deviceProfile = DEVICE_PROFILES[pageConfig.device];
  const thresholds = LIGHTHOUSE_THRESHOLDS[thresholdEnv];

  // Launch Chrome
  const chrome = await chromeLauncher.launch({
    chromeFlags: [
      "--headless",
      "--no-sandbox",
      "--disable-gpu",
      `--window-size=${deviceProfile.width},${deviceProfile.height}`,
    ],
  });

  const failures: string[] = [];
  const warnings: string[] = [];

  try {
    const flags = {
      port: chrome.port,
      output: "json" as const,
      formFactor: pageConfig.device === "mobile" ? "mobile" : "desktop",
      screenEmulation:
        pageConfig.device === "mobile"
          ? {
              mobile: true,
              width: deviceProfile.width,
              height: deviceProfile.height,
              deviceScaleFactor: deviceProfile.deviceScaleFactor,
            }
          : {
              mobile: false,
              width: deviceProfile.width,
              height: deviceProfile.height,
              deviceScaleFactor: 1,
            },
      throttlingMethod: "simulate",
    };

    const { lhr } = await lighthouse.default(url, flags);

    // Extract scores (0-1 in Lighthouse, multiply by 100)
    const scores: LighthouseScores = {
      performance: Math.round((lhr.categories.performance?.score ?? 0) * 100),
      accessibility: Math.round(
        (lhr.categories.accessibility?.score ?? 0) * 100
      ),
      bestPractices: Math.round(
        (lhr.categories["best-practices"]?.score ?? 0) * 100
      ),
      seo: Math.round((lhr.categories.seo?.score ?? 0) * 100),
    };

    // Extract Core Web Vitals
    const getNumericValue = (auditId: string): number | null => {
      const audit = lhr.audits[auditId];
      return audit?.numericValue ?? null;
    };

    const cwv: CoreWebVitals = {
      lcp: getNumericValue("largest-contentful-paint"),
      cls: getNumericValue("cumulative-layout-shift"),
      inp: getNumericValue("interaction-to-next-paint") ?? getNumericValue("total-blocking-time"),
      ttfb: getNumericValue("server-response-time"),
      fcp: getNumericValue("first-contentful-paint"),
      speedIndex: getNumericValue("speed-index"),
    };

    // ── Validate scores against thresholds ──────────────────────────────────
    if (scores.performance < thresholds.performance) {
      failures.push(
        `Performance: ${scores.performance} < threshold ${thresholds.performance}`
      );
    }
    if (scores.accessibility < thresholds.accessibility) {
      failures.push(
        `Accessibility: ${scores.accessibility} < threshold ${thresholds.accessibility}`
      );
    }
    if (scores.bestPractices < thresholds.bestPractices) {
      warnings.push(
        `Best Practices: ${scores.bestPractices} < threshold ${thresholds.bestPractices}`
      );
    }
    if (scores.seo < thresholds.seo) {
      failures.push(`SEO: ${scores.seo} < threshold ${thresholds.seo}`);
    }

    // ── Validate Core Web Vitals ────────────────────────────────────────────
    if (cwv.lcp !== null && cwv.lcp > CWV_THRESHOLDS.lcp) {
      failures.push(
        `LCP: ${Math.round(cwv.lcp)}ms exceeds threshold ${CWV_THRESHOLDS.lcp}ms`
      );
    }
    if (cwv.cls !== null && cwv.cls > CWV_THRESHOLDS.cls) {
      failures.push(
        `CLS: ${cwv.cls.toFixed(3)} exceeds threshold ${CWV_THRESHOLDS.cls}`
      );
    }
    if (cwv.ttfb !== null && cwv.ttfb > CWV_THRESHOLDS.ttfb) {
      warnings.push(
        `TTFB: ${Math.round(cwv.ttfb)}ms exceeds threshold ${CWV_THRESHOLDS.ttfb}ms`
      );
    }

    // Save Lighthouse HTML report
    const safeName = pageConfig.name.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase();
    const reportFile = `lighthouse-${safeName}-${pageConfig.device}.json`;
    const reportPath = path.join(outputDir, reportFile);
    fs.writeFileSync(reportPath, JSON.stringify(lhr, null, 2));

    return {
      name: pageConfig.name,
      url,
      device: pageConfig.device,
      scores,
      cwv,
      passed: failures.length === 0,
      failures,
      warnings,
      reportPath,
    };
  } finally {
    await chrome.kill();
  }
}

// ── Main runner ───────────────────────────────────────────────────────────────

export async function runLighthouseAudits(
  pages?: LighthousePageConfig[],
  baseUrl?: string
): Promise<LighthouseRunResult> {
  const env = getEnvironmentConfig();
  const resolvedBase = baseUrl ?? env.baseUrl;
  const isProduction =
    resolvedBase.includes("rankypulse.com") &&
    !resolvedBase.includes("staging");
  const thresholdEnv = isProduction ? "production" : "staging";
  const pagesToAudit = pages ?? LIGHTHOUSE_PAGES;
  const outputDir = path.join(process.cwd(), "qa/artifacts/lighthouse");
  fs.mkdirSync(outputDir, { recursive: true });

  console.log(`\n🔦 Lighthouse Audits\n`);
  console.log(`   Environment:  ${env.name}`);
  console.log(`   Base URL:     ${resolvedBase}`);
  console.log(
    `   Thresholds:   ${thresholdEnv} (Perf ${LIGHTHOUSE_THRESHOLDS[thresholdEnv].performance}, A11y ${LIGHTHOUSE_THRESHOLDS[thresholdEnv].accessibility}, SEO ${LIGHTHOUSE_THRESHOLDS[thresholdEnv].seo})`
  );
  console.log(`   Pages:        ${pagesToAudit.length}\n`);

  const results: LighthouseResult[] = [];

  for (let i = 0; i < pagesToAudit.length; i++) {
    const pageConfig = pagesToAudit[i];
    const url = `${resolvedBase}${pageConfig.path}`;
    console.log(
      `📊 [${i + 1}/${pagesToAudit.length}] Auditing: ${pageConfig.name} (${pageConfig.device})...`
    );

    try {
      const result = await runLighthouseOnPage(
        url,
        pageConfig,
        outputDir,
        thresholdEnv
      );
      results.push(result);

      const icon = result.passed ? "✅" : "❌";
      console.log(
        `   ${icon} Perf:${result.scores.performance} A11y:${result.scores.accessibility} SEO:${result.scores.seo} | LCP:${result.cwv.lcp ? Math.round(result.cwv.lcp) + "ms" : "n/a"} CLS:${result.cwv.cls?.toFixed(3) ?? "n/a"}`
      );

      if (result.failures.length > 0) {
        result.failures.forEach((f) => console.log(`   ❌ ${f}`));
      }
      if (result.warnings.length > 0) {
        result.warnings.forEach((w) => console.log(`   ⚠️  ${w}`));
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`   ❌ Failed to audit ${pageConfig.name}: ${errMsg}`);
      results.push({
        name: pageConfig.name,
        url,
        device: pageConfig.device,
        scores: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 },
        cwv: { lcp: null, cls: null, inp: null, ttfb: null, fcp: null, speedIndex: null },
        passed: false,
        failures: [`Lighthouse failed: ${errMsg}`],
        warnings: [],
      });
    }
  }

  const passedPages = results.filter((r) => r.passed).length;

  const runResult: LighthouseRunResult = {
    runAt: new Date().toISOString(),
    baseUrl: resolvedBase,
    environment: env.name,
    thresholdEnv,
    totalPages: results.length,
    passedPages,
    failedPages: results.length - passedPages,
    results,
    overallPassed: passedPages === results.length,
  };

  return runResult;
}

// ── Save & print ──────────────────────────────────────────────────────────────

export function saveLighthouseResults(
  result: LighthouseRunResult,
  artifactsDir: string
): void {
  fs.mkdirSync(artifactsDir, { recursive: true });
  const jsonPath = path.join(artifactsDir, "lighthouse-summary.json");
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
  console.log(`\n✅ Saved Lighthouse summary to ${jsonPath}`);
}

export function printLighthouseSummary(result: LighthouseRunResult): void {
  const icon = result.overallPassed ? "✅" : "❌";
  console.log("\n" + "━".repeat(70));
  console.log(`${icon}  Lighthouse Audits ${result.overallPassed ? "PASSED" : "FAILED"}`);
  console.log("━".repeat(70));
  console.log(`\n   Pages audited: ${result.totalPages}`);
  console.log(`   Passed:        ${result.passedPages}`);
  console.log(`   Failed:        ${result.failedPages}\n`);

  console.log("   Page                          Perf  A11y  SEO  LCP     CLS");
  console.log("   " + "─".repeat(65));
  result.results.forEach((r) => {
    const icon = r.passed ? "✅" : "❌";
    const lcpText = r.cwv.lcp ? `${Math.round(r.cwv.lcp)}ms` : "  —  ";
    const clsText = r.cwv.cls != null ? r.cwv.cls.toFixed(3) : "  — ";
    const name = `${r.name} (${r.device})`.padEnd(30);
    console.log(
      `   ${icon} ${name} ${String(r.scores.performance).padStart(3)}   ${String(r.scores.accessibility).padStart(3)}  ${String(r.scores.seo).padStart(3)}  ${lcpText.padEnd(8)} ${clsText}`
    );
  });

  if (result.failedPages > 0) {
    console.log("\n❌ Failures:\n");
    result.results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  ${r.name} (${r.device}):`);
        r.failures.forEach((f) => console.log(`    → ${f}`));
      });
  }
  console.log("━".repeat(70));
}

// ── CLI entry point ───────────────────────────────────────────────────────────

if (require.main === module) {
  const baseUrl = process.env.BASE_URL;
  const artifactsDir = path.join(process.cwd(), "qa/artifacts");

  runLighthouseAudits(undefined, baseUrl)
    .then((result) => {
      printLighthouseSummary(result);
      saveLighthouseResults(result, artifactsDir);
      process.exit(result.overallPassed ? 0 : 1);
    })
    .catch((err) => {
      console.error("❌ Lighthouse runner failed:", err);
      process.exit(1);
    });
}
