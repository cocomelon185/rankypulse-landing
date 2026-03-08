import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Plan pricing (in paise for INR, cents for USD)
const PLAN_CONFIG: Record<
  string,
  { amount: number; currency: string; description: string }
> = {
  starter_inr_monthly: { amount: 99900, currency: "INR", description: "RankyPulse Starter – Monthly" },
  starter_inr_annual:  { amount: 799 * 12 * 100, currency: "INR", description: "RankyPulse Starter – Annual" },
  pro_inr_monthly:     { amount: 260000, currency: "INR", description: "RankyPulse Pro – Monthly" },
  pro_inr_annual:      { amount: 2080 * 12 * 100, currency: "INR", description: "RankyPulse Pro – Annual" },
  starter_usd_monthly: { amount: 900, currency: "USD", description: "RankyPulse Starter – Monthly" },
  starter_usd_annual:  { amount: 7 * 12 * 100, currency: "USD", description: "RankyPulse Starter – Annual" },
  pro_usd_monthly:     { amount: 2900, currency: "USD", description: "RankyPulse Pro – Monthly" },
  pro_usd_annual:      { amount: 23 * 12 * 100, currency: "USD", description: "RankyPulse Pro – Annual" },
};

/**
 * POST /api/payment/create-link
 * Creates a Razorpay payment link server-side with the user_id embedded in notes.
 * This allows the webhook to identify which user paid.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planSlug, currency, billing } = await req.json();
  const key = `${planSlug}_${(currency as string).toLowerCase()}_${billing}`;
  const config = PLAN_CONFIG[key];

  if (!config) {
    return NextResponse.json({ error: "Invalid plan configuration" }, { status: 400 });
  }

  const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayKeyId || !razorpayKeySecret) {
    // Fallback to pre-created payment links if Razorpay API keys not configured
    return NextResponse.json({ error: "Payment not configured" }, { status: 503 });
  }

  const credentials = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64");

  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?plan=${planSlug}`;

  const body = {
    amount: config.amount,
    currency: config.currency,
    description: config.description,
    callback_url: callbackUrl,
    callback_method: "get",
    notes: {
      user_id: session.user.id,
      user_email: session.user.email ?? "",
      plan: planSlug,
      billing,
    },
    notify: {
      sms: false,
      email: true,
    },
    reminder_enable: false,
  };

  const response = await fetch("https://api.razorpay.com/v1/payment_links", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error("[Payment Create Link] Razorpay error:", err);
    return NextResponse.json({ error: "Failed to create payment link" }, { status: 502 });
  }

  const data = await response.json();
  return NextResponse.json({ url: data.short_url });
}
