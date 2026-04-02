"use client";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDateShort } from "@/lib/utils";
import type { OrderStatus } from "@/lib/utils";

const ORDERS = [
  { id: "ord-1", number: "PYV-12345", product: "Classic Premium Tee",        status: "dispatched" as OrderStatus, date: "2026-03-31", total: 23.98, items: 1 },
  { id: "ord-2", number: "PYV-12301", product: "Heavyweight Hoodie",          status: "delivered"  as OrderStatus, date: "2026-03-15", total: 45.99, items: 1 },
  { id: "ord-3", number: "PYV-12289", product: "Canvas Tote Bag",             status: "delivered"  as OrderStatus, date: "2026-03-01", total: 16.98, items: 2 },
  { id: "ord-4", number: "PYV-12210", product: "Classic Crewneck Sweatshirt", status: "cancelled"  as OrderStatus, date: "2026-02-14", total: 34.99, items: 1 },
];

const STATUS_TABS: (OrderStatus | "all")[] = ["all", "pending", "dispatched", "delivered", "cancelled"];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus | "all">("all");
  const filtered = activeTab === "all" ? ORDERS : ORDERS.filter((o) => o.status === activeTab);

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-cream mb-6">My Orders</h1>
      {/* Status tabs */}
      <div className="flex gap-1 border-b border-gold/10 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-xs font-label uppercase tracking-widest transition-colors relative capitalize ${activeTab === tab ? "text-gold" : "text-cream-faint hover:text-cream"}`}
          >
            {tab}
            {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full" />}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-cream-muted py-10 text-center">No orders found.</p>
        )}
        {filtered.map((order) => (
          <Link
            key={order.id}
            href={`/dashboard/orders/${order.id}`}
            className="flex items-center gap-4 p-5 bg-dark-card border border-gold/10 rounded-2xl hover:border-gold/30 transition-all group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-heading font-semibold text-cream group-hover:text-gold transition-colors">{order.number}</span>
                <Badge variant={order.status}>{order.status}</Badge>
              </div>
              <p className="text-sm text-cream-muted">{order.product} · {order.items} item{order.items > 1 ? "s" : ""}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-heading font-semibold text-cream">{formatPrice(order.total)}</p>
              <p className="font-label text-[10px] text-cream-faint mt-1">{formatDateShort(order.date)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
