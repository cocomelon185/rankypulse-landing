/**
 * Strips protocol, www prefix, and trailing slashes from a URL/domain string.
 * Returns a clean, lowercase bare domain (e.g. "linear.app").
 */
export function normalizeDomain(input: string): string {
    return input
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/+$/, "")
        .toLowerCase()
        .trim();
}
