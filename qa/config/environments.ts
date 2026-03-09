/**
 * /qa/config/environments.ts
 *
 * Environment-specific configuration for QA testing
 * Handles: staging, production, and local development
 */

export type Environment = "local" | "staging" | "production";

export interface EnvironmentConfig {
  name: Environment;
  baseUrl: string;
  apiBaseUrl: string;
  isProduction: boolean;
  timeout: number;
  retries: number;
  slowmo?: number; // Playwright: slow down actions (ms)
  headless: boolean;
  videoRecord: boolean;
  screenshotOnFailure: boolean;
}

export const ENVIRONMENTS: Record<Environment, EnvironmentConfig> = {
  local: {
    name: "local",
    baseUrl: "http://localhost:3000",
    apiBaseUrl: "http://localhost:3000/api",
    isProduction: false,
    timeout: 10000,
    retries: 2,
    slowmo: 0,
    headless: true,
    videoRecord: false,
    screenshotOnFailure: true,
  },
  staging: {
    name: "staging",
    baseUrl: "https://staging.rankypulse.com",
    apiBaseUrl: "https://staging.rankypulse.com/api",
    isProduction: false,
    timeout: 15000,
    retries: 3,
    slowmo: 100,
    headless: true,
    videoRecord: true,
    screenshotOnFailure: true,
  },
  production: {
    name: "production",
    baseUrl: "https://rankypulse.com",
    apiBaseUrl: "https://rankypulse.com/api",
    isProduction: true,
    timeout: 20000,
    retries: 3,
    slowmo: 0,
    headless: true,
    videoRecord: false,
    screenshotOnFailure: true,
  },
};

export function getEnvironmentConfig(env?: Environment): EnvironmentConfig {
  const selected =
    env ||
    (process.env.QA_ENV as Environment) ||
    (process.env.VERCEL_ENV === "production"
      ? "production"
      : process.env.VERCEL_ENV === "preview"
      ? "staging"
      : "local");

  return ENVIRONMENTS[selected] || ENVIRONMENTS.local;
}

export const DEFAULT_ENV = getEnvironmentConfig();
