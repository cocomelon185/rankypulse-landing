"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/horizon";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/PageLayout";
import { Chrome, HelpCircle } from "lucide-react";

export default function SignInClientPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center">
          <Card extra="p-8 md:p-10 w-full overflow-hidden" default={true}>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-[#1B2559] md:text-3xl">
                Sign in
              </h1>
              <p className="mt-2 text-gray-600">
                Sign in to access your RankyPulse dashboard and audit history.
              </p>
            </div>

            <Link href="/" className="block">
              <Button
                className="w-full"
                size="lg"
                onClick={() => track("auth_click", { method: "google", intent: "login" })}
              >
                <Chrome className="mr-2 h-5 w-5" />
                Sign in with Google
              </Button>
            </Link>

            <div className="mt-6 space-y-4 text-center">
              <Link
                href="/auth/forgot-password"
                className="block text-sm font-medium text-gray-600 transition-colors hover:text-[#4318ff] hover:underline"
              >
                Forgot password?
              </Link>
              <a
                href="mailto:support@rankypulse.com?subject=Sign%20in%20help"
                className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-[#4318ff] hover:underline"
              >
                <HelpCircle className="h-4 w-4" />
                Need help?
              </a>
            </div>

            <Link
              href="/"
              className="mt-8 block text-center text-sm text-gray-500 transition-colors hover:text-[#4318ff]"
            >
              ← Back to home
            </Link>
          </Card>
        </div>
      </PageLayout>
      <Footer />
    </div>
  );
}
