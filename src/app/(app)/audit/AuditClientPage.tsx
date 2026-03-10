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
      <h1 className="mb-1 text-2xl font-bold">Run an SEO Audit</h1>
      <p className="mb-5 text-sm text-gray-500">
        Crawl any website to discover SEO issues, broken links, and page-level recommendations.
      </p>

      <form action="/audit/results" method="get" onSubmit={onSubmit}>
        <input
          name="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="e.g. https://yoursite.com"
          className="w-full rounded border p-3"
        />

        {error && <div className="mt-3 text-sm text-red-500">{error}</div>}

        <button
          type="submit"
          className="mt-4 w-full rounded bg-black p-3 text-white font-semibold"
        >
          Start audit
        </button>
      </form>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { icon: "🔍", label: "Finds broken links, missing tags & crawl errors" },
          { icon: "📊", label: "Scores every page 0–100" },
          { icon: "✅", label: "Generates a prioritized fix list" },
        ].map(({ icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50 text-center"
          >
            <span className="text-xl">{icon}</span>
            <p className="text-[11px] text-gray-500 leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
