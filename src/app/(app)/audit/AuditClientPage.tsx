"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

function isValidHttpUrl(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function AuditClientPage() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    setError(null);
    const trimmed = url.trim();

    if (!isValidHttpUrl(trimmed)) {
      e.preventDefault();
      setError("Please enter a valid URL including http:// or https://");
      return;
    }

    track("run_audit", { url_host: new URL(trimmed).host });
    try {
      localStorage.setItem("rankypulse_last_url", trimmed);
      localStorage.setItem("rankypulse_autorun_audit", "1");
    } catch {}
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Run an SEO Audit</h1>

      <form action="/audit/results" method="get" onSubmit={onSubmit}>
        <input
          name="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full rounded border p-3"
        />

        {error && <div className="mt-3 text-sm text-red-500">{error}</div>}

        <button
          type="submit"
          className="mt-4 w-full rounded bg-black p-3 text-white"
        >
          Start audit
        </button>
      </form>
    </main>
  );
}
