"use client";

import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, User, Bell, Search, Menu } from "lucide-react";


/**
 * Note: If DropdownMenu components are missing, I will build a simple custom one. 
 * Checking availability... Assuming standard shadcn-like structure for now.
 */

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const getPageTitle = () => {
        const parts = pathname.split('/').filter(Boolean);
        if (parts.length === 0) return "Dashboard";
        const last = parts[parts.length - 1];
        return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ');
    };

    return (
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-white/5 bg-[#0d0f14]/80 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                    <Menu size={20} />
                </button>

                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                    <span className="hover:text-gray-300 transition-colors pointer-events-none">RankyPulse</span>
                    <span className="text-gray-700">/</span>
                    <h1 className="font-semibold text-gray-200">{getPageTitle()}</h1>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Search bar placeholder */}
                <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/5 rounded-full px-4 py-1.5 focus-within:border-indigo-500/50 transition-all group">
                    <Search size={14} className="text-gray-500 group-focus-within:text-indigo-400" />
                    <input
                        type="text"
                        placeholder="Search metrics..."
                        className="bg-transparent border-none outline-none text-xs text-gray-300 w-40 placeholder:text-gray-600"
                    />
                </div>

                <button className="p-2 text-gray-500 hover:text-indigo-400 hover:bg-white/5 rounded-full transition-all relative">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full border border-[#0d0f14]" />
                </button>

                <div className="h-6 w-px bg-white/10 mx-1" />

                {/* Simple User Menu */}
                <div className="flex items-center gap-3 ml-1 group cursor-pointer">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-xs font-medium text-gray-200">{session?.user?.name || "User Account"}</span>
                        <span className="text-[10px] text-gray-500">{session?.user?.email || "Free Plan"}</span>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white border border-white/10 shadow-lg shadow-indigo-500/20"
                    >
                        <User size={16} />
                    </button>
                </div>
            </div>
        </header>
    );
}
