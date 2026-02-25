import { test, expect } from "@playwright/test";

test.describe("Smoke: Key routes load", () => {
  test("landing page /", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText(/SEO audit|rankings|instant/i);
  });

  test("audit page", async ({ page }) => {
    await page.goto("/audit");
    await expect(page.locator("input[name='url']")).toBeVisible();
  });

  test("audit results", async ({ page }) => {
    await page.goto("/audit/results");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("pricing page", async ({ page }) => {
    await page.goto("/pricing");
    const currencyBtns = page.getByRole("button", { name: /^(USD|INR)$/ });
    await expect(currencyBtns).toHaveCount(2);
    await expect(page.getByRole("button", { name: "USD" })).toBeVisible();
    await expect(page.getByRole("button", { name: "INR" })).toBeVisible();
  });

  test("auth signin", async ({ page }) => {
    await page.goto("/auth/signin");
    await expect(page.getByRole("heading", { name: /Sign in/i })).toBeVisible();
  });

  test("auth signup", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(
      page.getByRole("heading", { name: /Create account|Sign up/i }),
    ).toBeVisible();
  });

  test("auth forgot-password", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await expect(
      page.getByRole("heading", { name: /Forgot password/i }),
    ).toBeVisible();
  });

  test("dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: /Dashboard/i }),
    ).toBeVisible();
  });

  test("billing page", async ({ page }) => {
    await page.goto("/billing");
    await expect(page.getByRole("heading", { name: /Billing/i })).toBeVisible();
  });
});

test.describe("Anonymous audit flow", () => {
  test("anonymous user can run audit and reach report page", async ({ page }) => {
    await page.goto("/");
    const input = page.getByPlaceholder(/yoursite\.com/).first();
    await input.fill("stripe.com");
    await page.getByRole("button", { name: /Run Free Audit|Scanning/i }).click();
    await expect(page).toHaveURL(/\/report\/stripe\.com/, { timeout: 15_000 });
  });

  test("anonymous Fix it now redirects to signin with callbackUrl", async ({ page }) => {
    await page.goto("/report/stripe.com", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
    const fixBtn = page.getByRole("button", { name: /Fix it now/i }).first();
    await fixBtn.waitFor({ state: "visible", timeout: 60_000 });
    await fixBtn.click();
    await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 10_000 });
    expect(page.url()).toContain("callbackUrl=");
  });
});
