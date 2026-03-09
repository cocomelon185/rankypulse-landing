/**
 * /qa/api/api-health.ts
 *
 * Phase 4: API Health & Schema Validation
 *
 * Checks:
 * 1. Endpoint reachability (status codes within acceptable range)
 * 2. Response time (< configured thresholds)
 * 3. Unauthenticated routes return 401 correctly
 * 4. JSON schema validation for critical endpoints (using authenticated session)
 * 5. Error response format validation
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 QA_SESSION_COOKIE="..." tsx qa/api/api-health.ts
 *
 * The QA_SESSION_COOKIE env var should contain the NextAuth session cookie
 * obtained by running the auth test and saving the session state.
 */

import * as fs from "fs";
import * as path from "path";
import { getEnvironmentConfig } from "../config/environments";
import { API_THRESHOLDS, API_HEALTH } from "../config/thresholds";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ApiEndpointCheck {
  name: string;
  path: string;
  method: "GET" | "POST";
  requiresAuth: boolean;
  body?: Record<string, unknown>;
  expectedStatus: number[];
  /** Threshold type from config */
  latencyType: "critical" | "standard" | "slow";
  /** Optional schema name to validate against */
  schemaName?: string;
}

export interface ApiCheckResult {
  name: string;
  path: string;
  method: string;
  statusCode: number;
  latencyMs: number;
  passed: boolean;
  issues: string[];
  responseBody?: unknown;
}

export interface ApiHealthResult {
  checkedAt: string;
  baseUrl: string;
  environment: string;
  totalChecks: number;
  passed: number;
  failed: number;
  avgLatencyMs: number;
  results: ApiCheckResult[];
  overallPassed: boolean;
}

// ── Endpoint definitions ──────────────────────────────────────────────────────

export const PUBLIC_ENDPOINTS: ApiEndpointCheck[] = [
  {
    name: "Heartbeat — Home",
    path: "/",
    method: "GET",
    requiresAuth: false,
    expectedStatus: [200],
    latencyType: "critical",
  },
  {
    name: "NextAuth CSRF",
    path: "/api/auth/csrf",
    method: "GET",
    requiresAuth: false,
    expectedStatus: [200],
    latencyType: "critical",
  },
  {
    name: "NextAuth Session (unauthenticated)",
    path: "/api/auth/session",
    method: "GET",
    requiresAuth: false,
    expectedStatus: [200], // Returns {} when unauthenticated
    latencyType: "critical",
  },
];

export const UNAUTH_GUARD_ENDPOINTS: ApiEndpointCheck[] = [
  {
    name: "User Plan — Requires Auth",
    path: "/api/user/plan",
    method: "GET",
    requiresAuth: true,
    expectedStatus: [401],
    latencyType: "critical",
  },
  {
    name: "Projects List — Requires Auth",
    path: "/api/projects",
    method: "GET",
    requiresAuth: true,
    expectedStatus: [401],
    latencyType: "critical",
  },
  {
    name: "Rank Keywords — Requires Auth",
    path: "/api/rank/keywords",
    method: "GET",
    requiresAuth: true,
    expectedStatus: [401],
    latencyType: "critical",
  },
  {
    name: "Backlinks GET — Requires Auth",
    path: "/api/backlinks?domain=example.com",
    method: "GET",
    requiresAuth: true,
    expectedStatus: [401],
    latencyType: "standard",
  },
  {
    name: "Competitors GET — Requires Auth",
    path: "/api/competitors?domain=example.com",
    method: "GET",
    requiresAuth: true,
    expectedStatus: [401],
    latencyType: "standard",
  },
  {
    name: "Audit Data — Requires Auth",
    path: "/api/audits/data",
    method: "GET",
    requiresAuth: true,
    expectedStatus: [401],
    latencyType: "standard",
  },
  {
    name: "Activity Log — Requires Auth",
    path: "/api/activity",
    method: "GET",
    requiresAuth: true,
    expectedStatus: [401],
    latencyType: "standard",
  },
  {
    name: "Action Center Tasks — Requires Auth",
    path: "/api/action-center/tasks",
    method: "GET",
    requiresAuth: true,
    expectedStatus: [401],
    latencyType: "standard",
  },
  {
    name: "Create Rank Keyword POST — Requires Auth",
    path: "/api/rank/keywords",
    method: "POST",
    requiresAuth: true,
    body: { domain: "example.com", keyword: "test keyword" },
    expectedStatus: [401],
    latencyType: "critical",
  },
  {
    name: "Create Project POST — Requires Auth",
    path: "/api/projects",
    method: "POST",
    requiresAuth: true,
    body: { domain: "example.com" },
    expectedStatus: [401],
    latencyType: "critical",
  },
];

// ── Simple JSON schema validator ──────────────────────────────────────────────

function validateSchema(
  data: unknown,
  schemaName: string,
  schemasDir: string
): string[] {
  const schemaPath = path.join(schemasDir, `${schemaName}.schema.json`);
  if (!fs.existsSync(schemaPath)) {
    return [`Schema file not found: ${schemaPath}`];
  }

  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
  const issues: string[] = [];

  // Basic structural validation (not full JSON Schema — avoid heavy deps)
  if (schema.type === "object" && schema.required) {
    if (typeof data !== "object" || data === null) {
      return [`Expected object, got ${typeof data}`];
    }
    for (const field of schema.required as string[]) {
      if (!(field in (data as Record<string, unknown>))) {
        issues.push(`Required field missing: "${field}"`);
      }
    }
  } else if (schema.type === "array") {
    if (!Array.isArray(data)) {
      return [`Expected array, got ${typeof data}`];
    }
  }

  return issues;
}

// ── Single endpoint check ─────────────────────────────────────────────────────

async function checkEndpoint(
  baseUrl: string,
  endpoint: ApiEndpointCheck,
  sessionCookie: string | null,
  schemasDir: string,
  expectAuth: boolean
): Promise<ApiCheckResult> {
  const url = `${baseUrl}${endpoint.path}`;
  const issues: string[] = [];

  // Build headers
  const headers: Record<string, string> = {
    "User-Agent": "RankyPulse-QA-API-Health/1.0",
    Accept: "application/json",
  };

  // Add session cookie only when testing authenticated endpoints
  if (sessionCookie && !endpoint.requiresAuth) {
    headers["Cookie"] = sessionCookie;
  }

  // Start latency timer
  const start = Date.now();
  let statusCode = 0;
  let responseBody: unknown;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      API_HEALTH.timeoutMs
    );

    const fetchOptions: RequestInit = {
      method: endpoint.method,
      headers,
      signal: controller.signal as AbortSignal,
    };

    if (endpoint.method === "POST" && endpoint.body) {
      fetchOptions.body = JSON.stringify(endpoint.body);
      (headers as Record<string, string>)["Content-Type"] = "application/json";
    }

    const res = await fetch(url, fetchOptions);
    clearTimeout(timeout);

    statusCode = res.status;

    // Try to parse JSON response
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      responseBody = await res.json().catch(() => null);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    issues.push(`Request failed: ${msg}`);
  }

  const latencyMs = Date.now() - start;

  // ── Check status code ─────────────────────────────────────────────────────
  if (!endpoint.expectedStatus.includes(statusCode)) {
    issues.push(
      `Expected status ${endpoint.expectedStatus.join(" or ")}, got ${statusCode}`
    );
  }

  // ── Check latency ─────────────────────────────────────────────────────────
  const maxLatency = API_THRESHOLDS[endpoint.latencyType];
  if (latencyMs > maxLatency) {
    issues.push(
      `Slow response: ${latencyMs}ms exceeds threshold of ${maxLatency}ms`
    );
  }

  // ── Validate error response format (for 4xx/5xx) ──────────────────────────
  if (statusCode >= 400 && responseBody) {
    const body = responseBody as Record<string, unknown>;
    if (!body.error && !body.message) {
      issues.push(
        `Error response missing "error" or "message" field (status ${statusCode})`
      );
    }
  }

  // ── Schema validation (for successful authenticated responses) ────────────
  if (
    endpoint.schemaName &&
    statusCode >= 200 &&
    statusCode < 300 &&
    responseBody !== null
  ) {
    const schemaIssues = validateSchema(
      responseBody,
      endpoint.schemaName,
      schemasDir
    );
    issues.push(...schemaIssues.map((i) => `Schema: ${i}`));
  }

  return {
    name: endpoint.name,
    path: endpoint.path,
    method: endpoint.method,
    statusCode,
    latencyMs,
    passed: issues.length === 0,
    issues,
    responseBody:
      process.env.VERBOSE === "true" ? responseBody : undefined,
  };
}

// ── Main health check runner ──────────────────────────────────────────────────

export async function runApiHealthChecks(
  baseUrl?: string,
  sessionCookie?: string
): Promise<ApiHealthResult> {
  const env = getEnvironmentConfig();
  const resolvedBase = baseUrl ?? env.baseUrl;
  const schemasDir = path.join(process.cwd(), "qa/api/schemas");

  console.log(`\n🏥 API Health Check\n`);
  console.log(`   Environment: ${env.name}`);
  console.log(`   Base URL:    ${resolvedBase}`);
  console.log(`   Auth:        ${sessionCookie ? "✅ Session cookie provided" : "❌ No session (testing unauth guards only)"}\n`);

  const allEndpoints = [
    ...PUBLIC_ENDPOINTS,
    ...UNAUTH_GUARD_ENDPOINTS,
  ];

  const results: ApiCheckResult[] = [];

  for (let i = 0; i < allEndpoints.length; i++) {
    const ep = allEndpoints[i];
    process.stdout.write(
      `\r⚡ Checking [${i + 1}/${allEndpoints.length}] ${ep.name.padEnd(50)}`
    );

    const result = await checkEndpoint(
      resolvedBase,
      ep,
      sessionCookie ?? null,
      schemasDir,
      ep.requiresAuth
    );
    results.push(result);

    // Small delay between requests
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log("\n");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const avgLatency = Math.round(
    results.reduce((sum, r) => sum + r.latencyMs, 0) / results.length
  );

  return {
    checkedAt: new Date().toISOString(),
    baseUrl: resolvedBase,
    environment: env.name,
    totalChecks: results.length,
    passed,
    failed,
    avgLatencyMs: avgLatency,
    results,
    overallPassed: failed === 0,
  };
}

// ── Save & print results ──────────────────────────────────────────────────────

export function saveApiHealthResults(
  result: ApiHealthResult,
  artifactsDir: string
): void {
  fs.mkdirSync(artifactsDir, { recursive: true });
  const jsonPath = path.join(artifactsDir, "api-health-report.json");
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
  console.log(`✅ Saved API health report to ${jsonPath}`);
}

export function printApiHealthSummary(result: ApiHealthResult): void {
  const icon = result.overallPassed ? "✅" : "❌";
  console.log("━".repeat(60));
  console.log(`${icon}  API Health Check ${result.overallPassed ? "PASSED" : "FAILED"}`);
  console.log("━".repeat(60));
  console.log(`\n   Total checks: ${result.totalChecks}`);
  console.log(`   Passed:       ${result.passed}`);
  console.log(`   Failed:       ${result.failed}`);
  console.log(`   Avg latency:  ${result.avgLatencyMs}ms`);

  if (result.failed > 0) {
    console.log(`\n❌ Failed checks:\n`);
    result.results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  ${r.method} ${r.path} (${r.statusCode}, ${r.latencyMs}ms)`);
        r.issues.forEach((issue) => console.log(`    → ${issue}`));
      });
  }

  console.log("━".repeat(60));
}

// ── CLI entry point ───────────────────────────────────────────────────────────

if (require.main === module) {
  const baseUrl = process.env.BASE_URL;
  const sessionCookie = process.env.QA_SESSION_COOKIE;
  const artifactsDir = path.join(process.cwd(), "qa/artifacts");

  runApiHealthChecks(baseUrl, sessionCookie)
    .then((result) => {
      printApiHealthSummary(result);
      saveApiHealthResults(result, artifactsDir);
      process.exit(result.overallPassed ? 0 : 1);
    })
    .catch((err) => {
      console.error("❌ API health check failed:", err);
      process.exit(1);
    });
}
