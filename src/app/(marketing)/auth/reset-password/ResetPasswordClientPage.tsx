"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Lock, ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setErrorMsg("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(
          data?.error ?? "Reset failed — the link may have expired."
        );
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Could not reset — try again.");
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <p className="font-['DM_Sans'] text-gray-400">
          Invalid or expired reset link.
        </p>
        <Link
          href="/auth/forgot-password"
          className="mt-4 inline-block font-['DM_Sans'] text-sm font-semibold text-indigo-400 hover:text-indigo-300"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="space-y-4 text-center">
        <p className="font-['DM_Sans'] font-medium text-white">
          Password updated
        </p>
        <p className="font-['DM_Sans'] text-sm text-gray-400">
          You can now sign in with your new password.
        </p>
        <Link
          href="/auth/signin"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 font-['DM_Sans'] text-sm font-semibold text-white transition hover:bg-indigo-400"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label
        htmlFor="password"
        className="block font-['DM_Sans'] text-sm font-medium text-gray-400"
      >
        New password
      </label>
      <input
        id="password"
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={status === "loading"}
        placeholder="At least 8 characters"
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-['DM_Sans'] text-sm text-white placeholder-gray-500 outline-none transition focus:border-indigo-500/50 disabled:opacity-60"
      />
      <label
        htmlFor="confirm"
        className="block font-['DM_Sans'] text-sm font-medium text-gray-400"
      >
        Confirm password
      </label>
      <input
        id="confirm"
        type="password"
        required
        minLength={8}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        disabled={status === "loading"}
        placeholder="Same as above"
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-['DM_Sans'] text-sm text-white placeholder-gray-500 outline-none transition focus:border-indigo-500/50 disabled:opacity-60"
      />
      {errorMsg && (
        <p className="font-['DM_Sans'] text-sm text-red-400">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3 font-['DM_Sans'] text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
      >
        <Lock size={16} />
        {status === "loading" ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}

export function ResetPasswordClientPage() {
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
            <span className="font-['Fraunces'] text-xl font-bold text-white">
              RankyPulse
            </span>
          </Link>
          <h1 className="font-['Fraunces'] text-3xl font-bold text-white">
            Set new password
          </h1>
          <p className="mt-2 font-['DM_Sans'] text-sm text-gray-500">
            Enter your new password below.
          </p>
        </div>

        <div
          className="rounded-2xl border border-white/8 p-8"
          style={{ background: "#13161f" }}
        >
          <Suspense fallback={<p className="text-gray-400">Loading…</p>}>
            <ResetPasswordForm />
          </Suspense>

          <Link
            href="/auth/signin"
            className="mt-6 flex items-center justify-center gap-2 font-['DM_Sans'] text-xs text-gray-500 transition hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
