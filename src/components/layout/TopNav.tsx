"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, ChevronDown, User, LogOut, Crown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function TopNav() {
    const { data: session } = useSession();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const initials = session?.user?.name
        ? session.user.name.slice(0, 2).toUpperCase()
        : session?.user?.email?.slice(0, 2).toUpperCase() ?? "?";

    const isAdmin = session?.user?.role === "admin";
    const isGuest = session?.user?.email === "guest@rankypulse.com";

    return (
        <nav className="w-full flex items-center justify-between px-4 lg:px-6 h-14 border-b border-white/5 shadow-2xl z-50 sticky top-0" style={{ backgroundColor: "#1a1535" }}>
            {/* Left section: Logo & Links */}
            <div className="flex items-center gap-6">
                <Link href="/dashboard" className="flex items-center gap-2 mr-4">
                    <div className="w-8 h-8 rounded bg-gradient-to-tr from-[#ff7e5f] to-[#feb47b] flex items-center justify-center -rotate-12 transform shadow-lg shadow-orange-500/20">
                        <div className="w-4 h-4 rounded-full bg-white opacity-90 shadow-inner"></div>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white uppercase hidden sm:block">RankyPulse</span>
                </Link>

                <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300">
                    <Link href="/features/keyword-gap" className="hover:text-white transition-colors">Keyword Gap</Link>
                    <Link href="/features/backlink-gap" className="hover:text-white transition-colors">Backlink Gap</Link>
                    <Link href="/features/on-page-checker" className="hover:text-white transition-colors">On-Page SEO</Link>
                    <Link href="/position-tracking" className="hover:text-white transition-colors">Tracking</Link>
                    <Link href="/features/writing-assistant" className="hover:text-white transition-colors">AI Writer</Link>
                </div>
            </div>

            {/* Center: Global Search */}
            <div className="flex-1 max-w-xl mx-6 hidden md:block">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Search domain, keyword or URL..."
                        className="w-full text-white border border-white/5 rounded-lg bg-white/[0.04] py-1.5 px-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-gray-500"
                    />
                    <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
            </div>

            {/* Right section: Plan badge + User */}
            <div className="flex items-center gap-3">
                {/* Upgrade CTA — only for non-admins */}
                {!isAdmin && (
                    <Link
                        href="/pricing"
                        className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 px-4 py-1.5 rounded-lg shadow-lg shadow-indigo-500/20 transition-all whitespace-nowrap"
                    >
                        <Crown size={12} />
                        Upgrade Plan
                    </Link>
                )}

                {isAdmin && (
                    <span className="hidden sm:flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                        <Shield size={12} /> Admin
                    </span>
                )}

                <div className="w-px h-5 bg-white/10 mx-1 hidden sm:block"></div>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 group"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold border border-white/20 shadow-lg">
                            {initials}
                        </div>
                        <div className="hidden sm:flex flex-col items-start">
                            <span className="text-xs font-medium text-gray-200 leading-none">
                                {isGuest ? "Guest User" : session?.user?.name ?? "Account"}
                            </span>
                            <span className="text-[10px] text-gray-500 leading-none mt-0.5">
                                {isAdmin ? "Admin" : isGuest ? "Free Plan" : "Free Plan"}
                            </span>
                        </div>
                        <ChevronDown size={12} className="text-gray-500 hidden sm:block" />
                    </button>

                    {/* Dropdown */}
                    {showUserMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[#1a1e2e] border border-white/10 shadow-2xl shadow-black/50 overflow-hidden z-50">
                            <div className="px-4 py-3 border-b border-white/5">
                                <p className="text-xs font-medium text-white">{session?.user?.name || "User"}</p>
                                <p className="text-[10px] text-gray-500 truncate">{session?.user?.email}</p>
                            </div>
                            <div className="py-1">
                                <Link
                                    href="/pricing"
                                    className="flex items-center gap-2 px-4 py-2 text-xs text-amber-400 hover:bg-white/5 transition-colors"
                                    onClick={() => setShowUserMenu(false)}
                                >
                                    <Crown size={12} /> Upgrade Plan
                                </Link>
                                <button
                                    onClick={() => { setShowUserMenu(false); signOut({ callbackUrl: "/auth/signin" }); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                                >
                                    <LogOut size={12} /> Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
