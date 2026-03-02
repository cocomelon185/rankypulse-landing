"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Payment links mapped from Razorpay dashboard screenshot
const PAYMENT_LINKS: Record<string, string> = {
  starter_usd_monthly: "https://rzp.io/rzp/xCsGfhy",
  pro_usd_monthly: "https://rzp.io/rzp/ZxZjm2W",
  starter_usd_annual: "https://rzp.io/rzp/T1SKAzMw",
  pro_usd_annual: "https://rzp.io/rzp/DHqvNC3",
  starter_inr_monthly: "https://rzp.io/rzp/lkSdM6mU",
  pro_inr_monthly: "https://rzp.io/rzp/8GYUq0N",
  starter_inr_annual: "https://rzp.io/rzp/8vuMRQQS",
  pro_inr_annual: "https://rzp.io/rzp/XJhqG27",
};

interface RazorpayCheckoutButtonProps {
  plan: "Starter" | "Pro";
  planSlug: "starter" | "pro";
  currency: "USD" | "INR";
  billing?: "monthly" | "annual";
  variant?: "primary" | "secondary";
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export function RazorpayCheckoutButton({
  plan,
  planSlug,
  currency,
  billing = "monthly",
  variant = "primary",
  className,
  children,
  onClick,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    onClick?.();
    setLoading(true);

    const key = `${planSlug}_${currency.toLowerCase()}_${billing}`;
    const link = PAYMENT_LINKS[key];

    if (link) {
      window.location.href = link;
    } else {
      setLoading(false);
      console.error("Payment link not found for", key);
    }
  };

  return (
    <Button
      variant={variant}
      size="lg"
      className={className}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Redirecting…
        </>
      ) : (
        children ?? `Buy ${plan}`
      )}
    </Button>
  );
}
