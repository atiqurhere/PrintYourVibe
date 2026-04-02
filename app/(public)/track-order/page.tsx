"use client";
import Link from "next/link";
import { useState } from "react";
import { Search, Package, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

const MOCK_ORDER = {
  orderNumber: "PYV-12345",
  status: "dispatched" as const,
  customer: "Jane Smith",
  estimatedDelivery: "3 Apr – 5 Apr 2026",
  carrier: "Royal Mail",
  tracking: "RM123456789GB",
  items: [{ name: "Classic Premium Tee", colour: "Jet Black", size: "M", qty: 1, price: 19.99 }],
  timeline: [
    { status: "Order Placed",    date: "31 Mar 2026, 11:42am", done: true },
    { status: "Payment Confirmed", date: "31 Mar 2026, 11:43am", done: true },
    { status: "Printing",       date: "1 Apr 2026, 09:15am",  done: true },
    { status: "Dispatched",     date: "2 Apr 2026, 14:00pm",  done: true },
    { status: "Delivered",      date: "Estimated 3–5 Apr",    done: false },
  ],
};

export default function TrackOrderPage() {
  const [orderNum, setOrderNum] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<typeof MOCK_ORDER | null>(null);
  const [error, setError] = useState("");

  const handleSearch = () => {
    if (orderNum.toUpperCase() === "PYV-12345" && email.includes("@")) {
      setResult(MOCK_ORDER);
      setError("");
    } else {
      setError("No order found with those details. Try PYV-12345 with any email.");
      setResult(null);
    }
  };

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
            <Input id="order-num" label="Order Number" placeholder="e.g. PYV-12345" value={orderNum} onChange={(e) => setOrderNum(e.target.value)} />
            <Input id="track-email" label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button variant="primary" size="lg" className="w-full" onClick={handleSearch}>
              <Search size={16} /> Track Order
            </Button>
          </div>
        </div>

        {result && (
          <div className="bg-dark-card border border-gold/12 rounded-2xl p-8 animate-scale-in">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-heading text-xl text-cream font-semibold">{result.orderNumber}</h2>
                <p className="text-sm text-cream-muted mt-1">{result.customer}</p>
              </div>
              <Badge variant={result.status}>{result.status}</Badge>
            </div>

            {/* Tracking info */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-dark-elevated rounded-xl p-4">
                <div className="flex items-center gap-2 text-gold mb-1"><Package size={14} /><span className="font-label text-[10px] uppercase tracking-widest">Carrier</span></div>
                <p className="text-sm text-cream">{result.carrier}</p>
                <p className="font-label text-xs text-gold mt-1">{result.tracking}</p>
              </div>
              <div className="bg-dark-elevated rounded-xl p-4">
                <div className="flex items-center gap-2 text-gold mb-1"><Clock size={14} /><span className="font-label text-[10px] uppercase tracking-widest">Est. Arrival</span></div>
                <p className="text-sm text-cream">{result.estimatedDelivery}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="timeline-line space-y-0 mb-8">
              {result.timeline.map((t, i) => (
                <div key={i} className="flex items-start gap-4 pb-6">
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 z-10 relative ${t.done ? "bg-gold/15 border-gold/40" : "bg-dark-elevated border-cream-faint/20"}`}>
                    {t.done ? <CheckCircle2 size={14} className="text-gold" /> : <div className="w-2 h-2 rounded-full bg-cream-faint/30" />}
                  </div>
                  <div>
                    <p className={`font-heading text-sm font-semibold ${t.done ? "text-cream" : "text-cream-faint"}`}>{t.status}</p>
                    <p className="font-label text-[10px] text-cream-faint mt-0.5">{t.date}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Items */}
            <div className="border-t border-gold/10 pt-6">
              <p className="font-label text-[11px] uppercase tracking-widest text-cream-faint mb-4">Items in this order</p>
              {result.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-cream-muted">{item.name} <span className="text-cream-faint">({item.colour}, {item.size}) ×{item.qty}</span></span>
                  <span className="text-cream">£{item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
