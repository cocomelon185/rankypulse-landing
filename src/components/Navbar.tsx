"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";

const navLinks: { href: string; label: string }[] = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-lg" aria-label="Main navigation">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-[#1B2559] shrink-0"
          aria-label="RankyPulse home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4318ff] text-white shadow-md">
            <Zap className="h-5 w-5" />
          </div>
          RankyPulse
        </Link>
        <div className="flex items-center gap-1 md:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                pathname === link.href
                  ? "bg-[#eff6ff] text-[#4318ff]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/auth/signin"
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            Sign in
          </Link>
          <Link
            href="/audit"
            className="shrink-0 rounded-xl bg-[#4318ff] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#3311db] hover:shadow-lg"
            aria-label="Run audit"
          >
            Run audit
          </Link>
        </div>
      </div>
    </nav>
  );
}
