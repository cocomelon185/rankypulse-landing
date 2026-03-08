"use client";

import { Link as LinkIcon } from "lucide-react";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export function BacklinksClient() {
  return (
    <ComingSoonPage
      feature="Backlinks"
      description="Analyze your link profile, discover referring domains, and find link-building opportunities. We're building this now."
      icon={<LinkIcon size={28} style={{ color: "#FF642D" }} />}
    />
  );
}
