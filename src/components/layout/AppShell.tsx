"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar, MobileSidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";

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
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#0E1117" }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-4 animate-spin"
            style={{ borderColor: "rgba(255,100,45,0.25)", borderTopColor: "#FF642D" }}
          />
          <span className="text-xs tracking-widest uppercase" style={{ color: "#4A5568" }}>
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen overflow-hidden" style={{ background: "#0E1117" }}>
      {/* Global Top Navbar */}
      <TopNav onMenuClick={() => setMobileMenuOpen(true)} />

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        {/* Desktop Sidebar */}
        <Sidebar hFull />
        <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto custom-scrollbar">
          <main className="flex-1 flex flex-col">
            <div className="flex-1 w-full max-w-[1600px] mx-auto p-5 md:p-7">
              {children}
            </div>
            <Footer />
          </main>
        </div>
      </div>
    </div>
  );
}
