import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification fields" },
        { status: 400 }
      );
    }

    // Test mode: accept mock verification for order_test_* ids
    if (TEST_MODE) {
      const isValidTest =
        razorpay_order_id.startsWith("order_test_") &&
        razorpay_payment_id &&
        razorpay_signature === "test_signature_ok";
      if (isValidTest) {
        const planName = (plan || razorpay_order_id.replace("order_test_", "").split("_")[0] || "starter") as string;
        const session = await getServerSession(authOptions);
        if (session?.user?.id) {
          await supabaseAdmin.from("user_plans").upsert({
            user_id: session.user.id,
            plan: planName,
            updated_at: new Date().toISOString(),
          });
        }
        return NextResponse.json({
          success: true,
          plan: planName,
          test_mode: true,
        });
      }
      return NextResponse.json(
        { error: "Test mode: use valid test payment IDs" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const planName = (plan || "starter") as string;
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await supabaseAdmin.from("user_plans").upsert({
        user_id: session.user.id,
        plan: planName,
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      plan: planName,
    });
  } catch (e) {
    console.error("[razorpay/verify]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
