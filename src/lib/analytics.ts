/**
 * Lightweight analytics wrapper. Captures funnel metrics without breaking the app.
 * - Development: console.log
 * - Production: PostHog (if NEXT_PUBLIC_POSTHOG_KEY) or gtag (if NEXT_PUBLIC_GA_ID)
 * - Otherwise: no-op
 */

/** Extract hostname only; never store full URLs or query strings. */
export function toSafeDomain(urlOrDomain: string): string {
  try {
    const u = new URL(urlOrDomain.startsWith("http") ? urlOrDomain : `https://${urlOrDomain}`);
    return u.hostname;
  } catch {
    return "unknown";
  }
}

type TrackProps = Record<string, string | number | boolean | undefined>;

function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

/** Send to PostHog (minimal client). */
function sendPostHog(eventName: string, props?: TrackProps): void {
  try {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || typeof window === "undefined") return;
    // Use global PostHog if loaded by snippet
    const ph = (window as unknown as { posthog?: { capture: (e: string, p?: TrackProps) => void } }).posthog;
    if (ph?.capture) ph.capture(eventName, props);
  } catch {
    // Silent fail
  }
}

/** Send to gtag. */
function sendGtag(eventName: string, props?: TrackProps): void {
  try {
    const id = process.env.NEXT_PUBLIC_GA_ID;
    if (!id || typeof window === "undefined") return;
    const gtag = (window as unknown as { gtag?: (a: string, b: string, c: TrackProps) => void }).gtag;
    if (gtag) gtag("event", eventName, props ?? {});
  } catch {
    // Silent fail
  }
}

/**
 * Track an analytics event.
 * Uses hostname/domain only; never stores full URLs or query strings.
 */
export function track(eventName: string, props?: TrackProps): void {
  // Don't leak full URLs into props
  const safeProps = props
    ? Object.fromEntries(
        Object.entries(props).filter(
          ([, v]) => v !== undefined && v !== null && String(v).length > 0
        )
      ) as TrackProps
    : undefined;

  if (isDev()) {
    // eslint-disable-next-line no-console
    console.log("[analytics]", eventName, safeProps ?? {});
    return;
  }

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  if (key) {
    sendPostHog(eventName, safeProps);
  } else if (gaId) {
    sendGtag(eventName, safeProps);
  }
  // else: no-op (silent)
}
