/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/horizon";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SaveReportCardProps {
  /** Compact mode for inline/prompt usage (e.g. when triggered by Export/AI Fixes) */
  compact?: boolean;
  /** Callback when user successfully submits */
  onSuccess?: () => void;
  /** Callback when user dismisses */
  onDismiss?: () => void;
  /** Optional context (e.g. "export" | "ai-fixes") for API */
  source?: string;
  /** Ref to scroll into view or focus */
  scrollRef?: React.RefObject<HTMLDivElement>;
  /** Show highlighted/pulse when triggered by action */
  highlighted?: boolean;
  /** Report URL (current page URL including ?url=...). Falls back to window.location.href if unset. */
  reportUrl?: string;
  /** Site URL that was audited (e.g. https://example.com). Used in email body. */
  siteUrl?: string;
  /** Optional summary: score, current, potential */
  summary?: { score?: number; current?: number; potential?: number };
  /** Audit issues for Next Best Step and issue breakdown (title, severity, eta) */
  issues?: Array<{ title: string; severity: string; eta?: string }>;
  /** @deprecated Use issues instead; kept for backward compatibility */
  nextBestStep?: string;
}

export function SaveReportCard({
  compact = false,
  onSuccess,
  onDismiss,
  source = "save-report",
  scrollRef,
  highlighted = false,
  reportUrl: reportUrlProp,
  siteUrl: siteUrlProp,
  summary,
  issues,
  nextBestStep: _nextBestStep,
}: SaveReportCardProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (highlighted && scrollRef?.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      inputRef.current?.focus();
    }
  }, [highlighted, scrollRef]);

  const validate = (): boolean => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email");
      return false;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setError("Please enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || loading) return;
    setLoading(true);
    try {
      const reportUrl =
        reportUrlProp ||
        (typeof window !== "undefined" ? window.location.href : "");
      const res = await fetch("/api/email-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source,
          reportUrl,
          siteUrl: siteUrlProp || undefined,
          summary: summary || undefined,
          issues: issues || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMsg = data.error || "Something went wrong";
        setError(errMsg);
        toast.error(errMsg);
        return;
      }
      setSubmitted(true);
      toast.success("Sent! Check your inbox (and spam).");
      onSuccess?.();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Please try again";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        ref={scrollRef}
        data-testid="save-report-success"
        className="rounded-2xl border-2 border-green-200/80 bg-green-50/50 p-4 text-center"
      >
        <p className="text-sm font-medium text-green-700">
          Check your inbox for the report link.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      data-testid="save-report-card"
      className={
        highlighted ? "animate-[pulse_1s_ease-in-out_1] rounded-2xl ring-2 ring-[#4318ff]/40" : ""
      }
    >
      <Card
        extra={compact ? "p-4" : "p-5"}
        default={true}
        className="border-2 border-[#4318ff]/20 bg-gradient-to-br from-[#eff6ff]/60 to-white"
      >
        <h4 className="font-semibold text-[#1B2559]">
          {compact ? "Save report to continue" : "Save this report"}
        </h4>
        <p className="mt-1 text-sm text-gray-600">
          {compact
            ? "Enter your email to get the audit link and action plan."
            : "Get this audit link + action plan sent to your email."}
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="you@example.com"
              disabled={loading}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#4318ff] focus:ring-2 focus:ring-[#4318ff]/20 disabled:opacity-70"
              aria-invalid={!!error}
              aria-describedby={error ? "save-report-error" : undefined}
              data-testid="save-report-email"
            />
            {error && (
              <p
                id="save-report-error"
                className="mt-1.5 text-sm text-red-600"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              disabled={loading}
              size={compact ? "sm" : "md"}
              className="inline-flex items-center gap-2"
              data-testid="save-report-submit"
            >
              <Mail className="h-4 w-4" />
              {loading ? "Sending…" : "Email me the report"}
            </Button>
            <button
              type="button"
              onClick={onDismiss}
              className="text-sm font-medium text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
              data-testid="save-report-dismiss"
            >
              Not now
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
