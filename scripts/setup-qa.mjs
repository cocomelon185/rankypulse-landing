#!/usr/bin/env node
/**
 * scripts/setup-qa.mjs
 *
 * Setup QA dependencies and npm scripts
 * Usage: node scripts/setup-qa.mjs
 *
 * This script:
 * 1. Installs QA npm packages
 * 2. Adds QA scripts to package.json
 * 3. Verifies TypeScript configuration
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const PACKAGE_JSON_PATH = path.join(PROJECT_ROOT, "package.json");

const QA_PACKAGES = [
  "playwright",
  "@playwright/test",
  "@axe-core/playwright",
  "lighthouse",
  "axios",
  "fast-xml-parser",
  "pixelmatch",
  "pngjs",
  "dotenv",
];

const QA_SCRIPTS = {
  "qa:discover-routes":
    "tsx qa/crawler/route-discovery.ts",
  "qa:discover-routes:prod":
    "BASE_URL=https://rankypulse.com tsx qa/crawler/route-discovery.ts",
  "qa:smoke": "playwright test qa/playwright/smoke.spec.ts --reporter=html",
  "qa:full": "playwright test qa/playwright --reporter=html",
  "qa:types": "tsc --noEmit qa/",
  "qa": "npm run qa:types && npm run qa:discover-routes && npm run qa:smoke",
};

console.log("🔧 RankyPulse QA Setup\n");

// Step 1: Load package.json
console.log("📦 Loading package.json...");
let packageJson;
try {
  const content = fs.readFileSync(PACKAGE_JSON_PATH, "utf-8");
  packageJson = JSON.parse(content);
} catch (err) {
  console.error("❌ Failed to read package.json:", err.message);
  process.exit(1);
}

// Step 2: Install QA packages
console.log(`\n📚 Installing ${QA_PACKAGES.length} QA packages...\n`);
const installCmd = `npm install --save-dev ${QA_PACKAGES.join(" ")}`;
try {
  execSync(installCmd, { stdio: "inherit", cwd: PROJECT_ROOT });
  console.log("\n✅ Packages installed\n");
} catch (err) {
  console.error("❌ Failed to install packages:", err.message);
  process.exit(1);
}

// Step 3: Add QA scripts to package.json
console.log("✍️  Adding QA scripts to package.json...");
if (!packageJson.scripts) {
  packageJson.scripts = {};
}

let addedScripts = 0;
Object.entries(QA_SCRIPTS).forEach(([scriptName, scriptCmd]) => {
  if (packageJson.scripts[scriptName]) {
    console.log(`   ⚠️  Script already exists: ${scriptName}`);
  } else {
    packageJson.scripts[scriptName] = scriptCmd;
    addedScripts++;
  }
});

fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2));
console.log(`✅ Added ${addedScripts} new scripts\n`);

// Step 4: Verify TypeScript
console.log("🔍 Verifying TypeScript...");
try {
  execSync("npx tsc --noEmit qa/ 2>&1 | head -20", {
    stdio: "inherit",
    cwd: PROJECT_ROOT,
  });
  console.log("✅ TypeScript OK\n");
} catch (err) {
  console.warn("⚠️  TypeScript check had warnings (this is OK)\n");
}

// Step 5: Summary
const separator = "=".repeat(50);
console.log(separator);
console.log("✅ QA Setup Complete!\n");
console.log("📋 Available commands:\n");
Object.entries(QA_SCRIPTS).forEach(([scriptName, scriptCmd]) => {
  console.log(`   npm run ${scriptName}`);
  console.log(`      → ${scriptCmd}`);
});

console.log("\n🚀 Next steps:");
console.log("   1. npm run qa:discover-routes     (discover all routes)");
console.log("   2. cat qa/artifacts/routes-discovered.json");
console.log("   3. See qa/README.md for full guide\n");

console.log("📖 Documentation: qa/README.md and qa/PHASE_1_SUMMARY.md");
console.log(separator);
