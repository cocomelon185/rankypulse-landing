"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const HAS_AUDIT_KEY = "rankypulse_has_audit";

function readHasAudit(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!localStorage.getItem(HAS_AUDIT_KEY);
  } catch {
    return false;
  }
}

export default function NextBestStepPanel() {
  const [hasAudit, setHasAudit] = useState<boolean>(() => readHasAudit());

  useEffect(() => {
    const onStorage = () => setHasAudit(readHasAudit());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!hasAudit) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm font-semibold text-white">Next best step</div>
      <div className="mt-1 text-sm text-white/70">
        Fix one issue in minutes and move your score up.
      </div>
      <Link
        href="/dashboard?view=quickwins"
        className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
      >
        Open Quick Wins
      </Link>
    </div>
  );
}
