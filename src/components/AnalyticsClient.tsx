"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pageview } from "@/lib/analytics";

/**
 * Renders nothing. Listens to pathname/search and triggers pageview on route change.
 * Tracks hash navigation (e.g. /#features) via hashchange.
 * Mount in layout.tsx body so SPA navigations are tracked.
 */
export function AnalyticsClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const search = searchParams?.toString() ? `?${searchParams.toString()}` : "";
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    pageview(pathname + search + hash);
  }, [pathname, searchParams]);

  useEffect(() => {
    const onHashChange = () => {
      const path = typeof window !== "undefined"
        ? window.location.pathname + (window.location.search || "") + (window.location.hash || "")
        : "/";
      pageview(path);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return null;
}
