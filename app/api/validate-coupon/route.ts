/**
 * POST /api/validate-coupon
 * Validates a coupon code against the database and returns the discount details.
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const { code, subtotalPence } = await req.json();
    if (!code) return NextResponse.json({ valid: false, error: "No code provided" }, { status: 400 });

    const { data: coupon, error } = await db
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("active", true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ valid: false, error: "Invalid or expired coupon code." });
    }

    // Check expiry
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: "This coupon has expired." });
    }

    // Check max uses
    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ valid: false, error: "This coupon has reached its usage limit." });
    }

    // Check min order
    if (subtotalPence < (coupon.min_order || 0) * 100) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order of £${coupon.min_order} required.`,
      });
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
    });
  } catch (err: any) {
    console.error("[validate-coupon]", err);
    return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 });
  }
}
