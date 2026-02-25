"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { isValidAuditUrl, normalizeUrl } from "@/lib/url-validation";
import { track } from "@/lib/analytics";

export function AuditCtaForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    // Read directly from form input to avoid stale state or autofill bypassing onChange
    const input = e.currentTarget.elements.namedItem("url") as HTMLInputElement | null;
    const raw = (input?.value ?? url).trim();
    const normalized = normalizeUrl(raw);
    if (!isValidAuditUrl(normalized)) {
      setError("Enter a valid URL (e.g. https://example.com)");
      return;
    }
    const host = new URL(normalized).hostname.replace(/^www\./, "");
    track("run_audit", { source: "pseo_cta", url_host: host });
    router.push(`/report/${host}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:gap-3">
      <input
        name="url"
        type="url"
        autoComplete="off"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
        aria-invalid={!!error}
        className="h-12 flex-1 rounded-xl border-2 border-gray-200 px-4 text-base placeholder-gray-400 transition-colors focus:border-[#4318ff] focus:outline-none focus:ring-4 focus:ring-[#4318ff]/20"
      />
      <Button type="submit" size="lg" className="shrink-0">
        Run Free Audit
      </Button>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
    </form>
  );
}
