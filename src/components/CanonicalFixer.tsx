"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function CanonicalFixer() {
  const router = useRouter();

  useEffect(() => {
    const handleCanonical = () => {
      // Get the current URL path (without origin)
      const pathName = window.location.pathname;
      const search = window.location.search;

      // Construct canonical URL (always use www prefix)
      let domain = "rankypulse.com";
      if (window.location.hostname === "www.rankypulse.com") {
        domain = "www.rankypulse.com";
      } else if (window.location.hostname !== "rankypulse.com") {
        // For staging/preview URLs, use the actual hostname
        domain = window.location.hostname;
      } else {
        // Default to www for consistency
        domain = "www.rankypulse.com";
      }

      const canonicalUrl = `https://${domain}${pathName}${search}`;

      // Find or create canonical link tag
      let canonicalLink = document.querySelector('link[rel="canonical"]');

      if (canonicalLink) {
        // Update existing canonical
        canonicalLink.setAttribute("href", canonicalUrl);
      } else {
        // Create new canonical link
        const newLink = document.createElement("link");
        newLink.rel = "canonical";
        newLink.href = canonicalUrl;
        document.head.appendChild(newLink);
      }
    };

    // Set canonical on mount
    handleCanonical();

    // Update on route change (router events don't fire for App Router, so we use MutationObserver or simple interval)
    // For simplicity, we'll check on mount and pathname change
  }, [router]);

  return null; // This component doesn't render anything
}
