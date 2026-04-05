/**
 * POST /api/webhook
 * Stripe webhook handler — saves completed orders to Supabase.
 * Must be configured on stripe.com dashboard: endpoint = https://yoursite.com/api/webhook
 * Events: checkout.session.completed
 */
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Lazy-initialize Stripe to avoid build-time crash when env vars are not set
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" as any });
}

// Service-role client — bypasses RLS so we can insert orders server-side
function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    { auth: { persistSession: false } }
  );
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("[webhook] Signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata || {};

    try {
      const items = JSON.parse(meta.items || "[]");
      const subtotalPence = session.amount_subtotal ?? 0;
      const totalPence = session.amount_total ?? 0;
      const shippingPence = (session as any).total_details?.amount_shipping ?? 0;
      const discountPence = Number(meta.couponDiscount || 0);

      // Increment coupon used_count if applicable
      if (meta.couponCode) {
        void getDb().rpc("increment_coupon_use", { code: meta.couponCode });
      }

      const db = getDb();
      const { error } = await db.from("orders").insert({
        order_number:         meta.orderNumber,
        user_id:              meta.userId || null,
        status:               "confirmed",
        subtotal_pence:       subtotalPence,
        shipping_pence:       shippingPence,
        discount_pence:       discountPence,
        total_pence:          totalPence,
        coupon_code:          meta.couponCode || null,
        stripe_session_id:    session.id,
        stripe_payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : null,
        items,
        shipping_name:        meta.shippingName,
        shipping_email:       meta.shippingEmail,
        shipping_address_1:   meta.shippingLine1,
        shipping_address_2:   meta.shippingLine2 || null,
        shipping_city:        meta.shippingCity,
        shipping_postcode:    meta.shippingPostcode,
        shipping_country:     "GB",
        history: [
          { status: "pending",   note: "Order created",                by: "system", at: new Date().toISOString() },
          { status: "confirmed", note: "Payment confirmed via Stripe", by: "system", at: new Date().toISOString() },
        ],
      });

      if (error) {
        console.error("[webhook] Failed to save order:", error);
        return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
      }

      console.log("[webhook] Order saved:", meta.orderNumber);
    } catch (err) {
      console.error("[webhook] Processing error:", err);
      return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

// App Router: tell Next.js not to parse body (Stripe needs raw body to verify signature)
export const dynamic = "force-dynamic";
