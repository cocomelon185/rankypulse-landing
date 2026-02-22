import { test, expect } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test.describe("API: Audit contract", () => {
  test("POST /api/audit with valid URL returns 200 and expected shape", async ({
    request,
  }) => {
    const res = await request.post(`${BASE}/api/audit`, {
      data: { url: "https://example.com" },
      headers: { "Content-Type": "application/json" },
      timeout: 35000,
    });

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("ok", true);
    expect(json).toHaveProperty("data");
    expect(json.data).toHaveProperty("summary");
    expect(json.data).toHaveProperty("scores");
    expect(json.data).toHaveProperty("issues");
    expect(json.data).toHaveProperty("url");
    expect(json.data).toHaveProperty("hostname");
    expect(Array.isArray(json.data.issues)).toBe(true);
    expect(typeof json.data.scores?.seo).toBe("number");
  });

  test("POST /api/audit with invalid input returns 400", async ({ request }) => {
    const res = await request.post(`${BASE}/api/audit`, {
      data: { url: "not-a-valid-url" },
      headers: { "Content-Type": "application/json" },
    });

    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty("ok", false);
    expect(json).toHaveProperty("error");
    expect(typeof json.error).toBe("string");
  });
});
