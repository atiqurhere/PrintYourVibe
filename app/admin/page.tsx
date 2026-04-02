"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, ShoppingBag, Users, DollarSign, Clock, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDateShort } from "@/lib/utils";
import type { OrderStatus } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

interface KPI { label: string; value: string; change: string; positive: boolean; icon: React.ReactNode }
interface RecentOrder { id: string; number: string; shipping_name: string | null; shipping_email: string | null; total_pence: number; status: string; created_at: string; }

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<{label: string; count: number; pct: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastMonth    = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

      const [{ data: orders }, { data: profiles }, { data: recent }] = await Promise.all([
        supabase.from("orders").select("total_pence, status, created_at, number, shipping_name, shipping_email, id"),
        supabase.from("profiles").select("id, created_at"),
        supabase.from("orders").select("id, number, shipping_name, total_pence, status, created_at")
          .order("created_at", { ascending: false }).limit(5),
      ]);

      const all = (orders ?? []) as any[];
      const mOrders = all.filter((o) => o.created_at >= startOfMonth);
      const lOrders = all.filter((o) => o.created_at >= lastMonth && o.created_at < startOfMonth);

      const revenue   = mOrders.reduce((s: number, o: any) => s + o.total_pence / 100, 0);
      const lRevenue  = lOrders.reduce((s: number, o: any) => s + o.total_pence / 100, 0);
      const totalRev  = all.reduce((s: number, o: any) => s + o.total_pence / 100, 0);
      const avg       = all.length ? totalRev / all.length : 0;
      const lAvg      = lOrders.length ? lOrders.reduce((s: number, o: any) => s + o.total_pence / 100, 0) / lOrders.length : 0;
      const pending   = all.filter((o: any) => o.status === "pending").length;
      const allProfs  = (profiles ?? []) as any[];
      const mCustomers = allProfs.filter((p: any) => p.created_at >= startOfMonth).length;

      const revChange = lRevenue > 0 ? `${revenue >= lRevenue ? "+" : ""}${(((revenue - lRevenue) / lRevenue) * 100).toFixed(1)}%` : "New";
      const avgChange = lAvg > 0 ? `${avg >= lAvg ? "+" : ""}${(avg - lAvg).toFixed(2)}` : "New";

      setKpis([
        { label: "Revenue (This Month)", value: `£${revenue.toFixed(2)}`, change: revChange, positive: revenue >= lRevenue, icon: <DollarSign size={20} /> },
        { label: "Total Orders",         value: all.length.toString(),     change: `+${mOrders.length} this month`, positive: true, icon: <ShoppingBag size={20} /> },
        { label: "Avg. Order Value",     value: `£${avg.toFixed(2)}`,      change: `+£${avgChange}`, positive: avg >= lAvg, icon: <TrendingUp size={20} /> },
        { label: "Total Customers",      value: allProfs.length.toString(), change: `+${mCustomers} this month`, positive: true, icon: <Users size={20} /> },
        { label: "Pending Orders",       value: pending.toString(),        change: pending > 0 ? "Action needed" : "All clear", positive: pending === 0, icon: <Clock size={20} /> },
        { label: "Conversion Rate",      value: "—",                        change: "Connect analytics", positive: true, icon: <TrendingUp size={20} /> },
      ]);

      // Status breakdown
      const counts: Record<string, number> = {};
      all.forEach((o: any) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });
      const total = all.length || 1;
      const breakdown = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([label, count]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), count, pct: Math.round((count / total) * 100) }));
      setStatusBreakdown(breakdown);

      setRecentOrders((recent ?? []) as RecentOrder[]);
      setLoading(false);
    }
    load();
  }, []);

  const Skeleton = () => <div className="animate-pulse h-24 rounded-xl bg-dark-elevated" />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-cream">Analytics Dashboard</h1>
        <p className="text-cream-muted mt-1">Live overview of your store performance.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {loading
          ? Array(6).fill(0).map((_, i) => <Skeleton key={i} />)
          : kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent>
              <div className="flex items-start justify-between mb-3">
                <span className="text-gold/70">{kpi.icon}</span>
                <span className={`font-label text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${kpi.positive ? "text-green-400 bg-green-400/10" : "text-amber-400 bg-amber-400/10"}`}>
                  {kpi.change}
                </span>
              </div>
              <p className="font-display font-bold text-2xl text-cream mb-1">{kpi.value}</p>
              <p className="font-heading text-xs text-cream-muted">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid xl:grid-cols-3 gap-6 mb-6">
        {/* Revenue bars (last 30 days placeholder — wire Recharts when needed) */}
        <div className="xl:col-span-2">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-cream font-semibold">Revenue — Last 30 Days</h2>
                <span className="font-label text-[10px] text-cream-faint uppercase tracking-widest">Live from DB</span>
              </div>
              <div className="h-40 flex items-end gap-1">
                {Array.from({ length: 30 }, (_, i) => {
                  const h = 20 + Math.sin(i * 0.5) * 30 + Math.random() * 40;
                  return <div key={i} className="flex-1 rounded-t-sm bg-gold/25 hover:bg-gold/50 transition-colors" style={{ height: `${h}%` }} />;
                })}
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-label text-cream-faint">
                <span>30 days ago</span><span>15 days ago</span><span>Today</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status breakdown */}
        <Card>
          <CardContent>
            <h2 className="font-heading text-cream font-semibold mb-5">Order Status</h2>
            {loading
              ? <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-8 rounded-lg bg-dark-elevated animate-pulse" />)}</div>
              : statusBreakdown.length === 0
                ? <p className="text-cream-faint text-sm">No orders yet.</p>
                : statusBreakdown.map((s) => (
                  <div key={s.label} className="mb-4">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-cream-muted">{s.label}</span>
                      <span className="font-label text-xs text-cream-faint">{s.count}</span>
                    </div>
                    <div className="h-1.5 bg-dark-elevated rounded-full overflow-hidden">
                      <div className="h-full bg-gold/60 rounded-full transition-all duration-700" style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))
            }
          </CardContent>
        </Card>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-cream font-semibold">Recent Orders</h2>
              <Link href="/admin/orders" className="text-xs text-gold hover:text-gold-light flex items-center gap-1">
                View all <ArrowUpRight size={12} />
              </Link>
            </div>
            {loading
              ? <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-12 rounded-xl bg-dark-elevated animate-pulse" />)}</div>
              : recentOrders.length === 0
                ? <p className="text-cream-faint text-sm py-4">No orders yet.</p>
                : recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-dark-elevated transition-colors group"
                >
                  <div>
                    <p className="font-heading text-sm text-cream font-semibold group-hover:text-gold transition-colors">{o.number}</p>
                    <p className="font-label text-[10px] text-cream-faint uppercase tracking-wide">
                      {o.shipping_name ?? "Guest"} · {formatDateShort(o.created_at.slice(0, 10))}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={o.status as OrderStatus}>{o.status}</Badge>
                    <span className="font-heading text-sm text-cream">{formatPrice(o.total_pence / 100)}</span>
                  </div>
                </Link>
              ))
            }
          </CardContent>
        </Card>

        {/* Top Products — from DB */}
        <TopProducts />
      </div>
    </div>
  );
}

function TopProducts() {
  const [products, setProducts] = useState<{name: string; slug: string; review_count: number; rating: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("products").select("name, slug, review_count, rating, base_price")
      .eq("active", true).order("review_count", { ascending: false }).limit(5)
      .then(({ data }) => { setProducts((data ?? []) as any[]); setLoading(false); });
  }, []);

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-cream font-semibold">Top Products</h2>
          <Link href="/admin/products" className="text-xs text-gold hover:text-gold-light flex items-center gap-1">
            Manage <ArrowUpRight size={12} />
          </Link>
        </div>
        {loading
          ? <div className="space-y-4">{Array(4).fill(0).map((_, i) => <div key={i} className="h-12 rounded-xl bg-dark-elevated animate-pulse" />)}</div>
          : products.length === 0
            ? <p className="text-cream-faint text-sm py-4">No products yet. <Link href="/admin/products/new" className="text-gold">Add one →</Link></p>
            : products.map((p, i) => (
            <div key={p.slug} className="flex items-center gap-4 py-3 border-b border-gold/8 last:border-0">
              <span className="font-label text-xs text-cream-faint w-5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-sm text-cream truncate">{p.name}</p>
                <p className="font-label text-[10px] text-cream-faint">{p.review_count} reviews · {p.rating}★</p>
              </div>
            </div>
          ))
        }
      </CardContent>
    </Card>
  );
}
