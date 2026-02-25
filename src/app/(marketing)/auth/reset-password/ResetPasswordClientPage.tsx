"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/horizon";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/PageLayout";
import { ArrowLeft, Lock } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const email = searchParams?.get("email") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
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
        body: JSON.stringify({ token, email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data?.error ?? "Reset failed — the link may have expired.");
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
        <p className="text-gray-600">Invalid or expired reset link.</p>
        <Link href="/auth/forgot-password" className="mt-4 inline-block font-semibold text-[#4318ff] hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="space-y-4 text-center">
        <p className="font-medium text-gray-800">Password updated</p>
        <p className="text-sm text-gray-600">You can now sign in with your new password.</p>
        <Link href="/auth/signin">
          <Button>Sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="email" value={email} />
      <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
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
        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#4318ff] focus:outline-none focus:ring-4 focus:ring-[#4318ff]/20 disabled:opacity-60"
      />
      <label htmlFor="confirm" className="block text-sm font-semibold text-gray-700">
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
        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#4318ff] focus:outline-none focus:ring-4 focus:ring-[#4318ff]/20 disabled:opacity-60"
      />
      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
      <Button type="submit" className="w-full" size="lg" disabled={status === "loading"}>
        <Lock className="mr-2 h-5 w-5" />
        {status === "loading" ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}

export function ResetPasswordClientPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center">
          <Card extra="p-8 md:p-10 w-full overflow-hidden" default={true}>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-[#1B2559] md:text-3xl">
                Set new password
              </h1>
              <p className="mt-2 text-gray-600">
                Enter your new password below.
              </p>
            </div>

            <Suspense fallback={<p className="text-gray-600">Loading…</p>}>
              <ResetPasswordForm />
            </Suspense>

            <Link
              href="/auth/signin"
              className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500 transition-colors hover:text-[#4318ff]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </Card>
        </div>
      </PageLayout>
      <Footer />
    </div>
  );
}
