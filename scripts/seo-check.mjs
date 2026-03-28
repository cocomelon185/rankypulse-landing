#!/usr/bin/env node
/**
 * seo-check.mjs — Build-time SEO guardrail script
 *
 * Validates Next.js page metadata to prevent common SEO regressions:
 *   - String titles that include brand name (will be doubled by layout template)
 *   - Auth/app pages without noindex (indexable when they shouldn't be)
 *   - Public marketing pages missing canonical tags
 *   - Public pages accidentally marked noindex
 *
 * Usage:   node scripts/seo-check.mjs
 * CI:      Add "seo-check" to your pre-deploy step
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const SRC = join(__dirname, "../src/app");

const errors = [];
const warnings = [];

function error(file, msg) {
  errors.push(`  ✗ ${relative(SRC, file)}: ${msg}`);
}

function warn(file, msg) {
  warnings.push(`  ⚠ ${relative(SRC, file)}: ${msg}`);
}

function getAllPageFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...getAllPageFiles(fullPath));
    } else if (entry === "page.tsx" || entry === "page.ts") {
      files.push(fullPath);
    }
  }
  return files;
}

function checkPage(filePath) {
  const content = readFileSync(filePath, "utf8");
  const rel = relative(SRC, filePath);

  const isMarketing = rel.startsWith("(marketing)");
  const isApp = rel.startsWith("(app)");
  const isAuthPage = rel.includes("/auth/");

  // Detect metadata presence
  const hasMetadata =
    content.includes("export const metadata") ||
    content.includes("export async function generateMetadata") ||
    content.includes("export function generateMetadata");

  if (!hasMetadata) {
    // (app) pages inherit from the layout — no per-page metadata needed
    // Auth flow pages (callback, verify, email OTP) are transient — metadata is optional
    if (!isApp && !isAuthPage) {
      warn(filePath, "No metadata export found — add metadata for public pages");
    }
    return;
  }

  // ── Rule 1: Root title that includes "RankyPulse" as a plain string ────────
  // The (marketing) layout has title: { template: "%s | RankyPulse" }.
  // A string like "Page | RankyPulse" becomes "Page | RankyPulse | RankyPulse".
  // Fix: use title: { absolute: "Page | RankyPulse" } instead.
  // Note: openGraph.title / twitter.title are always plain strings — that's fine.
  // We only error when the root title field is a string (no object form found).
  const hasObjectTitle = /title:\s*\{/.test(content);
  const hasStringTitleWithBrand = /title:\s*["'`][^"'`]*RankyPulse/.test(content);
  if (!hasObjectTitle && hasStringTitleWithBrand && isMarketing) {
    error(
      filePath,
      'root title includes "RankyPulse" as a plain string — will be doubled by the layout template. ' +
        'Use title: { absolute: "..." } instead.'
    );
  }

  // ── Rule 2: Auth pages must be noindex ────────────────────────────────────
  if (isAuthPage) {
    const hasNoIndex = /index:\s*false/.test(content);
    if (!hasNoIndex) {
      error(
        filePath,
        "Auth page is missing robots: { index: false } — it will be indexed by search engines"
      );
    }
  }

  // ── Rule 3: Public marketing pages should have a canonical ────────────────
  if (isMarketing && !isAuthPage) {
    const hasCanonical = /canonical/.test(content);
    if (!hasCanonical) {
      warn(filePath, "Missing alternates.canonical — recommended for all public pages");
    }
  }

  // ── Rule 4: Public pages accidentally marked noindex ─────────────────────
  if (isMarketing && !isAuthPage) {
    const hasExplicitNoIndex = /index:\s*false/.test(content);
    if (hasExplicitNoIndex) {
      warn(
        filePath,
        "Public marketing page has robots.index: false — verify this is intentional"
      );
    }
  }
}

// ── Run ───────────────────────────────────────────────────────────────────────

console.log("🔍 RankyPulse SEO Guardrail Check\n");

const pages = getAllPageFiles(SRC);
console.log(`Scanning ${pages.length} page files...\n`);

for (const page of pages) {
  checkPage(page);
}

if (warnings.length > 0) {
  console.log(`Warnings (${warnings.length}):`);
  for (const w of warnings) console.log(w);
  console.log();
}

if (errors.length > 0) {
  console.log(`Errors (${errors.length}):`);
  for (const e of errors) console.log(e);
  console.log();
  console.error(`❌  SEO check FAILED — ${errors.length} error(s) must be fixed before deploying.\n`);
  process.exit(1);
}

console.log(`✅  SEO check passed! ${pages.length} pages scanned, ${warnings.length} warning(s).\n`);
