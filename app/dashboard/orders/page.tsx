"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ShoppingBag, Package } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDateShort } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { db } from "@/lib/supabase/queries";
import type { Order } from "@/lib/supabase/queries";

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }

      const { data } = await db
        .from("orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      setOrders((data ?? []) as Order[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-dark-elevated rounded-xl w-48 mb-6" />
        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-dark-elevated rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-cream">My Orders</h1>
        <p className="text-cream-muted mt-1 text-sm">Track and manage all your PrintYourVibe orders.</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-dark-card border border-gold/10 rounded-2xl">
          <ShoppingBag size={48} className="text-gold/20 mb-4" />
          <h2 className="font-heading text-xl text-cream mb-2">No orders yet</h2>
          <p className="text-cream-muted text-sm mb-6">Start by browsing our collection and customising a product.</p>
          <Link href="/products" className="flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors">
            Browse Products <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="flex items-center justify-between p-5 bg-dark-card border border-gold/10 rounded-2xl hover:border-gold/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-dark-elevated border border-gold/10 flex items-center justify-center shrink-0">
                  <Package size={18} className="text-gold/50" />
                </div>
                <div>
                  <p className="font-heading text-sm text-cream font-semibold group-hover:text-gold transition-colors">{order.number}</p>
                  <p className="font-label text-[10px] text-cream-faint uppercase tracking-wide mt-0.5">
                    {order.items?.[0]?.productName || "Custom Order"}
                    {order.items?.length > 1 ? ` + ${order.items.length - 1} more` : ""}
                    {" · "}
                    {formatDateShort(order.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={order.status as any}>{order.status}</Badge>
                <span className="font-heading font-semibold text-cream">{formatPrice(order.total_pence / 100)}</span>
                <ArrowRight size={14} className="text-cream-faint group-hover:text-gold transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
