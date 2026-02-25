"use client";

/* eslint-disable react-hooks/set-state-in-effect -- token may be undefined on first render */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Zap } from "lucide-react";

export function VerifyClientPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const callbackUrl = searchParams?.get("callbackUrl") ?? "/dashboard";
  const [status, setStatus] = useState<"verifying" | "unsupported">("verifying");

  useEffect(() => {
    if (!token) {
      setStatus("unsupported");
      return;
    }
    const t = setTimeout(() => setStatus("unsupported"), 1500);
    return () => clearTimeout(t);
  }, [token]);

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: "#0d0f14" }}
    >
      <div className="text-center">
        <Link href="/" className="mb-6 inline-flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-['Fraunces'] text-xl font-bold text-white">RankyPulse</span>
        </Link>

        {status === "verifying" ? (
          <p className="font-['DM_Sans'] text-gray-400">Verifying your link…</p>
        ) : (
          <>
            <p className="font-['DM_Sans'] text-gray-400">
              Magic link sign-in requires additional setup.
            </p>
            <p className="mt-2 font-['DM_Sans'] text-sm text-gray-500">
              Please use <strong>Continue with Google</strong> to sign in.
            </p>
            <Link
              href={`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="mt-6 inline-block rounded-xl bg-indigo-500 px-6 py-3 font-['DM_Sans'] text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Sign in with Google
            </Link>
            <p className="mt-6">
              <Link href="/" className="font-['DM_Sans'] text-xs text-gray-600 hover:text-white">
                Back to home
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
