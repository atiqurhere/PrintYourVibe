/**
 * POST /api/checkout
 * Creates a Stripe Checkout Session and returns the URL.
 * The cart items, shipping details, and coupon are passed in the body.
 */
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe is not configured. Add STRIPE_SECRET_KEY to your environment." }, { status: 503 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-03-25.dahlia" as any });

  try {
    const body = await req.json();
    const { items, shipping, coupon, userId, shippingMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();

    // Build line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
      price_data: {
        currency: "gbp",
        product_data: {
          name: `${item.productName} — ${item.colour}, Size ${item.size}`,
          images: item.thumbnailUrl ? [item.thumbnailUrl] : [],
          metadata: {
            productId: item.productId,
            productSlug: item.productSlug,
            colour: item.colour,
            colourHex: item.colourHex,
            size: item.size,
            designUrl: item.designUrl || "",
          },
        },
        unit_amount: Math.round(item.unitPrice * 100), // £ to pence
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if not free
    const shippingCostPence = shippingMethod === "express" ? 799 : (body.subtotalPence >= 5000 ? 0 : 399);

    // Build session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: shippingCostPence, currency: "gbp" },
            display_name: shippingMethod === "express" ? "Express Delivery (1–2 days)" : "Standard Delivery (3–5 days)",
            delivery_estimate: shippingMethod === "express"
              ? { minimum: { unit: "business_day", value: 1 }, maximum: { unit: "business_day", value: 2 } }
              : { minimum: { unit: "business_day", value: 3 }, maximum: { unit: "business_day", value: 5 } },
          },
        },
      ],
      ...(coupon ? {
        discounts: [], // Stripe discounts require promo codes to be pre-created; we apply server-side
      } : {}),
      metadata: {
        orderNumber,
        userId: userId || "",
        shippingName: `${shipping.firstName} ${shipping.lastName}`,
        shippingEmail: shipping.email,
        shippingLine1: shipping.line1,
        shippingLine2: shipping.line2 || "",
        shippingCity: shipping.city,
        shippingPostcode: shipping.postcode,
        shippingPhone: shipping.phone || "",
        shippingMethod,
        couponCode: coupon?.code || "",
        couponDiscount: coupon ? String(body.discountPence || 0) : "0",
        items: JSON.stringify(items), // Stored for webhook to read
      },
      customer_email: shipping.email,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order=${orderNumber}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error("[checkout]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
