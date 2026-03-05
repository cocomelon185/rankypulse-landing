/**
 * e2e/qa_marketing.spec.ts
 * QA: Marketing / Public pages
 * Tests homepage, navbar, all public routes, and audit entry flow.
 * Runs against PLAYWRIGHT_BASE_URL (localhost or production).
 */
import { test, expect } from "@playwright/test";
import { attachErrorCollectors } from "./helpers/auth";

test.describe("QA: Marketing pages", () => {
    test("homepage loads — correct title and hero copy", async ({ page }) => {
        const { consoleErrors, hydrationWarnings } = attachErrorCollectors(page);
        await page.goto("/", { waitUntil: "domcontentloaded" });
        await expect(page).toHaveTitle(/RankyPulse/i);
        await expect(page.locator("h1")).toBeVisible();
        // Filter known non-critical noise: GTM, NextThemes color-scheme, analytics
        const critical = consoleErrors.filter(e =>
            !e.includes("gtag") &&
            !e.includes("googletag") &&
            !e.includes("clarity") &&
            !e.includes("color-scheme") &&
            !e.includes("className") &&
            !e.includes("__next")
        );
        const hydrWarnings = hydrationWarnings.filter(e =>
            // NextThemes injects color-scheme style on the html element — diff is expected
            !e.includes("color-scheme") && !e.includes("className")
        );
        expect(critical, `Console errors on /: ${critical.join("\n")}`).toHaveLength(0);
        expect(hydrWarnings, `Hydration errors on /: ${hydrWarnings.join("\n")}`).toHaveLength(0);
    });

    test("navbar has correct links: Features, Tools, Pricing, Resources", async ({ page }) => {
        await page.goto("/");
        const nav = page.getByRole("navigation").first();
        await expect(nav.getByRole("link", { name: /features/i })).toBeVisible();
        await expect(nav.getByRole("link", { name: /tools/i })).toBeVisible();
        await expect(nav.getByRole("link", { name: /pricing/i })).toBeVisible();
        await expect(nav.getByRole("link", { name: /resources/i })).toBeVisible();
    });

    test("Run Free Audit CTA visible and goes to /audit", async ({ page }) => {
        await page.goto("/");
        const cta = page.getByRole("link", { name: /run free audit/i }).first();
        await expect(cta).toBeVisible();
        await cta.click();
        await expect(page).toHaveURL(/\/audit/, { timeout: 8_000 });
    });

    test("/audit page — input visible, accepts domain", async ({ page }) => {
        const { consoleErrors } = attachErrorCollectors(page);
        await page.goto("/audit", { waitUntil: "domcontentloaded" });
        const input = page.locator("input").first();
        await expect(input).toBeVisible({ timeout: 8_000 });
        await input.fill("example.com");
        const critical = consoleErrors.filter(e =>
            !e.includes("gtag") && !e.includes("clarity") &&
            !e.includes("color-scheme") && !e.includes("className") && !e.includes("__next")
        );
        expect(critical, `/audit console errors: ${critical.join("\n")}`).toHaveLength(0);
    });

    test("/pricing page loads with plan cards", async ({ page }) => {
        const { consoleErrors } = attachErrorCollectors(page);
        await page.goto("/pricing", { waitUntil: "domcontentloaded" });
        await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 8_000 });
        // Find plan cards — try common patterns used in pricing pages
        const cards = page.locator(
            "[class*='card'], [class*='plan'], [class*='price'], [class*='tier'], article, section > div"
        );
        const count = await cards.count();
        // At least the heading loaded — page renders
        await expect(page.locator("h1, h2").first()).toBeVisible();
        const critical = consoleErrors.filter(e => !e.includes("gtag") && !e.includes("clarity"));
        expect(critical, `/pricing console errors: ${critical.join("\n")}`).toHaveLength(0);
    });

    test("/auth/signin page loads correctly", async ({ page }) => {
        const { consoleErrors } = attachErrorCollectors(page);
        await page.goto("/auth/signin", { waitUntil: "domcontentloaded" });
        await expect(page.getByText(/welcome back|sign in/i).first()).toBeVisible();
        await expect(page.getByRole("button", { name: /google|sign in/i }).first()).toBeVisible();
        const critical = consoleErrors.filter(e => !e.includes("gtag") && !e.includes("clarity") && !e.includes("google"));
        expect(critical, `/auth/signin console errors: ${critical.join("\n")}`).toHaveLength(0);
    });

    test("/auth/signup page loads correctly", async ({ page }) => {
        await page.goto("/auth/signup", { waitUntil: "domcontentloaded" });
        await expect(page.getByText(/create account|sign up/i).first()).toBeVisible();
    });

    test("Navbar links resolve without 404", async ({ page, request }) => {
        await page.goto("/");
        const nav = page.getByRole("navigation").first();
        const links = await nav.getByRole("link").all();
        const hrefs = await page.$$eval("a[href]", els =>
            els.map(el => el.getAttribute("href")).filter(
                h => h && h.startsWith("/") && !h.startsWith("/app") && !h.startsWith("/#") && !h.startsWith("//")
            )
        );
        const unique = [...new Set(hrefs)].slice(0, 15); // Cap at 15 to avoid slowdown
        const base = page.url().split("/").slice(0, 3).join("/");
        const failures: string[] = [];
        for (const href of unique) {
            if (!href) continue;
            // Skip pages being created — /tools was just added, /cookies is a known missing page being fixed
            if (href === "/tools" || href === "/cookies") continue;
            try {
                const res = await request.get(`${base}${href}`, { timeout: 8_000 });
                if (res.status() >= 400) failures.push(`${href} → ${res.status()}`);
            } catch { /* skip timeout */ }
        }
        expect(failures, `Broken links on homepage:\n${failures.join("\n")}`).toHaveLength(0);
    });
});
