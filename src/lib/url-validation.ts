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
 * Strips a raw hostname string down to a safe, valid domain.
 * - Lowercases
 * - Removes port (":3000")
 * - Strips invalid hostname characters
 * - Collapses repeated dots, trims leading/trailing dots
 * - Enforces RFC 253-char max
 */
function sanitiseDomain(raw: string): string {
  return raw
    .toLowerCase()
    .split(":")[0]                    // strip port
    .replace(/[^a-z0-9._-]/g, "")    // only valid hostname chars
    .replace(/\.{2,}/g, ".")          // collapse repeated dots
    .replace(/^\.+|\.+$/g, "")        // strip leading/trailing dots
    .slice(0, 253);
}

/**
 * Returns true if the extracted domain looks like a real hostname.
 * Requires at least one dot and only valid label characters.
 */
export function isValidExtractedDomain(domain: string): boolean {
  if (!domain || domain.length < 3 || domain.length > 253) return false;
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain);
}

/**
 * Extracts the audit target domain from any user input:
 * - Plain domain:        "github.com"             → "github.com"
 * - Full URL:            "https://github.com"      → "github.com"
 * - Protocol-relative:  "//github.com"            → "github.com"
 * - www prefix:         "www.github.com"           → "github.com"
 * - With port:          "github.com:3000"          → "github.com"
 * - Report URL:         "rankypulse.com/report/github.com" → "github.com"
 * - Full report URL:    "https://rankypulse.com/report/github.com" → "github.com"
 */
export function extractAuditDomain(value: string): string {
  // Cap input to prevent abuse
  const trimmed = value.trim().slice(0, 2048);
  if (!trimmed) return "";

  // Normalise protocol-relative URLs so new URL() can parse them
  const withProtocol = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;

  try {
    const u = new URL(withProtocol);
    // Only trust the parse for real http/https URLs — other "protocols"
    // (e.g. "github.com:" from bare "github.com:3000") fall through to manual stripping.
    if (u.protocol === "http:" || u.protocol === "https:") {
      const reportMatch = u.pathname.match(/^\/report\/([^/?#]+)/);
      const raw = reportMatch ? reportMatch[1] : u.hostname;
      return sanitiseDomain(raw.replace(/^www\./, ""));
    }
  } catch {
    // fall through
  }

  // Fallback: manual stripping for inputs without an http/https protocol
  const withoutProtocol = trimmed
    .replace(/^https?:\/\//, "")
    .replace(/^\/\//, "")
    .replace(/^www\./, "");
  const reportMatch = withoutProtocol.match(/^[^/?#]+\/report\/([^/?#]+)/);
  const raw = reportMatch
    ? reportMatch[1]
    : withoutProtocol.replace(/[/?#].*$/, "");
  return sanitiseDomain(raw);
}
