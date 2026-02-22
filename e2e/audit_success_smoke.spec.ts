import { test, expect } from "@playwright/test";

test.describe("Audit: success smoke", () => {
  test("run audit with valid URL shows loading then results", async ({ page }) => {
    await page.goto("/audit");

    // Fill URL and submit
    await page.locator("input[name='url']").fill("https://example.com");
    await page.getByRole("button", { name: /start audit/i }).click();

    // Brief loading may appear (button disabled or loading text)
    // Results page is the main assertion
    // Expect results container (score/summary/issue list) - on /audit/results
    await expect(page).toHaveURL(/\/audit\/results/, { timeout: 15000 });

    // Results page: score, summary, and at least one known category
    await expect(
      page.getByText(/current|potential|score/i).first()
    ).toBeVisible({ timeout: 5000 });

    // At least one known category: Issues, Overview, Title & Meta, Schema, Quick Wins
    await expect(
      page.getByText(/issues|overview|title|meta|schema|quick wins/i).first()
    ).toBeVisible();
  });
});
