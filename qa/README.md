# RankyPulse QA Automation System

**Phase 1: Route Discovery & Configuration** ✅

Complete multi-layer automated quality assurance system for RankyPulse. Catches regressions, performance issues, and broken functionality before production.

## Architecture

```
qa/
├── crawler/              # Technical SEO crawl, route discovery
├── config/               # Routes, environments, thresholds
├── playwright/           # E2E browser tests
├── api/                  # API health & schema validation
├── lighthouse/           # Performance & accessibility audits
├── visual/               # Screenshot baselines & regression detection
├── reporting/            # Aggregated reports (JSON, Markdown, HTML)
└── artifacts/            # Generated test outputs (gitignored)
```

## 7-Phase Implementation Plan

| Phase | Name | Status | Purpose |
|-------|------|--------|---------|
| **0** | Test Account Setup | ✅ Done | Seed test-friends@rankypulse.com |
| **1** | Route Discovery | 🔄 In Progress | Parse sitemap, crawl routes, find broken links |
| **2** | SEO & Technical Crawl | ⏳ Pending | Validate metadata, canonical, structured data |
| **3** | Browser Automation | ⏳ Pending | Smoke tests, auth flows, conversion funnel |
| **4** | API Health & Schema | ⏳ Pending | Endpoint validation, response shape checks |
| **5** | Lighthouse & Performance | ⏳ Pending | Performance scores, Core Web Vitals, metrics |
| **6** | Visual Regression | ⏳ Pending | Screenshot baselines, pixel diff detection |
| **7** | Reporting & CI/CD | ⏳ Pending | GitHub Actions, post-deploy automation |

## Quick Start

### Prerequisites

1. **Node.js 18+** (for `fetch()` support)
2. **npm 9+**
3. **Environment variables**:
   ```bash
   # .env.local
   BASE_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

### Installation

```bash
cd landing/

# Install QA dependencies
npm install --save-dev \
  playwright \
  @playwright/test \
  @axe-core/playwright \
  lighthouse \
  axios \
  fast-xml-parser \
  pixelmatch \
  pngjs \
  dotenv

# Verify installation
npm run qa:types  # TypeScript check
```

### Run Route Discovery (Phase 1)

```bash
# Local environment (http://localhost:3000)
npm run qa:discover-routes

# Staging
BASE_URL=https://staging.rankypulse.com npm run qa:discover-routes

# Production
npm run qa:discover-routes:prod
```

**Output**: `qa/artifacts/routes-discovered.json`

## Current Phase: Route Discovery (Phase 1)

### What It Does

1. **Parses sitemap.xml** — extracts static routes
2. **Crawls HTML** — follows internal links to find dynamic routes
3. **Tracks status codes** — detects 404s, redirects, timeouts
4. **Builds route manifest** — comprehensive inventory for testing

### Config Files Created

| File | Purpose |
|------|---------|
| `qa/config/routes.ts` | Route registry (all 85+ known routes) |
| `qa/config/environments.ts` | Environment configs (local, staging, prod) |
| `qa/config/thresholds.ts` | QA thresholds (Lighthouse, CWV, API timeouts) |
| `qa/crawler/route-discovery.ts` | Route discovery crawler with sitemap parsing |

### Example Output

```json
{
  "discoveredAt": "2026-03-09T14:30:00.000Z",
  "baseUrl": "https://rankypulse.com",
  "totalRoutes": 47,
  "routes": [
    {
      "path": "/",
      "url": "https://rankypulse.com/",
      "statusCode": 200,
      "title": "RankyPulse - SEO Audit Tool"
    },
    {
      "path": "/pricing",
      "url": "https://rankypulse.com/pricing",
      "statusCode": 200,
      "title": "Pricing | RankyPulse"
    },
    {
      "path": "/auth/signin",
      "url": "https://rankypulse.com/auth/signin",
      "statusCode": 200,
      "title": "Sign In | RankyPulse"
    }
  ],
  "brokenRoutes": [],
  "redirectChains": {}
}
```

## Upcoming Phases

### Phase 2: SEO & Technical Crawl
- Validate page titles, meta descriptions, H1 tags
- Check canonical URLs, hreflang, robots directives
- Detect soft 404s, redirect chains, broken internal links
- Structured data validation (JSON-LD, Open Graph)

### Phase 3: Browser Automation (Playwright)
- Smoke tests (homepage loads, no console errors)
- Auth flow (signup, login, password reset, magic link)
- Conversion funnel (home → audit → create account → results → upgrade)
- Dashboard functionality (navigation, data loading, interactions)
- Protected routes (redirects for logged-out users)

### Phase 4: API Health & Schema Validation
- Endpoint reachability checks (200/201/204 status)
- Response time validation (< thresholds)
- JSON schema validation (no unexpected nulls, required fields)
- Error handling (proper error messages, correct status codes)

### Phase 5: Lighthouse & Performance
- Performance score >= 75 (staging), >= 70 (prod)
- Accessibility score >= 90
- SEO score >= 90
- Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms)
- Audits on: homepage, pricing, login, dashboard, audit results

### Phase 6: Visual Regression
- Screenshot baselines (desktop, tablet, mobile)
- Pixel diff detection (>5% = regression)
- Compare: homepage, pricing, login, dashboard, project detail
- Report diffs with side-by-side images

### Phase 7: Reporting & CI/CD
- GitHub Actions workflows:
  - `qa-smoke.yml` — lightweight smoke tests on PR
  - `qa-post-deploy-staging.yml` — full suite on staging
  - `qa-post-deploy-prod.yml` — full suite on production
  - `qa-nightly.yml` — scheduled crawl + visual regression
  - `qa-manual.yml` — on-demand runs
- Aggregated reporting (JSON, Markdown, HTML)
- Slack notifications on failures
- Artifact storage (screenshots, lighthouse reports, diffs)

## Configuration Reference

### Environments (`qa/config/environments.ts`)

```typescript
{
  local:       { baseUrl: "http://localhost:3000", timeout: 10000 },
  staging:     { baseUrl: "https://staging.rankypulse.com", timeout: 15000 },
  production:  { baseUrl: "https://rankypulse.com", timeout: 20000 }
}
```

### Thresholds (`qa/config/thresholds.ts`)

```typescript
// Lighthouse scores (0-100)
{ performance: 75, accessibility: 90, seo: 90 }

// Core Web Vitals
{ lcp: 2500ms, cls: 0.1, inp: 200ms }

// API response times
{ critical: 2000ms, standard: 3000ms, slow: 5000ms }

// Visual regression
{ pixelDiffThreshold: 5%, minPixelDiff: 10 pixels }
```

### Routes (`qa/config/routes.ts`)

All 85+ routes documented with:
- Path, name, category (marketing/auth/app/api)
- Authentication requirement
- Whether crawlable
- Purpose/description

```typescript
getRoutesByCategory("app")      // 20 authenticated pages
getCrawlableRoutes()            // 45 publicly crawlable
getPublicRoutes()               // 30 marketing/auth pages
getApiRoutes()                  // 51 API endpoints
```

## Test Accounts

### Seeded Account (Phase 0)
```
Email:    test-friends@rankypulse.com
Password: TestRankyPulse2024!
Plan:     Starter (50 keywords)
Created:  By `scripts/seed-test-account.mjs`
```

**Usage**: Use in Playwright tests via:
```typescript
await page.fill('input[name="email"]', 'test-friends@rankypulse.com');
await page.fill('input[name="password"]', 'TestRankyPulse2024!');
```

## Common Commands

```bash
# TypeScript compilation check
npm run qa:types

# Discover routes (local)
npm run qa:discover-routes

# Discover routes (production)
npm run qa:discover-routes:prod

# Smoke tests (when Phase 3 is ready)
npm run qa:smoke

# Full E2E tests (when Phase 3 is ready)
npm run qa:full

# Full QA suite (types + routes + smoke)
npm run qa
```

## Output Artifacts

After running QA, outputs are saved to:

```
qa/artifacts/
├── routes-discovered.json       # Phase 1: Route inventory
├── crawl-results.json           # Phase 2: SEO/technical findings
├── playwright-report/           # Phase 3: E2E test results
├── lighthouse/                  # Phase 5: Performance audits
├── screenshots/                 # Phase 6: Visual baselines
├── diffs/                       # Phase 6: Regression diffs
├── reports/                     # Phase 7: Aggregated reports
│   ├── report.json
│   ├── report.md
│   └── report.html
└── logs/                        # All phase logs
```

All artifacts are `.gitignore`'d except baselines in `qa/visual/baselines/`.

## GitHub Actions Integration (Phase 7)

Coming soon: Automated QA on every deploy

```yaml
# .github/workflows/qa-post-deploy-staging.yml
- Triggers on Vercel staging deployment
- Runs full QA suite (phases 1-6)
- Posts results as PR comment
- Archives artifacts (screenshots, reports)
- Notifies Slack on failure
```

## Troubleshooting

### "Module not found: fast-xml-parser"
```bash
npm install --save-dev fast-xml-parser
```

### "Base URL not set"
```bash
# Set BASE_URL for route discovery
BASE_URL=http://localhost:3000 npm run qa:discover-routes
```

### Routes show 404
1. Ensure dev server is running: `npm run dev`
2. Check BASE_URL matches: `http://localhost:3000`
3. Verify routes exist in codebase

### TypeScript errors in qa/
```bash
npm run qa:types  # See full error list
```

## Next Steps

1. **✅ Phase 0**: Test account seeded (`scripts/seed-test-account.mjs`)
2. **🔄 Phase 1**: Route discovery configured (you are here)
   - Run: `npm run qa:discover-routes`
   - Verify output in `qa/artifacts/routes-discovered.json`
3. **⏳ Phase 2**: SEO & technical crawl (build `qa/crawler/crawl.ts`, `seo-checks.ts`)
4. **⏳ Phase 3**: Browser automation (build Playwright tests in `qa/playwright/`)
5. **⏳ Phase 4**: API health (build `qa/api/api-health.ts`, schemas)
6. **⏳ Phase 5**: Lighthouse audits (build `qa/lighthouse/run-lighthouse.ts`)
7. **⏳ Phase 6**: Visual regression (build `qa/visual/capture.ts`, `compare.ts`)
8. **⏳ Phase 7**: GitHub Actions integration (build `.github/workflows/qa-*.yml`)

## Questions?

See `/Users/amjad.mohammad/.claude/plans/indexed-swimming-widget.md` for the full plan.

---

**Last updated**: 2026-03-09 | **Phase**: 1 of 7 | **Status**: Configuration complete, ready to execute
