"use client";

import { FileText } from "lucide-react";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export function ContentClient() {
  return (
    <ComingSoonPage
      feature="Content Ideas"
      description="Discover content opportunities based on keyword gaps, trending topics, and competitor content strategies. We're building this now."
      icon={<FileText size={28} style={{ color: "#FF642D" }} />}
    />
  );
}
