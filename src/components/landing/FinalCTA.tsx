"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, Zap } from "lucide-react";
import { extractAuditDomain, isValidExtractedDomain } from "@/lib/url-validation";
import { useAuth } from "@/hooks/useAuth";
import { InstantPreview } from "@/components/landing/InstantPreview";
import type { PreviewResult, PreviewError } from "@/components/landing/InstantPreview";

export function FinalCTA() {
  const [domain, setDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const [previewData, setPreviewData] = useState<PreviewResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Read directly from form input to avoid stale state or autofill bypassing onChange
    const input = e.currentTarget.elements.namedItem("domain") as HTMLInputElement | null;
    const rawValue = (input?.value ?? domain).trim();
    const cleaned = extractAuditDomain(rawValue);

    if (!isValidExtractedDomain(cleaned)) {
      setError("Enter a valid domain — e.g. yoursite.com");
      return;
    }

    setError("");
    setScanError(null);
    setPreviewData(null);

    // ── Authenticated path: navigate to full report ──
    if (isAuthenticated) {
      setIsLoading(true);
      try {
        const res = await fetch("/api/usage/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: cleaned }),
        });
        const data = await res.json() as { allowed?: boolean };
        if (!data.allowed) {
          setError("You've used all audits this month. Upgrade to continue.");
          setIsLoading(false);
          return;
        }
      } catch {
        // Fail open on network error
      }
      router.push(`/report/${cleaned}`);
      return;
    }

    // ── Unauthenticated path: inline preview ──
    setIsScanning(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      const res = await fetch(`/api/crawl?domain=${encodeURIComponent(cleaned)}`, {
        signal: controller.signal,
      });
      const data = await res.json() as PreviewResult | PreviewError;

      if ("error" in data && data.error) {
        const errData = data as PreviewError;
        if (errData.error === "rate_limited") {
          setScanError("Too many requests — please wait a minute and try again.");
        } else if (errData.error === "unreachable") {
          setScanError(`Could not reach ${cleaned}. The site may be blocking crawlers.`);
        } else {
          setScanError("Something went wrong. Please try again.");
        }
      } else {
        setPreviewData(data as PreviewResult);
      }
    } catch (err) {
      setScanError(
        err instanceof Error && err.name === "AbortError"
          ? "The scan took too long. Please try again."
          : "Network error. Please try again."
      );
    } finally {
      clearTimeout(timeout);
      setIsScanning(false);
    }
  };

  return (
    <section className="relative overflow-hidden py-32" style={{ background: "#0d0f14" }}>
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/15 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-4 font-['DM_Mono'] text-xs uppercase tracking-widest text-gray-600"
        >
          Free · No credit card · Results in 10 seconds
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 font-['Fraunces'] font-bold leading-tight tracking-tight text-white"
          style={{ fontSize: "clamp(32px, 5vw, 64px)" }}
        >
          Find out what Google sees
          <br />
          <span className="italic text-indigo-400">when it looks at your site.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mb-10 max-w-xl font-['DM_Sans'] text-lg text-gray-400"
        >
          Free audit. No account needed. Takes 30 seconds.
          Most users find their first fix within 2 minutes.
        </motion.p>

        {/* Input form */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onSubmit={handleSubmit}
          className="mx-auto mb-4 flex max-w-xl flex-col gap-3 sm:flex-row"
        >
          <div className="group relative flex-1">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors duration-200 group-focus-within:text-indigo-400"
            />
            <input
              name="domain"
              type="text"
              autoComplete="off"
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                setError("");
                if (previewData) setPreviewData(null);
                if (scanError) setScanError(null);
              }}
              placeholder="yoursite.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-10 pr-4 font-['DM_Sans'] text-sm text-white placeholder-gray-600 transition-all duration-200 focus:border-indigo-500/60 focus:bg-indigo-500/4 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || isScanning}
            className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-indigo-500 px-7 py-4 font-['DM_Sans'] text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-400 hover:shadow-xl hover:shadow-indigo-500/30 active:translate-y-0 disabled:cursor-wait disabled:opacity-60"
          >
            {isLoading || isScanning ? (
              <><Zap size={15} className="animate-pulse" />Scanning...</>
            ) : (
              <><Zap size={15} />Get SEO Score</>
            )}
          </button>
        </motion.form>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 font-['DM_Sans'] text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}

        {/* Scanning animation */}
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-indigo-500"
                  animate={{ opacity: [0.3, 1, 0.3], scaleY: [1, 2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                />
              ))}
            </div>
            <span className="font-['DM_Mono'] text-xs text-gray-500">
              Analyzing {domain}…
            </span>
          </motion.div>
        )}

        {/* Scan error */}
        {scanError && !isScanning && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 font-['DM_Sans'] text-sm text-red-400"
          >
            {scanError}
          </motion.p>
        )}

        {/* Inline preview result */}
        {previewData && (
          <InstantPreview
            domain={previewData.domain}
            score={previewData.score}
            issues={previewData.issues}
            estimatedTrafficLoss={previewData.estimatedTrafficLoss}
            onRunAnother={() => {
              setPreviewData(null);
              setScanError(null);
              setDomain("");
            }}
          />
        )}

        {!previewData && !isScanning && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="font-['DM_Mono'] text-xs uppercase tracking-widest text-gray-700"
          >
            12,400+ sites audited · 4.8★ rating · free forever
          </motion.p>
        )}
      </div>
    </section>
  );
}
