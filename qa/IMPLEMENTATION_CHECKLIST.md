# QA Implementation Checklist

Track implementation progress across all 7 QA phases.

## Phase 0: Test Account Setup ✅ DONE

- [x] Create `scripts/seed-test-account.mjs`
- [x] Test account creation works
- [x] Account credentials verified: test-friends@rankypulse.com / TestRankyPulse2024!
- [x] Plan set to "starter" (50 keywords)
- [x] 90-day expiry configured (expires June 7, 2026)
- [x] Script is idempotent (safe to rerun)

**Status**: ✅ Ready to use in tests

---

## Phase 1: Route Discovery & Configuration ✅ DONE

### Configuration Files
- [x] Create `qa/config/routes.ts` (85+ route registry)
- [x] Create `qa/config/environments.ts` (local, staging, prod configs)
- [x] Create `qa/config/thresholds.ts` (QA acceptance criteria)
- [x] Create `qa/config/qa-dependencies.md` (npm packages guide)

### Implementation
- [x] Create `qa/crawler/route-discovery.ts` (crawler + sitemap parser)
- [x] Implement `parseSitemap()` function
- [x] Implement `crawlRoutes()` with status tracking
- [x] Implement redirect chain detection
- [x] Add rate limiting (200ms between requests)
- [x] Add same-origin filtering
- [x] Implement JSON output (`saveDiscoveryResults()`)

### Documentation
- [x] Create `qa/README.md` (comprehensive guide)
- [x] Create `qa/PHASE_1_SUMMARY.md` (detailed phase summary)
- [x] Create `qa/QUICK_START.md` (5-minute setup)
- [x] Create `qa/.gitignore` (exclude artifacts)

### Setup & Automation
- [x] Create `scripts/setup-qa.mjs` (automated QA setup)
- [x] Create QA npm scripts in package.json

### Directory Structure
- [x] Create `qa/` root directory
- [x] Create `qa/config/`, `qa/crawler/`, `qa/playwright/`, etc.
- [x] Create `qa/artifacts/` for outputs

**Status**: ✅ Ready to execute: `npm run qa:discover-routes`

---

## Phase 2: SEO & Technical Crawl ⏳ PENDING

### Crawler Enhancement
- [ ] Create `qa/crawler/crawl.ts` (crawl each Phase 1 route)
- [ ] Fetch page HTML
- [ ] Extract page metadata (title, description, H1, canonical, etc.)
- [ ] Detect soft 404s (200 status + "404" content)

### SEO Validation
- [ ] Create `qa/crawler/seo-checks.ts`
- [ ] Title validation (length 50-60 chars optimal)
- [ ] Meta description validation (150-160 chars optimal)
- [ ] H1 tag presence and count (exactly 1)
- [ ] Canonical URL validity
- [ ] Hreflang tags for multi-language variants
- [ ] Open Graph tags (og:title, og:description, og:image)
- [ ] Structured data validation (JSON-LD, microdata)
- [ ] Internal link anchor text quality
- [ ] Redirect efficiency (no chains > 1 hop)

### Link Validation
- [ ] Create `qa/crawler/link-checker.ts`
- [ ] Check internal links in crawled pages
- [ ] Check external links (sample, not all)
- [ ] Report broken links with context

### Output
- [ ] Save results to `qa/artifacts/crawl-results.json`
- [ ] Generate SEO report with findings

**Inputs**: `qa/artifacts/routes-discovered.json` from Phase 1
**Expected start**: After Phase 1 verification

---

## Phase 3: Browser Automation (Playwright) ⏳ PENDING

### Test Structure
- [ ] Create `qa/playwright/helpers/test-utils.ts` (login, project creation, cleanup)
- [ ] Create `qa/playwright/helpers/selectors.ts` (centralized locators)
- [ ] Create `qa/playwright/fixtures/test-data.ts` (test URLs, seed data)
- [ ] Create `qa/playwright/fixtures/constants.ts` (timeouts, thresholds)

### Smoke Tests
- [ ] Create `qa/playwright/smoke.spec.ts`
- [ ] Test homepage loads
- [ ] Test navbar and main buttons clickable
- [ ] Test no console errors
- [ ] Test no failed network requests
- [ ] Test core layout present

### Authentication Tests
- [ ] Create `qa/playwright/auth.spec.ts`
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test magic link auth
- [ ] Test Google OAuth
- [ ] Test password reset
- [ ] Test logout

### Audit Flow Tests
- [ ] Create `qa/playwright/audit-flow.spec.ts`
- [ ] Test free audit on homepage
- [ ] Test create account flow
- [ ] Test dashboard load
- [ ] Test audit results page

### Dashboard Tests
- [ ] Create `qa/playwright/dashboard.spec.ts`
- [ ] Test navigation to all app pages
- [ ] Test data loading (projects, audits)
- [ ] Test page transitions
- [ ] Test modals and dropdowns

### Pricing & Upgrade
- [ ] Create `qa/playwright/pricing.spec.ts`
- [ ] Test pricing page loads
- [ ] Test upgrade CTAs visible
- [ ] Test payment flow (if testable)

### Protected Routes
- [ ] Create `qa/playwright/protected-routes.spec.ts`
- [ ] Test logged-out users redirected to /auth/signin
- [ ] Test app routes require auth
- [ ] Test API endpoints require valid session

### Conversion Funnel
- [ ] Create `qa/playwright/conversion-funnel.spec.ts`
- [ ] Complete flow: homepage → free audit → signup → results → upgrade

**Dependencies**: Requires Phase 1 (route inventory) + Phase 0 (test account)
**Expected start**: After Phase 1 complete

---

## Phase 4: API Health & Schema Validation ⏳ PENDING

### Endpoint Checks
- [ ] Create `qa/api/api-health.ts`
- [ ] Check all 51 API routes are reachable
- [ ] Verify response status codes (200, 201, 204)
- [ ] Track response times (p99)
- [ ] Test error handling (401, 403, 404, 5xx)
- [ ] Validate error response format

### Schema Validation
- [ ] Create `qa/api/schemas/` directory
- [ ] Create JSON schema files:
  - [ ] `auth-session.schema.json` — /api/auth/session response
  - [ ] `user-plan.schema.json` — /api/user/plan response
  - [ ] `projects-list.schema.json` — /api/projects response
  - [ ] `audit-results.schema.json` — /api/audits/data response
  - [ ] `rank-keywords.schema.json` — /api/rank/keywords response
  - [ ] `backlinks.schema.json` — /api/backlinks response
  - [ ] `competitors.schema.json` — /api/competitors response
- [ ] Validate responses against schemas
- [ ] Report schema violations

### Response Validation
- [ ] No unexpected nulls in required fields
- [ ] Type validation (string, number, boolean, object, array)
- [ ] Enum validation for status fields
- [ ] Array length validation where applicable
- [ ] Nested object validation

**Dependencies**: Phase 1 (routes), Phase 3 (authenticated session)
**Expected start**: After Phase 3 auth tests working

---

## Phase 5: Lighthouse & Performance ⏳ PENDING

### Lighthouse Audits
- [ ] Create `qa/lighthouse/run-lighthouse.ts`
- [ ] Run Lighthouse on: homepage, pricing, login, dashboard, audit results
- [ ] Measure performance, accessibility, SEO, best practices
- [ ] Compare against thresholds (staging: 75/90/90, prod: 70/90/90)

### Core Web Vitals
- [ ] Measure LCP (Largest Contentful Paint < 2.5s)
- [ ] Measure CLS (Cumulative Layout Shift < 0.1)
- [ ] Measure INP (Interaction to Next Paint < 200ms)
- [ ] Measure TTFB (Time to First Byte < 600ms)
- [ ] Measure Speed Index < 4.5s

### Performance Tracking
- [ ] Establish baseline metrics
- [ ] Track metrics over time
- [ ] Detect regressions (warn if 10% worse)
- [ ] Generate performance report

### Device Profiles
- [ ] Test on desktop (1280x720)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)

**Dependencies**: Phase 1 (routes), Phase 3 (functional pages)
**Expected start**: After core pages are working

---

## Phase 6: Visual Regression ⏳ PENDING

### Screenshot Baselines
- [ ] Create `qa/visual/capture.ts`
- [ ] Capture screenshots of:
  - [ ] Homepage
  - [ ] Pricing page
  - [ ] Login page
  - [ ] Signup page
  - [ ] Dashboard
  - [ ] Audit results
  - [ ] Rank tracking page
- [ ] Capture on: desktop, tablet, mobile
- [ ] Store baselines in `qa/visual/baselines/`

### Visual Regression Detection
- [ ] Create `qa/visual/compare.ts`
- [ ] Pixel diff against baselines (pixelmatch)
- [ ] Threshold: >5% pixel diff = regression
- [ ] Ignore noise: timestamps, random IDs
- [ ] Generate visual diff images

### Regression Reporting
- [ ] Side-by-side baseline vs current
- [ ] Highlight changed regions
- [ ] Report pixel diff % and absolute pixels changed
- [ ] Archive diffs in `qa/artifacts/diffs/`

**Dependencies**: Phase 3 (functional pages), Phase 5 (stable layout)
**Expected start**: After visual stability confirmed

---

## Phase 7: Reporting & CI/CD Integration ⏳ PENDING

### GitHub Actions Workflows
- [ ] Create `.github/workflows/qa-smoke.yml`
  - Trigger: PR opened/updated
  - Run: Phase 1 routes + smoke tests (5 min)
  - Report: Comment on PR
  
- [ ] Create `.github/workflows/qa-post-deploy-staging.yml`
  - Trigger: Vercel staging deployment
  - Run: Full QA suite phases 1-6 (15 min)
  - Report: Archive artifacts, Slack notification
  
- [ ] Create `.github/workflows/qa-post-deploy-prod.yml`
  - Trigger: Vercel production deployment
  - Run: Full QA suite phases 1-6 (15 min)
  - Report: Archive artifacts, critical Slack notification
  
- [ ] Create `.github/workflows/qa-nightly.yml`
  - Trigger: Daily at 0 UTC
  - Run: Full crawl + visual regression (20 min)
  - Report: Email summary
  
- [ ] Create `.github/workflows/qa-manual.yml`
  - Trigger: Manual workflow_dispatch
  - Run: Full suite (15 min)
  - Report: Full HTML report

### Reporting System
- [ ] Create `qa/reporting/generate-report.ts`
- [ ] Aggregate results from all phases:
  - [ ] Phase 1: Routes (total, broken, redirects)
  - [ ] Phase 2: SEO findings (missing titles, descriptions, etc.)
  - [ ] Phase 3: E2E test results (pass/fail/timeout)
  - [ ] Phase 4: API health (response times, schema violations)
  - [ ] Phase 5: Lighthouse scores (performance, accessibility, SEO)
  - [ ] Phase 6: Visual regressions (diffs, pixel %)

### Report Formats
- [ ] JSON format (`qa/artifacts/reports/report.json`)
  - Machine-readable, import into dashboards
  
- [ ] Markdown format (`qa/artifacts/reports/report.md`)
  - Human-readable, post to Slack/email
  
- [ ] HTML format (`qa/artifacts/reports/report.html`)
  - Full interactive report with embedded images

### Artifact Management
- [ ] Upload screenshots to artifact storage
- [ ] Upload lighthouse reports
- [ ] Upload visual diffs
- [ ] Retention: keep last 30 days
- [ ] Clean up old artifacts

### Notifications
- [ ] Slack: post summary on failure
- [ ] Email: send full report to team
- [ ] PR comments: link to full report
- [ ] Dashboard: track trends over time

**Dependencies**: All phases 1-6 complete
**Expected start**: After all phases 1-6 working

---

## Summary Progress

| Phase | Name | Status | Files | Lines |
|-------|------|--------|-------|-------|
| 0 | Test Account | ✅ Done | 1 | 127 |
| 1 | Route Discovery | ✅ Done | 10 | 1,814 |
| 2 | SEO Crawl | ⏳ Pending | 3 | ~800 |
| 3 | Browser Automation | ⏳ Pending | 7 | ~2,000 |
| 4 | API Health | ⏳ Pending | 7 | ~600 |
| 5 | Lighthouse | ⏳ Pending | 2 | ~400 |
| 6 | Visual Regression | ⏳ Pending | 2 | ~500 |
| 7 | CI/CD & Reporting | ⏳ Pending | 6 | ~900 |
| | | | | |
| **Total** | **Complete QA System** | **35% Done** | **38 Files** | **~7,000 Lines** |

---

## How to Use This Checklist

1. **Copy to your task tracker** (Jira, Linear, GitHub Issues, Notion)
2. **Check off items as you complete them**
3. **Note blockers** and document solutions
4. **Track time** spent on each phase
5. **Run QA after each phase** to verify integration

---

## Tips for Success

- ✅ Complete phases in order (dependencies exist)
- ✅ Test after each phase completes
- ✅ Document any deviations from plan
- ✅ Keep artifacts organized in `qa/artifacts/`
- ✅ Review Phase 1 output before starting Phase 2
- ✅ Use test account from Phase 0 in Phases 3-4
- ✅ Share reports with team after each phase

---

**Last Updated**: 2026-03-09
**Phases Complete**: 2 of 7 (0 + 1)
**Est. Time Remaining**: 8-12 hours for phases 2-7
**Next Step**: Run `npm run qa:discover-routes`

