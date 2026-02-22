import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-10 px-4 md:px-8" role="contentinfo">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-[#1B2559]"
            aria-label="RankyPulse home"
          >
            <Zap className="h-5 w-5 text-[#4318ff]" />
            RankyPulse
          </Link>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <Link
              href="/#features"
              className="text-sm text-gray-600 transition-colors hover:text-[#4318ff]"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-gray-600 transition-colors hover:text-[#4318ff]"
            >
              Pricing
            </Link>
            <Link
              href="/audit"
              className="text-sm text-gray-600 transition-colors hover:text-[#4318ff]"
            >
              Run audit
            </Link>
            <Link
              href="/auth/signin"
              className="text-sm text-gray-600 transition-colors hover:text-[#4318ff]"
            >
              Sign in
            </Link>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-gray-500 md:text-left">
          Built for founders, marketers, and agencies who want real SEO results — not just reports.
        </p>
        <p className="mt-4 text-center text-sm text-gray-400 md:text-left">
          © {new Date().getFullYear()} RankyPulse. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
