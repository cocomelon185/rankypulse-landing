/**
 * /qa/reporting/generate-report.ts
 *
 * Phase 7: Aggregated QA Reporting
 *
 * Reads artifact JSON files from all phases and produces:
 * 1. qa/artifacts/reports/report.json — machine-readable
 * 2. qa/artifacts/reports/report.md  — human-readable Markdown
 * 3. qa/artifacts/reports/report.html — full HTML with collapsibles
 *
 * Usage:
 *   tsx qa/reporting/generate-report.ts
 *   GITHUB_RUN_ID=12345 tsx qa/reporting/generate-report.ts  (for CI links)
 */

import * as fs from "fs";
import * as path from "path";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PhaseResult {
  phase: number;
  name: string;
  ran: boolean;
  passed: boolean;
  summary: string;
  details?: unknown;
}

interface AggregatedReport {
  generatedAt: string;
  environment: string;
  baseUrl: string;
  gitRef?: string;
  gitSha?: string;
  ciRunId?: string;
  overallPassed: boolean;
  passRate: string;
  phases: PhaseResult[];
}

// ── Load artifact JSON files ──────────────────────────────────────────────────

function loadJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return null;
  }
}

// ── Phase summaries ───────────────────────────────────────────────────────────

function buildPhaseResults(artifactsDir: string): PhaseResult[] {
  const phases: PhaseResult[] = [];

  // ── Phase 1: Route Discovery ──────────────────────────────────────────────
  const routes = loadJson<{
    totalRoutes: number;
    brokenRoutes: unknown[];
  }>(path.join(artifactsDir, "routes-discovered.json"));

  phases.push({
    phase: 1,
    name: "Route Discovery",
    ran: routes !== null,
    passed: routes !== null ? routes.brokenRoutes.length === 0 : false,
    summary: routes
      ? `${routes.totalRoutes} routes | ${routes.brokenRoutes.length} broken`
      : "Not run",
    details: routes
      ? { totalRoutes: routes.totalRoutes, broken: routes.brokenRoutes.length }
      : undefined,
  });

  // ── Phase 2: SEO & Technical Crawl ───────────────────────────────────────
  const crawl = loadJson<{
    passed: boolean;
    totalPages: number;
    avgSeoScore: number;
    seoSummary: { missingTitle: number; missingH1: number; soft404s: number };
    linkSummary: { brokenLinks: unknown[] };
  }>(path.join(artifactsDir, "crawl-results.json"));

  phases.push({
    phase: 2,
    name: "SEO & Technical Crawl",
    ran: crawl !== null,
    passed: crawl?.passed ?? false,
    summary: crawl
      ? `${crawl.totalPages} pages | Score: ${crawl.avgSeoScore}/100 | ${crawl.linkSummary.brokenLinks.length} broken links`
      : "Not run",
    details: crawl
      ? {
          avgScore: crawl.avgSeoScore,
          brokenLinks: crawl.linkSummary.brokenLinks.length,
          missingTitle: crawl.seoSummary.missingTitle,
          missingH1: crawl.seoSummary.missingH1,
        }
      : undefined,
  });

  // ── Phase 3: Browser Automation ───────────────────────────────────────────
  const playwright = loadJson<{
    stats: { expected: number; unexpected: number; passed: number; failed: number };
  }>(path.join(artifactsDir, "playwright-results.json"));

  phases.push({
    phase: 3,
    name: "Browser Automation (Playwright)",
    ran: playwright !== null,
    passed: playwright
      ? (playwright.stats?.unexpected ?? playwright.stats?.failed ?? 0) === 0
      : false,
    summary: playwright
      ? `${playwright.stats?.passed ?? "?"} passed / ${playwright.stats?.unexpected ?? playwright.stats?.failed ?? "?"} failed`
      : "Not run",
    details: playwright?.stats,
  });

  // ── Phase 4: API Health ───────────────────────────────────────────────────
  const apiHealth = loadJson<{
    overallPassed: boolean;
    totalChecks: number;
    passed: number;
    failed: number;
    avgLatencyMs: number;
  }>(path.join(artifactsDir, "api-health-report.json"));

  phases.push({
    phase: 4,
    name: "API Health & Schema",
    ran: apiHealth !== null,
    passed: apiHealth?.overallPassed ?? false,
    summary: apiHealth
      ? `${apiHealth.passed}/${apiHealth.totalChecks} checks passed | Avg: ${apiHealth.avgLatencyMs}ms`
      : "Not run",
    details: apiHealth
      ? {
          passed: apiHealth.passed,
          failed: apiHealth.failed,
          avgLatencyMs: apiHealth.avgLatencyMs,
        }
      : undefined,
  });

  // ── Phase 5: Lighthouse ───────────────────────────────────────────────────
  const lighthouse = loadJson<{
    overallPassed: boolean;
    passedPages: number;
    failedPages: number;
    results: Array<{
      name: string;
      device: string;
      scores: { performance: number; accessibility: number; seo: number };
      passed: boolean;
    }>;
  }>(path.join(artifactsDir, "lighthouse-summary.json"));

  const avgPerf = lighthouse
    ? Math.round(
        lighthouse.results.reduce((s, r) => s + r.scores.performance, 0) /
          lighthouse.results.length
      )
    : 0;
  const avgSeo = lighthouse
    ? Math.round(
        lighthouse.results.reduce((s, r) => s + r.scores.seo, 0) /
          lighthouse.results.length
      )
    : 0;

  phases.push({
    phase: 5,
    name: "Lighthouse & Performance",
    ran: lighthouse !== null,
    passed: lighthouse?.overallPassed ?? false,
    summary: lighthouse
      ? `${lighthouse.passedPages}/${lighthouse.results.length} pages | Avg Perf: ${avgPerf} | Avg SEO: ${avgSeo}`
      : "Not run",
    details: lighthouse
      ? {
          passedPages: lighthouse.passedPages,
          avgPerformance: avgPerf,
          avgSeo,
        }
      : undefined,
  });

  // ── Phase 6: Visual Regression ────────────────────────────────────────────
  const visual = loadJson<{
    overallPassed: boolean;
    totalComparisons: number;
    passed: number;
    regressions: number;
    warnings: number;
  }>(path.join(artifactsDir, "visual-regression-report.json"));

  phases.push({
    phase: 6,
    name: "Visual Regression",
    ran: visual !== null,
    passed: visual?.overallPassed ?? false,
    summary: visual
      ? `${visual.passed}/${visual.totalComparisons} passed | ${visual.regressions} regressions`
      : "Not run",
    details: visual
      ? {
          comparisons: visual.totalComparisons,
          regressions: visual.regressions,
          warnings: visual.warnings,
        }
      : undefined,
  });

  return phases;
}

// ── Main report generator ─────────────────────────────────────────────────────

export function generateReport(artifactsDir: string): AggregatedReport {
  const phases = buildPhaseResults(artifactsDir);
  const phasesRan = phases.filter((p) => p.ran).length;
  const phasesPassed = phases.filter((p) => p.ran && p.passed).length;
  const overallPassed =
    phasesRan > 0 && phases.filter((p) => p.ran).every((p) => p.passed);

  return {
    generatedAt: new Date().toISOString(),
    environment: process.env.QA_ENV ?? process.env.VERCEL_ENV ?? "unknown",
    baseUrl: process.env.BASE_URL ?? process.env.QA_BASE_URL ?? "unknown",
    gitRef: process.env.GITHUB_REF_NAME,
    gitSha: process.env.GITHUB_SHA?.slice(0, 7),
    ciRunId: process.env.GITHUB_RUN_ID,
    overallPassed,
    passRate: `${phasesPassed}/${phasesRan} phases passed`,
    phases,
  };
}

// ── Markdown report ───────────────────────────────────────────────────────────

export function generateMarkdown(report: AggregatedReport): string {
  const lines: string[] = [];
  const statusIcon = report.overallPassed ? "✅" : "❌";
  const phasesPassed = report.phases.filter((p) => p.ran && p.passed).length;
  const phasesRan = report.phases.filter((p) => p.ran).length;

  lines.push(`# RankyPulse QA Report`);
  lines.push(`\n**Status**: ${statusIcon} ${report.overallPassed ? "ALL SYSTEMS GO" : "ISSUES FOUND"}`);
  lines.push(`**Generated**: ${new Date(report.generatedAt).toLocaleString()}`);
  lines.push(`**Environment**: \`${report.environment}\``);
  lines.push(`**Base URL**: ${report.baseUrl}`);

  if (report.gitSha) {
    lines.push(`**Commit**: \`${report.gitSha}\``);
  }
  if (report.ciRunId) {
    lines.push(
      `**CI Run**: [#${report.ciRunId}](https://github.com/actions/runs/${report.ciRunId})`
    );
  }

  lines.push(`\n## Phase Results (${phasesPassed}/${phasesRan} passed)\n`);
  lines.push(`| Phase | Name | Status | Summary |`);
  lines.push(`|-------|------|--------|---------|`);

  report.phases.forEach((p) => {
    const icon = !p.ran ? "⏭️" : p.passed ? "✅" : "❌";
    const status = !p.ran ? "Skipped" : p.passed ? "Passed" : "Failed";
    lines.push(`| ${p.phase} | ${p.name} | ${icon} ${status} | ${p.summary} |`);
  });

  // Details for failed phases
  const failed = report.phases.filter((p) => p.ran && !p.passed);
  if (failed.length > 0) {
    lines.push(`\n## ❌ Failed Phases\n`);
    failed.forEach((p) => {
      lines.push(`### Phase ${p.phase}: ${p.name}\n`);
      lines.push(`${p.summary}\n`);
      if (p.details) {
        lines.push("```json");
        lines.push(JSON.stringify(p.details, null, 2));
        lines.push("```");
      }
    });
  }

  lines.push(`\n---`);
  lines.push(`*Generated by RankyPulse QA System — ${new Date(report.generatedAt).toISOString()}*`);

  return lines.join("\n");
}

// ── HTML report ───────────────────────────────────────────────────────────────

export function generateHtml(report: AggregatedReport): string {
  const phaseRows = report.phases
    .map((p) => {
      const icon = !p.ran ? "⏭️" : p.passed ? "✅" : "❌";
      const rowClass = !p.ran ? "" : p.passed ? "pass" : "fail";
      return `<tr class="${rowClass}">
        <td>${p.phase}</td>
        <td>${p.name}</td>
        <td>${icon} ${!p.ran ? "Skipped" : p.passed ? "Passed" : "Failed"}</td>
        <td>${p.summary}</td>
      </tr>`;
    })
    .join("\n");

  const overallClass = report.overallPassed ? "pass" : "fail";
  const overallText = report.overallPassed ? "✅ ALL PASSED" : "❌ ISSUES FOUND";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>RankyPulse QA Report — ${new Date(report.generatedAt).toLocaleString()}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 960px; margin: 40px auto; padding: 0 20px; background: #0d1117; color: #e6edf3; }
    h1 { font-size: 1.8em; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 0.85em; margin-left: 8px; }
    .badge.pass { background: #1a4731; color: #56d364; }
    .badge.fail { background: #4c1a1a; color: #f85149; }
    .meta { color: #8b949e; font-size: 0.9em; margin: 16px 0 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background: #161b22; text-align: left; padding: 10px 14px; color: #8b949e; font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 10px 14px; border-bottom: 1px solid #21262d; font-size: 0.9em; }
    tr.pass td { background: rgba(56,139,68,0.07); }
    tr.fail td { background: rgba(248,81,73,0.07); }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin: 24px 0; }
    .stat { background: #161b22; border-radius: 8px; padding: 16px; text-align: center; border: 1px solid #21262d; }
    .stat-value { font-size: 1.8em; font-weight: 700; }
    .stat-label { color: #8b949e; font-size: 0.8em; margin-top: 4px; }
    footer { margin-top: 40px; color: #8b949e; font-size: 0.8em; text-align: center; }
  </style>
</head>
<body>
  <h1>RankyPulse QA Report <span class="badge ${overallClass}">${overallText}</span></h1>
  <div class="meta">
    <strong>Generated:</strong> ${new Date(report.generatedAt).toLocaleString()} &nbsp;|&nbsp;
    <strong>Environment:</strong> ${report.environment} &nbsp;|&nbsp;
    <strong>Base URL:</strong> ${report.baseUrl}
    ${report.gitSha ? ` &nbsp;|&nbsp; <strong>Commit:</strong> <code>${report.gitSha}</code>` : ""}
  </div>

  <div class="summary-grid">
    <div class="stat">
      <div class="stat-value">${report.phases.filter((p) => p.ran && p.passed).length}/${report.phases.filter((p) => p.ran).length}</div>
      <div class="stat-label">Phases Passed</div>
    </div>
  </div>

  <table>
    <thead>
      <tr><th>#</th><th>Phase</th><th>Status</th><th>Summary</th></tr>
    </thead>
    <tbody>
      ${phaseRows}
    </tbody>
  </table>

  <footer>Generated by RankyPulse QA System &middot; ${report.generatedAt}</footer>
</body>
</html>`;
}

// ── Save & print ──────────────────────────────────────────────────────────────

export function saveReport(report: AggregatedReport, reportsDir: string): void {
  fs.mkdirSync(reportsDir, { recursive: true });

  // JSON
  fs.writeFileSync(
    path.join(reportsDir, "report.json"),
    JSON.stringify(report, null, 2)
  );

  // Markdown
  fs.writeFileSync(path.join(reportsDir, "report.md"), generateMarkdown(report));

  // HTML
  fs.writeFileSync(path.join(reportsDir, "report.html"), generateHtml(report));

  console.log(`✅ Reports saved to ${reportsDir}`);
  console.log(`   report.json   — Machine-readable`);
  console.log(`   report.md     — Human-readable Markdown`);
  console.log(`   report.html   — Full HTML report`);
}

export function printReportSummary(report: AggregatedReport): void {
  const icon = report.overallPassed ? "✅" : "❌";
  console.log("\n" + "━".repeat(60));
  console.log(`${icon}  QA Report — ${report.passRate}`);
  console.log("━".repeat(60));
  report.phases.forEach((p) => {
    const icon = !p.ran ? "⏭️" : p.passed ? "✅" : "❌";
    const label = `Phase ${p.phase}: ${p.name}`.padEnd(40);
    console.log(`   ${icon} ${label} ${p.summary}`);
  });
  console.log("━".repeat(60));
}

// ── CLI entry point ───────────────────────────────────────────────────────────

if (require.main === module) {
  const artifactsDir = path.join(process.cwd(), "qa/artifacts");
  const reportsDir = path.join(artifactsDir, "reports");

  const report = generateReport(artifactsDir);
  printReportSummary(report);
  saveReport(report, reportsDir);

  console.log(
    `\n📄 View HTML report: ${path.join(reportsDir, "report.html")}`
  );
  process.exit(report.overallPassed ? 0 : 1);
}
