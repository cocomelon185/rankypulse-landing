"use client";

import Link from "next/link";
import { Search, ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopNav() {
    return (
        <nav className="w-full flex items-center justify-between px-4 lg:px-6 h-14 border-b border-white/5 shadow-2xl z-50 sticky top-0" style={{ backgroundColor: "#251e40" }}>
            {/* Left section: Logo & Links */}
            <div className="flex items-center gap-6">
                <Link href="/dashboard" className="flex items-center gap-2 mr-4">
                    <div className="w-8 h-8 rounded bg-gradient-to-tr from-[#ff7e5f] to-[#feb47b] flex items-center justify-center -rotate-12 transform shadow-lg shadow-orange-500/20">
                        <div className="w-4 h-4 rounded-full bg-white opacity-90 shadow-inner"></div>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white uppercase hidden sm:block">RankyPulse</span>
                </Link>

                <div className="hidden lg:flex items-center gap-4 text-sm font-medium text-gray-300">
                    <Link href="/enterprise" className="hover:text-white transition-colors">Enterprise</Link>
                    <button className="flex items-center gap-1 hover:text-white transition-colors">
                        More <ChevronDown size={14} />
                    </button>

                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs ml-2 cursor-pointer border border-white/20">
                        C
                    </div>
                </div>
            </div>

            {/* Center: Global Search */}
            <div className="flex-1 max-w-2xl mx-6 hidden md:block">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Search domain, keyword or URL"
                        className="w-full bg-[#352c5c] text-white border-none rounded bg-opacity-70 py-1.5 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-gray-400"
                    />
                    <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {/* Right section: CTA & Pricing */}
            <div className="flex items-center gap-4">
                <Button className="font-semibold bg-[#00c58e] hover:bg-[#00ad7c] text-white border-0 py-0 h-8 px-4 rounded shadow-lg shadow-[#00c58e]/20 text-sm">
                    Start free trial
                </Button>
                <Link href="/pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block">
                    Pricing
                </Link>
                <div className="w-px h-5 bg-white/10 hidden sm:block mx-1"></div>
                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition">
                    <User size={16} />
                </button>
            </div>
        </nav>
    );
}
