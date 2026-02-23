import { test, expect } from "@playwright/test";

test.describe("Audit: success smoke", () => {
  test("run audit with valid URL shows loading then results", async ({ page }) => {
    await page.goto("/audit");

    // Fill URL and submit
    await page.locator("input[name='url']").fill("https://example.com");
    await page.getByRole("button", { name: /start audit/i }).click();

    // Wait for results page
    await expect(page).toHaveURL(/\/audit\/results/, { timeout: 15000 });

    // Email capture card is inline; no modal to dismiss

    // Stable assertions: heading and site URL (avoids flaky tab-label matches)
    await expect(
      page.getByRole("heading", { name: /audit results/i })
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page.getByText(/Site:\s*https:\/\/example\.com/i)
    ).toBeVisible();
    await expect(page.getByText("Current score")).toBeVisible();
  });

  test("results page shows Unlock full report email capture for unsigned users", async ({
    page,
  }) => {
    await page.goto("/audit/results?sample=1");
    await expect(page.getByText(/email me the full report/i)).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.getByRole("button", { name: /send full report/i })).toBeVisible();
  });
});
