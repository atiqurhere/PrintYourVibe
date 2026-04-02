"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Package, MapPin, CheckCircle2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { db } from "@/lib/supabase/queries";
import type { Order } from "@/lib/supabase/queries";

const STATUS_TIMELINE = [
  { status: "pending",    label: "Order Placed",        note: "We received your order." },
  { status: "confirmed",  label: "Payment Confirmed",   note: "Payment confirmed via Stripe." },
  { status: "printing",   label: "Printing",            note: "Your design is being printed." },
  { status: "dispatched", label: "Dispatched",          note: "Your parcel has been handed to the carrier." },
  { status: "delivered",  label: "Delivered",           note: "Enjoy your order!" },
];
const STATUS_ORDER = STATUS_TIMELINE.map((s) => s.status);

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setNotFound(true); setLoading(false); return; }

      const { data, error } = await db
        .from("orders")
        .select("*")
        .eq("id", id)
        .eq("user_id", session.user.id)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setOrder(data as Order);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-dark-elevated rounded-xl w-64" />
        <div className="h-48 bg-dark-elevated rounded-2xl" />
        <div className="h-64 bg-dark-elevated rounded-2xl" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Package size={48} className="text-gold/20 mb-4" />
        <h2 className="font-heading text-xl text-cream mb-2">Order not found</h2>
        <p className="text-cream-muted text-sm mb-6">This order doesn&apos;t exist or doesn&apos;t belong to your account.</p>
        <Link href="/dashboard/orders" className="text-gold hover:text-gold-light transition-colors text-sm">
          ← Back to orders
        </Link>
      </div>
    );
  }

  const currentStatusIdx = STATUS_ORDER.indexOf(order.status);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/orders" className="text-cream-muted hover:text-cream transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl text-cream font-semibold">{order.number}</h1>
          <Badge variant={order.status as any}>{order.status}</Badge>
        </div>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="xl:col-span-2 space-y-6">

          {/* Items */}
          <div className="bg-dark-card border border-gold/12 rounded-2xl p-6">
            <h2 className="font-heading text-cream font-semibold mb-4">Items Ordered</h2>
            {order.items?.map((item, i) => (
              <div key={i} className="flex gap-4 py-4 border-b border-gold/8 last:border-0">
                <div className="w-16 h-16 rounded-xl bg-dark-elevated overflow-hidden shrink-0">
                  {item.thumbnailUrl ? (
                    <Image src={item.thumbnailUrl} alt={item.productName} width={64} height={64} className="object-contain w-full h-full p-1.5" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={20} className="text-gold/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-heading text-sm text-cream font-semibold">{item.productName}</p>
                  <p className="font-label text-[10px] text-cream-faint uppercase tracking-wide mt-0.5">
                    {item.colour} · Size {item.size} · Qty {item.quantity}
                  </p>
                  {item.productSlug && (
                    <Link href={`/products/${item.productSlug}`} className="text-[10px] text-gold hover:text-gold-light transition-colors mt-1 inline-flex items-center gap-1">
                      View product <ExternalLink size={10} />
                    </Link>
                  )}
                </div>
                <span className="font-heading font-semibold text-cream shrink-0">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-cream-muted">
                <span>Subtotal</span><span className="text-cream">{formatPrice(order.subtotal_pence / 100)}</span>
              </div>
              {order.discount_pence > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}</span>
                  <span>−{formatPrice(order.discount_pence / 100)}</span>
                </div>
              )}
              <div className="flex justify-between text-cream-muted">
                <span>Shipping</span>
                <span className="text-cream">{order.shipping_pence === 0 ? "Free" : formatPrice(order.shipping_pence / 100)}</span>
              </div>
              <div className="flex justify-between font-heading font-bold text-base pt-2 border-t border-gold/10">
                <span className="text-cream">Total</span>
                <span className="text-cream">{formatPrice(order.total_pence / 100)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-dark-card border border-gold/12 rounded-2xl p-6">
            <h2 className="font-heading text-cream font-semibold mb-6">Order Progress</h2>
            <div className="space-y-0">
              {STATUS_TIMELINE.map((step, i) => {
                const done = currentStatusIdx >= i;
                const isCurrent = STATUS_ORDER[currentStatusIdx] === step.status;
                // Find history entry for this step
                const histEntry = order.history?.find((h) => h.status === step.status);
                return (
                  <div key={step.status} className="flex items-start gap-4 pb-6 relative">
                    {i < STATUS_TIMELINE.length - 1 && (
                      <div className={`absolute left-3 top-6 w-px h-full ${done ? "bg-gold/30" : "bg-cream-faint/10"}`} />
                    )}
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 z-10 relative transition-all
                      ${done ? "bg-gold/15 border-gold/40" : "bg-dark-elevated border-cream-faint/20"}
                      ${isCurrent ? "ring-2 ring-gold/30 ring-offset-2 ring-offset-dark" : ""}`}>
                      {done ? <CheckCircle2 size={14} className="text-gold" /> : <div className="w-2 h-2 rounded-full bg-cream-faint/30" />}
                    </div>
                    <div>
                      <p className={`font-heading text-sm font-semibold ${done ? "text-cream" : "text-cream-faint"}`}>
                        {step.label}
                      </p>
                      {histEntry && (
                        <p className="font-label text-[10px] text-cream-faint mt-0.5">
                          {new Date(histEntry.at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      )}
                      {done && <p className="text-xs text-cream-muted mt-0.5">{step.note}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Order info */}
          <div className="bg-dark-card border border-gold/12 rounded-2xl p-6 space-y-4">
            <h2 className="font-heading text-cream font-semibold">Order Details</h2>
            <div className="text-sm space-y-3">
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-cream-faint mb-1">Placed</p>
                <p className="text-cream">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-cream-faint mb-1">Payment</p>
                <p className="text-cream text-green-400/80">Paid via Stripe</p>
              </div>
              {order.coupon_code && (
                <div>
                  <p className="font-label text-[10px] uppercase tracking-widest text-cream-faint mb-1">Coupon</p>
                  <p className="text-gold font-label text-xs">{order.coupon_code}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tracking */}
          {order.tracking && (
            <div className="bg-dark-card border border-gold/12 rounded-2xl p-6 space-y-3">
              <h2 className="font-heading text-cream font-semibold">Tracking</h2>
              <div className="flex items-start gap-3">
                <Package size={16} className="text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-cream">{order.tracking.carrier}</p>
                  <p className="font-label text-xs text-gold mt-0.5">{order.tracking.number}</p>
                </div>
              </div>
            </div>
          )}

          {/* Shipping address */}
          {order.shipping_address && (
            <div className="bg-dark-card border border-gold/12 rounded-2xl p-6 space-y-3">
              <h2 className="font-heading text-cream font-semibold">Shipping To</h2>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-gold mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="text-cream font-semibold">{order.shipping_name}</p>
                  <p className="text-cream-muted mt-1 leading-relaxed">
                    {order.shipping_address.line1}<br />
                    {order.shipping_address.city}, {order.shipping_address.postcode}<br />
                    {order.shipping_address.country || "United Kingdom"}
                  </p>
                  {order.shipping_email && (
                    <p className="text-cream-faint text-xs mt-2">{order.shipping_email}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
