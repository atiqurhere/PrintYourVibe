import Link from "next/link";
import { ChevronLeft, Package, MapPin, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { OrderStatus } from "@/lib/utils";

const ORDER = {
  number: "PYV-12345", status: "dispatched" as OrderStatus, date: "2026-03-31",
  customer: { name: "Jane Doe", email: "jane@example.com", phone: "+44 7700 000000" },
  shipping: { line1: "12 Example Street", city: "London", postcode: "SW1A 1AA", country: "United Kingdom" },
  carrier: "Royal Mail", tracking: "RM123456789GB",
  items: [{ name: "Classic Premium Tee", colour: "Jet Black", size: "M", qty: 1, price: 19.99, thumb: "/products/tshirt-black.png" }],
  subtotal: 19.99, shippingCost: 3.99, total: 23.98,
  timeline: [
    { status: "Order Placed",      date: "31 Mar 2026, 11:42am", note: "Payment confirmed via Stripe.", done: true },
    { status: "Printing",          date: "1 Apr 2026, 09:15am",  note: "Your design is being printed.",  done: true },
    { status: "Dispatched",        date: "2 Apr 2026, 14:00pm",  note: "Handed to Royal Mail.",           done: true },
    { status: "Delivered",         date: "Estimated 3–5 Apr",    note: "",                                done: false },
  ],
};

export default function OrderDetailPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/orders" className="text-cream-muted hover:text-cream transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl text-cream font-semibold">{ORDER.number}</h1>
          <Badge variant={ORDER.status}>{ORDER.status}</Badge>
        </div>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-dark-card border border-gold/12 rounded-2xl p-6">
            <h2 className="font-heading text-cream font-semibold mb-4">Items Ordered</h2>
            {ORDER.items.map((item, i) => (
              <div key={i} className="flex gap-4 py-4 border-b border-gold/8 last:border-0">
                <div className="w-16 h-16 rounded-xl bg-dark-elevated overflow-hidden shrink-0">
                  <img src={item.thumb} alt={item.name} className="w-full h-full object-contain p-2" />
                </div>
                <div className="flex-1">
                  <p className="font-heading text-sm text-cream font-semibold">{item.name}</p>
                  <p className="font-label text-[10px] text-cream-faint uppercase tracking-wide mt-0.5">
                    {item.colour} · Size {item.size} · Qty {item.qty}
                  </p>
                </div>
                <span className="font-heading font-semibold text-cream">{formatPrice(item.price)}</span>
              </div>
            ))}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-cream-muted"><span>Subtotal</span><span className="text-cream">{formatPrice(ORDER.subtotal)}</span></div>
              <div className="flex justify-between text-cream-muted"><span>Shipping</span><span className="text-cream">{formatPrice(ORDER.shippingCost)}</span></div>
              <div className="flex justify-between font-heading font-bold text-base pt-2 border-t border-gold/10"><span className="text-cream">Total</span><span className="text-cream">{formatPrice(ORDER.total)}</span></div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-dark-card border border-gold/12 rounded-2xl p-6">
            <h2 className="font-heading text-cream font-semibold mb-5">Order Timeline</h2>
            <div className="timeline-line space-y-0">
              {ORDER.timeline.map((t, i) => (
                <div key={i} className="flex items-start gap-4 pb-6">
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 z-10 relative ${t.done ? "bg-gold/15 border-gold/40" : "bg-dark-elevated border-cream-faint/20"}`}>
                    {t.done ? <CheckCircle2 size={14} className="text-gold" /> : <div className="w-2 h-2 rounded-full bg-cream-faint/30" />}
                  </div>
                  <div>
                    <p className={`font-heading text-sm font-semibold ${t.done ? "text-cream" : "text-cream-faint"}`}>{t.status}</p>
                    <p className="font-label text-[10px] text-cream-faint mt-0.5">{t.date}</p>
                    {t.note && <p className="text-xs text-cream-muted mt-1">{t.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Shipping */}
          <div className="bg-dark-card border border-gold/12 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={15} className="text-gold" />
              <h3 className="font-heading text-sm text-cream font-semibold">Shipping Address</h3>
            </div>
            <div className="text-sm text-cream-muted space-y-1">
              <p className="text-cream font-semibold">{ORDER.customer.name}</p>
              <p>{ORDER.shipping.line1}</p>
              <p>{ORDER.shipping.city}, {ORDER.shipping.postcode}</p>
              <p>{ORDER.shipping.country}</p>
            </div>
          </div>

          {/* Tracking */}
          <div className="bg-dark-card border border-gold/12 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package size={15} className="text-gold" />
              <h3 className="font-heading text-sm text-cream font-semibold">Tracking</h3>
            </div>
            <p className="text-sm text-cream-muted mb-1">{ORDER.carrier}</p>
            <p className="font-label text-xs text-gold">{ORDER.tracking}</p>
          </div>

          {/* Actions */}
          <div className="bg-dark-card border border-gold/12 rounded-2xl p-5 space-y-3">
            <h3 className="font-heading text-sm text-cream font-semibold mb-2">Actions</h3>
            {ORDER.status === "delivered" && (
              <Button variant="primary" size="md" className="w-full">Leave a Review</Button>
            )}
            <Button variant="secondary" size="md" className="w-full">Request Return / Refund</Button>
            <Link href="/track-order">
              <Button variant="ghost" size="md" className="w-full text-cream-muted">Track Order</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
