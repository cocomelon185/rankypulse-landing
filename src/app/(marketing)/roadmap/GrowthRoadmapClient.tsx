"use client";

import { AppNavbar } from "@/components/layout/Navbar";
import { GrowthRoadmap } from "@/components/audit/v2/GrowthRoadmap";

export function GrowthRoadmapClient() {
  return (
    <div className="min-h-screen bg-[#0B0F17]">
      <AppNavbar />
      <div className="pt-16">
        <GrowthRoadmap />
      </div>
    </div>
  );
}
