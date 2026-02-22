import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

const PLAN_AMOUNTS: Record<string, number> = {
  starter: 99900, // ₹999 in paise
  pro: 169900, // ₹1699 in paise
};

const TEST_MODE = !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET;

export async function POST(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request));
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }
  try {
    const body = await request.json();
    const plan = (body.plan as string)?.toLowerCase();

    if (!plan || !["starter", "pro"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Use 'starter' or 'pro'." },
        { status: 400 }
      );
    }

    const amount = PLAN_AMOUNTS[plan];
    if (!amount) {
      return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
    }

    // Test mode: return mock order without calling Razorpay
    if (TEST_MODE) {
      return NextResponse.json({
        id: `order_test_${plan}_${Date.now()}`,
        amount,
        currency: "INR",
        plan,
        test_mode: true,
      });
    }

    const keyId = process.env.RAZORPAY_KEY_ID!;
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `rp_${plan}_${Date.now()}`,
        notes: { plan },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.error?.description || "Failed to create order" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      plan,
      key_id: keyId,
    });
  } catch (e) {
    console.error("[razorpay/order]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
