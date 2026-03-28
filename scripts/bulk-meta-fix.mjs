#!/usr/bin/env node
/**
 * bulk-meta-fix.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * AI-powered bulk metadata fixer for RankyPulse.
 *
 * Scans public-facing page.tsx files for thin meta descriptions (< 70 chars)
 * and over-short page titles (< 30 chars raw, accounting for template suffix),
 * then calls Claude to generate SEO-optimised replacements and writes them
 * back to source — no database, no migrations, no fuss.
 *
 * Usage:
 *   node scripts/bulk-meta-fix.mjs              # dry-run: shows proposed fixes
 *   node scripts/bulk-meta-fix.mjs --apply      # writes changes to disk
 *   node scripts/bulk-meta-fix.mjs --verbose    # include Claude's reasoning
 *
 * Requires: ANTHROPIC_API_KEY env var
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import Anthropic from "@anthropic-ai/sdk";

// ── Config ────────────────────────────────────────────────────────────────────
const ROOT    = new URL("../src/app", import.meta.url).pathname;
const APPLY   = process.argv.includes("--apply");
const VERBOSE = process.argv.includes("--verbose");

const DESC_MIN = 70;
const DESC_MAX = 160;
// Titles: raw value + " | RankyPulse" (13 chars) gets appended by Next.js template.
// So a raw title of 17+ chars → final title ≥ 30 chars. We flag < 17 raw as truly short.
const TITLE_EFFECTIVE_MIN = 17;

// Skip authenticated-only sections — they're noindex and don't need marketing copy
const SKIP_SEGMENTS = new Set(["(app)", "api"]);

// Pages known to be auth-protected at the app/ level (not marketing)
const SKIP_PATHS = [
  /^app\/app\//,
];

const MODEL = "claude-haiku-4-5-20251001";

const anthropic = new Anthropic();

// ── ANSI colours ──────────────────────────────────────────────────────────────
const isTTY = process.stdout.isTTY;
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

// ── File walker ───────────────────────────────────────────────────────────────
function walkPages(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (!SKIP_SEGMENTS.has(entry)) results.push(...walkPages(full));
    } else if (entry === "page.tsx" || entry === "layout.tsx") {
      results.push(full);
    }
  }
  return results;
}

// ── Find the top-level meta description in a source file ─────────────────────
// Returns { value, fullMatch, index } or null.
// "Top-level" means NOT inside an openGraph/twitter sub-object.
function findTopLevelDescription(src) {
  // Strategy: split on the first occurrence of `openGraph:` or `twitter:`.
  // Any `description:` before that point is the root-level meta description.
  const ogIdx = src.search(/\bopenGraph\s*:/);
  const twIdx = src.search(/\btwitter\s*:/);
  const cutoff = Math.min(
    ogIdx  === -1 ? Infinity : ogIdx,
    twIdx  === -1 ? Infinity : twIdx,
  );

  const searchSrc = cutoff === Infinity ? src : src.slice(0, cutoff);

  // Match description: "..." or description: `...` (no template literals with ${})
  const re = /description\s*:\s*(['"`])((?:(?!\1)[^\\]|\\.)*)(\1)/g;
  for (const m of searchSrc.matchAll(re)) {
    const val = m[2];
    // Ignore very short strings that are clearly not meta descriptions (< 15 chars)
    if (val.length < 15) continue;
    // Ignore strings with ${} interpolation fragments (shouldn't happen with this regex
    // but be safe)
    if (val.includes("${")) continue;
    return { value: val, fullMatch: m[0], index: m.index };
  }
  return null;
}

// ── Find all description fields inside a data-object (e.g. pages = { ... }) ──
// Used for seo/[slug]/page.tsx and solutions/[slug]/page.tsx patterns.
function findDataObjectDescriptions(src) {
  // Only relevant if the file has a `const pages = {` pattern
  if (!/const pages\s*=\s*\{/.test(src)) return [];

  const hits = [];
  const re = /description\s*:\s*(['"`])((?:(?!\1)[^\\]|\\.)*)(\1)/g;
  for (const m of src.matchAll(re)) {
    const val = m[2];
    if (val.length < 15) continue;
    if (val.includes("${")) continue;
    hits.push({ value: val, fullMatch: m[0], index: m.index });
  }
  return hits;
}

// ── Find top-level title in a source file ─────────────────────────────────────
// Returns the first title string before openGraph/twitter (accounting for
// { absolute: "..." } pattern).
function findTopLevelTitle(src) {
  const ogIdx = src.search(/\bopenGraph\s*:/);
  const twIdx = src.search(/\btwitter\s*:/);
  const cutoff = Math.min(
    ogIdx === -1 ? Infinity : ogIdx,
    twIdx === -1 ? Infinity : twIdx,
  );
  const searchSrc = cutoff === Infinity ? src : src.slice(0, cutoff);

  // Match: title: "..." OR title: { absolute: "..." } OR title: { default: "..." }
  const re = /title\s*:\s*(?:\{\s*(?:absolute|default)\s*:\s*)?(['"`])((?:(?!\1)[^\\]|\\.)*)(\1)/g;
  for (const m of searchSrc.matchAll(re)) {
    const val = m[2];
    if (val.length < 5) continue;
    if (val.includes("${")) continue;
    return { value: val, fullMatch: m[0], index: m.index };
  }
  return null;
}

// ── Extract page slug/url hint from source ────────────────────────────────────
function extractCanonical(src) {
  const m = src.match(/canonical\s*:\s*['"`]([^'"`]+)['"`]/);
  return m ? m[1] : null;
}

// ── Claude: generate an optimised description ────────────────────────────────
async function generateDescription(context) {
  const { title, currentDesc, canonical, filePath } = context;

  const prompt = `You are an SEO copywriter for RankyPulse, an AI-powered SEO audit tool.

Write a compelling meta description for this page:
- Page title: ${title || "(unknown)"}
- Current description: "${currentDesc}"
- URL/canonical: ${canonical || filePath}

Requirements:
- Length: 100–140 characters (strict — count carefully)
- Tone: confident, benefit-focused, direct
- Include a natural call-to-action where it fits
- Do NOT start with "RankyPulse" or repeat the brand name unless it fits naturally
- Do NOT use the words "discover", "unlock", "revolutionize", "game-changing"
- Output ONLY the description text — no quotes, no explanations`;

  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
  // Strip any accidental surrounding quotes Claude might add
  return text.replace(/^["']|["']$/g, "").trim();
}

// ── Claude: generate an optimised title ──────────────────────────────────────
async function generateTitle(context) {
  const { currentTitle, canonical, filePath, templateSuffix } = context;

  const prompt = `You are an SEO copywriter for RankyPulse, an AI-powered SEO audit tool.

Write a page title for this page:
- Current title: "${currentTitle}"
- URL/canonical: ${canonical || filePath}
- The title will be displayed as: "<your title>${templateSuffix}"

Requirements:
- Your output alone (before the suffix) should be 20–47 characters
- Combine the keyword phrase with the brand differentiator naturally
- Be specific, not generic — use the actual feature name
- Output ONLY the title text — no quotes, no explanations, no suffix`;

  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 128,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
  return text.replace(/^["']|["']$/g, "").trim();
}

// ── Apply a string replacement to source ─────────────────────────────────────
function applyReplacement(src, oldValue, newValue, quote = '"') {
  // Build the old description string as it appears in source
  // We need to match the exact quote style and content
  const escapedOld = oldValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    `(description\\s*:\\s*(?:\\n\\s*)?)(['"\`])${escapedOld}\\2`,
  );
  return src.replace(re, `$1${quote}${newValue}${quote}`);
}

function applyTitleReplacement(src, oldValue, newValue, quote = '"') {
  const escapedOld = oldValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Match both plain and { absolute: "..." } forms
  const re = new RegExp(
    `(title\\s*:\\s*(?:\\{\\s*(?:absolute|default)\\s*:\\s*)?)(['"\`])${escapedOld}\\2`,
  );
  return src.replace(re, `$1${quote}${newValue}${quote}`);
}

// ── Diff display ──────────────────────────────────────────────────────────────
function showDiff(label, oldVal, newVal) {
  console.log(`  ${c.dim}OLD:${c.reset} ${c.red}${oldVal}${c.reset} ${c.dim}(${oldVal.length}ch)${c.reset}`);
  console.log(`  ${c.dim}NEW:${c.reset} ${c.green}${newVal}${c.reset} ${c.dim}(${newVal.length}ch)${c.reset}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
const files = walkPages(ROOT);

// Filter out skip paths
const publicFiles = files.filter((f) => {
  const rel = relative(join(ROOT, ".."), f);
  return !SKIP_PATHS.some((re) => re.test(rel));
});

console.log(`\n${c.bold}RankyPulse — Bulk AI Metadata Fixer${c.reset}`);
console.log(`${c.dim}Model: ${MODEL} | Mode: ${APPLY ? "APPLY" : "DRY-RUN"} | Files scanned: ${publicFiles.length}${c.reset}\n`);

if (!process.env.ANTHROPIC_API_KEY) {
  console.error(`${c.red}${c.bold}Error: ANTHROPIC_API_KEY is not set.${c.reset}`);
  console.error(`Set it with: export ANTHROPIC_API_KEY=sk-ant-...`);
  process.exit(1);
}

let totalFixed = 0;
let totalSkipped = 0;

for (const filePath of publicFiles) {
  const rel = relative(join(ROOT, ".."), filePath);
  let src = readFileSync(filePath, "utf8");
  let modified = false;
  const fixLog = [];

  // ── Data-object pages (seo/[slug], solutions/[slug]) ──────────────────────
  const isDataPage = /const pages\s*=\s*\{/.test(src);

  if (isDataPage) {
    const hits = findDataObjectDescriptions(src);
    for (const hit of hits) {
      if (hit.value.length >= DESC_MIN) continue; // already fine

      if (VERBOSE) {
        console.log(`${c.dim}  → generating description for: "${hit.value}"${c.reset}`);
      }

      const canonical = extractCanonical(src);
      // Guess the title nearby — look for a title: "..." within 300 chars before this hit
      const nearbyTitleMatch = src
        .slice(Math.max(0, hit.index - 300), hit.index)
        .match(/title\s*:\s*['"`]([^'"`]+)['"`]/g);
      const nearbyTitle = nearbyTitleMatch
        ? nearbyTitleMatch[nearbyTitleMatch.length - 1]
            .replace(/title\s*:\s*['"`]/, "")
            .replace(/['"`]$/, "")
        : null;

      let newDesc;
      try {
        newDesc = await generateDescription({
          title: nearbyTitle,
          currentDesc: hit.value,
          canonical,
          filePath: rel,
        });
      } catch (err) {
        console.error(`  ${c.red}Claude error: ${err.message}${c.reset}`);
        totalSkipped++;
        continue;
      }

      // Sanity-check length
      if (newDesc.length < DESC_MIN || newDesc.length > DESC_MAX) {
        // Force-trim if too long
        if (newDesc.length > DESC_MAX) {
          newDesc = newDesc.slice(0, DESC_MAX - 1).replace(/\s+\S*$/, "").trimEnd() + "…";
        }
        // If still too short, skip rather than write garbage
        if (newDesc.length < DESC_MIN) {
          console.log(`  ${c.yellow}Skipping — generated text too short (${newDesc.length}ch): "${newDesc}"${c.reset}`);
          totalSkipped++;
          continue;
        }
      }

      fixLog.push({ type: "description", old: hit.value, new: newDesc });

      // Detect quote character used in the original
      const quoteChar = src[src.indexOf(hit.fullMatch) + src.slice(src.indexOf(hit.fullMatch)).search(/['"`]/)] ?? '"';
      src = applyReplacement(src, hit.value, newDesc, quoteChar);
      modified = true;
    }
  } else {
    // ── Standard metadata export pages ──────────────────────────────────────
    const descHit = findTopLevelDescription(src);
    if (descHit && descHit.value.length < DESC_MIN) {
      if (VERBOSE) {
        console.log(`${c.dim}  → generating description for: "${descHit.value}"${c.reset}`);
      }

      const titleHit = findTopLevelTitle(src);
      const canonical = extractCanonical(src);

      let newDesc;
      try {
        newDesc = await generateDescription({
          title: titleHit?.value,
          currentDesc: descHit.value,
          canonical,
          filePath: rel,
        });
      } catch (err) {
        console.error(`  ${c.red}Claude error: ${err.message}${c.reset}`);
        totalSkipped++;
        continue;
      }

      if (newDesc.length > DESC_MAX) {
        newDesc = newDesc.slice(0, DESC_MAX - 1).replace(/\s+\S*$/, "").trimEnd() + "…";
      }
      if (newDesc.length < DESC_MIN) {
        console.log(`  ${c.yellow}Skipping — generated text too short (${newDesc.length}ch): "${newDesc}"${c.reset}`);
        totalSkipped++;
        continue;
      }

      fixLog.push({ type: "description", old: descHit.value, new: newDesc });

      const quoteChar = descHit.fullMatch.match(/['"`]/)?.[0] ?? '"';
      src = applyReplacement(src, descHit.value, newDesc, quoteChar);
      modified = true;
    }

    // ── Title check (only for files with very short raw titles) ───────────────
    const titleHit = findTopLevelTitle(src);
    // Check: does the file use the template (no "absolute", no " | RankyPulse" in title)?
    const usesTemplate = titleHit && !titleHit.fullMatch.includes("absolute") && !titleHit.value.includes("RankyPulse");
    const effectiveLen = titleHit ? titleHit.value.length + (usesTemplate ? 13 : 0) : 0;

    if (titleHit && effectiveLen < 30 && titleHit.value.length < TITLE_EFFECTIVE_MIN) {
      if (VERBOSE) {
        console.log(`${c.dim}  → generating title for: "${titleHit.value}"${c.reset}`);
      }

      const canonical = extractCanonical(src);
      const templateSuffix = usesTemplate ? " | RankyPulse" : "";

      let newTitle;
      try {
        newTitle = await generateTitle({
          currentTitle: titleHit.value,
          canonical,
          filePath: rel,
          templateSuffix,
        });
      } catch (err) {
        console.error(`  ${c.red}Claude error: ${err.message}${c.reset}`);
        totalSkipped++;
        continue;
      }

      fixLog.push({ type: "title", old: titleHit.value, new: newTitle });

      const quoteChar = titleHit.fullMatch.match(/['"`]/)?.[0] ?? '"';
      src = applyTitleReplacement(src, titleHit.value, newTitle, quoteChar);
      modified = true;
    }
  }

  // ── Output results for this file ───────────────────────────────────────────
  if (fixLog.length > 0) {
    console.log(`${c.bold}${c.cyan}${rel}${c.reset}`);
    for (const fix of fixLog) {
      console.log(`  ${c.yellow}${fix.type.toUpperCase()}${c.reset}`);
      showDiff(fix.type, fix.old, fix.new);
    }

    if (APPLY && modified) {
      writeFileSync(filePath, src, "utf8");
      console.log(`  ${c.green}✓ Written${c.reset}\n`);
      totalFixed++;
    } else {
      console.log(`  ${c.dim}(dry-run — pass --apply to write)${c.reset}\n`);
      totalFixed++;
    }
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log("─".repeat(72));
if (APPLY) {
  console.log(
    `${c.bold}${c.green}Done.${c.reset} Fixed ${totalFixed} file(s).` +
    (totalSkipped > 0 ? ` ${c.yellow}${totalSkipped} skipped (generation issues).${c.reset}` : ""),
  );
} else {
  console.log(
    `${c.bold}Dry-run complete.${c.reset} ${totalFixed} file(s) would be updated.`,
  );
  if (totalFixed > 0) {
    console.log(`Run with ${c.cyan}--apply${c.reset} to write changes to disk.`);
  }
}
console.log();
