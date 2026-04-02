"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, Layers, Wallet, ArrowRight, Clock, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDateShort } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { db } from "@/lib/supabase/queries";
import type { Order } from "@/lib/supabase/queries";

interface DashboardData {
  userName: string;
  totalOrders: number;
  pendingOrders: number;
  totalSpent: number;
  recentOrders: Order[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }

      const userId = session.user.id;
      const userName = session.user.user_metadata?.full_name
        || session.user.user_metadata?.name
        || session.user.email?.split("@")[0]
        || "there";

      // Fetch user's orders
      const { data: orders } = await db
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      const allOrders = (orders ?? []) as Order[];
      const totalSpent = allOrders.reduce((s, o) => s + o.total_pence / 100, 0);
      const pendingOrders = allOrders.filter((o) =>
        ["pending", "confirmed", "printing"].includes(o.status)
      ).length;

      setData({
        userName,
        totalOrders: allOrders.length,
        pendingOrders,
        totalSpent,
        recentOrders: allOrders.slice(0, 5),
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-dark-elevated rounded-xl w-64" />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-28 bg-dark-elevated rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const kpis = [
    { label: "Total Orders",  value: String(data?.totalOrders ?? 0),         icon: <ShoppingBag size={18} />, trend: "Lifetime" },
    { label: "In Progress",   value: String(data?.pendingOrders ?? 0),        icon: <Clock size={18} />,       trend: "Being printed/shipped" },
    { label: "Saved Designs", value: "—",                                    icon: <Layers size={18} />,      trend: "Mockup tool" },
    { label: "Total Spent",   value: formatPrice(data?.totalSpent ?? 0),     icon: <Wallet size={18} />,      trend: "Lifetime value" },
  ];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-cream">
          {greeting()}, {data?.userName} 👋
        </h1>
        <p className="text-cream-muted mt-1">Here&apos;s what&apos;s happening with your account.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent>
              <div className="flex items-start justify-between mb-3">
                <span className="text-gold/70">{kpi.icon}</span>
              </div>
              <p className="font-display font-bold text-3xl text-cream mb-1">{kpi.value}</p>
              <p className="font-heading text-sm text-cream-muted">{kpi.label}</p>
              <p className="font-label text-[10px] text-cream-faint/70 mt-1 uppercase tracking-wide">{kpi.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid xl:grid-cols-2 gap-8">
        {/* Quick Links */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-cream font-semibold">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/mockup",    icon: <Layers size={20} />,      label: "New Design",    sub: "Open mockup tool" },
                { href: "/products",  icon: <ShoppingBag size={20} />, label: "Shop Products", sub: "Browse catalogue" },
                { href: "/track-order", icon: <Clock size={20} />,     label: "Track Order",   sub: "Check delivery" },
                { href: "/dashboard/profile", icon: <User size={20} />, label: "My Profile",   sub: "Update details" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="group flex items-start gap-3 p-3 rounded-xl border border-gold/10 hover:border-gold/30 hover:bg-dark-elevated transition-all">
                  <span className="text-gold/60 group-hover:text-gold transition-colors mt-0.5">{item.icon}</span>
                  <div>
                    <p className="font-heading text-sm text-cream font-semibold group-hover:text-gold transition-colors">{item.label}</p>
                    <p className="font-label text-[10px] text-cream-faint">{item.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-cream font-semibold">Recent Orders</h2>
              <Link href="/dashboard/orders" className="text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {data?.recentOrders && data.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {data.recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-dark-elevated transition-colors group"
                  >
                    <div>
                      <p className="font-heading text-sm text-cream font-semibold group-hover:text-gold transition-colors">{order.number}</p>
                      <p className="font-label text-[10px] text-cream-faint uppercase tracking-wide mt-0.5">
                        {order.items?.[0]?.productName || "Custom Order"} · {formatDateShort(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={order.status as any}>{order.status}</Badge>
                      <span className="font-heading text-sm text-cream">{formatPrice(order.total_pence / 100)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <ShoppingBag size={32} className="text-gold/20 mx-auto mb-3" />
                <p className="text-cream-muted text-sm">No orders yet.</p>
                <Link href="/products" className="text-gold text-sm hover:text-gold-light transition-colors">
                  Browse products →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
