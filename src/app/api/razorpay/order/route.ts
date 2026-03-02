import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

const PLAN_AMOUNTS: Record<string, { INR: number; USD: number }> = {
  starter: { INR: 99900, USD: 900 },         // ₹999 or $9
  starter_annual: { INR: 958800, USD: 8400 }, // ₹9,588 or $84 (Total for 12 months)
  pro: { INR: 260000, USD: 2900 },           // ₹2,600 or $29
  pro_annual: { INR: 2496000, USD: 27600 },  // ₹24,960 or $276 (Total for 12 months)
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
    const billing = (body.billing as string)?.toLowerCase() === "annual" ? "annual" : "monthly";
    const currency = (body.currency as string)?.toUpperCase() === "USD" ? "USD" : "INR";

    if (!plan || !["starter", "pro"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Use 'starter' or 'pro'." },
        { status: 400 }
      );
    }

    const planKey = billing === "annual" ? `${plan}_annual` : plan;
    const amount = PLAN_AMOUNTS[planKey]?.[currency];
    if (!amount) {
      return NextResponse.json({ error: `Unknown plan configuration: ${planKey}` }, { status: 400 });
    }

    // Test mode: return mock order without calling Razorpay
    if (TEST_MODE) {
      return NextResponse.json({
        id: `order_test_${plan}_${Date.now()}`,
        amount,
        currency,
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
        currency,
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
