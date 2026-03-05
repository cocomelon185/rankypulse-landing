"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Globe,
  Search,
  TrendingUp,
  Link2,
  Users,
  Zap,
  FileText as FileTextIcon,
  BarChart2,
  Plug,
  Settings,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Design tokens ──────────────────────────────────────────────────────────
const T = {
  bg: "#0E1117",
  surface: "#151B27",
  border: "#1E2940",
  accent: "#FF642D",
  accentDim: "rgba(255,100,45,0.1)",
  textPrimary: "#C8D0E0",
  textSecondary: "#8B9BB4",
  textMuted: "#6B7A99",
};

// ── Nav structure ──────────────────────────────────────────────────────────
const TOP_ITEMS = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/app/projects", icon: FolderOpen },
];

const NAV_GROUPS = [
  {
    label: "SEO TOOLS",
    items: [
      { label: "Site Audit", href: "/app/audit", icon: Globe },
      { label: "Keyword Research", href: "/app/keywords", icon: Search },
      { label: "Rank Tracking", href: "/app/rank-tracking", icon: TrendingUp },
      { label: "Backlinks", href: "/app/backlinks", icon: Link2 },
      { label: "Competitors", href: "/app/competitors", icon: Users },
    ],
  },
  {
    label: "OPTIMIZATION",
    items: [
      { label: "Action Center", href: "/app/action-center", icon: Zap },
      { label: "Content Ideas", href: "/app/content", icon: Sparkles },
    ],
  },
  {
    label: "WORKSPACE",
    items: [
      { label: "Reports", href: "/app/reports", icon: BarChart2 },
      { label: "Integrations", href: "/app/integrations", icon: Plug },
      { label: "Settings", href: "/app/settings", icon: Settings },
    ],
  },
];

// ── Shared NavItem ─────────────────────────────────────────────────────────
function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        color: active ? T.accent : T.textSecondary,
        background: active ? T.accentDim : "transparent",
        borderLeft: active ? `3px solid ${T.accent}` : "3px solid transparent",
        textDecoration: "none",
        transition: "all 0.15s",
        marginBottom: 1,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLAnchorElement).style.color = T.textPrimary;
          (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.04)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLAnchorElement).style.color = T.textSecondary;
          (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
        }
      }}
    >
      <Icon size={15} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, lineHeight: 1.3 }}>{label}</span>
      {active && <ChevronRight size={12} style={{ opacity: 0.5 }} />}
    </Link>
  );
}

// ── Logo ───────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <Link href="/app/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", padding: "4px 0" }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: "linear-gradient(135deg, #FF642D 0%, #E85420 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" fill="white" />
          <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6" />
          <circle cx="12" cy="12" r="11" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3" />
        </svg>
      </div>
      <span style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, letterSpacing: "-0.3px" }}>
        RankyPulse
      </span>
    </Link>
  );
}

// ── Pro Footer ─────────────────────────────────────────────────────────────
function ProFooter() {
  return (
    <div style={{
      margin: "0 8px 8px",
      padding: "12px",
      borderRadius: 10,
      background: T.surface,
      border: `1px solid ${T.border}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: "0.5px" }}>PRO PLAN</span>
        <span style={{ fontSize: 10, color: "#00C853", fontWeight: 600, background: "rgba(0,200,83,0.12)", padding: "2px 6px", borderRadius: 4 }}>Active</span>
      </div>
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: T.textMuted }}>Audits used</span>
          <span style={{ fontSize: 11, color: T.textSecondary }}>68 / 100</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
          <div style={{ height: "100%", width: "68%", borderRadius: 2, background: `linear-gradient(90deg, ${T.accent}, #FF9D40)` }} />
        </div>
      </div>
      <Link
        href="/billing"
        style={{
          display: "block", textAlign: "center", padding: "7px 12px",
          borderRadius: 7, fontSize: 12, fontWeight: 600, textDecoration: "none",
          background: `linear-gradient(135deg, ${T.accent}, #E85420)`,
          color: "white", marginTop: 8,
        }}
      >
        Upgrade Plan
      </Link>
    </div>
  );
}

// ── Desktop Sidebar ────────────────────────────────────────────────────────
export function AppNavigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/app/dashboard") return pathname === "/app/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside style={{
      width: 240,
      minWidth: 240,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: T.bg,
      borderRight: `1px solid ${T.border}`,
      overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px" }}>
        <Logo />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "0 8px" }} className="custom-scrollbar">
        {/* Top-level items */}
        <div style={{ marginBottom: 8 }}>
          {TOP_ITEMS.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </div>

        {/* Grouped items */}
        {NAV_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: 8 }}>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: T.textMuted,
              padding: "8px 12px 4px",
              userSelect: "none",
            }}>
              {group.label}
            </div>
            {group.items.map((item) => (
              <NavItem key={item.href} {...item} active={isActive(item.href)} />
            ))}
          </div>
        ))}
      </nav>

      {/* Pro footer */}
      <ProFooter />
    </aside>
  );
}

// ── Mobile Sidebar ─────────────────────────────────────────────────────────
export function MobileAppNavigation({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === "/app/dashboard") return pathname === "/app/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 40,
              background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)",
            }}
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 50,
              width: 240, display: "flex", flexDirection: "column",
              background: T.bg, borderRight: `1px solid ${T.border}`,
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 16px 16px" }}>
              <Logo />
              <button
                onClick={onClose}
                style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
              <div style={{ marginBottom: 8 }}>
                {TOP_ITEMS.map((item) => (
                  <div key={item.href} onClick={onClose}>
                    <NavItem {...item} active={isActive(item.href)} />
                  </div>
                ))}
              </div>
              {NAV_GROUPS.map((group) => (
                <div key={group.label} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: T.textMuted, padding: "8px 12px 4px" }}>
                    {group.label}
                  </div>
                  {group.items.map((item) => (
                    <div key={item.href} onClick={onClose}>
                      <NavItem {...item} active={isActive(item.href)} />
                    </div>
                  ))}
                </div>
              ))}
            </nav>
            <ProFooter />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
