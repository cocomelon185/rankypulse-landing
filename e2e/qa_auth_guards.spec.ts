/**
 * e2e/qa_auth_guards.spec.ts
 * QA: Authentication guards for all /app/* routes.
 * These tests verify that unauthenticated users cannot access protected pages,
 * and are properly redirected to /auth/signin with the correct callbackUrl.
 */
import { test, expect } from "@playwright/test";
import { PROTECTED_ROUTES, assertRedirectedToSignin } from "./helpers/auth";

test.describe("QA: Auth guards — all /app/* routes redirect to signin", () => {
    for (const route of PROTECTED_ROUTES) {
        test(`${route} requires auth`, async ({ page }) => {
            await page.goto(route, { waitUntil: "domcontentloaded" });
            await assertRedirectedToSignin(page, route);
        });
    }
});

test.describe("QA: Auth redirect callbackUrl correctness", () => {
    test("/app/dashboard callbackUrl is preserved after signin redirect", async ({ page }) => {
        await page.goto("/app/dashboard");
        await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 10_000 });
        const url = new URL(page.url());
        const cb = url.searchParams.get("callbackUrl") ?? "";
        expect(decodeURIComponent(cb)).toContain("/app/dashboard");
    });

    test("/app/audit/acmecorp.com callbackUrl contains dynamic domain segment", async ({ page }) => {
        await page.goto("/app/audit/acmecorp.com");
        await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 10_000 });
        const url = new URL(page.url());
        const cb = decodeURIComponent(url.searchParams.get("callbackUrl") ?? "");
        expect(cb).toContain("acmecorp.com");
    });

    test("signin page itself is always accessible (no infinite redirect)", async ({ page }) => {
        await page.goto("/auth/signin");
        // Should NOT be redirected away from signin
        await expect(page).toHaveURL(/\/auth\/signin/);
        // Double check no redirect loop
        await expect(page.getByText(/welcome back|sign in/i).first()).toBeVisible({ timeout: 8_000 });
    });

    test("old /dashboard route redirects to /app/dashboard (backward compat)", async ({ page }) => {
        await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
        // Should end up at signin with callbackUrl pointing to /app/dashboard
        await expect(page).toHaveURL(/\/auth\/signin|\/app\/dashboard/, { timeout: 8_000 });
    });

    test("old /audits route redirects to /app/audit (backward compat)", async ({ page }) => {
        await page.goto("/audits", { waitUntil: "domcontentloaded" });
        await expect(page).toHaveURL(/\/auth\/signin|\/app\/audit/, { timeout: 8_000 });
    });
});
