"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Zap, Mail, ArrowRight, Lock } from "lucide-react";
import { track } from "@/lib/analytics";

export default function SignInClientPage() {
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams?.get("callbackUrl") ?? searchParams?.get("next") ?? "/dashboard";
  const errorParam = searchParams?.get("error");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleSignIn = () => {
    track("signin_attempt", { provider: "google" });
    signIn("google", { callbackUrl });
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await signIn("credentials", {
        identifier: identifier.trim(),
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        if (res.error === "CredentialsSignin") {
          // Check if this is a Google-only account so we can show a helpful message
          try {
            const check = await fetch(
              `/api/auth/check-login-method?identifier=${encodeURIComponent(identifier.trim())}`
            );
            const data = (await check.json()) as {
              exists: boolean;
              hasPassword: boolean;
              hasGoogle: boolean;
            };
            if (data.exists && data.hasGoogle && !data.hasPassword) {
              setErrorMsg(
                'This account uses Google sign-in. Please click "Continue with Google" above.'
              );
            } else {
              setErrorMsg("Invalid email/username or password");
            }
          } catch {
            setErrorMsg("Invalid email/username or password");
          }
        } else {
          setErrorMsg(res.error);
        }
        setStatus("error");
        return;
      }
      if (res?.url) {
        window.location.href = res.url;
        return;
      }
      setStatus("error");
      setErrorMsg("Sign in failed — try again.");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong — try again.");
    }
  };

  const handleMagicLink = () => {
    track("signin_attempt", { provider: "magic_link" });
    window.location.href = `/auth/signin/email?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  };

  const displayError = errorMsg || (errorParam === "CredentialsSignin" ? "Invalid email/username or password" : null);

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: "#0d0f14" }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/8 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-['Fraunces'] text-xl font-bold text-white">
              RankyPulse
            </span>
          </Link>
          <h1 className="font-['Fraunces'] text-3xl font-bold text-white">
            Welcome back
          </h1>
          <p className="mt-2 font-['DM_Sans'] text-sm text-gray-500">
            Sign in to see your audit history
          </p>
        </div>

        <div
          className="rounded-2xl border border-white/8 p-8"
          style={{ background: "#13161f" }}
        >
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white py-3.5 font-['DM_Sans'] text-sm font-semibold text-gray-800 transition-colors duration-200 hover:bg-gray-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center">
              <span
                className="px-3 font-['DM_Mono'] text-xs text-gray-600"
                style={{ background: "#13161f" }}
              >
                OR
              </span>
            </div>
          </div>

          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <input
              type="text"
              autoComplete="username"
              placeholder="Email or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={status === "loading"}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-['DM_Sans'] text-sm text-white placeholder-gray-500 outline-none transition focus:border-indigo-500/50 disabled:opacity-60"
            />
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={status === "loading"}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-['DM_Sans'] text-sm text-white placeholder-gray-500 outline-none transition focus:border-indigo-500/50 disabled:opacity-60"
            />
            {displayError && (
              <p className="text-sm text-red-400">{displayError}</p>
            )}
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3 font-['DM_Sans'] text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
            >
              <Lock size={16} />
              {status === "loading" ? "Signing in…" : "Sign in with password"}
            </button>
          </form>

          <div className="mt-4 space-y-1 text-center font-['DM_Sans'] text-xs text-gray-600">
            <p>
              <Link
                href={`/auth/forgot-password${callbackUrl !== "/dashboard" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
                className="text-indigo-400 transition-colors hover:text-indigo-300"
              >
                Forgot password?
              </Link>
              {" · "}
              <Link
                href={`/auth/forgot-username${callbackUrl !== "/dashboard" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
                className="text-indigo-400 transition-colors hover:text-indigo-300"
              >
                Forgot username?
              </Link>
            </p>
            <p>
              <button
                type="button"
                onClick={handleMagicLink}
                className="text-indigo-400 transition-colors hover:text-indigo-300"
              >
                <Mail size={12} className="mr-1 inline" />
                Email me a sign-in link
              </button>
            </p>
          </div>

          <p className="mt-3 text-center font-['DM_Sans'] text-xs text-gray-700">
            Don&apos;t have an account?{" "}
            <Link
              href={`/auth/signup${callbackUrl !== "/dashboard" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="text-indigo-400 transition-colors hover:text-indigo-300"
            >
              Sign up free
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center font-['DM_Sans'] text-xs text-gray-700">
          By signing in you agree to our{" "}
          <Link href="/terms" className="text-gray-600 transition-colors hover:text-white">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-gray-600 transition-colors hover:text-white">
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
