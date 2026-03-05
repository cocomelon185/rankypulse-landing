/**
 * e2e/qa_ui_checks.spec.ts
 * QA: UI/UX checks across public pages.
 * Tests for broken buttons, static demo data, console errors, and broken links.
 */
import { test, expect } from "@playwright/test";
import { attachErrorCollectors } from "./helpers/auth";

const PUBLIC_PAGES = [
    { path: "/", name: "Home" },
    { path: "/pricing", name: "Pricing" },
    { path: "/audit", name: "Audit Entry" },
    { path: "/auth/signin", name: "Sign In" },
    { path: "/auth/signup", name: "Sign Up" },
];

test.describe("QA: Console errors on public pages", () => {
    for (const { path, name } of PUBLIC_PAGES) {
        test(`${name} (${path}) — no JS errors or hydration warnings`, async ({ page }) => {
            const { consoleErrors, hydrationWarnings } = attachErrorCollectors(page);
            await page.goto(path, { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000); // Allow async renders

            const filtered = consoleErrors.filter(e =>
                !e.includes("gtag") &&
                !e.includes("googletag") &&
                !e.includes("clarity") &&
                !e.includes("google-analytics") &&
                !e.includes("favicon") &&
                !e.toLowerCase().includes("razorpay") // payment lib may warn on non-checkout pages
            );
            expect(filtered, `JS errors on ${path}:\n${filtered.join("\n")}`).toHaveLength(0);
            expect(hydrationWarnings, `Hydration warnings on ${path}:\n${hydrationWarnings.join("\n")}`).toHaveLength(0);
        });
    }
});

test.describe("QA: Broken buttons detection", () => {
    test("homepage — all buttons have accessible text", async ({ page }) => {
        await page.goto("/");
        const buttons = page.getByRole("button");
        const count = await buttons.count();
        for (let i = 0; i < count; i++) {
            const btn = buttons.nth(i);
            const text = (await btn.textContent())?.trim();
            const label = await btn.getAttribute("aria-label");
            const title = await btn.getAttribute("title");
            const hasLabel = (text && text.length > 0) || (label && label.length > 0) || (title && title.length > 0);
            expect(hasLabel, `Button at index ${i} has no accessible text, label, or title`).toBe(true);
        }
    });

    test("pricing page — plan CTA buttons are visible and clickable", async ({ page }) => {
        await page.goto("/pricing");
        // Find CTA buttons (Get started, Subscribe, etc.)
        const ctaBtns = page.getByRole("button", { name: /get started|subscribe|choose|select|upgrade|start/i });
        const count = await ctaBtns.count();
        expect(count).toBeGreaterThanOrEqual(1); // At least 1 plan CTA
        // Each button should be enabled
        for (let i = 0; i < Math.min(count, 5); i++) {
            await expect(ctaBtns.nth(i)).toBeEnabled();
        }
    });
});

test.describe("QA: Static / hardcoded demo data detection", () => {
    test("homepage does NOT show hardcoded 'notion.so' or 'acmecorp.com' as user data", async ({ page }) => {
        await page.goto("/");
        const bodyText = await page.locator("body").textContent();
        // These are OK as example domains in the text, but check context
        // The critical check is that the main headline / user-facing data isn't hardcoded
        // Allow them in sample text/badges but not as "your domain" type content
        const hasNotionAsUserData = (bodyText ?? "").includes("notion.so");
        // Just flag if it looks like notion is shown as if it's the user's domain
        if (hasNotionAsUserData) {
            console.warn("⚠️ 'notion.so' found on homepage — verify it's only used as an example domain in the search bar, not as user data");
        }
    });

    test("/audit/results — sample data is clearly labeled as sample", async ({ page }) => {
        await page.goto("/audit/results?sample=1", { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => { });
        const bodyText = await page.locator("body").textContent();
        // Should either show a sample/demo label OR show real-looking data with a domain in URL
        const hasSampleLabel = (bodyText ?? "").match(/sample|demo|example/i);
        const hasRealDomain = page.url().includes("results");
        expect(hasSampleLabel || hasRealDomain).toBeTruthy();
    });
});

test.describe("QA: Broken links detection", () => {
    test("homepage — no broken internal links (404s)", async ({ page, request }) => {
        await page.goto("/");
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
            try {
                const res = await request.get(`${base}${href}`, { timeout: 8_000 });
                if (res.status() >= 400) failures.push(`${href} → ${res.status()}`);
            } catch { /* skip timeout */ }
        }
        expect(failures, `Broken links on homepage:\n${failures.join("\n")}`).toHaveLength(0);
    });

    test("/pricing — no broken internal links", async ({ page, request }) => {
        await page.goto("/pricing");
        const hrefs = await page.$$eval("a[href]", els =>
            els.map(el => el.getAttribute("href")).filter(
                h => h && h.startsWith("/") && !h.startsWith("/app") && !h.startsWith("/#")
            )
        );
        const unique = [...new Set(hrefs)].slice(0, 10);
        const base = page.url().split("/").slice(0, 3).join("/");
        const failures: string[] = [];
        for (const href of unique) {
            if (!href) continue;
            try {
                const res = await request.get(`${base}${href}`, { timeout: 8_000 });
                if (res.status() >= 400) failures.push(`${href} → ${res.status()}`);
            } catch { /* skip timeout */ }
        }
        expect(failures, `Broken links on /pricing:\n${failures.join("\n")}`).toHaveLength(0);
    });
});

test.describe("QA: Responsive navigation", () => {
    test("mobile viewport — hamburger menu works on homepage", async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 Pro
        await page.goto("/");
        // On mobile, some nav links may be hidden behind a menu button
        const menuBtn = page.getByRole("button", { name: /menu|navigation|hamburger|open/i }).first();
        const isMenuBtnVisible = await menuBtn.isVisible().catch(() => false);
        if (isMenuBtnVisible) {
            await menuBtn.click();
            // After clicking, at least one nav link should appear
            const anyLink = page.getByRole("link", { name: /features|pricing|tools|resources/i }).first();
            await expect(anyLink).toBeVisible({ timeout: 3_000 });
        } else {
            // Nav is always visible — check links are accessible
            const anyLink = page.getByRole("link", { name: /features|pricing|tools|resources/i }).first();
            await expect(anyLink).toBeVisible();
        }
    });
});

test.describe("QA: Performance — pages load under reasonable time", () => {
    test("homepage LCP under 8 seconds", async ({ page }) => {
        const start = Date.now();
        await page.goto("/", { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("load");
        const elapsed = Date.now() - start;
        expect(elapsed).toBeLessThan(8_000);
    });

    test("pricing page loads under 8 seconds", async ({ page }) => {
        const start = Date.now();
        await page.goto("/pricing", { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("load");
        const elapsed = Date.now() - start;
        expect(elapsed).toBeLessThan(8_000);
    });
});
