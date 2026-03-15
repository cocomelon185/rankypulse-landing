"use client";

import { useEffect } from "react";

export function CanonicalFixer() {
  useEffect(() => {
    // Ensure only ONE canonical tag exists (prevents duplicate_canonical issues)
    const canonicalLinks = document.querySelectorAll('link[rel="canonical"]');

    if (canonicalLinks.length > 1) {
      // Multiple canonicals found - remove all but the first one
      // The first one is typically set by Next.js metadata API
      for (let i = 1; i < canonicalLinks.length; i++) {
        canonicalLinks[i].remove();
      }
    }

    // If no canonical exists, create one based on current URL
    if (canonicalLinks.length === 0) {
      const pathName = window.location.pathname;
      const search = window.location.search;

      // Construct canonical URL (normalize to www)
      let domain = "rankypulse.com";
      if (window.location.hostname === "www.rankypulse.com") {
        domain = "www.rankypulse.com";
      } else if (window.location.hostname !== "rankypulse.com") {
        domain = window.location.hostname;
      } else {
        domain = "www.rankypulse.com";
      }

      const canonicalUrl = `https://${domain}${pathName}${search}`;
      const newLink = document.createElement("link");
      newLink.rel = "canonical";
      newLink.href = canonicalUrl;
      document.head.appendChild(newLink);
    }
  }, []);

  return null; // This component doesn't render anything
}
