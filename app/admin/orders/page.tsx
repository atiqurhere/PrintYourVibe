"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Download, Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatDateShort } from "@/lib/utils";
import type { OrderStatus } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import type { Order } from "@/lib/supabase/queries";

const ALL_STATUSES: (OrderStatus | "all")[] = ["all","pending","confirmed","printing","dispatched","delivered","cancelled","refunded"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    supabase.from("orders").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setOrders((data ?? []) as Order[]); setLoading(false); });
  }, []);

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.number.toLowerCase().includes(q)
      || (o.shipping_name ?? "").toLowerCase().includes(q)
      || (o.shipping_email ?? "").toLowerCase().includes(q);
    const matchStatus = activeStatus === "all" || o.status === activeStatus;
    return matchSearch && matchStatus;
  });

  const exportCSV = () => {
    const rows = [
      ["Order #","Customer","Email","Total","Status","Date"],
      ...filtered.map((o) => [
        o.number, o.shipping_name ?? "", o.shipping_email ?? "",
        (o.total_pence / 100).toFixed(2), o.status, o.created_at.slice(0, 10),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-cream">Orders</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-amber-400 mt-1">{pendingCount} order{pendingCount > 1 ? "s" : ""} awaiting action</p>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={exportCSV}>
          <Download size={14} /> Export CSV
        </Button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-gold/10 mb-5 overflow-x-auto scrollbar-hide">
        {ALL_STATUSES.map((s) => {
          const count = s === "all" ? orders.length : orders.filter((o) => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`px-4 py-3 text-xs font-label uppercase tracking-widest whitespace-nowrap transition-colors relative capitalize shrink-0 flex items-center gap-1.5 ${activeStatus === s ? "text-gold" : "text-cream-faint hover:text-cream"}`}
            >
              {s}
              <span className={`text-[10px] ${activeStatus === s ? "text-gold/70" : "text-cream-faint/50"}`}>({count})</span>
              {activeStatus === s && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full" />}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-faint" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order number, customer, or email…"
          className="w-full bg-dark-elevated border border-gold/12 rounded-xl pl-10 pr-4 py-3 text-sm text-cream placeholder:text-cream-faint/50 focus:outline-none focus:border-gold/40 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-dark-card border border-gold/12 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/10">
              {["Order #","Customer","Total","Status","Date",""].map((h) => (
                <th key={h} className="text-left px-5 py-4 font-label text-[10px] uppercase tracking-widest text-cream-faint">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-gold/8">
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 rounded bg-dark-elevated animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              : filtered.map((o) => (
              <tr key={o.id} className="border-b border-gold/8 last:border-0 hover:bg-dark-elevated/50 transition-colors group">
                <td className="px-5 py-4 font-heading font-semibold text-cream group-hover:text-gold transition-colors">{o.number}</td>
                <td className="px-5 py-4">
                  <p className="text-cream text-sm">{o.shipping_name ?? "Guest"}</p>
                  <p className="font-label text-[10px] text-cream-faint">{o.shipping_email ?? "—"}</p>
                </td>
                <td className="px-5 py-4 font-heading font-semibold text-cream">{formatPrice(o.total_pence / 100)}</td>
                <td className="px-5 py-4"><Badge variant={o.status}>{o.status}</Badge></td>
                <td className="px-5 py-4 font-label text-[11px] text-cream-faint">{formatDateShort(o.created_at.slice(0, 10))}</td>
                <td className="px-5 py-4">
                  <Link href={`/admin/orders/${o.id}`} className="inline-flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors">
                    <Eye size={13} /> View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center text-cream-muted">
            {orders.length === 0 ? "No orders yet — orders will appear here once customers purchase." : "No orders match your filter."}
          </div>
        )}
      </div>
      <p className="mt-4 text-xs text-cream-faint text-right">
        {loading ? "Loading…" : `Showing ${filtered.length} of ${orders.length} orders`}
      </p>
    </div>
  );
}
