import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const number = searchParams.get("number")?.trim();
  const email  = searchParams.get("email")?.trim().toLowerCase();

  if (!number || !email) {
    return NextResponse.json({ error: "Missing order number or email." }, { status: 400 });
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .ilike("order_number", number)
    .ilike("shipping_email", email)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Parse items from metadata
  let items: any[] = [];
  try {
    const meta = typeof order.items === "string" ? JSON.parse(order.items) : (order.items ?? []);
    items = meta.map((i: any) => ({
      name:     i.productName ?? i.name ?? "Item",
      colour:   i.colour ?? "",
      size:     i.size ?? "",
      quantity: i.quantity ?? 1,
    }));
  } catch {}

  return NextResponse.json({
    order_number:    order.order_number,
    status:          order.status,
    created_at:      order.created_at,
    shipping_name:   order.shipping_name,
    shipping_address: [order.shipping_address_1, order.shipping_city, order.shipping_postcode, order.shipping_country].filter(Boolean).join(", "),
    tracking_number: order.tracking_number ?? null,
    tracking_url:    order.tracking_url ?? null,
    total_pence:     order.total_pence,
    items,
  });
}
