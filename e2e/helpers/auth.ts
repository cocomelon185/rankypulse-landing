/**
 * e2e/helpers/auth.ts
 * Shared auth utilities for QA test suite.
 * Since the app uses Google OAuth (no credential-based test users),
 * we test auth guards (redirects) without actually logging in,
 * and use a stored auth state file if available.
 */
import { Page, expect } from "@playwright/test";

export const TEST_EMAIL = process.env.QA_TEST_EMAIL ?? "qa@rankypulse.com";
export const TEST_PASS = process.env.QA_TEST_PASS ?? "";

// App pages that must redirect to signin when unauthenticated
export const PROTECTED_ROUTES = [
    "/app/dashboard",
    "/app/projects",
    "/app/audit",
    "/app/action-center",
    "/app/keywords",
    "/app/rank-tracking",
    "/app/backlinks",
    "/app/competitors",
    "/app/content",
    "/app/reports",
    "/app/integrations",
    "/app/settings",
    "/app/audit/acmecorp.com",
];

/** Assert a page is the signin page (possibly with callbackUrl param) */
export async function assertRedirectedToSignin(page: Page, originalPath: string) {
    await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 12_000 });
    const url = new URL(page.url());
    const cb = url.searchParams.get("callbackUrl") ?? url.searchParams.get("next") ?? "";
    expect(cb.length).toBeGreaterThan(0);
    // The callbackUrl should reference the original path
    expect(decodeURIComponent(cb)).toContain(originalPath.split("?")[0]);
}

/** Collect all console errors and network failures on a page */
export function attachErrorCollectors(page: Page) {
    const consoleErrors: string[] = [];
    const networkErrors: string[] = [];
    const hydrationWarnings: string[] = [];

    page.on("console", (msg) => {
        const text = msg.text();
        if (msg.type() === "error") consoleErrors.push(text);
        if (text.includes("Hydration") || text.includes("hydrat")) hydrationWarnings.push(text);
    });

    page.on("requestfailed", (req) => {
        networkErrors.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText}`);
    });

    page.on("response", (res) => {
        if (res.status() >= 400 && !res.url().includes("_next") && !res.url().includes("favicon")) {
            networkErrors.push(`HTTP ${res.status()} ${res.url()}`);
        }
    });

    return { consoleErrors, networkErrors, hydrationWarnings };
}
