"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CircularProgress } from "@/components/horizon";
import { isValidAuditUrl, normalizeUrl, extractAuditDomain } from "@/lib/url-validation";
import { track } from "@/lib/analytics";
import { useAuth } from "@/hooks/useAuth";

function AuditPreviewCard() {
  return (
    <Card
      extra="w-full max-w-[380px] overflow-hidden shadow-[14px_17px_40px_4px_rgba(112,144,176,0.12)] transition-all duration-300 hover:shadow-[14px_17px_40px_4px_rgba(112,144,176,0.18)] hover:-translate-y-2"
      default={true}
    >
      <div className="bg-[#f8fafc] p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-[#4318ff]/10 px-3 py-1 text-xs font-semibold text-[#4318ff]">
            Sample audit result
          </span>
          <CircularProgress percentage={78} size={72} />
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Typical improvement</p>
          <p className="text-2xl font-bold text-[#1B2559]">62 → 78 <span className="text-green-600">+16 pts</span></p>
          <div className="mt-4 space-y-2">
            <p className="flex items-center gap-2 text-sm text-gray-700">
              <span className="h-2 w-2 rounded-full bg-green-500" /> Add meta description
            </p>
            <p className="flex items-center gap-2 text-sm text-gray-700">
              <span className="h-2 w-2 rounded-full bg-green-500" /> Optimize title length
            </p>
            <p className="flex items-center gap-2 text-sm text-gray-700">
              <span className="h-2 w-2 rounded-full bg-green-500" /> Add schema markup
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function HeroSection() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [urlError, setUrlError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUrlError(null);
    const input = e.currentTarget.elements.namedItem("url") as HTMLInputElement;
    const raw = (input?.value ?? "").trim();
    const url = normalizeUrl(raw);
    if (!isValidAuditUrl(url)) {
      setUrlError("Enter a valid URL (e.g. https://example.com)");
      return;
    }
    const host = extractAuditDomain(url);

    if (isAuthenticated) {
      try {
        const res = await fetch("/api/usage/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: host }),
        });
        const data = await res.json() as { allowed?: boolean };
        if (!data.allowed) {
          setUrlError("You've used all audits this month. Upgrade to continue.");
          return;
        }
      } catch {
        // Fail open on network error
      }
    }

    track("run_audit", { url_host: host });
    router.push(`/report/${host}`);
  };

  return (
    <section className="hero-gradient relative overflow-hidden py-10 px-4 md:px-8 lg:py-12">
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(67, 24, 255, 0.08) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-[#1B2559] md:text-6xl lg:text-7xl">
              Instant SEO audit that shows exactly what&apos;s blocking your rankings — and how to fix it.
            </h1>
            <p className="max-w-xl text-lg text-gray-600 md:text-xl">
              For founders, agencies, and growth teams. Get your actionable score and fixes in ~30 seconds — free.
            </p>
            <form onSubmit={handleSubmit} className="w-full max-w-xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
                <input
                  name="url"
                  type="url"
                  autoComplete="off"
                  placeholder="https://example.com"
                  aria-invalid={!!urlError}
                  aria-describedby={urlError ? "hero-url-error" : undefined}
                  className={`h-14 w-full rounded-xl border-2 px-5 text-base text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-4 focus:ring-[#4318ff]/20 sm:flex-1 ${
                    urlError ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-[#4318ff]"
                  }`}
                />
                <button
                  type="submit"
                  className="h-14 shrink-0 rounded-xl bg-[#4318ff] px-10 text-lg font-semibold text-white shadow-xl transition-all hover:bg-[#3311db] hover:shadow-2xl"
                >
                  Scan My Site Now
                </button>
              </div>
              {urlError && (
                <p id="hero-url-error" className="mt-2 text-sm text-red-600">
                  {urlError}
                </p>
              )}
            </form>
            <p className="text-sm text-gray-500">
              Takes ~30 seconds. No signup required.{" "}
              <Link href="/audit" className="text-[#4318ff] hover:underline">
                Browse audit guides by niche
              </Link>
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <AuditPreviewCard />
          </div>
        </div>
      </div>
    </section>
  );
}
