"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Package, Truck, CheckCircle, Clock, Printer, AlertCircle, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";
import type { OrderStatus } from "@/lib/utils";

const STATUS_ICONS: Record<OrderStatus, React.ReactNode> = {
  pending:    <Clock size={16} />,
  confirmed:  <CheckCircle size={16} />,
  printing:   <Printer size={16} />,
  dispatched: <Truck size={16} />,
  delivered:  <Package size={16} />,
  cancelled:  <AlertCircle size={16} />,
  refunded:   <AlertCircle size={16} />,
};

const TIMELINE_STATUSES: OrderStatus[] = ["pending", "confirmed", "printing", "dispatched", "delivered"];

interface OrderResult {
  order_number: string;
  status: OrderStatus;
  created_at: string;
  shipping_name: string;
  shipping_address: string;
  tracking_number: string | null;
  tracking_url: string | null;
  total_pence: number;
  items: { name: string; colour: string; size: string; quantity: number }[];
}

export default function TrackOrderPage() {
  const [orderNum, setOrderNum] = useState("");
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<OrderResult | null>(null);
  const [error, setError]       = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNum.trim() || !email.trim()) { setError("Please enter both your order number and email."); return; }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/track-order?number=${encodeURIComponent(orderNum.trim())}&email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setError("No order found with that number and email. Please double-check your details.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStep = result ? TIMELINE_STATUSES.indexOf(result.status as OrderStatus) : -1;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dark">
        <section className="pt-32 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-gold opacity-40" />
          <div className="relative max-w-2xl mx-auto px-4 text-center">
            <span className="font-label text-[11px] uppercase tracking-widest text-gold">Track Your Order</span>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-cream mt-4 mb-4">Where's My Order?</h1>
            <p className="text-cream-muted">Enter your order number and the email you used at checkout.</p>
          </div>
        </section>

        <section className="pb-24">
          <div className="max-w-2xl mx-auto px-4">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-dark-card border border-gold/15 rounded-2xl p-6 mb-8 space-y-4">
              <Input
                id="track-number"
                label="Order Number"
                placeholder="PYV-20240101-0001"
                value={orderNum}
                onChange={(e) => setOrderNum(e.target.value.toUpperCase())}
                icon={<Package size={16} />}
              />
              <Input
                id="track-email"
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-400/20 rounded-xl px-4 py-3">
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
                <Search size={16} /> Track Order
              </Button>
            </form>

            {/* Result */}
            {result && (
              <div className="space-y-5 animate-fade-in-up">
                {/* Status header */}
                <div className="bg-dark-card border border-gold/15 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="font-label text-[10px] uppercase tracking-widest text-cream-faint mb-1">Order</p>
                      <p className="font-heading text-cream font-bold text-lg">{result.order_number}</p>
                      <p className="font-label text-[10px] text-cream-faint mt-1">{formatDate(result.created_at)}</p>
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-label ${STATUS_COLORS[result.status]}`}>
                      {STATUS_ICONS[result.status]} {STATUS_LABELS[result.status]}
                    </span>
                  </div>

                  {/* Timeline */}
                  {!["cancelled", "refunded"].includes(result.status) && (
                    <div className="relative">
                      <div className="flex justify-between">
                        {TIMELINE_STATUSES.map((s, i) => {
                          const done   = i <= currentStep;
                          const active = i === currentStep;
                          return (
                            <div key={s} className="flex flex-col items-center gap-1.5 relative z-10">
                              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${done ? "bg-gold border-gold text-dark" : "border-gold/20 text-cream-faint/30"} ${active ? "ring-4 ring-gold/20" : ""}`}>
                                {STATUS_ICONS[s]}
                              </div>
                              <p className={`font-label text-[8px] uppercase tracking-wider hidden sm:block ${done ? "text-gold" : "text-cream-faint/40"}`}>
                                {STATUS_LABELS[s]}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      {/* Connecting line */}
                      <div className="absolute top-4 left-4 right-4 h-0.5 bg-dark-elevated -z-0">
                        <div className="h-full bg-gold transition-all duration-500"
                          style={{ width: `${Math.max(0, (currentStep / (TIMELINE_STATUSES.length - 1)) * 100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Tracking */}
                {result.tracking_number && (
                  <div className="bg-dark-card border border-gold/15 rounded-2xl p-5">
                    <h3 className="font-heading text-cream font-semibold mb-2 flex items-center gap-2">
                      <Truck size={15} className="text-gold" /> Tracking
                    </h3>
                    <p className="font-label text-xs text-cream-muted mb-2">Tracking number: <span className="text-cream">{result.tracking_number}</span></p>
                    {result.tracking_url && (
                      <a href={result.tracking_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-gold text-sm hover:text-gold-light transition-colors">
                        Track on carrier site <ChevronRight size={14} />
                      </a>
                    )}
                  </div>
                )}

                {/* Items */}
                <div className="bg-dark-card border border-gold/15 rounded-2xl p-5">
                  <h3 className="font-heading text-cream font-semibold mb-4">Items in this order</h3>
                  <div className="space-y-3">
                    {result.items?.map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gold/8 last:border-0">
                        <div>
                          <p className="font-heading text-sm text-cream">{item.name}</p>
                          <p className="font-label text-[10px] text-cream-faint">{item.colour} · {item.size}</p>
                        </div>
                        <span className="font-label text-xs text-cream-muted">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gold/10 flex justify-between">
                    <span className="font-heading text-sm text-cream-muted">Total</span>
                    <span className="font-heading font-bold text-cream">£{(result.total_pence / 100).toFixed(2)}</span>
                  </div>
                </div>

                {/* Shipping */}
                <div className="bg-dark-card border border-gold/15 rounded-2xl p-5">
                  <h3 className="font-heading text-cream font-semibold mb-2 flex items-center gap-2">
                    <Package size={15} className="text-gold" /> Shipping To
                  </h3>
                  <p className="font-heading text-sm text-cream">{result.shipping_name}</p>
                  <p className="text-cream-muted text-sm">{result.shipping_address}</p>
                </div>
              </div>
            )}

            {/* Help note */}
            <div className="mt-8 text-center">
              <p className="text-cream-muted text-sm">
                Can't find your order? <a href="/contact" className="text-gold hover:text-gold-light transition-colors">Contact support →</a>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
