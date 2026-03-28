"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Zap, Loader2 } from "lucide-react";

export function VerifyClientPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const email = searchParams?.get("email");
  const callbackUrl = searchParams?.get("callbackUrl") ?? "/dashboard";
  const [status, setStatus] = useState<"verifying" | "success" | "error" | "no-token">("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token || !email) {
      setStatus("no-token");
      return;
    }

    signIn("magic-link", {
      token,
      email,
      redirect: false,
      callbackUrl,
    })
      .then((res) => {
        if (res?.ok && res.url) {
          setStatus("success");
          window.location.href = res.url;
        } else {
          setStatus("error");
          setErrorMsg(
            res?.error === "CredentialsSignin"
              ? "This sign-in link is invalid or has expired."
              : "Sign in failed — please request a new link."
          );
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("Something went wrong. Please try again.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: "#0d0f14" }}
    >
      <div className="text-center">
        <Link href="/" className="mb-8 inline-flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-['Fraunces'] text-xl font-bold text-white">RankyPulse</span>
        </Link>

        <h1 className="font-['Fraunces'] text-3xl font-bold text-white mb-4">
          Verify your email address
        </h1>

        {status === "verifying" && (
          <div className="mt-4">
            <Loader2 size={24} className="mx-auto mb-3 animate-spin text-indigo-400" />
            <p className="font-['DM_Sans'] text-gray-400">Signing you in…</p>
          </div>
        )}

        {status === "success" && (
          <div className="mt-4">
            <p className="font-['DM_Sans'] text-gray-400">Signed in! Redirecting…</p>
          </div>
        )}

        {(status === "error" || status === "no-token") && (
          <div className="mt-4 max-w-sm">
            <p className="font-['DM_Sans'] text-red-400">
              {status === "no-token"
                ? "Invalid sign-in link."
                : errorMsg || "Sign in failed."}
            </p>
            <p className="mt-2 font-['DM_Sans'] text-sm text-gray-500">
              Sign-in links expire after 15 minutes and can only be used once.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={`/auth/signin/email?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="inline-block rounded-xl bg-indigo-500 px-6 py-3 font-['DM_Sans'] text-sm font-semibold text-white transition hover:bg-indigo-400"
              >
                Request a new sign-in link
              </Link>
              <Link
                href={`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-['DM_Sans'] text-xs text-gray-600 hover:text-white"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
