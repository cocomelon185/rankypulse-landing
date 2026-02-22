"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileSearch, Zap, Target } from "lucide-react";

const HAS_AUDIT_KEY = "rankypulse_has_audit";
const TOP_ISSUE = "Meta description missing";
const TOP_ISSUE_TAB = "quick-wins";

export function NextBestStepPanel() {
  const [hasAudit, setHasAudit] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setHasAudit(!!localStorage.getItem(HAS_AUDIT_KEY));
      const handler = () => setHasAudit(!!localStorage.getItem(HAS_AUDIT_KEY));
      window.addEventListener("storage", handler);
      window.addEventListener("rankypulse-has-audit", handler);
      return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener("rankypulse-has-audit", handler);
      };
    }
  }, []);


  if (!mounted) return null;

  return (
    <aside
      className="sticky top-24 z-20 hidden w-72 shrink-0 lg:block rounded-2xl border-2 border-[#4318ff]/20 bg-gradient-to-br from-[#eff6ff]/80 to-white p-4 shadow-md"
    >
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Target className="h-5 w-5 text-[#4318ff]" />
          <h3 className="font-semibold text-[#1B2559]">Next Best Step</h3>
        </div>
        {!hasAudit ? (
          <>
            <p className="text-sm text-gray-600">Run your first audit to get personalized SEO fixes.</p>
            <Link href="/audit" className="mt-4 block">
              <Button size="sm" className="w-full">
                <FileSearch className="mr-2 h-4 w-4" />
                Run your first audit
              </Button>
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-[#1B2559]">Fix next: {TOP_ISSUE}</p>
            <p className="mt-1 text-xs text-gray-500">Quick win · ~5 min</p>
            <Link href={`/audit/results?tab=${TOP_ISSUE_TAB}`} className="mt-4 block">
              <Button size="sm" variant="secondary" className="w-full">
                <Zap className="mr-2 h-4 w-4" />
                Open Quick Wins
              </Button>
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
