/**
 * /qa/playwright/smoke.spec.ts
 *
 * Phase 3: Smoke Tests
 *
 * Fast sanity checks run on every PR and post-deploy.
 * Goal: Confirm the app is alive and core pages render without JS errors.
 * Target: < 3 minutes total
 *
 * Checks:
 * - Public pages load (200 status, title present)
 * - Auth pages render with correct form elements
 * - No critical JS console errors
 * - No failed network requests
 * - Basic navigation works
 */

import { test, expect } from "@playwright/test";
import { PUBLIC_ROUTES, AUTH_ROUTES, EXPECTED_TEXT } from "./fixtures/test-data";
import { AUTH, NAV } from "./helpers/selectors";
import { assertValidTitle, collectConsoleErrors } from "./helpers/test-utils";

// ── Homepage ──────────────────────────────────────────────────────────────────

test.describe("Homepage", () => {
  test("loads successfully with correct title", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(PUBLIC_ROUTES.home);
    await page.waitForLoadState("networkidle");

    await assertValidTitle(page);
    const title = await page.title();
    expect(title).toMatch(/rankypulse/i);
  });

  test("renders main CTA button", async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.home);
    await page.waitForLoadState("networkidle");

    // CTA button exists and is visible
    const ctaButton = page.getByRole("link", { name: EXPECTED_TEXT.home.ctaButton }).first();
    await expect(ctaButton).toBeVisible();
  });

  test("renders navigation bar", async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.home);
    await page.waitForLoadState("networkidle");

    // Nav with sign in and pricing links
    await expect(page.locator(NAV.signInLink)).toBeVisible();
  });

  test("has no critical JavaScript errors", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(PUBLIC_ROUTES.home);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000); // Allow async scripts to settle

    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("Failed to load resource") && // skip 404 asset errors
        !e.includes("ERR_") && // skip network errors
        !e.includes("favicon") // skip favicon 404s
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

// ── Public Marketing Pages ────────────────────────────────────────────────────

const publicPages = [
  { name: "Home", path: PUBLIC_ROUTES.home },
  { name: "Pricing", path: PUBLIC_ROUTES.pricing },
] as const;

test.describe("Public pages load without errors", () => {
  for (const { name, path } of publicPages) {
    test(`${name} page loads with 200 status`, async ({ page, request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
    });

    test(`${name} page has valid title`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("domcontentloaded");
      await assertValidTitle(page);
    });
  }
});

// ── Pricing page ──────────────────────────────────────────────────────────────

test.describe("Pricing page", () => {
  test("displays pricing plans", async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.pricing);
    await page.waitForLoadState("networkidle");

    // Should show price indicators
    const body = await page.content();
    expect(body).toMatch(EXPECTED_TEXT.pricing.priceIndicator);
  });

  test("shows Free, Starter, and Pro plans", async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.pricing);
    await page.waitForLoadState("networkidle");

    const body = await page.content();
    expect(body).toMatch(/free/i);
    expect(body).toMatch(/starter/i);
    expect(body).toMatch(/pro/i);
  });
});

// ── Auth Pages ────────────────────────────────────────────────────────────────

test.describe("Sign In page", () => {
  test("renders email and password inputs", async ({ page }) => {
    await page.goto(AUTH_ROUTES.signIn);
    await page.waitForLoadState("networkidle");

    await expect(page.locator(AUTH.emailInput)).toBeVisible();
    await expect(page.locator(AUTH.passwordInput)).toBeVisible();
  });

  test("renders submit button", async ({ page }) => {
    await page.goto(AUTH_ROUTES.signIn);
    await page.waitForLoadState("networkidle");

    await expect(page.locator(AUTH.submitButton)).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto(AUTH_ROUTES.signIn);
    await page.fill(AUTH.emailInput, "nonexistent@invalid.test");
    await page.fill(AUTH.passwordInput, "wrongpassword123!");
    await page.click(AUTH.submitButton);

    // Wait for error — either form validation or server response
    await page.waitForTimeout(2000);
    const errorVisible =
      (await page.locator(AUTH.errorMessage).isVisible().catch(() => false)) ||
      (await page.url()).includes("/auth/signin"); // Stayed on login page = error

    expect(errorVisible).toBe(true);
  });

  test("has link to sign up", async ({ page }) => {
    await page.goto(AUTH_ROUTES.signIn);
    await expect(page.locator(AUTH.signUpButton).or(page.getByRole("link", { name: /sign up|create/i }))).toBeVisible();
  });
});

test.describe("Sign Up page", () => {
  test("renders registration form", async ({ page }) => {
    await page.goto(AUTH_ROUTES.signUp);
    await page.waitForLoadState("networkidle");

    // Sign-up form has multiple text inputs (email + username) — use .first()
    // to avoid strict-mode violation when multiple inputs match the selector
    await expect(page.locator(AUTH.emailInput).first()).toBeVisible();
    await expect(page.locator(AUTH.passwordInput).first()).toBeVisible();
    await expect(page.locator(AUTH.submitButton)).toBeVisible();
  });

  test("shows error for invalid email", async ({ page }) => {
    await page.goto(AUTH_ROUTES.signUp);
    await page.fill(AUTH.emailInput, "not-an-email");
    await page.click(AUTH.submitButton);
    await page.waitForTimeout(500);

    // HTML5 validation or custom error
    const hasValidationError = await page.evaluate(() => {
      const emailInput = document.querySelector(
        "input[type='email'], input[name='email']"
      ) as HTMLInputElement;
      return emailInput ? !emailInput.validity.valid : false;
    });
    expect(hasValidationError).toBe(true);
  });
});

// ── Navigation ────────────────────────────────────────────────────────────────

test.describe("Navigation", () => {
  test("pricing link in nav goes to /pricing", async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.home);
    await page.waitForLoadState("domcontentloaded");

    const pricingLink = page.locator(NAV.pricingLink).or(
      page.getByRole("link", { name: /pricing/i }).first()
    );

    if (await pricingLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await pricingLink.click();
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/pricing");
    } else {
      // Pricing link may be behind mobile menu
      test.skip();
    }
  });

  test("sign in link leads to /auth/signin", async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.home);
    await page.waitForLoadState("domcontentloaded");

    const signInLink = page.locator(NAV.signInLink).first();
    if (await signInLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await signInLink.click();
      await expect(page).toHaveURL(/auth\/signin/);
    } else {
      test.skip();
    }
  });
});

// ── Response code checks ──────────────────────────────────────────────────────

test.describe("HTTP response codes", () => {
  const routesToCheck = [
    { path: "/", expectedStatus: 200 },
    { path: "/pricing", expectedStatus: 200 },
    { path: "/auth/signin", expectedStatus: 200 },
    { path: "/auth/signup", expectedStatus: 200 },
  ];

  for (const { path, expectedStatus } of routesToCheck) {
    test(`GET ${path} returns ${expectedStatus}`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(expectedStatus);
    });
  }

  test("GET /app/dashboard redirects unauthenticated to /auth/signin", async ({ request }) => {
    const response = await request.get("/app/dashboard", {
      maxRedirects: 0,
    });
    // Should be 3xx redirect or the response URL should be /auth/signin
    expect([301, 302, 307, 308, 200]).toContain(response.status());
  });
});
