import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | RankyPulse",
  description: "The page you were looking for could not be found. Return to RankyPulse and run a free SEO audit.",
  robots: { index: false, follow: true },
  alternates: {
    canonical: "https://rankypulse.com/404"
  }
};

export default function NotFound() {
  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ background: "#0d0f14" }}
    >
      {/* Subtle glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/6 blur-[120px]" />
      </div>

      <div className="relative max-w-xl">
        {/* Large ghost 404 */}
        <div
          className="mb-2 font-['Fraunces'] font-bold leading-none"
          style={{ fontSize: "clamp(80px, 18vw, 140px)", color: "rgba(255,255,255,0.04)" }}
          aria-hidden="true"
        >
          404
        </div>

        <h1 className="mb-3 font-['Fraunces'] text-3xl font-bold text-white">
          This page doesn&apos;t exist
        </h1>
        <p className="mb-10 font-['DM_Sans'] text-base text-gray-400">
          But your website&apos;s SEO issues do.
        </p>

        <div className="mb-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 font-['DM_Sans'] text-sm font-semibold text-white transition-colors hover:bg-indigo-400"
          >
            Back to Home →
          </Link>
          <Link
            href="/audit"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/30 px-6 py-3 font-['DM_Sans'] text-sm font-semibold text-indigo-400 transition-colors hover:bg-indigo-500/10"
          >
            Run Free Audit →
          </Link>
        </div>

        {/* Helpful Resources */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-4">Quick Links</p>
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/#features" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Pricing
            </Link>
            <Link href="/contact" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Contact
            </Link>
            <Link href="/seo-audit-tool" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              SEO Tools
            </Link>
          </nav>
        </div>
      </div>
    </main>
  );
}
