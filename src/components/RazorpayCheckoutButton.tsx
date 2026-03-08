"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";


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
  const [error, setError]     = useState<string | null>(null);

  const handleClick = async () => {
    onClick?.();
    setLoading(true);
    setError(null);

    try {
      // Create server-side payment link with user_id embedded in notes for webhook attribution
      const res = await fetch("/api/payment/create-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug, currency, billing }),
      });

      if (res.ok) {
        const { url } = await res.json();
        if (url) {
          window.location.href = url;
          return;
        }
      }

      // Payment link creation failed — surface a clear error
      setError("Payment unavailable. Please try again or contact support.");
    } catch {
      setError("Payment unavailable. Please try again or contact support.");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant={variant}
        size="lg"
        className={className}
        onClick={handleClick}
        disabled={loading}
        aria-busy={loading}
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
      {error && (
        <p className="text-xs text-red-500 text-center max-w-[220px]">{error}</p>
      )}
    </div>
  );
}
