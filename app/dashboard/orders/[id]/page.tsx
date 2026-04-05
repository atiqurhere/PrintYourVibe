"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Package, Clock, CheckCircle, Printer, Truck, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase/client";
import { formatPrice, formatDate, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";
import type { OrderStatus } from "@/lib/utils";

interface Order {
  id: string; order_number: string; status: OrderStatus;
  total_pence: number; created_at: string; items: string;
}

export default function UserOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = "/login"; return; }

    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", session.user.id)
      .single();

    setOrder(data);
    setLoading(false);
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  const TIMELINE = [
    { status: "pending" as OrderStatus,    icon: <Clock size={16} />,       label: "Order Placed" },
    { status: "confirmed" as OrderStatus,  icon: <CheckCircle size={16} />, label: "Confirmed" },
    { status: "printing" as OrderStatus,   icon: <Printer size={16} />,     label: "Printing" },
    { status: "dispatched" as OrderStatus, icon: <Truck size={16} />,       label: "Dispatched" },
    { status: "delivered" as OrderStatus,  icon: <Package size={16} />,     label: "Delivered" },
  ];

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-dark-elevated rounded-xl w-48" />
      <div className="h-32 bg-dark-elevated rounded-2xl" />
      <div className="h-48 bg-dark-elevated rounded-2xl" />
    </div>
  );

  if (!order) return (
    <div className="text-center py-20">
      <p className="text-cream-muted mb-4">Order not found.</p>
      <Link href="/dashboard/orders"><Button variant="secondary">← Back to orders</Button></Link>
    </div>
  );

  let items: any[] = [];
  try { items = typeof order.items === "string" ? JSON.parse(order.items) : (order.items ?? []); } catch {}

  const statusIdx = TIMELINE.findIndex((t) => t.status === order.status);
  const isCancelled = ["cancelled", "refunded"].includes(order.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/dashboard/orders" className="text-cream-faint hover:text-cream transition-colors text-sm">← Orders</Link>
        <span className="text-cream-faint/40">/</span>
        <span className="font-label text-sm text-cream">{order.order_number}</span>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-cream">{order.order_number}</h1>
          <p className="text-cream-muted text-sm mt-1">Placed {formatDate(order.created_at)}</p>
        </div>
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-label ${STATUS_COLORS[order.status as OrderStatus]}`}>
          {STATUS_LABELS[order.status as OrderStatus]}
        </span>
      </div>

      {/* Timeline */}
      {!isCancelled && (
        <div className="bg-dark-card border border-gold/12 rounded-2xl p-6">
          <h2 className="font-heading text-cream font-semibold mb-6">Order Progress</h2>
          <div className="relative">
            <div className="flex justify-between">
              {TIMELINE.map((t, i) => {
                const done   = i <= statusIdx;
                const active = i === statusIdx;
                return (
                  <div key={t.status} className="flex flex-col items-center gap-2 relative z-10">
                    <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${done ? "bg-gold border-gold text-dark" : "border-gold/20 text-cream-faint/30"} ${active ? "ring-4 ring-gold/20" : ""}`}>
                      {t.icon}
                    </div>
                    <p className={`font-label text-[9px] uppercase tracking-wider text-center hidden sm:block ${done ? "text-gold" : "text-cream-faint/40"}`}>{t.label}</p>
                  </div>
                );
              })}
            </div>
            <div className="absolute top-[18px] left-4 right-4 h-0.5 bg-dark-elevated -z-0">
              <div className="h-full bg-gold transition-all duration-700"
                style={{ width: `${Math.max(0, (statusIdx / (TIMELINE.length - 1)) * 100)}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Tracking */}
      {order.tracking_number && (
        <div className="bg-dark-card border border-gold/12 rounded-2xl p-5">
          <h2 className="font-heading text-cream font-semibold mb-2 flex items-center gap-2">
            <Truck size={15} className="text-gold" /> Tracking Information
          </h2>
          <p className="text-cream-muted text-sm">Tracking number: <span className="text-cream font-mono">{order.tracking_number}</span></p>
          {order.tracking_url && (
            <a href={order.tracking_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-gold text-sm mt-2 hover:text-gold-light transition-colors">
              Track on carrier site <ArrowRight size={14} />
            </a>
          )}
        </div>
      )}

      {/* Items */}
      <div className="bg-dark-card border border-gold/12 rounded-2xl p-6">
        <h2 className="font-heading text-cream font-semibold mb-4">Order Items</h2>
        <div className="space-y-3">
          {items.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gold/8 last:border-0">
              <div className="flex items-center gap-3">
                {item.thumbnailUrl && (
                  <div className="w-12 h-12 rounded-lg bg-dark-elevated overflow-hidden shrink-0">
                    <img src={item.thumbnailUrl} alt={item.productName} className="w-full h-full object-contain p-1" />
                  </div>
                )}
                <div>
                  <p className="font-heading text-sm text-cream font-semibold">{item.productName}</p>
                  <p className="font-label text-[10px] text-cream-faint">{item.colour} · Size {item.size}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-heading text-sm text-cream">×{item.quantity}</p>
                <p className="font-label text-xs text-cream-muted">{formatPrice(item.unitPrice * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gold/10 space-y-2 text-sm">
          <div className="flex justify-between text-cream-muted">
            <span>Shipping</span>
            <span className="text-cream">{formatPrice((order.shipping_pence ?? 0) / 100)}</span>
          </div>
          {order.discount_pence > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Discount</span>
              <span>−{formatPrice(order.discount_pence / 100)}</span>
            </div>
          )}
          <div className="flex justify-between font-heading font-bold text-base pt-2 border-t border-gold/10">
            <span className="text-cream">Total</span>
            <span className="text-cream">{formatPrice(order.total_pence / 100)}</span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      <div className="bg-dark-card border border-gold/12 rounded-2xl p-5">
        <h2 className="font-heading text-cream font-semibold mb-3 flex items-center gap-2">
          <Package size={15} className="text-gold" /> Delivery Address
        </h2>
        <p className="text-cream font-heading text-sm">{order.shipping_name}</p>
        <p className="text-cream-muted text-sm">{order.shipping_address_1}</p>
        {order.shipping_address_2 && <p className="text-cream-muted text-sm">{order.shipping_address_2}</p>}
        <p className="text-cream-muted text-sm">{[order.shipping_city, order.shipping_postcode].filter(Boolean).join(", ")}</p>
        <p className="text-cream-muted text-sm">{order.shipping_country}</p>
      </div>
    </div>
  );
}
