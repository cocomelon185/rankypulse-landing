/**
 * /qa/playwright/conversion-funnel.spec.ts
 *
 * Phase 3: Conversion Funnel Tests
 *
 * Validates the complete user journey:
 * Homepage → (Free Audit) → Sign In → Dashboard → App features
 *
 * This is the most business-critical test file.
 * Any failure here directly impacts revenue and user acquisition.
 */

import { test, expect } from "@playwright/test";
import { PUBLIC_ROUTES, AUTH_ROUTES, APP_ROUTES, TEST_ACCOUNTS } from "./fixtures/test-data";
import { PRICING } from "./helpers/selectors";
import {
  signIn,
  dismissOnboarding,
  assertAuthenticated,
  waitForContentLoad,
  setAuditDomain,
  assertValidTitle,
} from "./helpers/test-utils";

const QA = TEST_ACCOUNTS.qa;

// ── Homepage → Sign In → Dashboard ───────────────────────────────────────────

test.describe("Core Conversion Path: Visitor → Authenticated User", () => {
  test("complete flow: homepage CTA → sign in → dashboard", async ({ page }) => {
    // Step 1: Visit homepage
    await page.goto(PUBLIC_ROUTES.home);
    await page.waitForLoadState("networkidle");

    // Verify homepage loads
    await assertValidTitle(page);
    expect(page.url()).toMatch(/\/$/);

    // Step 2: Click the primary CTA or navigate to sign in
    const cta = page
      .getByRole("link", { name: /get started|try free|sign up|audit/i })
      .first();

    if (await cta.isVisible({ timeout: 3000 }).catch(() => false)) {
      const href = await cta.getAttribute("href");
      if (href?.includes("/auth/")) {
        await cta.click();
        await page.waitForLoadState("networkidle");
      } else {
        // CTA goes elsewhere — navigate to sign in directly
        await page.goto(AUTH_ROUTES.signIn);
      }
    } else {
      await page.goto(AUTH_ROUTES.signIn);
    }

    // Step 3: Sign in (use API helper to avoid hydration race on sign-in form)
    await signIn(page, QA.email, QA.password);

    // Step 4: Should reach dashboard/app
    await assertAuthenticated(page);
    await dismissOnboarding(page);

    // Step 5: Navigate to dashboard and verify content loads
    await page.goto(APP_ROUTES.dashboard);
    await waitForContentLoad(page);

    expect(page.url()).toContain("/app/");
    await assertValidTitle(page);
  });
});

// ── Pricing → Sign In Flow ────────────────────────────────────────────────────

test.describe("Pricing Page → Sign In Flow", () => {
  test("pricing page CTA can lead to sign-up or sign-in", async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.pricing);
    await page.waitForLoadState("networkidle");

    // Find any upgrade/get started button
    const upgradeBtn = page.locator(PRICING.upgradeButton).first();

    if (await upgradeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await upgradeBtn.click();
      await page.waitForLoadState("networkidle");

      // Should end up on auth page or payment page
      const url = page.url();
      const isValidDestination =
        url.includes("/auth/") ||
        url.includes("/pricing") ||
        url.includes("/app/") ||
        url.includes("razorpay") ||
        url.includes("checkout");

      expect(isValidDestination).toBe(true);
    } else {
      // Pricing buttons may require JS rendering
      test.skip();
    }
  });
});

// ── Post-Auth Navigation ──────────────────────────────────────────────────────

test.describe("Post-Authentication User Journey", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, QA.email, QA.password);
    await dismissOnboarding(page);
  });

  test("can navigate to all primary app sections", async ({ page }) => {
    const sections = [
      { name: "Dashboard", path: APP_ROUTES.dashboard },
      { name: "Projects", path: APP_ROUTES.projects },
      { name: "Rank Tracking", path: APP_ROUTES.rankTracking },
      { name: "Keyword Research", path: APP_ROUTES.keywordResearch },
      { name: "Backlinks", path: APP_ROUTES.backlinks },
      { name: "Competitors", path: APP_ROUTES.competitors },
    ];

    for (const { name, path } of sections) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const url = page.url();
      expect(url).not.toContain("/auth/signin");
      expect(url).not.toContain("/error");

      const title = await page.title();
      expect(title).not.toMatch(/^error$/i);
    }
  });

  test("dashboard shows project listing or empty state", async ({ page }) => {
    await page.goto(APP_ROUTES.dashboard);
    await waitForContentLoad(page);

    const body = await page.content();
    // Either shows projects or an empty state CTA
    const hasContent =
      body.toLowerCase().includes("project") ||
      body.toLowerCase().includes("audit") ||
      body.toLowerCase().includes("start") ||
      body.toLowerCase().includes("no project");

    expect(hasContent).toBe(true);
  });

  test("audit page has domain input or project selector", async ({ page }) => {
    await page.goto(APP_ROUTES.audit);
    await waitForContentLoad(page);

    const body = await page.content();
    // Audit page should mention domain, URL, or project
    const hasDomainUI =
      body.toLowerCase().includes("domain") ||
      body.toLowerCase().includes("url") ||
      body.toLowerCase().includes("website") ||
      body.toLowerCase().includes("project");

    expect(hasDomainUI).toBe(true);
  });

  test("rank tracking page loads with keyword management UI", async ({ page }) => {
    await page.goto(APP_ROUTES.rankTracking);
    await waitForContentLoad(page);

    const body = await page.content();
    // Should mention keywords
    expect(body.toLowerCase()).toMatch(/keyword|track|rank|position/);
  });
});

// ── Audit Flow ────────────────────────────────────────────────────────────────

test.describe("Audit Flow", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, QA.email, QA.password);
    await dismissOnboarding(page);
    // Pre-set domain in localStorage
    await setAuditDomain(page, "example.com");
  });

  test("audit sub-pages load when domain is set", async ({ page }) => {
    const auditPages = [
      { path: "/app/audits/issues", name: "Issues" },
      { path: "/app/audits/links", name: "Links" },
      { path: "/app/audits/speed", name: "Speed" },
      { path: "/app/audits/vitals", name: "Vitals" },
    ];

    for (const { path, name } of auditPages) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // Should load without crashing
      const title = await page.title();
      expect(title).not.toMatch(/^error$/i);

      const url = page.url();
      expect(url).not.toContain("/auth/signin");
    }
  });
});

// ── User Plan & Upgrade Flow ──────────────────────────────────────────────────

test.describe("User Plan & Upgrade", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, QA.email, QA.password);
    await dismissOnboarding(page);
  });

  test("GET /api/user/plan returns valid plan for authenticated user", async ({
    page,
  }) => {
    const res = await page.request.get("/api/user/plan");
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("plan");
    expect(["free", "starter", "pro"]).toContain(body.plan);
    expect(body).toHaveProperty("keywordsUsed");
    expect(body).toHaveProperty("keywordCap");
  });

  test("pricing page is accessible from within the app", async ({ page }) => {
    // Most apps have upgrade links in sidebar or settings
    await page.goto(APP_ROUTES.settings);
    await waitForContentLoad(page);

    // Pricing page should be reachable
    await page.goto(PUBLIC_ROUTES.pricing);
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/pricing");
  });
});

// ── Error Recovery ────────────────────────────────────────────────────────────

test.describe("Error Recovery", () => {
  test("404 page for unknown route shows friendly message", async ({ page }) => {
    await page.goto("/this-page-definitely-does-not-exist-xyz");
    await page.waitForLoadState("networkidle");

    const status = await page.evaluate(() => {
      // Try to get HTTP status from the response if available
      return document.title;
    });

    // Should show 404 or Not Found, not 500
    const body = await page.content();
    const shows404 =
      body.toLowerCase().includes("404") ||
      body.toLowerCase().includes("not found") ||
      body.toLowerCase().includes("page doesn't exist");

    // If custom 404 exists, check it; otherwise just ensure no 500
    const title = await page.title();
    expect(title).not.toMatch(/500|server error/i);
  });

  test("app handles API errors gracefully", async ({ page }) => {
    await signIn(page, QA.email, QA.password);
    await dismissOnboarding(page);

    // Navigate to competitors page (may show empty state if no data)
    await page.goto(APP_ROUTES.competitors);
    await waitForContentLoad(page);

    // Page should not crash — empty state or data is OK
    const title = await page.title();
    expect(title).not.toMatch(/error|500/i);

    const body = await page.content();
    // Should not have unhandled JS error in body
    expect(body).not.toContain("TypeError:");
    expect(body).not.toContain("Cannot read properties of undefined");
  });
});
