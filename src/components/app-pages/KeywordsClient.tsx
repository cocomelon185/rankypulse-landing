"use client";

import { Search } from "lucide-react";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export function KeywordsClient() {
  return (
    <ComingSoonPage
      feature="Keyword Research"
      description="Discover keywords your competitors rank for, find low-difficulty opportunities, and build your content strategy. We're building this now."
      icon={<Search size={28} style={{ color: "#FF642D" }} />}
    />
  );
}
