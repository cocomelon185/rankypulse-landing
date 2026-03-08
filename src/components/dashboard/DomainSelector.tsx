"use client";

import { useState } from "react";
import { ChevronDown, Plus, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DomainSelector({ currentDomain }: { currentDomain?: string | null }) {
    const router = useRouter();

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-white/5 bg-[#0d0f14]">
            {/* Left side: Domain Selector */}
            <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    SEO Dashboard:
                    {currentDomain ? (
                        <button className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors">
                            {currentDomain} <ChevronDown size={18} />
                        </button>
                    ) : (
                        <span className="flex items-center gap-1.5 text-gray-500 text-base font-normal">
                            <Globe size={16} /> No domain selected
                        </span>
                    )}
                </h1>
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-3">
                <button className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">
                    Send feedback
                </button>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => router.push('/')}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold h-9 px-4 rounded-md shadow-lg shadow-indigo-500/20"
                    >
                        <Plus size={16} className="mr-1.5" /> Create SEO Project
                    </Button>
                    <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 h-9 px-3">
                        Share
                    </Button>
                </div>
            </div>
        </div>
    );
}
