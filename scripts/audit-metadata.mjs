#!/usr/bin/env node
/**
 * audit-metadata.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Scans every page.tsx in src/app/ and flags metadata titles / descriptions
 * that fall outside Google's recommended length ranges.
 *
 * Usage:
 *   node scripts/audit-metadata.mjs
 *   node scripts/audit-metadata.mjs --json        (machine-readable output)
 *   node scripts/audit-metadata.mjs --fix-report  (only show problems)
 *
 * Limits:
 *   Title:       30–60 chars   (< 30 → too short, > 60 → too long)
 *   Description: 70–160 chars  (< 70 → too short, > 160 → too long)
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

// ── Config ────────────────────────────────────────────────────────────────────
const ROOT      = new URL("../src/app", import.meta.url).pathname;
const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN  = 70;
const DESC_MAX  = 160;

const args         = process.argv.slice(2);
const JSON_MODE    = args.includes("--json");
const PROBLEMS_ONLY = args.includes("--fix-report");

// ── ANSI colours (disabled when piping / JSON mode) ──────────────────────────
const isTTY = process.stdout.isTTY && !JSON_MODE;
const c = {
  reset:  isTTY ? "\x1b[0m"  : "",
  bold:   isTTY ? "\x1b[1m"  : "",
  dim:    isTTY ? "\x1b[2m"  : "",
  green:  isTTY ? "\x1b[32m" : "",
  yellow: isTTY ? "\x1b[33m" : "",
  red:    isTTY ? "\x1b[31m" : "",
  cyan:   isTTY ? "\x1b[36m" : "",
  blue:   isTTY ? "\x1b[34m" : "",
};

// ── Regexes ───────────────────────────────────────────────────────────────────
// Static string: title: "...", title: { absolute: "..." }, title: `...` (no interpolation)
const STATIC_TITLE_RE = /title\s*:\s*(?:\{\s*absolute\s*:\s*)?(['"`])([^'"`${}]+)\1/g;
const STATIC_DESC_RE  = /description\s*:\s*(['"`])([^'"`${}]+)\1/g;

// Dynamic (has template literal interpolation)
const DYN_TITLE_RE = /title\s*:\s*(?:\{\s*absolute\s*:\s*)?`[^`]*\$\{[^`]*`/g;
const DYN_DESC_RE  = /description\s*:\s*`[^`]*\$\{[^`]*`/g;

// ── File walker ───────────────────────────────────────────────────────────────
function walkPages(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...walkPages(full));
    } else if (entry === "page.tsx" || entry === "layout.tsx") {
      results.push(full);
    }
  }
  return results;
}

// ── Classifier ────────────────────────────────────────────────────────────────
function classify(value, min, max) {
  if (value.length < min) return "SHORT";
  if (value.length > max) return "LONG";
  return "OK";
}

function statusEmoji(status) {
  return { OK: "✅", SHORT: "❌", LONG: "⚠️", DYNAMIC: "🔍" }[status] ?? "?";
}

function statusColor(status) {
  return {
    OK:      c.green,
    SHORT:   c.red,
    LONG:    c.yellow,
    DYNAMIC: c.blue,
  }[status] ?? c.reset;
}

// ── Main ──────────────────────────────────────────────────────────────────────
const files = walkPages(ROOT);
const results = [];

for (const file of files) {
  const src  = readFileSync(file, "utf8");
  const path = relative(join(ROOT, ".."), file);

  const titles = [];
  const descs  = [];

  // Static titles
  for (const m of src.matchAll(STATIC_TITLE_RE)) {
    const val    = m[2].trim();
    const status = classify(val, TITLE_MIN, TITLE_MAX);
    titles.push({ value: val, length: val.length, status });
  }

  // Dynamic titles
  const dynTitles = src.match(DYN_TITLE_RE) ?? [];
  for (const _ of dynTitles) {
    titles.push({ value: "(dynamic — manual review)", length: null, status: "DYNAMIC" });
  }

  // Static descriptions
  for (const m of src.matchAll(STATIC_DESC_RE)) {
    const val    = m[2].trim();
    // Skip short strings that are clearly not descriptions (< 20 chars)
    if (val.length < 20) continue;
    const status = classify(val, DESC_MIN, DESC_MAX);
    descs.push({ value: val, length: val.length, status });
  }

  // Dynamic descriptions
  const dynDescs = src.match(DYN_DESC_RE) ?? [];
  for (const _ of dynDescs) {
    descs.push({ value: "(dynamic — manual review)", length: null, status: "DYNAMIC" });
  }

  if (titles.length > 0 || descs.length > 0) {
    results.push({ path, titles, descs });
  }
}

// ── JSON output ───────────────────────────────────────────────────────────────
if (JSON_MODE) {
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

// ── Stats ─────────────────────────────────────────────────────────────────────
let tOK = 0, tLong = 0, tShort = 0, tDyn = 0;
let dOK = 0, dLong = 0, dShort = 0, dDyn = 0;

for (const { titles, descs } of results) {
  for (const t of titles) {
    if (t.status === "OK") tOK++;
    else if (t.status === "LONG") tLong++;
    else if (t.status === "SHORT") tShort++;
    else tDyn++;
  }
  for (const d of descs) {
    if (d.status === "OK") dOK++;
    else if (d.status === "LONG") dLong++;
    else if (d.status === "SHORT") dShort++;
    else dDyn++;
  }
}

// ── Table output ──────────────────────────────────────────────────────────────
console.log(`\n${c.bold}RankyPulse — Metadata Audit${c.reset}`);
console.log(`${c.dim}Scanned ${files.length} page/layout files in src/app/${c.reset}\n`);

const COL1 = 52;
const COL2 = 8;
const COL3 = 48;

const header = `${"File".padEnd(COL1)} ${"Len".padEnd(COL2)} ${"Value"}`;
const divider = "─".repeat(COL1 + COL2 + COL3 + 3);

// Titles section
console.log(`${c.bold}${c.cyan}TITLES${c.reset}  ${c.dim}(ideal: ${TITLE_MIN}–${TITLE_MAX} chars)${c.reset}`);
console.log(divider);
console.log(`${c.dim}${header}${c.reset}`);
console.log(divider);

for (const { path, titles } of results) {
  for (const t of titles) {
    if (PROBLEMS_ONLY && t.status === "OK") continue;
    const em  = statusEmoji(t.status);
    const col = statusColor(t.status);
    const len = t.length !== null ? String(t.length).padEnd(COL2) : "  —   ";
    const val = t.value.length > COL3 ? t.value.slice(0, COL3 - 1) + "…" : t.value;
    console.log(`${em} ${col}${path.padEnd(COL1 - 2)}${c.reset} ${c.dim}${len}${c.reset} ${col}${val}${c.reset}`);
  }
}

// Descriptions section
console.log(`\n${c.bold}${c.cyan}DESCRIPTIONS${c.reset}  ${c.dim}(ideal: ${DESC_MIN}–${DESC_MAX} chars)${c.reset}`);
console.log(divider);
console.log(`${c.dim}${header}${c.reset}`);
console.log(divider);

for (const { path, descs } of results) {
  for (const d of descs) {
    if (PROBLEMS_ONLY && d.status === "OK") continue;
    const em  = statusEmoji(d.status);
    const col = statusColor(d.status);
    const len = d.length !== null ? String(d.length).padEnd(COL2) : "  —   ";
    const val = d.value.length > COL3 ? d.value.slice(0, COL3 - 1) + "…" : d.value;
    console.log(`${em} ${col}${path.padEnd(COL1 - 2)}${c.reset} ${c.dim}${len}${c.reset} ${col}${val}${c.reset}`);
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${divider}`);
console.log(`${c.bold}Summary${c.reset}`);
console.log(
  `  Titles:       ${c.green}${tOK} OK${c.reset}  ` +
  `${tLong  > 0 ? c.yellow : c.dim}${tLong} too long${c.reset}  ` +
  `${tShort > 0 ? c.red    : c.dim}${tShort} too short${c.reset}  ` +
  `${c.blue}${tDyn} dynamic${c.reset}`
);
console.log(
  `  Descriptions: ${c.green}${dOK} OK${c.reset}  ` +
  `${dLong  > 0 ? c.yellow : c.dim}${dLong} too long${c.reset}  ` +
  `${dShort > 0 ? c.red    : c.dim}${dShort} too short${c.reset}  ` +
  `${c.blue}${dDyn} dynamic${c.reset}`
);

const totalProblems = tLong + tShort + dLong + dShort;
console.log(
  totalProblems === 0
    ? `\n${c.green}${c.bold}✓ All static metadata is within range.${c.reset}\n`
    : `\n${c.yellow}${c.bold}⚠  ${totalProblems} static issue(s) found. Run with --fix-report to see only problems.${c.reset}\n`
);
