import { test, expect } from "@playwright/test";

test.describe("Audit: backend error", () => {
  test("500 from audit API shows user-friendly error and Try again", async ({
    page,
  }) => {
    // Intercept audit API and force 500
    await page.route("**/api/audit**", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal server error" }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto("/audit");

    // Valid URL so the request is sent
    await page.locator("input[name='url']").fill("https://example.com");
    await page.getByRole("button", { name: /start audit/i }).click();

    // Expect user-friendly error (no raw stack trace)
    await expect(
      page.getByText(/something went wrong|try again|error|failed/i).first()
    ).toBeVisible({ timeout: 10000 });

    // Expect "Try again" or equivalent
    await expect(
      page.getByRole("button", { name: /try again/i })
    ).toBeVisible({ timeout: 3000 });
  });
});
