/**
 * URL validation for audit and similar inputs.
 * Must be valid http/https.
 */

const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

export function isValidAuditUrl(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const u = new URL(trimmed);
    return (u.protocol === "http:" || u.protocol === "https:") && URL_REGEX.test(trimmed);
  } catch {
    return false;
  }
}

export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (/^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * Extracts the audit target domain from user input.
 * Handles plain domains, full URLs, and /report/[domain] URLs
 * (e.g. https://rankypulse.com/report/github.com → "github.com").
 */
export function extractAuditDomain(value: string): string {
  const trimmed = value.trim();
  try {
    const u = new URL(trimmed);
    const reportMatch = u.pathname.match(/^\/report\/([^/?#]+)/);
    if (reportMatch) return reportMatch[1].toLowerCase();
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    const withoutProtocol = trimmed.replace(/^https?:\/\//, "").replace(/^www\./, "");
    const reportMatch = withoutProtocol.match(/^[^/]+\/report\/([^/?#]+)/);
    if (reportMatch) return reportMatch[1].toLowerCase();
    return withoutProtocol.replace(/\/.*$/, "").toLowerCase();
  }
}
