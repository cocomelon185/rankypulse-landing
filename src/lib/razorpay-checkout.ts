/**
 * Razorpay checkout integration.
 * Loads script from CDN and opens checkout modal.
 */

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id?: string;
  subscription_id?: string;
  name: string;
  description?: string;
  handler: (res: RazorpayPaymentResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayPaymentResponse {
  razorpay_order_id?: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  razorpay_subscription_id?: string;
}

interface RazorpayInstance {
  open(): void;
  on(event: string, handler: () => void): void;
}

const SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_URL;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Razorpay script failed to load"));
    document.body.appendChild(s);
  });
}

export async function openRazorpayCheckout(params: {
  keyId: string;
  orderId?: string;
  subscriptionId?: string;
  amount: number;
  currency?: string;
  plan: string;
  onSuccess: (res: RazorpayPaymentResponse) => void | Promise<void>;
  onDismiss?: () => void;
}): Promise<void> {
  await loadScript();
  const Razorpay = window.Razorpay;
  if (!Razorpay) throw new Error("Razorpay not available");

  const options: RazorpayOptions = {
    key: params.keyId,
    amount: params.amount,
    currency: params.currency || "INR",
    order_id: params.orderId,
    subscription_id: params.subscriptionId,
    name: "RankyPulse",
    description: `${params.plan} plan`,
    handler: (res) => params.onSuccess(res),
    modal: {
      ondismiss: params.onDismiss,
    },
  };

  const rzp = new Razorpay(options);
  rzp.open();
}
