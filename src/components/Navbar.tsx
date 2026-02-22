"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Zap } from "lucide-react";

const navLinks: { href: string; label: string; icon?: typeof LayoutDashboard }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-[#1B2559] shrink-0"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#4318ff] to-[#7551ff] text-white shadow-md">
            <Zap className="h-5 w-5" />
          </div>
          RankyPulse
        </Link>
        <div className="flex items-center gap-1 md:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                pathname === link.href
                  ? "bg-gradient-to-r from-[#eff6ff] to-[#e0e7ff] text-[#4318ff] shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {link.icon ? <link.icon className="h-4 w-4" /> : null}
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
            className="shrink-0 rounded-xl bg-gradient-to-r from-[#4318ff] to-[#7551ff] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-95"
          >
            Run Free Audit
          </Link>
        </div>
      </div>
    </nav>
  );
}
