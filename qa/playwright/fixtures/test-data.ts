/**
 * /qa/playwright/fixtures/test-data.ts
 *
 * Test data and constants used across Playwright tests.
 * Single source of truth for test credentials, URLs, and seed data.
 */

// ── Test Accounts ─────────────────────────────────────────────────────────────

export const TEST_ACCOUNTS = {
  /** Main QA account — Starter plan, seeded by scripts/seed-test-account.mjs */
  qa: {
    email: "test-friends@rankypulse.com",
    password: "TestRankyPulse2024!",
    name: "Test Account (QA)",
    plan: "starter" as const,
  },
} as const;

// ── Test Domains ──────────────────────────────────────────────────────────────

export const TEST_DOMAINS = {
  /** Well-known domain guaranteed to be crawlable */
  sample: "example.com",
  /** A real external domain for backlink/competitor testing */
  real: "github.com",
};

// ── Public Routes ─────────────────────────────────────────────────────────────

export const PUBLIC_ROUTES = {
  home: "/",
  features: "/features",
  pricing: "/pricing",
  docs: "/docs",
  blog: "/blog",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
};

// ── Auth Routes ───────────────────────────────────────────────────────────────

export const AUTH_ROUTES = {
  signIn: "/auth/signin",
  signUp: "/auth/signup",
  magicLink: "/auth/magic-link",
  forgotPassword: "/auth/forgot-password",
};

// ── App Routes ────────────────────────────────────────────────────────────────

export const APP_ROUTES = {
  dashboard: "/app/dashboard",
  projects: "/app/projects",
  audit: "/app/audit",
  rankTracking: "/app/rank-tracking",
  positionTracking: "/app/position-tracking",
  keywordResearch: "/app/keyword-research",
  backlinks: "/app/backlinks",
  competitors: "/app/competitors",
  settings: "/app/settings",
  account: "/app/account",
  integrations: "/app/integrations",
  reports: "/app/reports",
  actionCenter: "/app/action-center",
};

// ── Text Strings for Assertions ────────────────────────────────────────────────

export const EXPECTED_TEXT = {
  home: {
    headline: /rank|seo|audit|track|keyword/i,
    ctaButton: /get started|try free|audit|start/i,
  },
  pricing: {
    planNames: /free|starter|pro/i,
    priceIndicator: /\$|\₹|month|year/i,
  },
  signIn: {
    heading: /sign in|log in|welcome back/i,
    emailLabel: /email/i,
    passwordLabel: /password/i,
  },
  dashboard: {
    heading: /dashboard|overview|welcome/i,
    projectSection: /project|audit|site/i,
  },
};

// ── Invalid test data (for form validation) ───────────────────────────────────

export const INVALID_DATA = {
  email: "not-a-valid-email",
  shortPassword: "abc",
  sqlInjection: "' OR '1'='1",
  xssPayload: '<script>alert("xss")</script>',
  longString: "a".repeat(256),
};
