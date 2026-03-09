/**
 * /qa/playwright/helpers/selectors.ts
 *
 * Centralized CSS/Playwright locators for the RankyPulse UI.
 * Single source of truth — update once if the UI changes.
 *
 * Uses Playwright locator strategies in priority order:
 * 1. data-testid (most stable)
 * 2. ARIA role + accessible name
 * 3. CSS selector (last resort)
 */

// ── Navigation ────────────────────────────────────────────────────────────────
export const NAV = {
  topbar: "header, nav",
  logo: "[data-testid='logo'], a[href='/']",
  mobileMenuToggle: "[data-testid='mobile-menu'], button[aria-label*='menu']",
  signInLink: "a[href='/auth/signin']",
  signUpLink: "a[href='/auth/signup']",
  pricingLink: "a[href='/pricing']",
};

// ── Auth forms ────────────────────────────────────────────────────────────────
// NOTE: The sign-in page uses type="text" with autocomplete="username"
// (not type="email"). Selectors ordered from most-specific to fallback.
export const AUTH = {
  emailInput: [
    "input[autocomplete='username']",
    "input[placeholder*='email' i]",
    "input[placeholder*='username' i]",
    "input[type='email']",
    "input[name='email']",
  ].join(", "),
  passwordInput: [
    "input[type='password']",
    "input[autocomplete='current-password']",
    "input[autocomplete='new-password']",
    "input[name='password']",
  ].join(", "),
  nameInput: "input[name='name'], input[placeholder*='name' i]",
  submitButton: "button[type='submit']",
  signInButton: [
    "button:has-text('Sign in with password')",
    "button:has-text('Sign in')",
    "button:has-text('Log in')",
    "[data-testid='signin-btn']",
  ].join(", "),
  signUpButton: [
    "button:has-text('Sign up')",
    "button:has-text('Create account')",
    "[data-testid='signup-btn']",
  ].join(", "),
  googleOauthButton: "button:has-text('Google'), [data-testid='google-signin']",
  magicLinkButton: [
    "button:has-text('Email me')",
    "button:has-text('Magic')",
    "[data-testid='magic-link-btn']",
  ].join(", "),
  errorMessage: "[data-testid='auth-error'], .text-red-400, [role='alert']",
  successMessage: "[data-testid='auth-success'], .text-green-400",
  forgotPasswordLink: "a:has-text('Forgot'), a[href*='forgot']",
};

// ── App Shell / Dashboard ─────────────────────────────────────────────────────
export const APP = {
  sidebar: "[data-testid='sidebar'], aside, nav[aria-label*='sidebar' i]",
  sidebarLinks: "aside a, nav[aria-label*='sidebar' i] a",
  mainContent: "main, [data-testid='main-content']",
  pageHeading: "h1",
  loadingSpinner: "[data-testid='loading'], .animate-spin, [aria-busy='true']",
  errorBanner: "[data-testid='error'], .text-red-400, [role='alert']",
  userMenu: "[data-testid='user-menu'], button[aria-label*='user' i]",
  signOutButton: "button:has-text('Sign out'), button:has-text('Logout'), [data-testid='signout']",
};

// ── Audit section ─────────────────────────────────────────────────────────────
export const AUDIT = {
  urlInput: "input[type='url'], input[placeholder*='url' i], input[name='url']",
  startAuditButton: "button:has-text('Audit'), button:has-text('Analyze'), [data-testid='start-audit']",
  auditResults: "[data-testid='audit-results'], .audit-results",
  issuesList: "[data-testid='issues-list']",
  scoreCircle: "[data-testid='score'], .score",
};

// ── Rank Tracking ─────────────────────────────────────────────────────────────
export const RANK = {
  addKeywordButton: "button:has-text('Add keyword'), button:has-text('Track'), [data-testid='add-keyword']",
  keywordInput: "input[placeholder*='keyword' i], input[name='keyword']",
  keywordModal: "[data-testid='keyword-modal'], [role='dialog']",
  keywordList: "[data-testid='keyword-list'], table",
  trackKeywordSubmit: "[data-testid='track-keyword-submit'], button[type='submit']:has-text('Track')",
};

// ── Projects ──────────────────────────────────────────────────────────────────
export const PROJECTS = {
  createProjectButton: "button:has-text('New project'), button:has-text('Create'), [data-testid='create-project']",
  projectCard: "[data-testid='project-card'], .project-card",
  projectList: "[data-testid='project-list']",
  deleteProjectButton: "button[aria-label*='delete' i], [data-testid='delete-project']",
};

// ── Pricing page ──────────────────────────────────────────────────────────────
export const PRICING = {
  planCard: "[data-testid='plan-card'], .plan-card",
  upgradeButton: "button:has-text('Upgrade'), button:has-text('Get started'), [data-testid='upgrade-btn']",
  freeTrialButton: "button:has-text('Free'), button:has-text('Start free'), [data-testid='free-plan-btn']",
  pricingToggle: "[data-testid='billing-toggle'], button:has-text('Annual'), button:has-text('Monthly')",
};

// ── Modals ────────────────────────────────────────────────────────────────────
export const MODAL = {
  container: "[role='dialog'], [data-testid='modal']",
  closeButton: "button[aria-label='Close'], [data-testid='modal-close'], button:has-text('×')",
  confirmButton: "button:has-text('Confirm'), button:has-text('Yes'), [data-testid='confirm-btn']",
  cancelButton: "button:has-text('Cancel'), [data-testid='cancel-btn']",
};

// ── Onboarding ────────────────────────────────────────────────────────────────
export const ONBOARDING = {
  modal: "[data-testid='onboarding-modal'], [role='dialog']:has-text('Get started')",
  closeButton: "button[aria-label='Close'], [data-testid='onboarding-close']",
  skipButton: "button:has-text('Skip'), [data-testid='skip-onboarding']",
};

// ── Toast notifications ───────────────────────────────────────────────────────
export const TOAST = {
  container: "[data-testid='toast'], [role='status'], .toast",
  success: ".toast-success, [data-type='success']",
  error: ".toast-error, [data-type='error']",
};
