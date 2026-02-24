"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileSearch,
  BarChart3,
  TrendingUp,
  Users,
  ListChecks,
  Zap,
  ChevronRight,
  Menu,
  X,
  CreditCard,
} from "lucide-react";
import NextBestStepPanel from "@/components/layout/NextBestStepPanel";

const SIDEBAR_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard?view=quickwins", label: "Quick Wins", icon: Zap },
  { href: "/audit", label: "Start audit", icon: FileSearch },
  { href: "/features/discoverability", label: "Discoverability", icon: BarChart3 },
  { href: "/features/growth", label: "Growth Tracker", icon: TrendingUp },
  { href: "/features/competitors", label: "Competitors", icon: Users },
  { href: "/features/action-plan", label: "Action Plan", icon: ListChecks },
  { href: "/billing", label: "Billing", icon: CreditCard },
] as const;

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

function SidebarNavContent() {
  const pathname = usePathname();
  return (
    <>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Main
        </p>
        {SIDEBAR_LINKS.map(({ href, label, icon: Icon }) => {
          const p = pathname ?? "";
          const isActive = p === href || p.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-[#eff6ff] to-[#e0e7ff] text-[#4318ff] shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
              {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-100 space-y-1 p-4">
        <Link
          href="https://rankypulse.com/pricing"
          className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#4318ff]/10 to-[#7551ff]/10 px-4 py-3 text-sm font-semibold text-[#4318ff] transition-all hover:from-[#4318ff]/20 hover:to-[#7551ff]/20"
          onClick={() => track("upgrade_click", { plan: "Pro", placement: "app_shell" })}
        >
          <Zap className="h-5 w-5" />
          Upgrade to Pro
        </Link>
        <a
          href="mailto:support@rankypulse.com?subject=RankyPulse%20Support"
          className="flex items-center gap-3 rounded-xl px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
        >
          Need help? Contact support
        </a>
      </div>
    </>
  );
}

export function AppShell({ children, title, subtitle, action }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200/80 bg-white shadow-xl transition-transform duration-200 ease-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#4318ff] to-[#7551ff] text-white shadow-md">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-[#1B2559]">RankyPulse</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto" onClick={() => setMobileOpen(false)}>
          <SidebarNavContent />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-gray-200/80 bg-white/95 shadow-sm backdrop-blur lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#4318ff] to-[#7551ff] text-white shadow-md">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-[#1B2559]">RankyPulse</span>
          </Link>
        </div>
        <SidebarNavContent />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top header bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-gray-200/80 bg-white/95 px-4 shadow-sm backdrop-blur md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex shrink-0 rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div>
            {title && (
              <>
                <h1 className="text-lg font-bold text-[#1B2559] md:text-xl">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-500">{subtitle}</p>
                )}
              </>
            )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>

        <main className="flex-1 flex gap-6 p-4 md:p-8">
          <div className="flex-1 min-w-0">{children}</div>
          <NextBestStepPanel />
        </main>
      </div>
    </div>
  );
}
