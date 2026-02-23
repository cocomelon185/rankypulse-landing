"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type AuditIssue = {
  id: string;
  code: string;
  title: string;
  severity: string;
  effortMinutes?: number;
  category?: string;
  suggestedFix?: string;
};

type AuditData = {
  url: string;
  hostname: string;
  summary: string;
  scores: { seo: number };
  issues: AuditIssue[];
};

function safeGet(key: string): string {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function safeRemove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

function isSignedIn(): boolean {
  return safeGet("rankypulse_is_signed_in") === "1";
}

function isValidHttpUrl(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function AuditResultsClientPage() {
  const searchParams = useSearchParams();
  const sampleMode = ((searchParams ? searchParams.get("sample") : null) === "1");
  const queryUrl = (searchParams ? (searchParams.get("url") || "") : "");

  const url = useMemo(() => {
    const fromQuery = queryUrl.trim();
    if (isValidHttpUrl(fromQuery)) return fromQuery;

    const fromStorage = safeGet("rankypulse_last_url");
    if (isValidHttpUrl(fromStorage)) return fromStorage;

    return "https://example.com";
  }, [queryUrl]);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AuditData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "err">("idle");
  const [dismissed, setDismissed] = useState(false);

  const showSaveReport = (sampleMode || !isSignedIn()) && !dismissed;

  async function runAudit() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) throw new Error("bad_response");
      const json = (await res.json()) as { ok: boolean; data?: AuditData };
      if (!json.ok || !json.data) throw new Error("bad_payload");

      setData(json.data);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (sampleMode) return;

    try {
      safeSet("rankypulse_last_url", url);
      safeSet("rankypulse_autorun_audit", "1");
    } catch {}

    runAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, sampleMode]);

  async function sendReportEmail() {
    if (!email.trim()) return;
    setEmailStatus("sending");
    try {
      const res = await fetch("/api/email-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, email: email.trim() }),
      });

      if (!res.ok) throw new Error("email_failed");

      setEmailStatus("sent");
      safeSet("rankypulse_has_audit", "1");
    } catch {
      setEmailStatus("err");
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Audit results</h1>

      <div className="mt-4 rounded-lg border p-4">
        <div className="text-sm text-gray-700">
          Site: <span className="font-medium">{url}</span>
        </div>
        <div className="mt-3 text-sm font-semibold">Current score</div>
        <div className="mt-1 text-sm text-gray-600">
          Overview · Issues · Title &amp; Meta · Schema · Quick Wins
        </div>
      </div>

      {showSaveReport && (
        <div className="mt-6 rounded-lg border p-4">
          <div className="text-sm font-semibold">Save this report</div>
          <div className="mt-1 text-sm text-gray-600">
            Enter your email and we'll send you this audit + next best steps.
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded border p-3"
            />
            <button
              type="button"
              onClick={sendReportEmail}
              className="rounded bg-black px-4 py-3 text-sm font-semibold text-white"
            >
              {emailStatus === "sending" ? "Sending…" : "Email me the report"}
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="text-sm font-semibold text-gray-600 hover:underline"
            >
              Not now
            </button>

            {emailStatus === "sent" && (
              <div className="text-sm text-green-700">Sent! Check your inbox.</div>
            )}
            {emailStatus === "err" && (
              <div className="text-sm text-red-600">Could not send. Try again.</div>
            )}
          </div>
        </div>
      )}

      {sampleMode && (
        <div className="mt-6 rounded-lg border p-4">
          <div className="text-sm font-semibold">Quick Wins</div>
          <div className="mt-1 text-sm text-gray-600">Fix the next issue in minutes.</div>
          <Link
            href="/dashboard?view=quickwins"
            className="mt-3 inline-flex rounded bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            Open Quick Wins
          </Link>
        </div>
      )}

      {loading && (
        <div className="mt-6 rounded-lg border p-4">
          <div className="text-sm font-semibold">Running audit…</div>
          <div className="mt-1 text-sm text-gray-600">This usually takes a few seconds.</div>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="text-sm font-semibold text-red-700">{error}</div>
          <button
            type="button"
            onClick={runAudit}
            className="mt-3 inline-flex rounded bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      )}

      {data && !loading && !error && (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border p-4">
            <div className="text-sm font-semibold">Overview</div>
            <div className="mt-1 text-sm text-gray-700">{data.summary}</div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-sm font-semibold">Score</div>
            <div className="mt-1 text-3xl font-bold">{Math.round(data.scores.seo)}</div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-sm font-semibold">Issues</div>
            <div className="mt-2 space-y-2">
              {data.issues.slice(0, 10).map((i) => (
                <div key={i.id} className="rounded-md border p-3">
                  <div className="text-sm font-semibold">{i.title}</div>
                  <div className="mt-1 text-xs text-gray-600">
                    Severity: {i.severity}
                    {typeof i.effortMinutes === "number" ? ` · ETA: ${i.effortMinutes} min` : ""}
                  </div>
                  {i.suggestedFix ? (
                    <div className="mt-2 text-sm text-gray-700">{i.suggestedFix}</div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-sm font-semibold">Quick Wins</div>
            <div className="mt-1 text-sm text-gray-600">Fix the next issue in minutes.</div>
            <Link
              href="/dashboard?view=quickwins"
              className="mt-3 inline-flex rounded bg-black px-4 py-2 text-sm font-semibold text-white"
            >
              Open Quick Wins
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
