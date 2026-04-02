"use client";
import Link from "next/link";
import { ShoppingBag, Layers, TrendingUp, Wallet, ArrowRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDateShort } from "@/lib/utils";
import Image from "next/image";

const kpis = [
  { label: "Total Orders",    value: "12",       icon: <ShoppingBag size={18} />, trend: "+2 this month" },
  { label: "Pending",         value: "2",        icon: <Clock size={18} />,       trend: "In production" },
  { label: "Saved Designs",   value: "8",        icon: <Layers size={18} />,      trend: "Last saved today" },
  { label: "Total Spent",     value: "£284.60",  icon: <Wallet size={18} />,      trend: "Lifetime value" },
];

const recentOrders = [
  { id: "ord-1", number: "PYV-12345", product: "Classic Premium Tee", status: "dispatched" as const, date: "2026-03-31", total: 23.98 },
  { id: "ord-2", number: "PYV-12301", product: "Heavyweight Hoodie",  status: "delivered"  as const, date: "2026-03-15", total: 45.99 },
  { id: "ord-3", number: "PYV-12289", product: "Canvas Tote Bag",    status: "delivered"  as const, date: "2026-03-01", total: 16.98 },
];

const recentMockups = [
  { id: "m1", thumb: "/products/tshirt-black.png",   product: "Classic Premium Tee", date: "2026-03-31" },
  { id: "m2", thumb: "/products/hoodie-black.png",   product: "Heavyweight Hoodie",  date: "2026-03-28" },
  { id: "m3", thumb: "/products/totebag-natural.png", product: "Canvas Tote Bag",   date: "2026-03-20" },
  { id: "m4", thumb: "/products/tshirt-white.png",   product: "Relaxed Fit Tee",    date: "2026-03-15" },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-cream">Good morning, Jane 👋</h1>
        <p className="text-cream-muted mt-1">Here&apos;s what&apos;s happening with your account.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent>
              <div className="flex items-start justify-between mb-3">
                <span className="text-gold/70">{kpi.icon}</span>
                <TrendingUp size={14} className="text-green-400/50" />
              </div>
              <p className="font-display font-bold text-3xl text-cream mb-1">{kpi.value}</p>
              <p className="font-heading text-sm text-cream-muted">{kpi.label}</p>
              <p className="font-label text-[10px] text-cream-faint/70 mt-1 uppercase tracking-wide">{kpi.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid xl:grid-cols-2 gap-8">
        {/* Recent Mockups */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-cream font-semibold">Recent Mockups</h2>
              <Link href="/dashboard/mockups" className="text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {recentMockups.map((m) => (
                <Link key={m.id} href="/mockup" className="group">
                  <div className="aspect-square rounded-xl overflow-hidden bg-dark-elevated border border-gold/10 group-hover:border-gold/35 transition-all">
                    <Image src={m.thumb} alt={m.product} width={100} height={100} className="object-contain w-full h-full p-2 group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <p className="font-label text-[9px] text-cream-faint mt-1.5 text-center uppercase tracking-wide truncate">{formatDateShort(m.date)}</p>
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
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-dark-elevated transition-colors group"
                >
                  <div>
                    <p className="font-heading text-sm text-cream font-semibold group-hover:text-gold transition-colors">{order.number}</p>
                    <p className="font-label text-[10px] text-cream-faint uppercase tracking-wide mt-0.5">{order.product} · {formatDateShort(order.date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={order.status}>{order.status}</Badge>
                    <span className="font-heading text-sm text-cream">{formatPrice(order.total)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
