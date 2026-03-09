/**
 * /qa/visual/compare.ts
 *
 * Phase 6: Visual Regression — Screenshot Comparison
 *
 * Compares current screenshots against baselines using pixel-diff.
 * Flags regressions (>5% pixel diff) and generates side-by-side diff images.
 *
 * Usage:
 *   tsx qa/visual/compare.ts
 *
 * Prerequisites:
 *   1. Run: MODE=baseline tsx qa/visual/capture.ts  (saves baselines)
 *   2. Run: MODE=current tsx qa/visual/capture.ts   (saves current screenshots)
 *   3. Run: tsx qa/visual/compare.ts               (compares and reports)
 */

import * as fs from "fs";
import * as path from "path";
import { VISUAL_THRESHOLDS } from "../config/thresholds";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DiffResult {
  name: string;
  baselinePath: string;
  currentPath: string;
  diffPath?: string;
  pixelDiffCount: number;
  totalPixels: number;
  diffPercent: number;
  passed: boolean;
  /** PASSED / WARN / FAIL */
  status: "passed" | "warn" | "regression";
  error?: string;
}

export interface CompareRunResult {
  comparedAt: string;
  totalComparisons: number;
  passed: number;
  regressions: number;
  warnings: number;
  missingBaselines: number;
  missingCurrent: number;
  results: DiffResult[];
  overallPassed: boolean;
}

// ── PNG comparison using pixelmatch ──────────────────────────────────────────

async function compareImages(
  baselinePath: string,
  currentPath: string,
  diffPath: string
): Promise<{ pixelDiff: number; totalPixels: number }> {
  // Dynamic import to handle environments without these packages gracefully
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PNG } = require("pngjs");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pixelmatch = require("pixelmatch");

  const baselinePng = PNG.sync.read(fs.readFileSync(baselinePath));
  const currentPng = PNG.sync.read(fs.readFileSync(currentPath));

  // If dimensions differ, we can't do a pixel diff
  if (
    baselinePng.width !== currentPng.width ||
    baselinePng.height !== currentPng.height
  ) {
    throw new Error(
      `Image dimensions changed: baseline ${baselinePng.width}x${baselinePng.height} vs current ${currentPng.width}x${currentPng.height}`
    );
  }

  const { width, height } = baselinePng;
  const totalPixels = width * height;

  // Create diff image buffer
  const diffPng = new PNG({ width, height });

  const pixelDiff = pixelmatch(
    baselinePng.data,
    currentPng.data,
    diffPng.data,
    width,
    height,
    {
      threshold: 0.1, // Per-pixel sensitivity (0 = exact, 1 = loose)
      includeAA: false, // Ignore anti-aliasing differences
      alpha: 0.1, // Blend transparency
      diffColor: [255, 0, 0], // Red for changed pixels
      aaColor: [255, 255, 0], // Yellow for AA pixels
    }
  );

  // Save diff image
  if (pixelDiff > VISUAL_THRESHOLDS.minPixelDiff) {
    fs.mkdirSync(path.dirname(diffPath), { recursive: true });
    fs.writeFileSync(diffPath, PNG.sync.write(diffPng));
  }

  return { pixelDiff, totalPixels };
}

// ── Main comparison runner ────────────────────────────────────────────────────

export async function runVisualComparison(options?: {
  baselinesDir?: string;
  currentDir?: string;
  diffsDir?: string;
}): Promise<CompareRunResult> {
  const baselinesDir =
    options?.baselinesDir ??
    path.join(process.cwd(), "qa/visual/baselines");
  const currentDir =
    options?.currentDir ??
    path.join(process.cwd(), "qa/artifacts/screenshots");
  const diffsDir =
    options?.diffsDir ??
    path.join(process.cwd(), "qa/artifacts/diffs");

  console.log(`\n🔍 Visual Regression Comparison\n`);
  console.log(`   Baselines: ${baselinesDir}`);
  console.log(`   Current:   ${currentDir}`);
  console.log(`   Diffs:     ${diffsDir}\n`);

  if (!fs.existsSync(baselinesDir)) {
    console.error(
      `❌ Baselines directory not found. Run: MODE=baseline tsx qa/visual/capture.ts`
    );
    process.exit(1);
  }

  if (!fs.existsSync(currentDir)) {
    console.error(
      `❌ Current screenshots not found. Run: MODE=current tsx qa/visual/capture.ts`
    );
    process.exit(1);
  }

  // Find baseline images
  const baselineFiles = fs
    .readdirSync(baselinesDir)
    .filter((f) => f.endsWith(".png"));

  const results: DiffResult[] = [];
  let missingCurrent = 0;

  for (const filename of baselineFiles) {
    const baselinePath = path.join(baselinesDir, filename);
    const currentPath = path.join(currentDir, filename);
    const diffPath = path.join(diffsDir, `diff-${filename}`);
    const name = filename.replace(".png", "");

    if (!fs.existsSync(currentPath)) {
      missingCurrent++;
      results.push({
        name,
        baselinePath,
        currentPath,
        pixelDiffCount: 0,
        totalPixels: 0,
        diffPercent: 0,
        passed: false,
        status: "regression",
        error: "Current screenshot missing — page may have been removed",
      });
      continue;
    }

    try {
      const { pixelDiff, totalPixels } = await compareImages(
        baselinePath,
        currentPath,
        diffPath
      );

      const diffPercent = (pixelDiff / totalPixels) * 100;
      const isRegression = diffPercent > VISUAL_THRESHOLDS.pixelDiffThreshold * 100;
      const isWarn =
        diffPercent > (VISUAL_THRESHOLDS.pixelDiffThreshold * 100) / 2;

      const status: DiffResult["status"] = isRegression
        ? "regression"
        : isWarn
        ? "warn"
        : "passed";

      results.push({
        name,
        baselinePath,
        currentPath,
        diffPath: pixelDiff > VISUAL_THRESHOLDS.minPixelDiff ? diffPath : undefined,
        pixelDiffCount: pixelDiff,
        totalPixels,
        diffPercent: Math.round(diffPercent * 100) / 100,
        passed: !isRegression,
        status,
      });

      const icon = isRegression ? "❌" : isWarn ? "⚠️ " : "✅";
      console.log(
        `   ${icon} ${name.padEnd(35)} ${String(pixelDiff).padStart(6)} px diff  (${diffPercent.toFixed(2)}%)`
      );
    } catch (err) {
      results.push({
        name,
        baselinePath,
        currentPath,
        pixelDiffCount: 0,
        totalPixels: 0,
        diffPercent: 0,
        passed: false,
        status: "regression",
        error: err instanceof Error ? err.message : String(err),
      });
      console.log(`   ❌ ${name}: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log();

  const passed = results.filter((r) => r.passed).length;
  const regressions = results.filter((r) => r.status === "regression").length;
  const warnings = results.filter((r) => r.status === "warn").length;

  return {
    comparedAt: new Date().toISOString(),
    totalComparisons: results.length,
    passed,
    regressions,
    warnings,
    missingBaselines: 0,
    missingCurrent,
    results,
    overallPassed: regressions === 0,
  };
}

// ── Save & print ──────────────────────────────────────────────────────────────

export function saveCompareResults(
  result: CompareRunResult,
  artifactsDir: string
): void {
  fs.mkdirSync(artifactsDir, { recursive: true });
  const jsonPath = path.join(artifactsDir, "visual-regression-report.json");
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
  console.log(`✅ Saved visual regression report to ${jsonPath}`);
}

export function printCompareSummary(result: CompareRunResult): void {
  const icon = result.overallPassed ? "✅" : "❌";
  console.log("━".repeat(60));
  console.log(
    `${icon}  Visual Regression ${result.overallPassed ? "PASSED" : "FAILED"}`
  );
  console.log("━".repeat(60));
  console.log(`\n   Comparisons: ${result.totalComparisons}`);
  console.log(`   Passed:      ${result.passed}`);
  console.log(`   Regressions: ${result.regressions}`);
  console.log(`   Warnings:    ${result.warnings}`);
  if (result.missingCurrent > 0) {
    console.log(`   Missing:     ${result.missingCurrent} (current screenshots not found)`);
  }

  if (result.regressions > 0) {
    console.log(`\n❌ Visual Regressions:\n`);
    result.results
      .filter((r) => r.status === "regression")
      .forEach((r) => {
        console.log(`  ${r.name}`);
        if (r.error) {
          console.log(`    Error: ${r.error}`);
        } else {
          console.log(`    ${r.pixelDiffCount} pixels changed (${r.diffPercent}% of viewport)`);
          if (r.diffPath) console.log(`    Diff: ${r.diffPath}`);
        }
      });
  }

  console.log(
    `\n   Threshold: ${VISUAL_THRESHOLDS.pixelDiffThreshold * 100}% pixel diff = regression`
  );
  console.log("━".repeat(60));
}

// ── CLI entry point ───────────────────────────────────────────────────────────

if (require.main === module) {
  const artifactsDir = path.join(process.cwd(), "qa/artifacts");

  runVisualComparison()
    .then((result) => {
      printCompareSummary(result);
      saveCompareResults(result, artifactsDir);
      process.exit(result.overallPassed ? 0 : 1);
    })
    .catch((err) => {
      console.error("❌ Comparison failed:", err);
      process.exit(1);
    });
}
