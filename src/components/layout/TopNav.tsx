"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Bell, Clock, ChevronDown, LogOut, Crown, User as UserIcon, Menu, X,
  CheckCircle, AlertCircle, Info, Calendar, RefreshCcw, Plus,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// ── Notifications panel data (real data fetched in future; placeholder UI now) ─
const NOTIF_PLACEHOLDER = [
  { id: 1, icon: CheckCircle, color: "#00C853", title: "Audit complete", sub: "Your crawl finished — view results", time: "now" },
  { id: 2, icon: AlertCircle, color: "#FF9800", title: "New errors found", sub: "Check your issues list", time: "1h ago" },
  { id: 3, icon: Info, color: "#00B0FF", title: "Tip: add a sitemap.xml", sub: "Improves crawl coverage", time: "2d ago" },
];

function NotificationsPanel({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-80 rounded-xl border overflow-hidden z-50 shadow-2xl"
      style={{ background: "#0D1424", borderColor: "#1E2940" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#1E2940" }}>
        <p className="text-sm font-bold text-white">Notifications</p>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/[0.04]" style={{ color: "#6B7A99" }}>
          <X size={14} />
        </button>
      </div>
      <div className="divide-y" style={{ borderColor: "#1E2940" }}>
        {NOTIF_PLACEHOLDER.map((n) => (
          <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer">
            <n.icon size={16} style={{ color: n.color }} className="mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white">{n.title}</p>
              <p className="text-[11px] mt-0.5 truncate" style={{ color: "#6B7A99" }}>{n.sub}</p>
            </div>
            <span className="text-[10px] shrink-0 mt-0.5" style={{ color: "#4A5568" }}>{n.time}</span>
          </div>
        ))}
      </div>
      <div className="px-4 py-2.5 border-t" style={{ borderColor: "#1E2940" }}>
        <p className="text-[11px] text-center" style={{ color: "#4A5568" }}>
          Real-time notifications coming in a future update
        </p>
      </div>
    </motion.div>
  );
}

// ── Scheduled Audits panel ─────────────────────────────────────────────────────
function ScheduledAuditsPanel({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-72 rounded-xl border overflow-hidden z-50 shadow-2xl"
      style={{ background: "#0D1424", borderColor: "#1E2940" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#1E2940" }}>
        <p className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar size={14} style={{ color: "#FF642D" }} /> Scheduled Audits
        </p>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/[0.04]" style={{ color: "#6B7A99" }}>
          <X size={14} />
        </button>
      </div>
      <div className="px-4 py-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(255,100,45,0.1)" }}>
          <RefreshCcw size={20} style={{ color: "#FF642D" }} />
        </div>
        <p className="text-sm font-semibold text-white mb-1">No scheduled audits</p>
        <p className="text-[12px] mb-4" style={{ color: "#6B7A99" }}>
          Schedule automatic weekly audits for your projects.
        </p>
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white"
          style={{ background: "rgba(255,100,45,0.15)", color: "#FF642D" }}
        >
          <Plus size={12} /> Schedule Audit
        </button>
        <p className="text-[10px] mt-3" style={{ color: "#4A5568" }}>Scheduled audits available on Pro plan</p>
      </div>
    </motion.div>
  );
}

// ── Main TopNav ────────────────────────────────────────────────────────────────
export function TopNav({ onMenuClick }: { onMenuClick?: () => void } = {}) {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showScheduled, setShowScheduled] = useState(false);

  const displayName = session?.user?.name || "John Doe";
  const displayRole = (session?.user as any)?.role === "admin" ? "Admin" : "Founder";
  const initials = displayName.slice(0, 2).toUpperCase();
  const isAdmin = (session?.user as any)?.role === "admin";

  // Close other panel when opening one
  const toggleNotifications = () => {
    setShowScheduled(false);
    setShowUserMenu(false);
    setShowNotifications(v => !v);
  };
  const toggleScheduled = () => {
    setShowNotifications(false);
    setShowUserMenu(false);
    setShowScheduled(v => !v);
  };
  const toggleUserMenu = () => {
    setShowNotifications(false);
    setShowScheduled(false);
    setShowUserMenu(v => !v);
  };

  return (
    <nav
      className="w-full flex items-center gap-4 px-4 lg:px-6 h-16 border-b sticky top-0 z-50"
      style={{ background: "#0D1424", borderColor: "#1E2940" }}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg transition-colors"
        style={{ color: "#4A5568" }}
      >
        <Menu size={20} />
      </button>

      {/* Center: Search bar */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-xl">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <Search size={15} style={{ color: "#4A5568" }} />
          </div>
          <input
            type="text"
            placeholder="Search websites, keywords..."
            className="w-full h-10 pl-10 pr-4 rounded-xl text-[13px] outline-none transition-all"
            style={{
              background: "#151B27",
              border: "1px solid #1E2940",
              color: "#C8D0E0",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#FF642D")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#1E2940")}
          />
        </div>
      </div>

      {/* Right: Bell, Clock, User */}
      <div className="flex items-center gap-1">

        {/* Bell — Notifications */}
        <div className="relative">
          <button
            id="btn-notifications"
            onClick={toggleNotifications}
            className={cn(
              "relative p-2.5 rounded-xl transition-colors hover:bg-white/[0.04]",
              showNotifications && "bg-white/[0.06]"
            )}
            style={{ color: showNotifications ? "#FF642D" : "#6B7A99" }}
            title="Notifications"
          >
            <Bell size={18} />
            <span
              className="absolute top-2 right-2 w-2 h-2 rounded-full border-2"
              style={{ background: "#FF642D", borderColor: "#0D1424" }}
            />
          </button>
          <AnimatePresence>
            {showNotifications && (
              <NotificationsPanel onClose={() => setShowNotifications(false)} />
            )}
          </AnimatePresence>
        </div>

        {/* Clock — Scheduled Audits */}
        <div className="relative">
          <button
            id="btn-scheduled-audits"
            onClick={toggleScheduled}
            className={cn(
              "p-2.5 rounded-xl transition-colors hover:bg-white/[0.04]",
              showScheduled && "bg-white/[0.06]"
            )}
            style={{ color: showScheduled ? "#FF642D" : "#6B7A99" }}
            title="Scheduled Audits"
          >
            <Clock size={18} />
          </button>
          <AnimatePresence>
            {showScheduled && (
              <ScheduledAuditsPanel onClose={() => setShowScheduled(false)} />
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="w-px h-6 mx-1" style={{ background: "#1E2940" }} />

        {/* User profile */}
        <div className="relative">
          <button
            onClick={toggleUserMenu}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl transition-colors hover:bg-white/[0.04]"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}
            >
              {initials}
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none gap-0.5">
              <span className="text-[13px] font-semibold text-white">{displayName}</span>
              <span className="text-[11px]" style={{ color: "#6B7A99" }}>{displayRole}</span>
            </div>
            <ChevronDown
              size={14}
              className={cn("transition-transform", showUserMenu && "rotate-180")}
              style={{ color: "#4A5568" }}
            />
          </button>

          {/* User dropdown */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52 rounded-xl border overflow-hidden z-50 p-1.5 shadow-2xl"
                style={{ background: "#0D1424", borderColor: "#1E2940" }}
              >
                <div className="px-3 py-2.5 border-b mb-1" style={{ borderColor: "#1E2940" }}>
                  <p className="text-xs font-bold text-white truncate">{displayName}</p>
                  <p className="text-[10px] truncate mt-0.5" style={{ color: "#4A5568" }}>
                    {session?.user?.email}
                  </p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <Link
                    href="/app/settings"
                    className="flex items-center gap-2.5 px-3 py-2 text-[12px] rounded-lg transition-colors hover:bg-white/[0.04]"
                    style={{ color: "#8B9BB4" }}
                    onClick={() => setShowUserMenu(false)}
                  >
                    <UserIcon size={13} /> Profile Settings
                  </Link>
                  {!isAdmin && (
                    <Link
                      href="/pricing"
                      className="flex items-center gap-2.5 px-3 py-2 text-[12px] font-semibold rounded-lg transition-colors hover:bg-white/[0.04]"
                      style={{ color: "#FF642D" }}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Crown size={13} /> Upgrade Plan
                    </Link>
                  )}
                  <div className="h-px mx-2 my-1" style={{ background: "#1E2940" }} />
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      signOut({ callbackUrl: "/auth/signin" });
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] rounded-lg transition-colors hover:bg-red-500/5"
                    style={{ color: "#8B9BB4" }}
                  >
                    <LogOut size={13} /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
