"use client";

import Link from "next/link";
import { BarChart3 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-12 px-4 shadow-[0_-4px_6px_-1px_rgba(112,144,176,0.04)] md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-[#1B2559]"
          >
            <BarChart3 className="h-5 w-5 text-[#4318ff]" />
            RankyPulse
          </Link>
          <div className="flex gap-6 md:gap-8">
            <Link
              href="/pricing"
              className="text-sm text-gray-600 transition-colors hover:text-[#4318ff]"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-sm text-gray-600 transition-colors hover:text-[#4318ff]"
            >
              About
            </Link>
            <Link
              href="/audit"
              className="text-sm text-gray-600 transition-colors hover:text-[#4318ff]"
            >
              Run Audit
            </Link>
            <Link
              href="/auth/signin"
              className="text-sm text-gray-600 transition-colors hover:text-[#4318ff]"
            >
              Sign in
            </Link>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} RankyPulse. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
