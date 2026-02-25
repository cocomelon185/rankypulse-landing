"use client";

import { useCallback, useRef, useState } from "react";

export function useScrollToIssue() {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToIssue = useCallback((issueId: string) => {
    const el = document.getElementById(`issue-${issueId}`);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedId(issueId);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setHighlightedId(null), 2000);
  }, []);

  return { highlightedId, scrollToIssue };
}
