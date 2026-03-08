import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const PLAN_DURATION_DAYS: Record<string, number> = {
  monthly: 31,
  annual: 366,
};

/**
 * POST /api/webhooks/razorpay
 * Handles Razorpay payment events and updates user plan in Supabase.
 *
 * Configure in Razorpay Dashboard → Webhooks:
 *   URL: https://rankypulse.com/api/webhooks/razorpay
 *   Events: payment_link.paid, payment.captured
 *   Secret: RAZORPAY_WEBHOOK_SECRET env var
 */
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  // Verify HMAC-SHA256 signature
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== signature) {
    console.warn("[Razorpay Webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.event as string;

  // Handle payment_link.paid (preferred — has notes with user_id)
  if (eventType === "payment_link.paid") {
    const payload = event.payload as Record<string, unknown>;
    const paymentLink = (payload?.payment_link as Record<string, unknown>)?.entity as Record<string, unknown>;
    const payment = (payload?.payment as Record<string, unknown>)?.entity as Record<string, unknown>;

    const notes = paymentLink?.notes as Record<string, string> | undefined;
    const userId = notes?.user_id;
    const planSlug = notes?.plan as "starter" | "pro" | undefined;
    const billing = notes?.billing ?? "monthly";
    const paymentId = payment?.id as string | undefined;

    if (!userId || !planSlug) {
      console.error("[Razorpay Webhook] Missing user_id or plan in payment link notes", notes);
      return NextResponse.json({ error: "Missing user metadata" }, { status: 400 });
    }

    await activatePlan(userId, planSlug, billing as string, paymentId);
    return NextResponse.json({ received: true });
  }

  // Handle payment.captured (fallback — match by email)
  if (eventType === "payment.captured") {
    const payload = event.payload as Record<string, unknown>;
    const payment = (payload?.payment as Record<string, unknown>)?.entity as Record<string, unknown>;

    const notes = payment?.notes as Record<string, string> | undefined;
    const userId = notes?.user_id;
    const planSlug = notes?.plan as "starter" | "pro" | undefined;
    const billing = notes?.billing ?? "monthly";
    const paymentId = payment?.id as string | undefined;

    if (userId && planSlug) {
      await activatePlan(userId, planSlug, billing as string, paymentId);
    } else {
      // Fallback: match by email from payment contact
      const email = payment?.email as string | undefined;
      if (email && planSlug) {
        const { data: user } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("email", email)
          .single();
        if (user?.id) {
          await activatePlan(user.id, planSlug, billing as string, paymentId);
        }
      }
    }

    return NextResponse.json({ received: true });
  }

  // Acknowledge unknown events
  return NextResponse.json({ received: true });
}

async function activatePlan(
  userId: string,
  plan: "starter" | "pro",
  billing: string,
  paymentId?: string
) {
  const durationDays = PLAN_DURATION_DAYS[billing] ?? 31;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const { error } = await supabaseAdmin
    .from("users")
    .update({
      plan,
      plan_started_at: now.toISOString(),
      plan_expires_at: expiresAt.toISOString(),
      ...(paymentId ? { razorpay_payment_id: paymentId } : {}),
    })
    .eq("id", userId);

  if (error) {
    console.error("[Razorpay Webhook] Failed to update user plan:", error);
    throw new Error("DB update failed");
  }

  console.log(`[Razorpay Webhook] Activated ${plan} plan for user ${userId} until ${expiresAt.toISOString()}`);
}
