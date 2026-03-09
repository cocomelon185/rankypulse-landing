# QA System Dependencies

This document lists all npm packages required for the QA automation system.

## Install Command

```bash
cd landing/
npm install --save-dev \
  @playwright/test \
  playwright \
  @axe-core/playwright \
  lighthouse \
  axios \
  fast-xml-parser \
  pixelmatch \
  pngjs \
  dotenv
```

## Package Details

| Package | Version | Purpose | Category |
|---------|---------|---------|----------|
| `@playwright/test` | ^1.40.0 | E2E test framework + runner | Browser Automation |
| `playwright` | ^1.40.0 | Browser control library | Browser Automation |
| `@axe-core/playwright` | ^4.8.0 | Accessibility scanning | Accessibility Testing |
| `lighthouse` | ^11.4.0 | Performance & SEO audits | Performance |
| `axios` | ^1.6.0 | HTTP client for API testing | API Testing |
| `fast-xml-parser` | ^4.3.0 | Parse sitemap.xml | Route Discovery |
| `pixelmatch` | ^5.3.0 | Pixel diff for visual regression | Visual Regression |
| `pngjs` | ^7.0.0 | PNG image manipulation | Visual Regression |
| `dotenv` | ^16.3.1 | Load .env files | Configuration |

## Why Each Package

### Browser Automation
- **Playwright**: Industry-standard for cross-browser E2E testing
- **@axe-core/playwright**: Accessibility violations detected automatically

### Performance & SEO
- **Lighthouse**: Google's official tool for performance/SEO/accessibility audits
- **fast-xml-parser**: Parse sitemap.xml to discover routes

### API Testing
- **Axios**: Promise-based HTTP client, better error handling than fetch

### Visual Regression
- **pixelmatch**: Pixel-by-pixel image comparison
- **pngjs**: PNG reading/writing for baseline comparison

## Already Installed in Project

These should already be in `landing/package.json`:
- `next`
- `react`
- `typescript`
- `@types/node`

## Dev Script Addition

Add to `landing/package.json` → `scripts`:

```json
{
  "scripts": {
    "qa:discover-routes": "tsx qa/crawler/route-discovery.ts",
    "qa:discover-routes:prod": "BASE_URL=https://rankypulse.com tsx qa/crawler/route-discovery.ts",
    "qa:smoke": "playwright test qa/playwright/smoke.spec.ts --reporter=html",
    "qa:full": "playwright test qa/playwright --reporter=html",
    "qa:types": "tsc --noEmit qa/",
    "qa": "npm run qa:types && npm run qa:discover-routes && npm run qa:smoke"
  }
}
```

## TypeScript Configuration

The existing `tsconfig.json` should support QA code. If not, ensure:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "skipLibCheck": true,
    "esModuleInterop": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*", "qa/**/*"],
  "exclude": ["node_modules", ".next"]
}
```

## Playwright Configuration

Create `landing/playwright.config.ts` (may already exist):

```typescript
import { defineConfig, devices } from "@playwright/test";
import { DEFAULT_ENV } from "./qa/config/environments";

export default defineConfig({
  testDir: "./qa/playwright",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { outputFolder: "qa/artifacts/playwright-report" }],
    ["json", { outputFile: "qa/artifacts/playwright-results.json" }],
  ],
  use: {
    baseURL: DEFAULT_ENV.baseUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: DEFAULT_ENV.videoRecord ? "retain-on-failure" : "off",
  },
  webServer: process.env.SKIP_SERVER_START
    ? undefined
    : {
        command: "npm run dev",
        url: DEFAULT_ENV.baseUrl,
        reuseExistingServer: !process.env.CI,
      },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
});
```

## Installation Checklist

- [ ] Run `npm install --save-dev [packages above]`
- [ ] Verify TypeScript compiles: `npm run qa:types`
- [ ] Test route discovery: `npm run qa:discover-routes`
- [ ] All scripts in package.json exist
- [ ] Playwright config exists and references QA
- [ ] .env.local has `BASE_URL=http://localhost:3000` for local testing

## Next Steps

After installing dependencies:

1. Run `npm run qa:discover-routes` to verify route discovery works
2. Run `npm run qa:types` to check TypeScript compilation
3. Proceed with Phase 1 implementation (route discovery execution)
4. Then Phase 2 (SEO crawl), Phase 3 (browser tests), etc.
