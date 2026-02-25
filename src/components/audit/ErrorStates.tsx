"use client";

import { useRouter } from "next/navigation";
import { WifiOff, Clock, RefreshCw, AlertTriangle } from "lucide-react";

// ── Shared layout ──────────────────────────────────────────────────────────────

function ErrorWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-6"
      style={{ background: "#0d0f14" }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>
      <div className="relative w-full max-w-sm text-center">{children}</div>
    </div>
  );
}

function ErrorIcon({
  icon: Icon,
  color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: "red" | "amber" | "indigo";
}) {
  const styles = {
    red: "bg-red-500/10 border-red-500/20 text-red-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
  };
  return (
    <div
      className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border ${styles[color]}`}
    >
      <Icon size={28} />
    </div>
  );
}

const PrimaryBtn = ({
  onClick,
  children,
  href,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  href?: string;
}) => {
  const cls =
    "flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3 font-['DM_Sans'] text-sm font-semibold text-white transition-colors hover:bg-indigo-400";
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  );
};

const SecondaryBtn = ({
  onClick,
  href,
  children,
}: {
  onClick?: () => void;
  href?: string;
  children: React.ReactNode;
}) => {
  const cls =
    "w-full rounded-xl border border-white/10 py-3 font-['DM_Sans'] text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white";
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  );
};

// ── 1. Unreachable domain ──────────────────────────────────────────────────────

export function UnreachableErrorState({ domain }: { domain: string }) {
  const router = useRouter();
  return (
    <ErrorWrapper>
      <ErrorIcon icon={WifiOff} color="red" />
      <h1 className="mb-3 font-['Fraunces'] text-2xl font-bold text-white">
        Couldn&apos;t reach {domain}
      </h1>
      <p className="mb-8 font-['DM_Sans'] text-sm leading-relaxed text-gray-400">
        This domain may be blocking automated requests, or it may not exist.
        Check the URL and try again.
      </p>
      <PrimaryBtn onClick={() => router.push("/")}>Try another domain →</PrimaryBtn>
    </ErrorWrapper>
  );
}

// ── 2. Timeout ─────────────────────────────────────────────────────────────────

export function TimeoutErrorState({
  domain,
  onRetry,
}: {
  domain: string;
  onRetry: () => void;
}) {
  return (
    <ErrorWrapper>
      <ErrorIcon icon={Clock} color="amber" />
      <h1 className="mb-3 font-['Fraunces'] text-2xl font-bold text-white">
        Taking longer than expected
      </h1>
      <p className="mb-8 font-['DM_Sans'] text-sm leading-relaxed text-gray-400">
        {domain} is responding slowly. This sometimes happens with larger sites or when Google&apos;s
        PageSpeed API is under load. Try again — it usually works on the second attempt.
      </p>
      <div className="space-y-3">
        <PrimaryBtn onClick={onRetry}>
          <RefreshCw size={14} />
          Try again
        </PrimaryBtn>
        <SecondaryBtn href="/">Audit a different domain</SecondaryBtn>
      </div>
    </ErrorWrapper>
  );
}

// ── 3. Rate limited ────────────────────────────────────────────────────────────

export function RateLimitedState() {
  return (
    <ErrorWrapper>
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-3xl">
        ⏱
      </div>
      <h1 className="mb-3 font-['Fraunces'] text-2xl font-bold text-white">Slow down a bit</h1>
      <p className="mb-8 font-['DM_Sans'] text-sm leading-relaxed text-gray-400">
        You&apos;ve run several audits quickly. Wait a minute, then try again.
        <br />
        <br />
        Need unlimited audits?{" "}
        <a href="/pricing" className="text-indigo-400 hover:text-indigo-300">
          Upgrade to Pro →
        </a>
      </p>
      <PrimaryBtn href="/">Back to homepage</PrimaryBtn>
    </ErrorWrapper>
  );
}

// ── 4. Generic failure ─────────────────────────────────────────────────────────

export function GenericErrorState({
  domain,
  onRetry,
}: {
  domain: string;
  onRetry: () => void;
}) {
  return (
    <ErrorWrapper>
      <ErrorIcon icon={AlertTriangle} color="amber" />
      <h1 className="mb-3 font-['Fraunces'] text-2xl font-bold text-white">
        Something went wrong
      </h1>
      <p className="mb-8 font-['DM_Sans'] text-sm leading-relaxed text-gray-400">
        The audit for {domain} hit an unexpected error. This is usually temporary — try again.
      </p>
      <div className="space-y-3">
        <PrimaryBtn onClick={onRetry}>
          <RefreshCw size={14} />
          Try again
        </PrimaryBtn>
        <SecondaryBtn href="/">Audit a different domain</SecondaryBtn>
      </div>
    </ErrorWrapper>
  );
}
