"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";
import { useBilling } from "@/hooks/useBilling";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY;
const HAS_RAZORPAY = !!RAZORPAY_KEY;

interface RazorpayCheckoutButtonProps {
  plan: "Starter" | "Pro";
  planSlug: "starter" | "pro";
  currency: "USD" | "INR";
  variant?: "primary" | "secondary";
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export function RazorpayCheckoutButton({
  plan,
  planSlug,
  currency,
  variant = "primary",
  className,
  children,
  onClick,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const { upgradePlan } = useBilling();

  const handleClick = async () => {
    onClick?.();

    setLoading(true);
    try {
      const res = await fetchWithTimeout("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planSlug, currency }),
        timeout: 15000,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      const isTestMode = !!data.test_mode;

      if (isTestMode) {
        // Simulate upgrade without opening Razorpay
        const verifyRes = await fetchWithTimeout("/api/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: data.id,
            razorpay_payment_id: "pay_test_ok",
            razorpay_signature: "test_signature_ok",
            plan: planSlug,
          }),
          timeout: 10000,
        });
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) throw new Error(verifyData.error || "Verification failed");
        upgradePlan(planSlug);
        toast.success(`You're now on ${plan}! (Test mode)`);
        return;
      }

      if (!HAS_RAZORPAY) {
        toast.error("Razorpay key not configured. Enable NEXT_PUBLIC_RAZORPAY_KEY for live payments.");
        return;
      }

      await openRazorpayCheckout({
        keyId: RAZORPAY_KEY,
        orderId: data.id,
        amount: data.amount,
        currency: "INR",
        plan,
        onSuccess: async (paymentRes) => {
          const verifyRes = await fetchWithTimeout("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: paymentRes.razorpay_order_id,
              razorpay_payment_id: paymentRes.razorpay_payment_id,
              razorpay_signature: paymentRes.razorpay_signature,
              plan: planSlug,
            }),
            timeout: 10000,
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");
          upgradePlan(planSlug);
          toast.success(`Welcome to ${plan}! Your plan is now active.`);
        },
        onDismiss: () => setLoading(false),
      });
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.name === "AbortError"
            ? "Request timed out. Please try again."
            : e.message
          : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
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
          Processing…
        </>
      ) : (
        children ?? `Buy ${plan}`
      )}
    </Button>
  );
}
