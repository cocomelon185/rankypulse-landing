"use client";

import { Card } from "@/components/horizon";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export function CanonicalFixCard({ url, currentScore }: { url: string; currentScore: number }) {
  const canonical = `<link rel="canonical" href="${url}" />`;
  const predicted = Math.min(100, currentScore + 10);

  const copy = () => {
    navigator.clipboard.writeText(canonical);
    toast.success("Canonical tag copied");
  };

  return (
    <Card extra="p-6 md:p-8" default={true}>
      <h3 className="text-lg font-bold text-[#1B2559]">
        Fix canonical now → boost score instantly
      </h3>

      <p className="mt-1 text-sm text-gray-600">
        Add this tag to your &lt;head&gt; to tell Google your preferred URL.
      </p>

      <div className="mt-4 rounded-xl border bg-gray-50 p-4 font-mono text-sm">
        {canonical}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Button onClick={copy} className="gap-2">
          <Copy className="h-4 w-4" />
          Copy canonical tag
        </Button>

        <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
          Score after fix: {predicted}
        </div>
      </div>
    </Card>
  );
}
