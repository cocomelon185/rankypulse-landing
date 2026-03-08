"use client";

import { Target } from "lucide-react";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export function CompetitorIntelligenceClient() {
  return (
    <ComingSoonPage
      feature="Competitor Intelligence"
      description="Deep competitive analysis — compare keyword overlap, backlink profiles, content gaps, and traffic estimates against your top rivals. We're building this now."
      icon={<Target size={28} style={{ color: "#FF642D" }} />}
    />
  );
}
