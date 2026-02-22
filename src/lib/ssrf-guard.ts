/**
 * SSRF guard: block localhost, private IPs, and internal hosts.
 */

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "0.0.0.0",
  "[::1]",
]);

const PRIVATE_CIDR = [
  /^10\./,                    // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
  /^192\.168\./,              // 192.168.0.0/16
  /^169\.254\./,              // link-local
  /^127\./,                   // loopback
];

export function isUrlBlocked(url: URL): boolean {
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (BLOCKED_HOSTS.has(host)) return true;
  const parts = host.split(".");
  const ip = parts.length === 4 ? host : null;
  if (ip) {
    if (PRIVATE_CIDR.some((re) => re.test(ip))) return true;
  }
  if (host.endsWith(".local") || host.endsWith(".internal")) return true;
  return false;
}
