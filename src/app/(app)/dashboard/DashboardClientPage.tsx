/**
 * Legacy shim — the dashboard has been fully replaced.
 * page.tsx now imports DashboardClient directly from @/components/dashboard/DashboardClient.
 * This file is kept to avoid breaking any stale dynamic imports.
 */
export { DashboardClient as default } from "@/components/dashboard/DashboardClient";
