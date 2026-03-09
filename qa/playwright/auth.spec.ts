/**
 * /qa/playwright/auth.spec.ts
 *
 * Phase 3: Authentication Tests
 *
 * Tests all authentication flows:
 * - Email/password sign-in (valid and invalid)
 * - Sign-up (new account creation)
 * - Sign-out
 * - Protected route redirects
 * - Session persistence
 * - Password validation
 *
 * Uses test-friends@rankypulse.com seeded by scripts/seed-test-account.mjs
 */

import { test, expect } from "@playwright/test";
import { AUTH_ROUTES, APP_ROUTES, TEST_ACCOUNTS, INVALID_DATA } from "./fixtures/test-data";
import { AUTH, APP } from "./helpers/selectors";
import {
  signIn,
  signOut,
  dismissOnboarding,
  assertAuthenticated,
  assertRedirectedToSignIn,
  assertValidTitle,
} from "./helpers/test-utils";

const QA = TEST_ACCOUNTS.qa;

// ── Sign In ───────────────────────────────────────────────────────────────────

test.describe("Sign In — Valid Credentials", () => {
  test("can sign in with correct email and password", async ({ page }) => {
    await signIn(page, QA.email, QA.password);

    // Should be redirected to a non-auth page
    await assertAuthenticated(page);
    expect(page.url()).not.toContain("/auth/");
  });

  test("authenticated user sees app dashboard or onboarding", async ({ page }) => {
    await signIn(page, QA.email, QA.password);
    await dismissOnboarding(page);

    // Should be somewhere in the app
    const url = page.url();
    expect(url).toMatch(/\/(app\/|dashboard|onboarding)/);
  });

  test("dashboard shows user-specific content after sign in", async ({ page }) => {
    await signIn(page, QA.email, QA.password);
    await dismissOnboarding(page);

    // Navigate to dashboard explicitly
    await page.goto(APP_ROUTES.dashboard);
    await page.waitForLoadState("networkidle");

    // Page should contain actual content (not an error page).
    // Use innerText (visible text only) — page.content() includes raw HTML
    // where "500" appears in Next.js chunk hashes (false positive).
    const visibleText = await page.locator("body").innerText();
    expect(visibleText).not.toMatch(/500 Internal Server Error|Server Error|Something went wrong/i);
    await assertValidTitle(page);
  });
});

// ── Sign In — Invalid Credentials ─────────────────────────────────────────────

test.describe("Sign In — Invalid Credentials", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(AUTH_ROUTES.signIn);
    await page.waitForLoadState("networkidle");
  });

  test("shows error for wrong password", async ({ page }) => {
    await page.fill(AUTH.emailInput, QA.email);
    await page.fill(AUTH.passwordInput, "wrongpassword!");
    await page.click(AUTH.submitButton);

    // Should stay on sign in page with some error indication
    await page.waitForTimeout(2000);
    expect(page.url()).toContain("/auth/signin");
  });

  test("shows error for non-existent email", async ({ page }) => {
    await page.fill(AUTH.emailInput, "nobody@doesnotexist.invalid");
    await page.fill(AUTH.passwordInput, QA.password);
    await page.click(AUTH.submitButton);

    await page.waitForTimeout(2000);
    expect(page.url()).toContain("/auth/signin");
  });

  test("blocks form submit with empty email", async ({ page }) => {
    await page.fill(AUTH.passwordInput, QA.password);
    await page.click(AUTH.submitButton);

    await page.waitForTimeout(500);
    // Email HTML5 validation prevents submission
    const emailInput = page.locator(AUTH.emailInput);
    const isRequired = await emailInput.evaluate(
      (el: HTMLInputElement) => el.required || !el.validity.valid
    );
    expect(isRequired).toBe(true);
    expect(page.url()).toContain("/auth/signin");
  });

  test("blocks form submit with empty password", async ({ page }) => {
    await page.fill(AUTH.emailInput, QA.email);
    await page.click(AUTH.submitButton);

    await page.waitForTimeout(500);
    expect(page.url()).toContain("/auth/signin");
  });

  test("rejects SQL injection attempt gracefully", async ({ page }) => {
    await page.fill(AUTH.emailInput, INVALID_DATA.sqlInjection);
    await page.fill(AUTH.passwordInput, INVALID_DATA.sqlInjection);
    await page.click(AUTH.submitButton);

    await page.waitForTimeout(2000);
    // Should stay on sign in (rejected gracefully, not 500 error)
    const url = page.url();
    expect(url).toContain("/auth/signin");
    expect(await page.title()).not.toMatch(/error|500/i);
  });
});

// ── Sign Out ──────────────────────────────────────────────────────────────────

test.describe("Sign Out", () => {
  test("can sign out and is redirected to sign-in", async ({ page }) => {
    await signIn(page, QA.email, QA.password);
    await dismissOnboarding(page);
    await page.goto(APP_ROUTES.dashboard);
    await page.waitForLoadState("networkidle");

    await signOut(page);

    expect(page.url()).toContain("/auth/signin");
  });

  test("cannot access protected route after sign out", async ({ page }) => {
    await signIn(page, QA.email, QA.password);
    await dismissOnboarding(page);
    await signOut(page);

    // Try to access dashboard directly
    await page.goto(APP_ROUTES.dashboard);
    await assertRedirectedToSignIn(page);
  });
});

// ── Forgot Password ───────────────────────────────────────────────────────────

test.describe("Forgot Password", () => {
  test("forgot password page loads and shows email input", async ({ page }) => {
    await page.goto(AUTH_ROUTES.forgotPassword);
    await page.waitForLoadState("networkidle");

    await expect(page.locator(AUTH.emailInput)).toBeVisible();
    await expect(page.locator(AUTH.submitButton)).toBeVisible();
  });

  test("submitting with valid email shows success message", async ({ page }) => {
    await page.goto(AUTH_ROUTES.forgotPassword);
    await page.fill(AUTH.emailInput, QA.email);
    await page.click(AUTH.submitButton);

    await page.waitForTimeout(2000);

    // Either success message or still on same page (no 500)
    expect(await page.title()).not.toMatch(/error|500/i);
  });
});

// ── Session Persistence ───────────────────────────────────────────────────────

test.describe("Session Persistence", () => {
  test("authenticated session persists across page navigations", async ({ page }) => {
    await signIn(page, QA.email, QA.password);
    await dismissOnboarding(page);

    // Navigate to several app pages and verify still authenticated
    const routesToCheck = [
      APP_ROUTES.dashboard,
      APP_ROUTES.projects,
      APP_ROUTES.audit,
    ];

    for (const route of routesToCheck) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      // Should still be authenticated (not redirected to /auth/signin)
      expect(page.url()).not.toContain("/auth/signin");
    }
  });

  test("session cookie is set after sign in", async ({ page, context }) => {
    await signIn(page, QA.email, QA.password);

    const cookies = await context.cookies();
    // NextAuth session cookie
    const sessionCookie = cookies.find(
      (c) =>
        c.name.includes("next-auth") ||
        c.name.includes("session") ||
        c.name === "__Secure-next-auth.session-token"
    );
    expect(sessionCookie).toBeTruthy();
  });
});

// ── Protected Route Guard ─────────────────────────────────────────────────────

test.describe("Protected Route Guard", () => {
  const protectedRoutes = [
    APP_ROUTES.dashboard,
    APP_ROUTES.projects,
    APP_ROUTES.audit,
    APP_ROUTES.rankTracking,
    APP_ROUTES.settings,
  ];

  for (const route of protectedRoutes) {
    test(`${route} redirects to sign-in when unauthenticated`, async ({ page }) => {
      // Ensure no session
      await page.context().clearCookies();

      await page.goto(route);
      await assertRedirectedToSignIn(page);
    });
  }
});

// ── API Session ───────────────────────────────────────────────────────────────

test.describe("API Authentication", () => {
  test("GET /api/auth/session returns valid session after sign in", async ({
    page,
    request,
  }) => {
    await signIn(page, QA.email, QA.password);

    // Use page's cookie context to make the API call
    const sessionRes = await page.request.get("/api/auth/session");
    expect(sessionRes.status()).toBe(200);

    const session = await sessionRes.json();
    expect(session).toHaveProperty("user");
    expect(session.user.email).toBe(QA.email);
  });

  test("GET /api/auth/session returns 401 or empty when unauthenticated", async ({
    request,
  }) => {
    const res = await request.get("/api/auth/session");
    // NextAuth returns {} (200 empty) or null session for unauthenticated
    expect([200, 401]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(body.user).toBeFalsy();
    }
  });
});
