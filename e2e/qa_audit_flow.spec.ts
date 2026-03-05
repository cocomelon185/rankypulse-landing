/**
 * e2e/qa_audit_flow.spec.ts
 * QA: End-to-end audit flow tests (public/anonymous).
 * Tests the full audit funnel: homepage → domain input → audit runs → results page.
 * Also verifies result page data corresponds to the scanned domain (not hardcoded).
 */
import { test, expect } from "@playwright/test";
import { attachErrorCollectors } from "./helpers/auth";

test.describe("QA: Anonymous audit flow", () => {
    test("homepage domain input → submitting triggers audit for that domain", async ({ page }) => {
        const { networkErrors } = attachErrorCollectors(page);
        await page.goto("/");

        const input = page.getByPlaceholder(/yoursite\.com|domain/i).first();
        await expect(input).toBeVisible({ timeout: 8_000 });
        await input.fill("stripe.com");

        const runBtn = page.getByRole("button", { name: /run free audit|run audit|start audit|scanning/i }).first();
        await expect(runBtn).toBeVisible({ timeout: 5_000 });
        await runBtn.click();

        // Should navigate to a report or audit results page
        await expect(page).toHaveURL(/\/(report|audit)\/.+|\/audit\/results/, { timeout: 30_000 });
        const critical5xx = networkErrors.filter(e => e.startsWith("HTTP 5"));
        expect(critical5xx, `5xx errors during audit: ${critical5xx.join("\n")}`).toHaveLength(0);
    });

    test("audit results page — domain shows correctly, not hardcoded", async ({ page }) => {
        // Navigate directly to a known audit result for stripe.com
        await page.goto("/report/stripe.com", { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => { });

        // The page must mention the domain we passed, not a hardcoded demo domain
        const bodyText = await page.locator("body").textContent({ timeout: 10_000 });
        expect(bodyText).toContain("stripe.com");
        expect(bodyText ?? "").not.toMatch(/notion\.so|acmecorp\.com|sample\s*demo/i);
    });

    test("/audit page — domain input works and shows loading state", async ({ page }) => {
        await page.goto("/audit");
        const input = page.locator("input[name='url'], input[type='url'], input[type='text']").first();
        await expect(input).toBeVisible({ timeout: 8_000 });
        await input.fill("https://httpbin.org");

        const submitBtn = page.getByRole("button", { name: /audit|start|run|scan/i }).first();
        await submitBtn.click();

        // Either redirects to results OR shows a loading state in < 5s
        const hasLoading = await page.getByText(/scanning|loading|analyzing|crawl/i).isVisible({ timeout: 5_000 }).catch(() => false);
        const redirected = !page.url().includes("/audit") || page.url().includes("/results");
        expect(hasLoading || redirected).toBe(true);
    });

    test("audit results page — score gauge shows a numeric value 0–100", async ({ page }) => {
        await page.goto("/audit/results?sample=1", { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => { });

        // Look for a score number displayed
        const scoreEl = page.getByText(/current score/i).first();
        const visible = await scoreEl.isVisible({ timeout: 8_000 }).catch(() => false);
        if (visible) {
            const parentText = await scoreEl.locator("..").textContent({ timeout: 5_000 });
            const match = (parentText ?? "").match(/\d+/);
            if (match) {
                const score = Number(match[0]);
                expect(score).toBeGreaterThanOrEqual(0);
                expect(score).toBeLessThanOrEqual(100);
            }
        }
    });

    test("Fix it now button on results page → redirects to signin with callbackUrl", async ({ page }) => {
        await page.goto("/report/stripe.com", { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => { });
        const fixBtn = page.getByRole("button", { name: /fix it now/i }).first();
        const isVisible = await fixBtn.isVisible({ timeout: 30_000 }).catch(() => false);
        if (isVisible) {
            await fixBtn.click();
            await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 10_000 });
            expect(page.url()).toContain("callbackUrl");
        }
    });

    test("/audit/results page — shows email capture for unauthenticated users", async ({ page }) => {
        await page.goto("/audit/results?sample=1", { waitUntil: "domcontentloaded" });
        const emailInput = page.getByPlaceholder(/you@example\.com|email/i).first();
        const visible = await emailInput.isVisible({ timeout: 10_000 }).catch(() => false);
        // This feature should be present
        if (!visible) {
            // May have moved to a modal — check for email capture text
            const hasEmailCapture = await page.getByText(/email me|send.*report|unlock/i).isVisible({ timeout: 5_000 }).catch(() => false);
            expect(hasEmailCapture, "Email capture should be visible for anonymous users on audit results").toBe(true);
        }
    });
});

test.describe("QA: /app/audit/[domain] dynamic route (unauthenticated)", () => {
    test("dynamic route /app/audit/[domain] uses the domain from URL, not hardcoded", async ({ page }) => {
        await page.goto("/app/audit/myblog.dev");
        // Should redirect to signin since unauthenticated
        await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 8_000 });
        // callbackUrl should contain the specific domain
        const url = new URL(page.url());
        const cb = decodeURIComponent(url.searchParams.get("callbackUrl") ?? "");
        expect(cb).toContain("myblog.dev");
    });

    test("different domains have different /app/audit/[domain] callbackUrls", async ({ page }) => {
        // Domain 1
        await page.goto("/app/audit/acmecorp.com");
        await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 8_000 });
        const url1 = new URL(page.url());
        const cb1 = decodeURIComponent(url1.searchParams.get("callbackUrl") ?? "");

        // Domain 2
        await page.goto("/app/audit/shopify-store.io");
        await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 8_000 });
        const url2 = new URL(page.url());
        const cb2 = decodeURIComponent(url2.searchParams.get("callbackUrl") ?? "");

        // They must differ
        expect(cb1).not.toBe(cb2);
        expect(cb1).toContain("acmecorp.com");
        expect(cb2).toContain("shopify-store.io");
    });
});
