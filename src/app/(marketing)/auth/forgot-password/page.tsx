"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/horizon";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/PageLayout";
import { ArrowLeft, Mail, HelpCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center">
          <Card extra="p-8 md:p-10 w-full overflow-hidden" default={true}>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-[#1B2559] md:text-3xl">
                Forgot password?
              </h1>
              <p className="mt-2 text-gray-600">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Placeholder: wire to auth API when ready
              }}
              className="space-y-4"
            >
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-[#4318ff] focus:outline-none focus:ring-4 focus:ring-[#4318ff]/20"
              />
              <Button type="submit" className="w-full" size="lg">
                <Mail className="mr-2 h-5 w-5" />
                Send reset link
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Remember your password?{" "}
              <Link href="https://rankypulse.com/auth/signin" className="font-semibold text-[#4318ff] transition-colors hover:underline">
                Sign in
              </Link>
            </p>

            <div className="mt-6 flex justify-center">
              <a
                href="mailto:support@rankypulse.com?subject=Password%20reset%20help"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-[#4318ff] hover:underline"
              >
                <HelpCircle className="h-4 w-4" />
                Need help?
              </a>
            </div>

            <Link
              href="/"
              className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500 transition-colors hover:text-[#4318ff]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </Card>
        </div>
      </PageLayout>
      <Footer />
    </div>
  );
}
