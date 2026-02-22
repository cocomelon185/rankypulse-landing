"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/horizon";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiErrorRetry } from "@/components/ui/ApiErrorRetry";
import { useBilling } from "@/hooks/useBilling";
import { isValidAuditUrl, normalizeUrl } from "@/lib/url-validation";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { Search, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AUDIT_RESULT_KEY = "rankypulse_audit_result";

const EXAMPLE_CHIPS = ["example.com", "mysite.com", "project.io"];

function AuditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { plan, getAuditCap } = useBilling();
  const [urlError, setUrlError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("sample") === "1") {
      router.replace("/audit/results?sample=1");
    }
  }, [router, searchParams]);

  const runAudit = async (url: string) => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetchWithTimeout("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        timeout: 35000,
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json?.error || "Something went wrong. Please try again.";
        setApiError(msg);
        toast.error(msg);
        return;
      }
      if (!json?.ok || !json?.data) {
        setApiError("Invalid response. Please try again.");
        return;
      }
      if (typeof window !== "undefined") {
        sessionStorage.setItem(AUDIT_RESULT_KEY, JSON.stringify(json.data));
      }
      router.push(`/audit/results?url=${encodeURIComponent(url)}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUrlError(null);
    setApiError(null);
    const input = e.currentTarget.elements.namedItem("url") as HTMLInputElement;
    const raw = input?.value?.trim() || "";
    const url = normalizeUrl(raw);
    if (!isValidAuditUrl(url)) {
      setUrlError("Please enter a valid URL (e.g. https://example.com)");
      toast.error("Invalid URL. Must start with http:// or https://.");
      return;
    }
    runAudit(url);
  };

  const auditCap = getAuditCap();

  return (
    <PageLayout>
      <PageHeader
        icon={<Search className="h-7 w-7" />}
        title="Run your free SEO audit"
        subtitle="Enter your website URL below to get instant SEO insights and actionable fixes."
      />

      <div className="mx-auto max-w-2xl">
        <Card extra="p-6 md:p-10 overflow-hidden" default>
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Credits remaining</span>
            <span className="rounded-full bg-gradient-to-r from-[#4318ff]/20 to-[#7551ff]/20 px-4 py-1.5 text-sm font-semibold text-[#4318ff]">
              {auditCap} audits
            </span>
          </div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="url" className="mb-3 block text-sm font-semibold text-gray-700">
              Website URL
            </label>
            <input
              id="url"
              name="url"
              type="url"
              placeholder="https://example.com"
              aria-invalid={!!urlError}
              aria-describedby={urlError ? "url-error" : undefined}
              className={`w-full rounded-xl border-2 px-5 py-4 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-4 focus:ring-[#4318ff]/20 ${
                urlError ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-[#4318ff]"
              }`}
            />
            {urlError && (
              <p id="url-error" className="mt-2 text-sm text-red-600">
                {urlError}
              </p>
            )}
            {apiError && (
              <div className="mt-4">
                <ApiErrorRetry
                  message={apiError}
                  onRetry={() => setApiError(null)}
                />
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {EXAMPLE_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    const input = document.getElementById("url") as HTMLInputElement;
                    if (input) input.value = `https://${chip}`;
                  }}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  {chip}
                </button>
              ))}
            </div>
            <Button
              type="submit"
              className="mt-6 w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Running audit…
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Start Audit
                </>
              )}
            </Button>
          </form>
        </Card>

        <div className="mt-8 flex flex-col gap-4 text-center sm:flex-row sm:justify-center sm:gap-8">
          <p className="text-sm text-gray-500">
            No signup required for the free trial.{" "}
            <Link href="/auth/signup" className="font-semibold text-[#4318ff] transition-colors hover:underline">
              Sign up
            </Link>{" "}
            for more audits.
          </p>
          <Link
            href="/audit?sample=1"
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#4318ff] transition-colors hover:underline"
          >
            <FileText className="h-4 w-4" />
            See sample report
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}

export default function AuditPage() {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <div className="mx-auto max-w-2xl space-y-6">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </PageLayout>
      }
    >
      <AuditForm />
    </Suspense>
  );
}
