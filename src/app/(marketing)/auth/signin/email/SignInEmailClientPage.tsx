"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Mail, ArrowLeft } from "lucide-react";

export function SignInEmailClientPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, callbackUrl }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data?.error ?? "Could not send link.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Could not send — try again.");
    }
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: "#0d0f14" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-['Fraunces'] text-xl font-bold text-white">RankyPulse</span>
          </Link>
          <h1 className="font-['Fraunces'] text-3xl font-bold text-white">Sign in with email</h1>
          <p className="mt-2 font-['DM_Sans'] text-sm text-gray-500">
            We&apos;ll send you a magic link — no password needed
          </p>
        </div>

        <div
          className="rounded-2xl border border-white/8 p-8"
          style={{ background: "#13161f" }}
        >
          {status === "success" ? (
            <p className="text-center font-['DM_Sans'] text-sm text-gray-400">
              Check your inbox for the sign-in link. It may take a minute.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading"}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-['DM_Sans'] text-sm text-white placeholder-gray-500 outline-none transition focus:border-indigo-500/50 disabled:opacity-60"
              />
              {errorMsg && (
                <p className="text-sm text-red-400">{errorMsg}</p>
              )}
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3 font-['DM_Sans'] text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
              >
                <Mail size={16} />
                {status === "loading" ? "Sending…" : "Send magic link"}
              </button>
            </form>
          )}
        </div>

        <Link
          href="/auth/signin"
          className="mt-6 flex items-center justify-center gap-2 font-['DM_Sans'] text-xs text-gray-500 transition hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      </motion.div>
    </main>
  );
}
