"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Search,
  TrendingUp,
  FileSearch,
  Link as LinkIcon,
  Users,
  FileText,
  Puzzle,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "SEO TOOLS",
    items: [
      { label: "Dashboard",        href: "/dashboard",                 icon: LayoutDashboard },
      { label: "Site Audits",      href: "/audits/full",               icon: Search },
      { label: "Rank Tracking",    href: "/position-tracking",         icon: TrendingUp },
      { label: "Keyword Research", href: "/features/keyword-explorer", icon: FileSearch },
      { label: "Backlinks",        href: "/features/backlink-audit",   icon: LinkIcon },
      { label: "Competitors",      href: "/features/competitors",      icon: Users },
    ],
  },
  {
    label: "WORKSPACE",
    items: [
      { label: "Reports",      href: "/reports",      icon: FileText },
      { label: "Integrations", href: "/integrations", icon: Puzzle },
      { label: "Settings",     href: "/settings",     icon: Settings },
    ],
  },
];

// ── Logo ─────────────────────────────────────────────────────────────────────
function SidebarLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="22" r="3" fill="#FF642D" />
          <path
            d="M10 17 C10 11.477 13.134 8 16 8 C18.866 8 22 11.477 22 17"
            stroke="#FF642D" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"
          />
          <path
            d="M6 19 C6 9.059 10.477 4 16 4 C21.523 4 26 9.059 26 19"
            stroke="#FF642D" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.35"
          />
        </svg>
      </div>
      <span className="font-bold text-[17px] tracking-tight text-white">
        RankyPulse
      </span>
    </Link>
  );
}

// ── Single Nav Item ───────────────────────────────────────────────────────────
function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-150 overflow-hidden",
        active
          ? "text-[#FF642D]"
          : "text-[#8B9BB4] hover:text-[#C8D0E0] hover:bg-white/[0.04]"
      )}
      style={active ? { background: "rgba(255,100,45,0.08)" } : {}}
    >
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[#FF642D]" />
      )}
      <item.icon
        size={17}
        className={cn(
          "shrink-0 transition-colors",
          active ? "text-[#FF642D]" : "text-[#64748B]"
        )}
      />
      {item.label}
    </Link>
  );
}

// ── Pro Plan Footer ───────────────────────────────────────────────────────────
function ProPlanBlock({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="px-4 pb-5 pt-3 border-t" style={{ borderColor: "#1E2940" }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-bold text-[#FF642D]">Pro Plan</span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(0,200,83,0.15)", color: "#00C853" }}>
          Active
        </span>
      </div>
      <p className="text-[11px] mb-2" style={{ color: "#4A5568" }}>Limits</p>
      <div className="h-1.5 w-full rounded-full overflow-hidden mb-4" style={{ background: "#1E2940" }}>
        <div
          className="h-full rounded-full"
          style={{ width: "68%", background: "linear-gradient(90deg, #FF642D, #FF8C5A)" }}
        />
      </div>
      <button
        onClick={onUpgrade}
        className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}
      >
        Upgrade
      </button>
    </div>
  );
}

// ── Desktop Sidebar ───────────────────────────────────────────────────────────
export function Sidebar({ hFull }: { hFull?: boolean } = {}) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col w-60 border-r",
        hFull ? "h-full" : "h-screen sticky top-0"
      )}
      style={{ background: "#0D1424", borderColor: "#1E2940" }}
    >
      <div className="h-16 flex items-center px-5 border-b" style={{ borderColor: "#1E2940" }}>
        <SidebarLogo />
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-3 custom-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-1">
            <p className="px-4 pt-4 pb-1.5 text-[10px] font-bold tracking-widest uppercase" style={{ color: "#2E4166" }}>
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} active={isActive(item.href)} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <ProPlanBlock onUpgrade={() => router.push("/pricing")} />
    </aside>
  );
}

// ── Mobile Sidebar ────────────────────────────────────────────────────────────
export function MobileSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm lg:hidden"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 z-[120] bottom-0 w-60 border-r lg:hidden flex flex-col"
            style={{ background: "#0D1424", borderColor: "#1E2940" }}
          >
            <div
              className="h-16 flex items-center justify-between px-5 border-b"
              style={{ borderColor: "#1E2940" }}
            >
              <SidebarLogo />
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "#4A5568" }}
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-2 px-3" onClick={onClose}>
              {NAV_GROUPS.map((group) => (
                <div key={group.label} className="mb-1">
                  <p className="px-4 pt-4 pb-1.5 text-[10px] font-bold tracking-widest uppercase" style={{ color: "#2E4166" }}>
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <NavLink key={item.href} item={item} active={isActive(item.href)} />
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <ProPlanBlock onUpgrade={() => { onClose(); router.push("/pricing"); }} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
