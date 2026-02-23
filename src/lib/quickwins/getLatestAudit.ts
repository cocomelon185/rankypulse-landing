/**
 * Fetches the latest audit for a site.
 * Currently reads from sessionStorage (client-side).
 * TODO: Add API endpoint to fetch audit by site when available.
 */

const AUDIT_RESULT_KEY = "rankypulse_audit_result";

export type AuditData = {
  url?: string;
  hostname?: string;
  issues?: Array<{
    id?: string;
    sev?: string;
    msg?: string;
    title?: string;
    severity?: string;
  }>;
  checks?: Record<string, unknown>;
  score?: number;
  scores?: { seo?: number };
};

function getHostname(url: string): string {
  try {
    return new URL(url).hostname || "";
  } catch {
    return "";
  }
}

/**
 * Get latest audit. If site is provided, only return audit if hostname matches.
 * If site is empty, return the stored audit (for single-audit flow).
 */
export function getLatestAudit(site?: string): AuditData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(AUDIT_RESULT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const url = String(parsed?.url ?? "");

    if (site && site.trim()) {
      const auditHost = getHostname(url);
      const siteNorm = site.replace(/^https?:\/\//i, "").split("/")[0].toLowerCase();
      const auditHostNorm = auditHost.toLowerCase();
      if (siteNorm !== auditHostNorm && !auditHostNorm.endsWith(`.${siteNorm}`) && !siteNorm.endsWith(`.${auditHostNorm}`)) {
        return null;
      }
    }

    const hostname = url ? getHostname(url) : String(parsed?.hostname ?? "");

    const issues = Array.isArray(parsed?.issues)
      ? parsed.issues.map((i: Record<string, unknown>) => ({
          id: i.id != null ? String(i.id) : undefined,
          sev: i.sev != null ? String(i.sev) : undefined,
          msg: i.msg != null ? String(i.msg) : undefined,
          title: i.title != null ? String(i.title) : undefined,
          severity: i.severity != null ? String(i.severity) : undefined,
        }))
      : [];

    return {
      url,
      hostname: hostname || undefined,
      issues,
      checks: parsed?.checks as Record<string, unknown> | undefined,
      score: typeof parsed?.score === "number" ? parsed.score : undefined,
      scores: parsed?.scores as { seo?: number } | undefined,
    };
  } catch {
    return null;
  }
}
