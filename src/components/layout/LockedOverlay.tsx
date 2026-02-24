"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

interface LockedOverlayProps {
  onUpgrade?: () => void;
  blur?: boolean;
  message?: string;
  placement?: string;
}

export function LockedOverlay({
  onUpgrade,
  blur = true,
  message = "Upgrade to Pro to unlock this feature",
  placement = "locked_overlay",
}: LockedOverlayProps) {
  const handleUpgradeClick = () => {
    track("upgrade_click", { plan: "Pro", placement });
  };
  return (
    <div
      className={
        blur
          ? "absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/80 backdrop-blur-md"
          : "flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50/90 to-orange-50/90 p-8"
      }
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-inner">
        <Lock className="h-8 w-8" />
      </div>
      <p className="mt-4 text-center font-semibold text-[#1B2559]">
        Pro feature
      </p>
      <p className="mt-1 max-w-xs text-center text-sm text-gray-600">
        {message}
      </p>
      <div className="mt-6">
        {onUpgrade ? (
          <Button
            onClick={() => {
              handleUpgradeClick();
              onUpgrade();
            }}
            size="lg"
          >
            Upgrade to Pro
          </Button>
        ) : (
          <Link
            href="https://rankypulse.com/pricing"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#4318ff] px-8 text-base font-semibold text-white shadow-md transition-all hover:bg-[#3311db] hover:shadow-lg"
            onClick={handleUpgradeClick}
          >
            Upgrade to Pro
          </Link>
        )}
      </div>
    </div>
  );
}
