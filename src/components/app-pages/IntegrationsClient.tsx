"use client";

import { Plug } from "lucide-react";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export function IntegrationsClient() {
  return (
    <ComingSoonPage
      feature="Integrations"
      description="Connect RankyPulse with Google Search Console, Google Analytics, Slack, and more to centralise your SEO data. We're building this now."
      icon={<Plug size={28} style={{ color: "#FF642D" }} />}
    />
  );
}
