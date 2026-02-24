import { test, expect } from "@playwright/test";

/**
 * Audit Results UI regression guard.
 *
 * Run this test alone:
 *   npx playwright test e2e/audit_results_ui_regression.spec.ts
 */
test.describe("Audit Results UI regression", () => {
  test.beforeEach(async ({ page }) => {
    // Disable animations for stable tests
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => {
      const style = document.createElement("style");
      style.textContent =
        "* { animation: none !important; transition: none !important; }";
      document.head.appendChild(style);
    });
  });

  test("full results page: hero, top fixes, IssueRow, actions, unlock section", async ({
    page,
  }) => {
    // Desktop viewport so sticky actions panel (Copy share link) is visible
    await page.setViewportSize({ width: 1280, height: 720 });

    // url= triggers audit; sample=1 skips audit (hero/top-fixes need data)
    await page.goto("/audit/results?url=https://example.com");

    // Wait for audit to complete and main content
    await expect(
      page.getByRole("heading", { name: /top fixes/i })
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByRole("heading", { name: /email full report/i })
    ).toBeVisible({ timeout: 5000 });

    // Hero summary visible
    await expect(
      page.getByRole("region", { name: /hero summary/i })
    ).toBeVisible();

    // Top fixes section visible
    await expect(
      page.getByText(/top fixes \(highest impact first\)/i)
    ).toBeVisible();

    // IssueRow has "View fix steps" (in non-compact Top issues card)
    await expect(page.getByRole("button", { name: /view fix steps/i })).toBeVisible();

    // Actions panel includes "Copy share link"
    await expect(
      page.getByRole("button", { name: /copy share link/i })
    ).toBeVisible();

    // Unlock section includes "You're viewing the summary…"
    await expect(
      page.getByText(/you'?re viewing the summary/i)
    ).toBeVisible();

    // Stable DOM assertion: core structure present
    await expect(
      page.locator(".audit-results-page")
    ).toBeVisible();

    // Screenshot for visual regression (baseline created on first run)
    await expect(page).toHaveScreenshot("audit-results-ui.png", {
      fullPage: false,
    });
  });
});
