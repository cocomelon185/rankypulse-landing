/**
 * /qa/playwright/helpers/test-utils.ts
 *
 * Reusable test utilities for Playwright tests.
 * Handles: login, logout, waiting for navigation, dismissing modals, etc.
 */

import { type Page, type BrowserContext, expect } from "@playwright/test";
import { AUTH, APP, ONBOARDING, MODAL } from "./selectors";
import { TEST_ACCOUNTS } from "../fixtures/test-data";

// ── Auth helpers ──────────────────────────────────────────────────────────────

/**
 * Signs in a user via NextAuth's API directly (bypasses the UI form).
 *
 * WHY: The sign-in form inputs have no `name` attributes — they're React
 * controlled components. If React hasn't hydrated yet when Playwright clicks
 * submit, the browser fires a native POST with an empty body, which NextAuth
 * rejects. Using `page.request` (which shares cookies with the browser context)
 * avoids this race condition entirely and is faster.
 */
export async function signIn(
  page: Page,
  email = TEST_ACCOUNTS.qa.email,
  password = TEST_ACCOUNTS.qa.password
): Promise<void> {
  // Navigate to sign-in first to establish origin + any redirect cookies
  if (!page.url().includes("/auth/signin")) {
    await page.goto("/auth/signin");
    await page.waitForLoadState("domcontentloaded");
  }

  const origin = new URL(page.url()).origin;

  // Step 1: fetch CSRF token (NextAuth requires it for credential POSTs)
  const csrfRes = await page.request.get(`${origin}/api/auth/csrf`);
  if (!csrfRes.ok()) {
    throw new Error(`Failed to get CSRF token: ${csrfRes.status()}`);
  }
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  // Step 2: POST credentials — use json:true so NextAuth returns JSON, not a redirect
  // page.request shares the cookie jar with the browser, so the session cookie
  // set here is immediately available to subsequent page.goto() calls.
  const callbackRes = await page.request.post(
    `${origin}/api/auth/callback/credentials`,
    {
      form: {
        csrfToken,
        identifier: email,
        password,
        callbackUrl: `${origin}/dashboard`,
        json: "true",
      },
    }
  );

  // NextAuth returns { url } JSON; a URL containing ?error= means auth failed
  const body = (await callbackRes.json().catch(() => ({}))) as { url?: string };
  if (!body.url || body.url.includes("error=")) {
    throw new Error(
      `Sign in failed for ${email} — server returned: ${body.url ?? callbackRes.status()}`
    );
  }

  // Step 3: Navigate to dashboard with the session cookie now in context
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
}

/**
 * Signs out the current user via NextAuth's API.
 *
 * WHY: The sign-out button is inside a dropdown with no stable selector
 * (no data-testid, no aria-label on the toggle button). Using the API
 * is faster and avoids brittle UI selectors.
 */
export async function signOut(page: Page): Promise<void> {
  const origin = new URL(page.url()).origin;

  // Get CSRF token (NextAuth requires it for sign-out POST)
  const csrfRes = await page.request.get(`${origin}/api/auth/csrf`);
  if (!csrfRes.ok()) throw new Error(`Failed to get CSRF token: ${csrfRes.status()}`);
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  // POST to NextAuth sign-out endpoint
  await page.request.post(`${origin}/api/auth/signout`, {
    form: {
      csrfToken,
      callbackUrl: `${origin}/auth/signin`,
      json: "true",
    },
  });

  // Navigate to sign-in to confirm signed out
  await page.goto("/auth/signin");
  await page.waitForLoadState("networkidle");
}

/**
 * Dismisses any onboarding modal if present.
 */
export async function dismissOnboarding(page: Page): Promise<void> {
  const modal = page.locator(ONBOARDING.modal);
  if (await modal.isVisible({ timeout: 2000 }).catch(() => false)) {
    const closeBtn = page.locator(ONBOARDING.closeButton).or(
      page.locator(ONBOARDING.skipButton)
    );
    if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await closeBtn.click();
      await modal.waitFor({ state: "hidden", timeout: 3000 });
    }
  }
}

/**
 * Dismisses any open modal dialog.
 */
export async function dismissModal(page: Page): Promise<void> {
  const modal = page.locator(MODAL.container);
  if (await modal.isVisible({ timeout: 2000 }).catch(() => false)) {
    const closeBtn = page.locator(MODAL.closeButton);
    if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await closeBtn.click();
      await modal.waitFor({ state: "hidden", timeout: 3000 });
    } else {
      await page.keyboard.press("Escape");
    }
  }
}

// ── Navigation helpers ─────────────────────────────────────────────────────────

/**
 * Navigate to a path and wait until network is idle.
 */
export async function navigateTo(
  page: Page,
  path: string,
  waitFor: "load" | "networkidle" | "domcontentloaded" = "networkidle"
): Promise<void> {
  await page.goto(path, { waitUntil: waitFor });
}

/**
 * Navigate to an app page as an authenticated user.
 * Calls signIn first if needed.
 */
export async function navigateAuthenticated(
  page: Page,
  path: string
): Promise<void> {
  // If we're already signed in (sidebar visible), just navigate
  const isSigned =
    (await page.locator(APP.sidebar).isVisible({ timeout: 2000 }).catch(() => false)) ||
    (await page.url()).includes("/app/");

  if (!isSigned) {
    await signIn(page);
  }

  await navigateTo(page, path);
}

// ── Wait helpers ──────────────────────────────────────────────────────────────

/**
 * Wait for page content to be ready for assertions.
 *
 * Strategy: wait for the AppShell's "Loading..." full-page spinner to resolve
 * (which means the JWT session has been verified). We don't wait for inline
 * data-loading spinners (e.g. rank tracking, audit) because those can spin
 * indefinitely while fetching live API data — and the static page structure
 * (headings, labels) is already present and testable.
 */
export async function waitForContentLoad(page: Page): Promise<void> {
  // AppShell shows exactly "Loading..." while checking the session.
  // Wait for it to disappear (authenticated → renders content; or redirected).
  await page
    .getByText("Loading...", { exact: true })
    .first()
    .waitFor({ state: "hidden", timeout: 15000 })
    .catch(() => {
      // Already hidden (fast load) or different loading UI — proceed
    });

  // Ensure the document itself has finished loading
  await page.waitForLoadState("load");
}

/**
 * Assert no console errors occurred.
 * Call this at the end of a test to validate clean page load.
 */
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });
  return errors;
}

/**
 * Assert that no critical network requests failed.
 */
export async function assertNoFailedRequests(page: Page): Promise<void> {
  const failedRequests: string[] = [];
  page.on("requestfailed", (request) => {
    // Ignore analytics and third-party tracking failures
    const url = request.url();
    if (
      url.includes("analytics") ||
      url.includes("gtag") ||
      url.includes("hotjar") ||
      url.includes("crisp")
    ) {
      return;
    }
    failedRequests.push(`${request.method()} ${url} → ${request.failure()?.errorText}`);
  });

  // Give page a moment to fully load
  await page.waitForTimeout(500);

  if (failedRequests.length > 0) {
    throw new Error(
      `Failed network requests:\n${failedRequests.join("\n")}`
    );
  }
}

// ── Assertion helpers ─────────────────────────────────────────────────────────

/**
 * Assert that the page has a valid title (not empty, not "Error").
 */
export async function assertValidTitle(page: Page): Promise<void> {
  const title = await page.title();
  expect(title).toBeTruthy();
  expect(title).not.toMatch(/^error$/i);
  expect(title.length).toBeGreaterThan(5);
}

/**
 * Assert that the user is currently authenticated (sidebar or dashboard visible).
 */
export async function assertAuthenticated(page: Page): Promise<void> {
  const url = page.url();
  expect(url).not.toContain("/auth/signin");
  expect(url).not.toContain("/auth/signup");
}

/**
 * Assert that the page redirected to sign-in (for protected route tests).
 */
export async function assertRedirectedToSignIn(page: Page): Promise<void> {
  await page.waitForURL("**/auth/signin**", { timeout: 10000 });
  expect(page.url()).toContain("/auth/signin");
}

// ── Storage helpers ───────────────────────────────────────────────────────────

/**
 * Set localStorage domain for audit pages.
 */
export async function setAuditDomain(page: Page, domain: string): Promise<void> {
  await page.evaluate(
    ([key, val]) => localStorage.setItem(key, val),
    ["rankypulse_last_url", domain]
  );
}

/**
 * Clear all localStorage (reset state between tests).
 */
export async function clearStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

// ── Cookie / session helpers ──────────────────────────────────────────────────

/**
 * Save auth state to file for session reuse between tests.
 * Avoids signing in before every test (faster).
 */
export async function saveAuthState(
  context: BrowserContext,
  filePath: string
): Promise<void> {
  await context.storageState({ path: filePath });
}

/**
 * Check if a storage state file exists (can reuse previous session).
 */
export function authStateExists(filePath: string): boolean {
  try {
    return require("fs").existsSync(filePath);
  } catch {
    return false;
  }
}
