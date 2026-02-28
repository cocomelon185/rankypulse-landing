"use client";

import { useState } from "react";
import { Sidebar, MobileSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#0d0f14] overflow-hidden">
      {/* SEMrush-style Top Navbar */}
      <TopNav />

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-56px)]">
        {/* SEMrush-style Sidebar */}
        <Sidebar hFull />
        <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto scrollbar-hide">
          {/* We keep the old header or remove it. For now let's keep it as a secondary breadcrumb/search, but hide on big screens since TopNav has it? No, keep it as it has breadcrumbs. */}
          <Header onMenuClick={() => setMobileMenuOpen(true)} />

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
