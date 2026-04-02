"use client";
import Link from "next/link";
import { useState } from "react";
import { Search, Package, MapPin, Clock, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { db } from "@/lib/supabase/queries";
import type { Order } from "@/lib/supabase/queries";
import { formatPrice } from "@/lib/utils";

type TrackResult = Order & { found: true };

export default function TrackOrderPage() {
  const [orderNum, setOrderNum] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!orderNum.trim() || !email.trim()) {
      setError("Please enter both your order number and email address.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const { data, error: dbErr } = await db
        .from("orders")
        .select("*")
        .eq("number", orderNum.trim().toUpperCase())
        .eq("shipping_email", email.trim().toLowerCase())
        .single();

      if (dbErr || !data) {
        setError("No order found with those details. Please check your order number and email.");
      } else {
        setResult({ ...data, found: true } as TrackResult);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const statusTimeline: { status: string; label: string }[] = [
    { status: "pending",   label: "Order Placed" },
    { status: "confirmed", label: "Payment Confirmed" },
    { status: "printing",  label: "Printing" },
    { status: "dispatched",label: "Dispatched" },
    { status: "delivered", label: "Delivered" },
  ];

  const ORDER_STATUS_ORDER = ["pending", "confirmed", "printing", "dispatched", "delivered"];

  function isDone(orderStatus: string, timelineStatus: string): boolean {
    const orderIdx = ORDER_STATUS_ORDER.indexOf(orderStatus);
    const timelineIdx = ORDER_STATUS_ORDER.indexOf(timelineStatus);
    return orderIdx >= timelineIdx;
  }

  return (
    <div className="pt-32 pb-24 bg-dark min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="font-label text-[11px] uppercase tracking-widest text-gold">Track</span>
          <h1 className="font-display font-bold text-4xl text-cream mt-2 mb-3">Order Tracker</h1>
          <p className="text-cream-muted">Enter your order number and email to check your delivery status.</p>
        </div>

        <div className="bg-dark-card border border-gold/12 rounded-2xl p-8 mb-8">
          <div className="space-y-5">
            <Input
              id="order-num"
              label="Order Number"
              placeholder="e.g. PYV-20260401-0001"
              value={orderNum}
              onChange={(e) => setOrderNum(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && handleSearch()}
            />
            <Input
              id="track-email"
              label="Email Address"
              type="email"
              placeholder="The email you ordered with"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && handleSearch()}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button variant="primary" size="lg" className="w-full" onClick={handleSearch} loading={loading}>
              <Search size={16} /> Track Order
            </Button>
          </div>
        </div>

        {result && (
          <div className="bg-dark-card border border-gold/12 rounded-2xl p-8 animate-scale-in">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-heading text-xl text-cream font-semibold">{result.number}</h2>
                <p className="text-sm text-cream-muted mt-1">{result.shipping_name}</p>
              </div>
              <Badge variant={result.status as any}>{result.status}</Badge>
            </div>

            {/* Tracking info */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {result.tracking ? (
                <div className="bg-dark-elevated rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gold mb-1">
                    <Package size={14} />
                    <span className="font-label text-[10px] uppercase tracking-widest">Carrier</span>
                  </div>
                  <p className="text-sm text-cream">{result.tracking.carrier}</p>
                  <p className="font-label text-xs text-gold mt-1">{result.tracking.number}</p>
                </div>
              ) : (
                <div className="bg-dark-elevated rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gold mb-1">
                    <Package size={14} />
                    <span className="font-label text-[10px] uppercase tracking-widest">Tracking</span>
                  </div>
                  <p className="text-sm text-cream-muted">Not yet dispatched</p>
                </div>
              )}
              <div className="bg-dark-elevated rounded-xl p-4">
                <div className="flex items-center gap-2 text-gold mb-1">
                  <Clock size={14} />
                  <span className="font-label text-[10px] uppercase tracking-widest">Order Total</span>
                </div>
                <p className="text-sm text-cream">{formatPrice(result.total_pence / 100)}</p>
              </div>
            </div>

            {/* Shipping Address */}
            {result.shipping_address && (
              <div className="bg-dark-elevated rounded-xl p-4 mb-8 flex items-start gap-3">
                <MapPin size={14} className="text-gold mt-1 shrink-0" />
                <div>
                  <p className="font-label text-[10px] uppercase tracking-widest text-cream-faint mb-1">Shipping Address</p>
                  <p className="text-sm text-cream">{result.shipping_name}</p>
                  <p className="text-sm text-cream-muted">
                    {result.shipping_address.line1}, {result.shipping_address.city}, {result.shipping_address.postcode}
                  </p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-0 mb-8">
              {statusTimeline.map((t, i) => {
                const done = isDone(result.status, t.status);
                const isCurrent = result.status === t.status;
                // Get timestamp from history if available
                const historyEntry = result.history?.find((h) => h.status === t.status);
                return (
                  <div key={t.status} className="flex items-start gap-4 pb-6 relative">
                    {i < statusTimeline.length - 1 && (
                      <div className={`absolute left-3 top-6 w-px h-full ${done ? "bg-gold/30" : "bg-cream-faint/10"}`} />
                    )}
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 z-10 relative transition-all
                      ${done ? "bg-gold/15 border-gold/40" : "bg-dark-elevated border-cream-faint/20"}
                      ${isCurrent ? "ring-2 ring-gold/30 ring-offset-2 ring-offset-dark" : ""}`}>
                      {done ? <CheckCircle2 size={14} className="text-gold" /> : <div className="w-2 h-2 rounded-full bg-cream-faint/30" />}
                    </div>
                    <div>
                      <p className={`font-heading text-sm font-semibold ${done ? "text-cream" : "text-cream-faint"}`}>{t.label}</p>
                      {historyEntry && (
                        <p className="font-label text-[10px] text-cream-faint mt-0.5">
                          {new Date(historyEntry.at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Items */}
            <div className="border-t border-gold/10 pt-6">
              <p className="font-label text-[11px] uppercase tracking-widest text-cream-faint mb-4">Items in this order</p>
              {result.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm mb-2">
                  <span className="text-cream-muted">
                    {item.productName} <span className="text-cream-faint">({item.colour}, {item.size}) ×{item.quantity}</span>
                  </span>
                  <span className="text-cream">{formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Link to dashboard if logged in */}
            <div className="border-t border-gold/10 pt-5 mt-4">
              <Link href="/dashboard/orders" className="flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors">
                View all orders in your dashboard <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
