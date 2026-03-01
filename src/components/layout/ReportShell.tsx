"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Sidebar, MobileSidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";

/**
 * A lightweight shell for public report pages (/report/[domain]).
 * - Always shows the TopNav (no auth redirect)
 * - Shows Sidebar only when user is logged in
 */
export function ReportShell({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const isLoggedIn = !!session?.user;

    return (
        <div className="flex flex-col min-h-screen bg-[#0d0f14] overflow-hidden">
            {/* Always-visible Top Navbar */}
            <TopNav onMenuClick={() => setMobileMenuOpen(true)} />

            <div className="flex flex-1 overflow-hidden h-[calc(100vh-56px)]">
                {/* Sidebar — always visible for dashboard feel */}
                <Sidebar hFull />
                <MobileSidebar
                    isOpen={mobileMenuOpen}
                    onClose={() => setMobileMenuOpen(false)}
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto scrollbar-hide">
                    <main className="flex-1 flex flex-col pt-0">
                        <div className="flex-1 w-full animate-in fade-in duration-700">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
