"use client";

import { useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import { track } from "@/lib/analytics";
import type { AffectedPage } from "@/lib/audit-issue-presentation";

interface VerifyFixButtonProps {
  issueId: string;
  affectedPages: AffectedPage[];
  onVerifySuccess: (issueId: string) => void;
  onVerifyFailed: (issueId: string, remainingCount: number) => void;
  onCmsDetected?: (cms: string) => void;
}

type VerifyState = "idle" | "verifying" | "success" | "partial" | "failed";

type PageVerifyResult = {
  url: string;
  ok: boolean;
  issues: { code: string; message: string }[];
};

const SAMPLE_SIZE = 3;

async function verifyPage(
  pageUrl: string,
  issueId: string,
): Promise<PageVerifyResult & { cmsDetected?: string | null }> {
  try {
    const params = new URLSearchParams({ url: pageUrl, issueId });
    const res = await fetch(`/api/verify?${params}`);
    const data = await res.json();
    return {
      url: pageUrl,
      ok: data.ok === true,
      issues: data.issues ?? [],
      cmsDetected: data.cmsDetected ?? null,
    };
  } catch {
    return { url: pageUrl, ok: false, issues: [{ code: "fetch_error", message: "Could not reach page" }] };
  }
}

export function VerifyFixButton({
  issueId,
  affectedPages,
  onVerifySuccess,
  onVerifyFailed,
  onCmsDetected,
}: VerifyFixButtonProps) {
  const [state, setState] = useState<VerifyState>("idle");
  const [failedPages, setFailedPages] = useState<PageVerifyResult[]>([]);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [totalToVerify, setTotalToVerify] = useState(0);
  const [sampleDone, setSampleDone] = useState(false);

  const runVerification = useCallback(
    async (pages: AffectedPage[]) => {
      setState("verifying");
      setTotalToVerify(pages.length);
      setVerifiedCount(0);

      const failed: PageVerifyResult[] = [];
      let detectedCms: string | null = null;

      for (let i = 0; i < pages.length; i++) {
        const result = await verifyPage(pages[i].url, issueId);
        setVerifiedCount(i + 1);

        if (!detectedCms && result.cmsDetected) {
          detectedCms = result.cmsDetected;
          onCmsDetected?.(detectedCms);
        }

        if (!result.ok) {
          failed.push(result);
        }
      }

      setFailedPages(failed);

      if (failed.length === 0) {
        setState("success");
        try { localStorage.setItem(`rankypulse_verified_${issueId}`, "1"); } catch {}
        track("verify_success", { issueId, remainingCount: 0, mode: pages.length <= SAMPLE_SIZE ? "sample" : "full" });
        onVerifySuccess(issueId);
      } else {
        setState("failed");
        track("verify_failed", { issueId, remainingCount: failed.length, mode: pages.length <= SAMPLE_SIZE ? "sample" : "full" });
        onVerifyFailed(issueId, failed.length);
      }
    },
    [issueId, onVerifySuccess, onVerifyFailed, onCmsDetected],
  );

  const handleVerifySample = useCallback(async () => {
    track("verify_clicked", { issueId, mode: "sample" });
    const sample = affectedPages.slice(0, SAMPLE_SIZE);
    await runVerification(sample);
    setSampleDone(true);
  }, [issueId, affectedPages, runVerification]);

  const handleVerifyAll = useCallback(async () => {
    track("verify_clicked", { issueId, mode: "full" });
    await runVerification(affectedPages);
  }, [issueId, affectedPages, runVerification]);

  if (state === "success") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <p className="text-xs font-semibold text-emerald-800">Verified!</p>
        </div>
        <p className="mt-1 text-[11px] text-emerald-600">
          {sampleDone && affectedPages.length > SAMPLE_SIZE
            ? `Verified ${Math.min(SAMPLE_SIZE, affectedPages.length)}/${Math.min(SAMPLE_SIZE, affectedPages.length)} sample pages. All passed.`
            : "All sampled pages verified. Score updated."}
        </p>
        {sampleDone && affectedPages.length > SAMPLE_SIZE && (
          <button
            type="button"
            onClick={handleVerifyAll}
            className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#4318ff] hover:underline"
          >
            <ShieldCheck className="h-3 w-3" />
            Verify all {affectedPages.length} pages
          </button>
        )}
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <p className="text-xs font-semibold text-amber-800">
            {failedPages.length} page{failedPages.length !== 1 ? "s" : ""} still need fixes
          </p>
        </div>
        <ul className="mt-2 space-y-1">
          {failedPages.slice(0, 3).map((p) => (
            <li key={p.url} className="text-[11px]">
              <span className="truncate font-mono text-amber-700 block">{p.url}</span>
              {p.issues[0] && (
                <span className="text-[10px] text-amber-600">{p.issues[0].message}</span>
              )}
            </li>
          ))}
          {failedPages.length > 3 && (
            <li className="text-[11px] text-amber-600">
              +{failedPages.length - 3} more
            </li>
          )}
        </ul>
        <button
          type="button"
          onClick={handleVerifySample}
          className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#4318ff] hover:underline"
        >
          <ShieldCheck className="h-3 w-3" />
          Re-verify
        </button>
      </div>
    );
  }

  return (
    <div>
      {state === "verifying" && (
        <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Verified {verifiedCount}/{totalToVerify} pages…
        </div>
      )}
      <button
        type="button"
        onClick={handleVerifySample}
        disabled={state === "verifying"}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-400 bg-emerald-50 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 transition-colors"
      >
        {state === "verifying" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying pages…
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            Verify fix ({Math.min(SAMPLE_SIZE, affectedPages.length)} sample pages)
          </>
        )}
      </button>
    </div>
  );
}
