/**
 * /qa/config/routes.ts
 *
 * Comprehensive route registry for RankyPulse
 * Used by route discovery, crawl, and test execution
 *
 * Categories:
 * - marketing: public pages (no auth required)
 * - auth: authentication flows (signup, login, password reset)
 * - app: authenticated pages (require valid session)
 * - api: backend API endpoints
 */

export interface RouteConfig {
  path: string;
  name: string;
  category: "marketing" | "auth" | "app" | "api";
  requiresAuth: boolean;
  statusCode?: number;
  description?: string;
  isDynamic?: boolean; // true if route has [params]
  crawlable?: boolean; // false if needs session/params
}

// ── Marketing Pages (Public) ────────────────────────────────────────────
export const MARKETING_ROUTES: RouteConfig[] = [
  {
    path: "/",
    name: "Home",
    category: "marketing",
    requiresAuth: false,
    description: "Landing page with CTA",
    crawlable: true,
  },
  {
    path: "/features",
    name: "Features",
    category: "marketing",
    requiresAuth: false,
    description: "Feature list and benefits",
    crawlable: true,
  },
  {
    path: "/pricing",
    name: "Pricing",
    category: "marketing",
    requiresAuth: false,
    description: "Pricing plans and comparison",
    crawlable: true,
  },
  {
    path: "/docs",
    name: "Docs",
    category: "marketing",
    requiresAuth: false,
    description: "Documentation",
    crawlable: true,
  },
  {
    path: "/blog",
    name: "Blog",
    category: "marketing",
    requiresAuth: false,
    description: "Blog listing",
    crawlable: true,
  },
  {
    path: "/contact",
    name: "Contact",
    category: "marketing",
    requiresAuth: false,
    description: "Contact form",
    crawlable: true,
  },
  {
    path: "/privacy",
    name: "Privacy Policy",
    category: "marketing",
    requiresAuth: false,
    crawlable: true,
  },
  {
    path: "/terms",
    name: "Terms of Service",
    category: "marketing",
    requiresAuth: false,
    crawlable: true,
  },
];

// ── Auth Pages ──────────────────────────────────────────────────────────
export const AUTH_ROUTES: RouteConfig[] = [
  {
    path: "/auth/signin",
    name: "Sign In",
    category: "auth",
    requiresAuth: false,
    description: "Login with email/password or OAuth",
    crawlable: true,
  },
  {
    path: "/auth/signup",
    name: "Sign Up",
    category: "auth",
    requiresAuth: false,
    description: "Create new account",
    crawlable: true,
  },
  {
    path: "/auth/magic-link",
    name: "Magic Link Auth",
    category: "auth",
    requiresAuth: false,
    description: "Passwordless login",
    crawlable: true,
  },
  {
    path: "/auth/callback/google",
    name: "Google OAuth Callback",
    category: "auth",
    requiresAuth: false,
    description: "OAuth redirect handler",
    crawlable: false,
  },
  {
    path: "/auth/forgot-password",
    name: "Forgot Password",
    category: "auth",
    requiresAuth: false,
    crawlable: true,
  },
  {
    path: "/auth/reset-password",
    name: "Reset Password",
    category: "auth",
    requiresAuth: false,
    crawlable: false, // requires token in URL
  },
];

// ── Authenticated App Pages (Route Group: (app)) ───────────────────────
export const APP_ROUTES: RouteConfig[] = [
  // Dashboard & Core
  {
    path: "/app/dashboard",
    name: "Dashboard",
    category: "app",
    requiresAuth: true,
    crawlable: true,
    description: "Main dashboard with project overview",
  },
  {
    path: "/app/projects",
    name: "Projects",
    category: "app",
    requiresAuth: true,
    crawlable: true,
    description: "Project listing and management",
  },
  {
    path: "/app/audit",
    name: "Audit Index",
    category: "app",
    requiresAuth: true,
    crawlable: true,
    description: "Site audit entry point",
  },
  {
    path: "/app/audit/[domain]",
    name: "Audit Detail",
    category: "app",
    requiresAuth: true,
    isDynamic: true,
    crawlable: false, // requires domain param
    description: "Audit results for specific domain",
  },

  // Audit Sub-Pages (require [domain] param)
  {
    path: "/app/audits/full",
    name: "Full Audit Report",
    category: "app",
    requiresAuth: true,
    crawlable: false,
    description: "Complete audit results",
  },
  {
    path: "/app/audits/issues",
    name: "Issues",
    category: "app",
    requiresAuth: true,
    crawlable: false,
    description: "SEO and technical issues",
  },
  {
    path: "/app/audits/links",
    name: "Internal Links",
    category: "app",
    requiresAuth: true,
    crawlable: false,
    description: "Internal linking structure analysis",
  },
  {
    path: "/app/audits/speed",
    name: "Page Speed",
    category: "app",
    requiresAuth: true,
    crawlable: false,
    description: "Performance metrics and diagnostics",
  },
  {
    path: "/app/audits/vitals",
    name: "Core Web Vitals",
    category: "app",
    requiresAuth: true,
    crawlable: false,
    description: "Web Vitals metrics",
  },

  // Rank Intelligence
  {
    path: "/app/rank-tracking",
    name: "Rank Tracking",
    category: "app",
    requiresAuth: true,
    crawlable: true,
    description: "Keyword position tracking",
  },
  {
    path: "/app/position-tracking",
    name: "Position Tracking",
    category: "app",
    requiresAuth: true,
    crawlable: true,
    description: "SERP position analysis",
  },

  // Intelligence Features
  {
    path: "/app/keyword-research",
    name: "Keyword Research",
    category: "app",
    requiresAuth: true,
    crawlable: true,
    description: "Find new keyword opportunities",
  },
  {
    path: "/app/backlinks",
    name: "Backlinks",
    category: "app",
    requiresAuth: true,
    crawlable: true,
    description: "Backlink analysis",
  },
  {
    path: "/app/competitors",
    name: "Competitor Intelligence",
    category: "app",
    requiresAuth: true,
    crawlable: true,
    description: "Competitor analysis",
  },

  // Settings & Account
  {
    path: "/app/settings",
    name: "Settings",
    category: "app",
    requiresAuth: true,
    crawlable: true,
    description: "Account and app settings",
  },
  {
    path: "/app/account",
    name: "Account",
    category: "app",
    requiresAuth: true,
    crawlable: true,
    description: "Account profile",
  },
  {
    path: "/app/integrations",
    name: "Integrations",
    category: "app",
    requiresAuth: true,
    crawlable: true,
    description: "Third-party integrations",
  },
  {
    path: "/app/reports",
    name: "Reports",
    category: "app",
    requiresAuth: true,
    crawlable: true,
    description: "Custom reports",
  },
  {
    path: "/app/action-center",
    name: "Action Center",
    category: "app",
    requiresAuth: true,
    crawlable: true,
    description: "Actionable optimization tasks",
  },
];

// ── API Routes (Backend) ─────────────────────────────────────────────────
export const API_ROUTES: RouteConfig[] = [
  // Auth APIs
  {
    path: "/api/auth/signin",
    name: "Sign In API",
    category: "api",
    requiresAuth: false,
  },
  {
    path: "/api/auth/callback/credentials",
    name: "Credentials Callback",
    category: "api",
    requiresAuth: false,
  },
  {
    path: "/api/auth/callback/google",
    name: "Google OAuth Callback",
    category: "api",
    requiresAuth: false,
  },
  {
    path: "/api/auth/session",
    name: "Get Session",
    category: "api",
    requiresAuth: true,
  },
  {
    path: "/api/auth/signout",
    name: "Sign Out",
    category: "api",
    requiresAuth: true,
  },

  // User APIs
  {
    path: "/api/user/plan",
    name: "Get User Plan",
    category: "api",
    requiresAuth: true,
  },
  {
    path: "/api/user/profile",
    name: "Get User Profile",
    category: "api",
    requiresAuth: true,
  },

  // Project APIs
  {
    path: "/api/projects",
    name: "List/Create Projects",
    category: "api",
    requiresAuth: true,
  },
  {
    path: "/api/projects/[id]",
    name: "Get/Update/Delete Project",
    category: "api",
    requiresAuth: true,
    isDynamic: true,
  },

  // Audit APIs
  {
    path: "/api/audits/data",
    name: "Get Audit Data",
    category: "api",
    requiresAuth: true,
  },
  {
    path: "/api/audits/free",
    name: "Free Audit",
    category: "api",
    requiresAuth: false,
  },

  // Crawl APIs
  {
    path: "/api/crawl/full/start",
    name: "Start Full Crawl",
    category: "api",
    requiresAuth: true,
  },
  {
    path: "/api/crawl/full/next",
    name: "Get Next Crawl Page",
    category: "api",
    requiresAuth: true,
  },
  {
    path: "/api/crawl/full/status",
    name: "Get Crawl Status",
    category: "api",
    requiresAuth: true,
  },

  // Rank Tracking APIs
  {
    path: "/api/rank/keywords",
    name: "Manage Rank Keywords",
    category: "api",
    requiresAuth: true,
  },
  {
    path: "/api/rank/keywords/[id]",
    name: "Delete Rank Keyword",
    category: "api",
    requiresAuth: true,
    isDynamic: true,
  },
  {
    path: "/api/rank/history",
    name: "Get Rank History",
    category: "api",
    requiresAuth: true,
  },
  {
    path: "/api/rank/visibility",
    name: "Get Visibility Score",
    category: "api",
    requiresAuth: true,
  },
  {
    path: "/api/rank/overview",
    name: "Get Rank Overview",
    category: "api",
    requiresAuth: true,
  },

  // Keyword Research APIs
  {
    path: "/api/keywords/research",
    name: "Keyword Research",
    category: "api",
    requiresAuth: true,
  },

  // Backlinks APIs
  {
    path: "/api/backlinks",
    name: "Get Backlinks",
    category: "api",
    requiresAuth: true,
  },

  // Competitors APIs
  {
    path: "/api/competitors",
    name: "Get Competitors",
    category: "api",
    requiresAuth: true,
  },

  // Internal Links APIs
  {
    path: "/api/internal-links",
    name: "Get Internal Links",
    category: "api",
    requiresAuth: true,
  },

  // Action Center APIs
  {
    path: "/api/action-center/tasks",
    name: "Get Action Center Tasks",
    category: "api",
    requiresAuth: true,
  },

  // Payment APIs
  {
    path: "/api/payment/create-link",
    name: "Create Payment Link",
    category: "api",
    requiresAuth: true,
  },
  {
    path: "/api/webhooks/razorpay",
    name: "Razorpay Webhook",
    category: "api",
    requiresAuth: false,
  },

  // Activity APIs
  {
    path: "/api/activity",
    name: "Get Activity Log",
    category: "api",
    requiresAuth: true,
  },

  // Cron APIs
  {
    path: "/api/cron/rank-update",
    name: "Cron: Rank Update",
    category: "api",
    requiresAuth: false,
  },
  {
    path: "/api/cron/rank-report",
    name: "Cron: Rank Report",
    category: "api",
    requiresAuth: false,
  },
];

// ── Aggregate all routes ────────────────────────────────────────────────
export const ALL_ROUTES: RouteConfig[] = [
  ...MARKETING_ROUTES,
  ...AUTH_ROUTES,
  ...APP_ROUTES,
  ...API_ROUTES,
];

// ── Route filtering helpers ─────────────────────────────────────────────
export function getRoutesByCategory(category: RouteConfig["category"]) {
  return ALL_ROUTES.filter((r) => r.category === category);
}

export function getCrawlableRoutes() {
  return ALL_ROUTES.filter((r) => r.crawlable !== false);
}

export function getPublicRoutes() {
  return ALL_ROUTES.filter((r) => !r.requiresAuth);
}

export function getAuthenticatedRoutes() {
  return ALL_ROUTES.filter((r) => r.requiresAuth);
}

export function getApiRoutes() {
  return getRoutesByCategory("api");
}

export function getPageRoutes() {
  return ALL_ROUTES.filter((r) => r.category !== "api");
}
