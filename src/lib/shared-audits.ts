import { supabaseAdmin } from "@/lib/supabase";

export const SHARED_AUDIT_STATUSES = [
  "pending",
  "crawling",
  "completed",
  "failed",
] as const;

export type SharedAuditStatus = (typeof SHARED_AUDIT_STATUSES)[number];

export interface SharedAuditJob {
  id: string;
  domain: string;
  status: SharedAuditStatus;
  created_at: string;
  updated_at: string | null;
  pages_crawled: number | null;
  pages_limit?: number | null;
  current_url?: string | null;
  last_error?: string | null;
}

function normalizeDomainForAudit(input: string): string {
  return input
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .toLowerCase()
    .trim();
}

export async function getAccessibleAuditDomainsForUser(userId: string): Promise<string[]> {
  const { data } = await supabaseAdmin
    .from("crawl_jobs")
    .select("domain")
    .eq("user_id", userId)
    .in("status", [...SHARED_AUDIT_STATUSES])
    .order("created_at", { ascending: false });

  const seen = new Set<string>();
  const domains: string[] = [];

  for (const row of data ?? []) {
    const domain = normalizeDomainForAudit(row.domain);
    if (!domain || domain === "undefined" || seen.has(domain)) continue;
    seen.add(domain);
    domains.push(domain);
  }

  return domains;
}

export async function getLatestSharedAuditJobsForDomains(
  domains: string[],
  statuses: readonly SharedAuditStatus[] = SHARED_AUDIT_STATUSES
): Promise<Map<string, SharedAuditJob>> {
  const normalizedDomains = [...new Set(domains.map(normalizeDomainForAudit).filter(Boolean))];
  if (normalizedDomains.length === 0) {
    return new Map();
  }

  const { data } = await supabaseAdmin
    .from("crawl_jobs")
    .select("id, domain, status, created_at, updated_at, pages_crawled, pages_limit, current_url, last_error")
    .in("domain", normalizedDomains)
    .in("status", [...statuses])
    .order("created_at", { ascending: false });

  const jobs = new Map<string, SharedAuditJob>();
  for (const row of data ?? []) {
    const domain = normalizeDomainForAudit(row.domain);
    if (!domain || jobs.has(domain)) continue;
    jobs.set(domain, {
      id: row.id,
      domain,
      status: row.status as SharedAuditStatus,
      created_at: row.created_at,
      updated_at: row.updated_at ?? null,
      pages_crawled: row.pages_crawled ?? null,
      pages_limit: row.pages_limit ?? null,
      current_url: (row as Record<string, unknown>).current_url as string | null | undefined,
      last_error: (row as Record<string, unknown>).last_error as string | null | undefined,
    });
  }

  return jobs;
}

export async function getLatestSharedAuditJobForDomain(
  domain: string,
  statuses: readonly SharedAuditStatus[] = SHARED_AUDIT_STATUSES
): Promise<SharedAuditJob | null> {
  const jobs = await getLatestSharedAuditJobsForDomains([domain], statuses);
  const normalizedDomain = normalizeDomainForAudit(domain);
  return jobs.get(normalizedDomain) ?? null;
}

export async function resolveSharedAuditContext(
  userId: string,
  requestedDomain?: string | null,
  statuses: readonly SharedAuditStatus[] = SHARED_AUDIT_STATUSES
): Promise<{
  allDomains: string[];
  targetDomain: string | null;
  latestJob: SharedAuditJob | null;
}> {
  const allDomains = await getAccessibleAuditDomainsForUser(userId);
  const normalizedRequested = requestedDomain ? normalizeDomainForAudit(requestedDomain) : null;

  if (allDomains.length === 0) {
    return { allDomains, targetDomain: normalizedRequested, latestJob: null };
  }

  if (normalizedRequested) {
    if (!allDomains.includes(normalizedRequested)) {
      return { allDomains, targetDomain: normalizedRequested, latestJob: null };
    }

    return {
      allDomains,
      targetDomain: normalizedRequested,
      latestJob: await getLatestSharedAuditJobForDomain(normalizedRequested, statuses),
    };
  }

  const sharedJobs = await getLatestSharedAuditJobsForDomains(allDomains, statuses);
  const targetDomain = allDomains.find((domain) => sharedJobs.has(domain)) ?? allDomains[0] ?? null;

  return {
    allDomains,
    targetDomain,
    latestJob: targetDomain ? sharedJobs.get(targetDomain) ?? null : null,
  };
}
