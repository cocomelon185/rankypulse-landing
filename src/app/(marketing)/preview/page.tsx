/**
 * TEMPORARY PREVIEW — shows dashboard layout without auth (delete after reviewing)
 */
"use client";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Bell, Clock, Search, ChevronDown,
} from "lucide-react";

export default function PreviewPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden" style={{ background: "#0E1117" }}>
      {/* Mock TopNav */}
      <nav
        className="w-full flex items-center gap-4 px-6 h-16 border-b sticky top-0 z-50"
        style={{ background: "#0D1424", borderColor: "#1E2940" }}
      >
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-xl">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#4A5568" }} />
            <input
              readOnly
              placeholder="Search websites, keywords..."
              className="w-full h-10 pl-10 pr-4 rounded-xl text-[13px] outline-none"
              style={{ background: "#151B27", border: "1px solid #1E2940", color: "#C8D0E0" }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="relative p-2.5 rounded-xl" style={{ color: "#6B7A99" }}>
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: "#FF642D", border: "2px solid #0D1424" }} />
          </button>
          <button className="p-2.5 rounded-xl" style={{ color: "#6B7A99" }}>
            <Clock size={18} />
          </button>
          <div className="w-px h-6 mx-1" style={{ background: "#1E2940" }} />
          <div className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "linear-gradient(135deg,#FF642D,#E8541F)" }}>JD</div>
            <div className="flex flex-col items-start leading-none gap-0.5">
              <span className="text-[13px] font-semibold text-white">John Doe</span>
              <span className="text-[11px]" style={{ color: "#6B7A99" }}>Founder</span>
            </div>
            <ChevronDown size={14} style={{ color: "#4A5568" }} />
          </div>
        </div>
      </nav>

      {/* Layout */}
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        <Sidebar hFull />
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar">
          <div className="p-5 md:p-7 w-full max-w-[1600px] mx-auto">
            <DashboardClient />
          </div>
        </div>
      </div>
    </div>
  );
}
