/**
 * GA4 / analytics wrapper (client-safe).
 * - No-op if window is undefined or NEXT_PUBLIC_GA_ID is missing
 * - Also supports PostHog if NEXT_PUBLIC_POSTHOG_KEY is set
 *
 * Conversion events (buffered locally for dashboard):
 *   audit_results_view, fix_button_click, roadmap_cta_click, modal_open,
 *   modal_continue, email_submit_clicked, email_submit_success, email_submit_error,
 *   pricing_view, checkout_start
 *
 * Other events:
 *   auth_click, sign_up, login, run_audit, upgrade_click
 */

const BUFFER_KEY = "rp_analytics_events_v1";
const VARIANT_KEY = "rp_variant_v1";
const BUFFER_SIZE = 200;

const SENSITIVE_KEYS = new Set(["email", "userEmail", "toEmail"]);
const URL_KEYS = new Set(["url", "finalUrl", "url_host", "url_domain"]);
const MAX_STRING_LEN = 120;

export type BufferedEvent = {
  name: string;
  ts: number;
  payload: Record<string, string | number | boolean>;
};

type TrackProps = Record<string, string | number | boolean | undefined>;

/** Extract hostname only; never store full URLs or query strings. */
export function toSafeDomain(urlOrDomain: string): string {
  try {
    const u = new URL(urlOrDomain.startsWith("http") ? urlOrDomain : `https://${urlOrDomain}`);
    return u.hostname;
  } catch {
    return "unknown";
  }
}

function isClient(): boolean {
  return typeof window !== "undefined";
}

/** Safe flag: when true, new conversion UI (variant B) is the default. Set to false to roll back. */
export const AUDIT_CONVERSION_VARIANT_B_DEFAULT = true;

/**
 * Get current A/B variant ("a" | "b"). Default "a" unless AUDIT_CONVERSION_VARIANT_B_DEFAULT.
 * Read from localStorage key rp_variant_v1. No PII.
 */
export function getVariant(): "a" | "b" {
  if (!isClient()) return AUDIT_CONVERSION_VARIANT_B_DEFAULT ? "b" : "a";
  try {
    const v = localStorage.getItem(VARIANT_KEY);
    if (v === "a" || v === "b") return v;
  } catch {
    // ignore
  }
  return AUDIT_CONVERSION_VARIANT_B_DEFAULT ? "b" : "a";
}

/**
 * If URL has ?variant=a|b, persist to localStorage. Call on audit results page mount.
 */
export function initVariantFromSearchParams(params: URLSearchParams | null): void {
  if (!params || !isClient()) return;
  const v = params.get("variant");
  if (v === "a" || v === "b") {
    try {
      localStorage.setItem(VARIANT_KEY, v);
    } catch {
      // ignore
    }
  }
}

function getGaId(): string | undefined {
  return process.env.NEXT_PUBLIC_GA_ID;
}

function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

function truncate(val: string): string {
  if (typeof val !== "string") return String(val);
  return val.length > MAX_STRING_LEN ? val.slice(0, MAX_STRING_LEN) + "…" : val;
}

function isJsonSafe(val: unknown): val is string | number | boolean {
  return val === null || typeof val === "string" || typeof val === "number" || typeof val === "boolean";
}

/**
 * Sanitize payload: remove emails, simplify URLs to hostname, truncate strings, primitives only.
 */
function sanitizePayload(params?: TrackProps): Record<string, string | number | boolean> {
  if (!params || typeof params !== "object") return {};

  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (SENSITIVE_KEYS.has(k)) continue;
    if (v === undefined || v === null || String(v).length === 0) continue;
    if (!isJsonSafe(v)) continue;

    let safe: string | number | boolean = v as string | number | boolean;
    if (typeof safe === "string") {
      if (URL_KEYS.has(k) || k.toLowerCase().includes("url")) {
        try {
          safe = toSafeDomain(safe);
        } catch {
          safe = truncate(safe);
        }
      } else {
        safe = truncate(safe);
      }
    }
    out[k] = safe;
  }
  return out;
}

// In-memory ring buffer (client-only)
let buffer: BufferedEvent[] = [];
const eventTarget = typeof EventTarget !== "undefined" ? new EventTarget() : null;

function loadFromStorage(): BufferedEvent[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(BUFFER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BufferedEvent[];
    return Array.isArray(parsed) ? parsed.slice(-BUFFER_SIZE) : [];
  } catch {
    return [];
  }
}

function saveToStorage(events: BufferedEvent[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(BUFFER_KEY, JSON.stringify(events));
  } catch {
    // localStorage full or disabled
  }
}

function appendToBuffer(name: string, payload: Record<string, string | number | boolean>): void {
  const ev: BufferedEvent = { name, ts: Date.now(), payload };
  buffer.push(ev);
  if (buffer.length > BUFFER_SIZE) buffer = buffer.slice(-BUFFER_SIZE);
  saveToStorage(buffer);
  eventTarget?.dispatchEvent(new CustomEvent("rp_analytics_update", { detail: ev }));
}

/** Initialize buffer from localStorage on first client use. */
if (isClient()) {
  buffer = loadFromStorage();
}

/** Get all buffered events (last 200). */
export function getBufferedEvents(): BufferedEvent[] {
  if (!isClient()) return [];
  if (buffer.length === 0) buffer = loadFromStorage();
  return [...buffer];
}

/** Clear buffer and localStorage. */
export function clearBufferedEvents(): void {
  buffer = [];
  if (isClient()) {
    try {
      localStorage.removeItem(BUFFER_KEY);
    } catch {
      // ignore
    }
    eventTarget?.dispatchEvent(new CustomEvent("rp_analytics_update"));
  }
}

/** Subscribe to new events (for live dashboard updates). Returns unsubscribe fn. */
export function subscribe(listener: () => void): () => void {
  if (!eventTarget) return () => {};
  eventTarget.addEventListener("rp_analytics_update", listener);
  return () => eventTarget.removeEventListener("rp_analytics_update", listener);
}

/** Send page view to GA. No-op if not in browser or GA id missing. */
export function pageview(url?: string): void {
  if (!isClient() || !getGaId()) return;
  try {
    const gtag = (window as unknown as { gtag?: (a: string, b: string, c?: Record<string, string>) => void }).gtag;
    if (!gtag) return;
    const pagePath = url ?? (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/");
    gtag("config", getGaId()!, { page_path: pagePath });
  } catch {
    // Silent fail
  }
}

/** Send to PostHog (minimal client). */
function sendPostHog(eventName: string, props?: TrackProps): void {
  try {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || !isClient()) return;
    const ph = (window as unknown as { posthog?: { capture: (e: string, p?: TrackProps) => void } }).posthog;
    if (ph?.capture) ph.capture(eventName, props);
  } catch {
    // Silent fail
  }
}

/** Send to gtag. */
function sendGtag(eventName: string, props?: TrackProps): void {
  try {
    const id = getGaId();
    if (!id || !isClient()) return;
    const gtag = (window as unknown as { gtag?: (a: string, b: string, c: TrackProps) => void }).gtag;
    if (gtag) gtag("event", eventName, props ?? {});
  } catch {
    // Silent fail
  }
}

/**
 * Track an analytics event.
 * - Sanitizes payload (no emails, hostname-only URLs, truncated strings)
 * - Appends to in-memory buffer + localStorage (last 200)
 * - Forwards to gtag if available, else console.log fallback
 * Works even when GA/PostHog are not configured.
 */
export function track(eventName: string, params?: TrackProps): void {
  const rawParams = params
    ? Object.fromEntries(
        Object.entries(params).filter(
          ([, v]) => v !== undefined && v !== null && String(v).length > 0
        )
      ) as TrackProps
    : undefined;

  const variant = getVariant();
  const sanitized = { ...sanitizePayload(rawParams), variant };

  // Always buffer and persist (client-side)
  if (isClient()) {
    appendToBuffer(eventName, sanitized);
  }

  if (isDev()) {
    // eslint-disable-next-line no-console
    console.log("[analytics]", eventName, sanitized);
    return; // Don't send to GA/PostHog in dev to avoid polluting
  }

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const gaId = getGaId();
  const paramsWithVariant = { ...rawParams, variant };
  if (key && isClient()) sendPostHog(eventName, paramsWithVariant);
  if (gaId && isClient()) sendGtag(eventName, paramsWithVariant);
}

// Dev-only console helper
if (isClient() && isDev()) {
  (window as unknown as { __rp_events?: () => BufferedEvent[] }).__rp_events = getBufferedEvents;
}
