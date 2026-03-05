/**
 * e2e/qa_api_health.spec.ts
 * QA: API endpoint health checks.
 * Tests all critical API routes for correct response shapes, status codes,
 * and error handling.
 */
import { test, expect } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test.describe("QA: API health checks", () => {
    test("GET /api/auth/session returns 200 with JSON", async ({ request }) => {
        const res = await request.get(`${BASE}/api/auth/session`);
        expect(res.status()).toBe(200);
        const json = await res.json();
        // Unauthenticated: session should be empty object or null
        expect(typeof json).toBe("object");
    });

    test("GET /api/auth/providers returns 200 with OAuth providers", async ({ request }) => {
        const res = await request.get(`${BASE}/api/auth/providers`);
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(typeof json).toBe("object");
    });

    test("POST /api/audit with valid URL returns 200 and correct shape", async ({ request }) => {
        const res = await request.post(`${BASE}/api/audit`, {
            data: { url: "https://example.com" },
            headers: { "Content-Type": "application/json", "x-playwright": "1" },
            timeout: 35_000,
        });
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(json).toHaveProperty("ok", true);
        expect(json.data).toHaveProperty("summary");
        expect(json.data).toHaveProperty("scores");
        expect(json.data).toHaveProperty("issues");
        expect(json.data).toHaveProperty("url");
        expect(json.data).toHaveProperty("hostname");
        expect(Array.isArray(json.data.issues)).toBe(true);
        expect(typeof json.data.scores?.seo).toBe("number");
        // CRITICAL: hostname must match the submitted domain, not be hardcoded
        expect(json.data.hostname).not.toBe("notion.so");
        expect(json.data.hostname).not.toBe("stripe.com");
        expect(json.data.url).toContain("example.com");
    });

    test("POST /api/audit returns domain-specific data (not hardcoded)", async ({ request }) => {
        // Test with two different domains and verify results differ
        const [res1, res2] = await Promise.all([
            request.post(`${BASE}/api/audit`, {
                data: { url: "https://example.com" },
                headers: { "Content-Type": "application/json", "x-playwright": "1" },
                timeout: 35_000,
            }),
            request.post(`${BASE}/api/audit`, {
                data: { url: "https://httpbin.org" },
                headers: { "Content-Type": "application/json", "x-playwright": "1" },
                timeout: 35_000,
            }),
        ]);
        if (res1.status() === 200 && res2.status() === 200) {
            const j1 = await res1.json();
            const j2 = await res2.json();
            // Hostnames must match what was submitted
            expect(j1.data?.hostname).toContain("example.com");
            expect(j2.data?.hostname).toContain("httpbin.org");
            // They should NOT be the same hostname
            expect(j1.data?.hostname).not.toBe(j2.data?.hostname);
        }
    });

    test("POST /api/audit with invalid URL returns 400", async ({ request }) => {
        const res = await request.post(`${BASE}/api/audit`, {
            data: { url: "not-a-valid-url" },
            headers: { "Content-Type": "application/json" },
        });
        expect(res.status()).toBe(400);
        const json = await res.json();
        expect(json).toHaveProperty("ok", false);
        expect(json).toHaveProperty("error");
    });

    test("POST /api/audit with empty body returns 400", async ({ request }) => {
        const res = await request.post(`${BASE}/api/audit`, {
            data: {},
            headers: { "Content-Type": "application/json" },
        });
        expect(res.status()).toBe(400);
    });

    test("GET /api/projects requires auth (returns 401 or redirects)", async ({ request }) => {
        const res = await request.get(`${BASE}/api/projects`);
        // Without auth token, should be 401 or 403
        expect([400, 401, 403, 405]).toContain(res.status());
    });
});

test.describe("QA: API — no server errors on page load", () => {
    const publicPages = ["/", "/pricing", "/audit", "/auth/signin"];

    for (const path of publicPages) {
        test(`no 5xx from API calls on ${path}`, async ({ page }) => {
            const serverErrors: string[] = [];
            page.on("response", (res) => {
                if (res.status() >= 500 && res.url().includes("/api/")) {
                    serverErrors.push(`${res.status()} ${res.url()}`);
                }
            });
            await page.goto(path, { waitUntil: "networkidle" }).catch(() => { });
            expect(serverErrors, `5xx API errors on ${path}: ${serverErrors.join(", ")}`).toHaveLength(0);
        });
    }
});
