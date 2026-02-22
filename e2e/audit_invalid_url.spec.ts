import { test, expect } from "@playwright/test";

test.describe("Audit: invalid URL", () => {
  test("invalid URL shows inline error, no network call", async ({ page }) => {
    // Intercept any audit API call - we expect none for invalid URL
    let auditApiCalled = false;
    await page.route("**/api/audit**", (route) => {
      auditApiCalled = true;
      route.continue();
    });

    await page.goto("/audit");

    // Enter invalid URL
    await page.locator("input[name='url']").fill("not a url");
    await page.getByRole("button", { name: /start audit/i }).click();

    // Expect inline validation error (no navigation to results)
    await expect(
      page.getByText(/valid url|invalid|http|https/i).first()
    ).toBeVisible({ timeout: 3000 });

    // Should NOT have navigated to results
    await expect(page).not.toHaveURL(/\/audit\/results/);

    // Audit API should not have been called (client-side validation)
    expect(auditApiCalled).toBe(false);
  });
});
