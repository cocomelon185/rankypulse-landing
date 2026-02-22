"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, CreditCard } from "lucide-react";

interface RazorpayComingSoonModalProps {
  onClose: () => void;
  planName?: string;
  /** "razorpay" for INR, "stripe" for USD */
  paymentType?: "razorpay" | "stripe";
}

export function RazorpayComingSoonModal({ onClose, planName, paymentType = "razorpay" }: RazorpayComingSoonModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="razorpay-modal-title"
    >
      <div
        className="relative max-w-md w-full rounded-2xl bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eff6ff] to-[#e0e7ff]">
            <CreditCard className="h-8 w-8 text-[#4318ff]" />
          </div>
          <h2 id="razorpay-modal-title" className="text-xl font-bold text-[#1B2559]">
            Setup Required
          </h2>
          <p className="mt-2 text-gray-600">
            {paymentType === "stripe"
              ? `Stripe checkout for ${planName || "USD plans"} is coming soon. Switch to INR for Razorpay payments.`
              : planName
              ? `Razorpay checkout for ${planName} is not yet configured.`
              : "Razorpay checkout is not yet configured."}
            {paymentType === "razorpay" && " To enable payments:"}
          </p>
          {paymentType === "razorpay" && (
            <ol className="mt-4 list-inside list-decimal space-y-2 text-left text-sm text-gray-700">
              <li>Add <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">RAZORPAY_KEY_ID</code> and <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">RAZORPAY_KEY_SECRET</code> to your environment</li>
              <li>Add <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">NEXT_PUBLIC_RAZORPAY_KEY</code> for client checkout</li>
              <li>Restart the app and try again</li>
            </ol>
          )}
          <p className="mt-4 text-sm text-gray-500">
            Contact support@rankypulse.com for help with setup.
          </p>
          <Button onClick={onClose} className="mt-6">
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
