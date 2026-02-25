"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/horizon";
import { PageLayout } from "@/components/layout/PageLayout";
import { ArrowLeft, ExternalLink, HelpCircle, Shield } from "lucide-react";

export default function ForgotPasswordClientPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center">
          <Card extra="p-8 md:p-10 w-full overflow-hidden" default={true}>
            <div className="mb-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
                  <Shield className="h-7 w-7 text-indigo-500" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-[#1B2559] md:text-3xl">
                Sign in with Google
              </h1>
              <p className="mt-3 text-gray-600">
                RankyPulse uses <strong>Google Sign-In</strong> for authentication.
                There is no separate RankyPulse password to reset.
              </p>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5 text-sm text-gray-700">
              <p className="mb-3 font-semibold text-indigo-800">
                To manage your Google account password:
              </p>
              <ol className="list-decimal space-y-1.5 pl-4 text-gray-600">
                <li>Visit your Google Account security settings</li>
                <li>Go to <strong>Signing in to Google</strong></li>
                <li>Select <strong>Password</strong> to update it</li>
              </ol>
            </div>

            <a
              href="https://myaccount.google.com/security"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4318ff] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#3311db]"
            >
              Go to Google Account settings
              <ExternalLink className="h-4 w-4" />
            </a>

            <p className="mt-6 text-center text-sm text-gray-600">
              Ready to sign in?{" "}
              <Link
                href="/auth/signin"
                className="font-semibold text-[#4318ff] transition-colors hover:underline"
              >
                Back to sign in
              </Link>
            </p>

            <div className="mt-6 flex justify-center">
              <a
                href="mailto:support@rankypulse.com?subject=Sign%20in%20help"
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
