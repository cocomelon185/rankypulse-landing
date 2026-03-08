"use client";

import { Users } from "lucide-react";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export function CompetitorsClient() {
  return (
    <ComingSoonPage
      feature="Competitors"
      description="Track your top competitors, compare SEO metrics side-by-side, and find gaps you can exploit to outrank them. We're building this now."
      icon={<Users size={28} style={{ color: "#FF642D" }} />}
    />
  );
}
