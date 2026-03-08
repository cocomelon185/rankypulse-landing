"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  {
    label: "Tools",
    submenu: [
      { label: "SEO Audit Tool", href: "/seo-audit-tool" },
      { label: "Technical SEO Audit", href: "/technical-seo-audit" },
      { label: "Meta Tag Checker", href: "/meta-tag-checker" },
      { label: "Internal Link Checker", href: "/internal-link-checker" },
      { label: "Redirect Checker", href: "/redirect-checker" },
      { label: "Competitor Analysis", href: "/competitor-seo-analysis" },
      { label: "View All Tools", href: "/tools" },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  {
    label: "Learn",
    submenu: [
      { label: "Blog", href: "/blog" },
      { label: "SEO Checklist", href: "/guides/technical-seo-checklist" },
      { label: "How to Audit", href: "/guides/how-to-do-seo-audit" },
      { label: "Audit Template", href: "/guides/seo-audit-template" },
      { label: "Fix Core Web Vitals", href: "/guides/fix-core-web-vitals" },
      { label: "Internal Linking", href: "/guides/internal-linking-strategy" },
    ],
  },
  {
    label: "Solutions",
    submenu: [
      { label: "For Small Business", href: "/seo-audit-for-small-business" },
      { label: "For E-commerce", href: "/seo-audit-for-ecommerce" },
      { label: "For Shopify", href: "/seo-audit-for-shopify" },
      { label: "For WordPress", href: "/seo-audit-for-wordpress" },
      { label: "For SaaS", href: "/seo-audit-for-saas" },
      { label: "For Agencies", href: "/seo-audit-for-agencies" },
      { label: "For Nonprofits", href: "/seo-audit-for-nonprofits" },
      { label: "For Local Business", href: "/seo-audit-for-local-business" },
    ],
  },
];

// ── Logo SVG ───────────────────────────────────────────────────────────────
function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="22" r="3" fill="#FF642D" />
      <path d="M10 17 C10 11.477 13.134 8 16 8 C18.866 8 22 11.477 22 17"
        stroke="#FF642D" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M6 19 C6 9.059 10.477 4 16 4 C21.523 4 26 9.059 26 19"
        stroke="#FF642D" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.35" />
    </svg>
  );
}

export function AppNavbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href.split("#")[0] + "/");

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-[100] h-16 transition-all duration-300 ${scrolled
            ? "bg-[#0C1020]/95 border-b border-[#1E2940] shadow-2xl backdrop-blur-[20px]"
            : "bg-[#0C1020]/70 border-b border-transparent backdrop-blur-[12px]"
          }`}
      >
        <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <LogoMark />
            <span className="font-bold text-[17px] tracking-tight text-white group-hover:opacity-90 transition-opacity">
              RankyPulse
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const hasSubmenu = "submenu" in link;
              const active = !hasSubmenu && isActive(link.href as string);
              const isSubmenuOpen = openSubmenu === link.label;

              return (
                <div key={link.label} className="relative group">
                  {hasSubmenu ? (
                    <button
                      className="relative rounded-lg px-4 py-2 text-[13px] font-medium transition-all duration-150 flex items-center gap-1.5"
                      style={{
                        color: isSubmenuOpen ? "#fff" : "#8B9BB4",
                        background: isSubmenuOpen ? "rgba(255,100,45,0.08)" : "transparent",
                      }}
                      onMouseEnter={() => setOpenSubmenu(link.label)}
                      onMouseLeave={() => setOpenSubmenu(null)}
                    >
                      {link.label}
                      <ChevronDown size={13} className={`transition-transform ${isSubmenuOpen ? "rotate-180" : ""}`} />
                    </button>
                  ) : (
                    <Link
                      href={link.href as string}
                      className="relative rounded-lg px-4 py-2 text-[13px] font-medium transition-all duration-150"
                      style={{
                        color: active ? "#fff" : "#8B9BB4",
                        fontWeight: active ? 600 : 400,
                        background: active ? "rgba(255,100,45,0.08)" : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.color = "#C8D0E0";
                          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.color = "#8B9BB4";
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      {link.label}
                      {active && (
                        <span
                          className="absolute -bottom-px left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full"
                          style={{ background: "#FF642D" }}
                        />
                      )}
                    </Link>
                  )}

                  {/* Dropdown menu */}
                  {hasSubmenu && isSubmenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute left-0 top-full mt-1 w-48 rounded-lg border border-[#1E2940] bg-[#0C1020] shadow-xl z-50"
                      onMouseEnter={() => setOpenSubmenu(link.label)}
                      onMouseLeave={() => setOpenSubmenu(null)}
                    >
                      {(link as any).submenu.map((item: any, idx: number) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`block px-4 py-2.5 text-[12px] font-medium transition-colors ${
                            idx === 0 ? "rounded-t-lg" : ""
                          } ${idx === (link as any).submenu.length - 1 ? "rounded-b-lg" : ""} ${
                            isActive(item.href)
                              ? "bg-[#FF642D]/10 text-[#FF642D]"
                              : "text-[#8B9BB4] hover:bg-[#1E2940]/50 hover:text-[#C8D0E0]"
                          }`}
                          onClick={() => setOpenSubmenu(null)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop auth area */}
          <div className="hidden items-center gap-3 md:flex">
            {status === "authenticated" ? (
              <>
                <Link
                  href="/app/dashboard"
                  className="rounded-lg px-4 py-2 text-[13px] font-medium transition-all hover:opacity-80"
                  style={{ color: "#8B9BB4" }}
                >
                  Go to App →
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-lg px-4 py-2 text-[13px] font-medium transition-all"
                  style={{ color: "#8B9BB4" }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="rounded-lg px-4 py-2 text-[13px] font-medium transition-all hover:text-white"
                style={{ color: "#8B9BB4" }}
              >
                Log in
              </Link>
            )}
            <Link
              href="/audit"
              className="inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-px active:translate-y-0 hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #FF642D, #E8541F)",
                boxShadow: "0 4px 20px rgba(255,100,45,0.3)",
              }}
            >
              Run Free Audit ↗
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="flex items-center justify-center rounded-lg p-2 transition hover:bg-white/[0.06] md:hidden"
            style={{ color: "#8B9BB4" }}
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
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[99] md:hidden"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-[100] flex h-full w-72 flex-col md:hidden"
              style={{ background: "#0D1424", borderLeft: "1px solid #1E2940" }}
            >
              <div className="flex h-16 items-center justify-between px-5 border-b" style={{ borderColor: "#1E2940" }}>
                <div className="flex items-center gap-2.5">
                  <LogoMark />
                  <span className="font-bold text-[17px] text-white">RankyPulse</span>
                </div>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="rounded-lg p-2 transition hover:bg-white/[0.06]"
                  style={{ color: "#8B9BB4" }}
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-6">
                <nav className="space-y-1">
                  {NAV_LINKS.map((link) => {
                    const hasSubmenu = "submenu" in link;
                    return (
                      <div key={link.label}>
                        {hasSubmenu ? (
                          <>
                            <p className="block rounded-xl px-4 py-3 text-[15px] font-medium transition-all text-white/60">
                              {link.label}
                            </p>
                            <div className="space-y-1 pl-4 mb-2">
                              {(link as any).submenu.map((item: any) => (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="block rounded-lg px-3 py-2 text-[14px] font-medium transition-all"
                                  style={{ color: "#8B9BB4" }}
                                >
                                  {item.label}
                                </Link>
                              ))}
                            </div>
                          </>
                        ) : (
                          <Link
                            key={link.label}
                            href={link.href as string}
                            onClick={() => setMobileOpen(false)}
                            className="block rounded-xl px-4 py-3 text-[15px] font-medium transition-all"
                            style={{ color: "#8B9BB4" }}
                          >
                            {link.label}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </nav>

                <div className="my-6 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

                <div className="space-y-3">
                  {status === "authenticated" ? (
                    <>
                      <Link
                        href="/app/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="block w-full rounded-xl border px-4 py-3 text-center text-[14px] font-medium transition text-white"
                        style={{ borderColor: "#1E2940", background: "rgba(255,100,45,0.08)", color: "#FF642D" }}
                      >
                        Go to App →
                      </Link>
                      <button
                        type="button"
                        onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                        className="flex w-full items-center justify-center rounded-xl border px-4 py-3 text-center text-[14px] font-medium transition"
                        style={{ borderColor: "#1E2940", color: "#8B9BB4" }}
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/signin"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full rounded-xl border px-4 py-3 text-center text-[14px] font-medium transition"
                      style={{ borderColor: "#1E2940", color: "#8B9BB4" }}
                    >
                      Log in
                    </Link>
                  )}
                  <Link
                    href="/audit"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full rounded-xl px-4 py-3 text-center text-[14px] font-semibold text-white transition hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}
                  >
                    Run Free Audit ↗
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
