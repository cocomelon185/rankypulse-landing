"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar, MobileSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { UpgradeBanner } from "@/components/layout/UpgradeBanner";

/** Auth guard + full layout shell */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  // Show nothing while loading / redirecting
  if (!isMounted || status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d0f14]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          <span className="text-xs text-gray-500 tracking-widest uppercase">Loading...</span>
        </div>
      </div>
    );
  }

  const isGuest = session?.user?.id === "guest-user-id-001" || session?.user?.email === "guest@rankypulse.com";
  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="flex flex-col min-h-screen bg-[#0d0f14] overflow-hidden">
      {/* Global Top Navbar */}
      <TopNav />

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <Sidebar hFull />
        <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto scrollbar-hide">
          <Header onMenuClick={() => setMobileMenuOpen(true)} />

          {/* Aggressive Upgrade Banner for guests/free users */}
          {!isAdmin && <UpgradeBanner isGuest={isGuest} />}

          <main className="flex-1 flex flex-col pt-0">
            <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-700">
              {children}
            </div>
            {/* Global Footer */}
            <Footer />
          </main>
        </div>
      </div>
    </div>
  );
}
