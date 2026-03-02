"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Settings, User as UserIcon, ChevronDown, LogOut, Crown, Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function TopNav({ onMenuClick }: { onMenuClick?: () => void } = {}) {
    const { data: session } = useSession();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const initials = session?.user?.name
        ? session.user.name.slice(0, 2).toUpperCase()
        : session?.user?.email?.slice(0, 2).toUpperCase() ?? "?";

    const isAdmin = session?.user?.role === "admin";

    return (
        <nav className={cn(
            "w-full flex items-center justify-between px-4 lg:px-8 h-14 border-b transition-all z-50 sticky top-0 bg-[#0c0e14]/80 backdrop-blur-md",
            scrolled ? "border-[#1e2336] shadow-xl" : "border-transparent"
        )}>
            {/* Left section: Mobile Menu Trigger & logo (fallback) */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-[#545a72] hover:text-[#e8eaf0] hover:bg-white/5 rounded-lg transition-colors"
                >
                    <Menu size={20} />
                </button>

                {/* Mobile Logo Only */}
                <Link href="/" className="md:hidden flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#f97316] to-[#fb923c] flex items-center justify-center shadow-lg shadow-[#f97316]/20">
                        <span className="text-white font-bold text-xs">RP</span>
                    </div>
                </Link>

                <div className="hidden md:flex flex-col">
                    <h1 className="text-sm font-bold text-[#e8eaf0] tracking-tight">Dashboard Overview</h1>
                    <p className="text-[10px] text-[#545a72] font-medium uppercase tracking-[0.1em]">Property: rankypulse.com</p>
                </div>
            </div>

            {/* Center: Global Search */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
                <div className="relative group max-w-md mx-auto">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search size={14} className="text-[#545a72] group-focus-within:text-[#f97316] transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for keywords, pages or settings..."
                        className="w-full bg-[#171b26] text-[#e8eaf0] border border-[#1e2336] rounded-lg py-2 pl-10 pr-12 text-[13px] focus:outline-none focus:border-[#f97316]/50 focus:ring-4 focus:ring-[#f97316]/5 transition-all placeholder:text-[#545a72]"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-[#252a3e] bg-[#1c2130] px-1.5 font-mono text-[10px] font-medium text-[#545a72] opacity-100">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </div>
                </div>
            </div>

            {/* Right section: Action Icons + User */}
            <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button className="p-2 text-[#545a72] hover:text-[#e8eaf0] hover:bg-[#171b26] rounded-lg transition-all relative group">
                        <Bell size={18} />
                        <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-[#f97316] rounded-full border border-[#0c0e14] group-hover:scale-125 transition-transform"></span>
                    </button>
                    <button className="p-2 text-[#545a72] hover:text-[#e8eaf0] hover:bg-[#171b26] rounded-lg transition-all">
                        <Settings size={18} />
                    </button>
                </div>

                <div className="w-px h-6 bg-[#1e2336] mx-1"></div>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 group p-1 pr-2 rounded-full hover:bg-[#171b26] transition-all border border-transparent hover:border-[#1e2336]"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1e2336] to-[#252a3e] flex items-center justify-center text-[#e8eaf0] text-xs font-bold border border-[#1e2336] shadow-lg group-hover:border-[#f97316]/30 transition-colors">
                            {initials}
                        </div>
                        <ChevronDown size={14} className={cn("text-[#545a72] transition-transform", showUserMenu && "rotate-180")} />
                    </button>

                    {/* Premium Dropdown */}
                    <AnimatePresence>
                        {showUserMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#12151e] border border-[#1e2336] shadow-2xl shadow-black/80 overflow-hidden z-50 p-1.5"
                            >
                                <div className="px-3 py-2.5 border-b border-[#1e2336] mb-1">
                                    <p className="text-xs font-bold text-[#e8eaf0] truncate">{session?.user?.name || "Account"}</p>
                                    <p className="text-[10px] text-[#545a72] truncate mt-0.5">{session?.user?.email}</p>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <Link
                                        href="/dashboard/profile"
                                        className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-[#8b91a8] hover:text-[#e8eaf0] hover:bg-[#171b26] rounded-lg transition-colors"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <UserIcon size={14} /> Profile Settings
                                    </Link>
                                    {!isAdmin && (
                                        <Link
                                            href="/pricing"
                                            className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-[#f97316] hover:bg-[#f97316]/5 rounded-lg transition-colors font-semibold"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <Crown size={14} /> Upgrade Plan
                                        </Link>
                                    )}
                                    <div className="h-px bg-[#1e2336] my-1 mx-2"></div>
                                    <button
                                        onClick={() => { setShowUserMenu(false); signOut({ callbackUrl: "/auth/signin" }); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-[#8b91a8] hover:text-[#ef4444] hover:bg-[#ef4444]/5 rounded-lg transition-colors"
                                    >
                                        <LogOut size={14} /> Sign Out
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
