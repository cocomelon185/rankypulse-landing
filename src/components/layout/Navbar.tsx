"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Menu, X, LogOut } from "lucide-react";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Audits", href: "/audits" },
  { label: "Reports", href: "/reports" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
];

export function AppNavbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    pathname === href ||
    pathname.startsWith(href + "/") ||
    // /report/* and /audit/* paths should highlight the "Audits" nav link
    (href === "/audits" &&
      (pathname.startsWith("/report/") || pathname.startsWith("/audit/")));

  return (
    <>
      <nav
        className="fixed inset-x-0 top-0 z-[100] h-16 transition-all duration-300"
        style={{
          background: scrolled
            ? "rgba(13,15,20,0.92)"
            : "rgba(13,15,20,0.6)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 40px rgba(0,0,0,0.4)" : "none",
        }}
      >
        <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span
              className="font-display text-[17px] font-bold text-white tracking-tight group-hover:opacity-85 transition-opacity"
            >
              RankyPulse
            </span>
            <span
              className="hidden sm:inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest"
              style={{
                background: "rgba(99,102,241,0.2)",
                color: "#a5b4fc",
                border: "1px solid rgba(99,102,241,0.3)",
              }}
            >
              Beta
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative rounded-lg px-4 py-2 text-[13px] font-medium transition-all duration-150"
                  style={{
                    color: active ? "#fff" : "#94a3b8",
                    fontWeight: active ? 600 : 400,
                    background: active ? "rgba(99,102,241,0.15)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = "#fff";
                      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = "#94a3b8";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {link.label}
                  {active && (
                    <span
                      className="absolute -bottom-px left-1/2 h-0.5 w-1 -translate-x-1/2 rounded-full"
                      style={{ background: "#818cf8" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            {status === "authenticated" ? (
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium text-gray-300 transition-all hover:text-white hover:bg-white/[0.06]"
              >
                <LogOut size={14} />
                Sign out
              </button>
            ) : (
              <Link
                href="/auth/signin"
                className="rounded-lg px-4 py-2 text-[13px] font-medium text-gray-300 transition-all hover:text-white hover:bg-white/[0.06]"
              >
                Sign In
              </Link>
            )}
            <Link
              href="/audit"
              className="inline-flex items-center gap-1.5 rounded-lg px-5 py-2 text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-px active:translate-y-0"
              style={{
                background: "#6366f1",
                boxShadow: "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#818cf8";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 4px 20px rgba(99,102,241,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#6366f1";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              Start Free <span aria-hidden>→</span>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="flex items-center justify-center rounded-lg p-2 text-gray-400 transition hover:bg-white/[0.06] md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[99] md:hidden"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-[100] flex h-full w-72 flex-col md:hidden"
              style={{
                background: "#0d0f14",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* Drawer header */}
              <div
                className="flex h-16 items-center justify-between px-5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-md"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                  >
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-display text-base font-bold text-white">
                    RankyPulse
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="rounded-lg p-2 text-gray-400 hover:bg-white/[0.06]"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer nav links */}
              <div className="flex-1 overflow-y-auto px-4 py-6">
                <nav className="space-y-1">
                  {NAV_LINKS.map((link) => {
                    const active = isActive(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-xl px-4 py-3 text-[15px] font-medium transition-all"
                        style={{
                          color: active ? "#fff" : "#94a3b8",
                          background: active
                            ? "rgba(99,102,241,0.15)"
                            : "transparent",
                        }}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>

                <div
                  className="my-6 h-px"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />

                <div className="space-y-3">
                  <div className="flex justify-center mb-4">
                    <ThemeToggle />
                  </div>
                  {status === "authenticated" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-center text-[14px] font-medium text-gray-300 transition hover:bg-white/[0.06]"
                      style={{ borderColor: "rgba(255,255,255,0.12)" }}
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  ) : (
                    <Link
                      href="/auth/signin"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full rounded-xl border px-4 py-3 text-center text-[14px] font-medium text-gray-300 transition hover:bg-white/[0.06]"
                      style={{ borderColor: "rgba(255,255,255,0.12)" }}
                    >
                      Sign In
                    </Link>
                  )}
                  <Link
                    href="/audit"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full rounded-xl px-4 py-3 text-center text-[14px] font-semibold text-white transition hover:opacity-90"
                    style={{ background: "#6366f1" }}
                  >
                    Start Free →
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
