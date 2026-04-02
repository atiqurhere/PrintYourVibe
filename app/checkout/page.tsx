"use client";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCartStore } from "@/stores/useCartStore";
import { formatPrice, generateOrderNumber, estimatedDelivery } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import { ToastProvider } from "@/components/ui/Toast";

export default function CheckoutPage() {
  const { items, subtotal, discount, shippingCost, total, shippingMethod, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderNumber] = useState(generateOrderNumber());

  const [form, setForm] = useState({
    email: "", firstName: "", lastName: "", line1: "", line2: "", city: "", postcode: "", phone: "",
  });

  const handleUpdate = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handlePayment = () => {
    setLoading(true);
    // Mock payment success
    setTimeout(() => {
      clearCart();
      window.location.href = `/checkout/success?order=${orderNumber}`;
    }, 2000);
  };

  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <ToastProvider>
        <Navbar />
        <main className="min-h-screen bg-dark flex items-center justify-center">
          <div className="text-center">
            <p className="text-cream-muted mb-6">Your cart is empty.</p>
            <Link href="/products"><Button variant="primary">Browse Products</Button></Link>
          </div>
        </main>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <Navbar />
      <main className="min-h-screen bg-dark pt-28 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display font-bold text-4xl text-cream mb-2">Checkout</h1>
          {/* Progress */}
          <div className="flex items-center gap-3 mb-10">
            {["Shipping", "Payment"].map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`flex items-center gap-2 ${step > i + 1 ? "text-green-400" : step === i + 1 ? "text-gold" : "text-cream-faint"}`}>
                  <div className={`w-7 h-7 rounded-full border flex items-center justify-center font-label text-xs font-bold transition-all
                    ${step > i + 1 ? "bg-green-400/15 border-green-400/40" : step === i + 1 ? "bg-gold/15 border-gold/40" : "border-cream-faint/20"}`}>
                    {step > i + 1 ? <CheckCircle2 size={14} /> : i + 1}
                  </div>
                  <span className="text-sm font-heading">{s}</span>
                </div>
                {i < 1 && <div className="w-8 h-px bg-gold/15" />}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Form */}
            <div className="lg:col-span-2">
              {step === 1 && (
                <div className="bg-dark-card border border-gold/12 rounded-2xl p-8 space-y-6">
                  <h2 className="font-heading text-xl text-cream font-semibold">Contact & Shipping</h2>
                  <Input id="email" label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => handleUpdate("email", e.target.value)} required />
                  <div className="grid grid-cols-2 gap-4">
                    <Input id="fname" label="First Name" placeholder="Jane" value={form.firstName} onChange={(e) => handleUpdate("firstName", e.target.value)} required />
                    <Input id="lname" label="Last Name" placeholder="Smith" value={form.lastName} onChange={(e) => handleUpdate("lastName", e.target.value)} required />
                  </div>
                  <Input id="line1" label="Address Line 1" placeholder="12 Example Street" value={form.line1} onChange={(e) => handleUpdate("line1", e.target.value)} required />
                  <Input id="line2" label="Address Line 2 (optional)" placeholder="Flat 3" value={form.line2} onChange={(e) => handleUpdate("line2", e.target.value)} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input id="city" label="City / Town" placeholder="London" value={form.city} onChange={(e) => handleUpdate("city", e.target.value)} required />
                    <Input id="postcode" label="Postcode" placeholder="SW1A 1AA" value={form.postcode} onChange={(e) => handleUpdate("postcode", e.target.value)} required />
                  </div>
                  <Input id="phone" label="Phone (optional)" type="tel" placeholder="+44 7700 000000" value={form.phone} onChange={(e) => handleUpdate("phone", e.target.value)} />
                  <Button variant="primary" size="lg" className="w-full mt-2" onClick={() => setStep(2)}>
                    Continue to Payment <ArrowRight size={16} />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="bg-dark-card border border-gold/12 rounded-2xl p-8 space-y-6">
                  <h2 className="font-heading text-xl text-cream font-semibold">Payment Details</h2>
                  <div className="bg-dark-elevated border border-gold/10 rounded-xl p-5 space-y-4">
                    <p className="font-label text-[11px] uppercase tracking-widest text-cream-faint mb-3">Card Information</p>
                    <div className="rounded-lg bg-dark-card border border-gold/12 px-4 py-3.5 text-cream-muted text-sm">
                      [Stripe Card Element — integrate with @stripe/react-stripe-js]
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-dark-card border border-gold/12 px-4 py-3.5 text-cream-muted text-sm">MM / YY</div>
                      <div className="rounded-lg bg-dark-card border border-gold/12 px-4 py-3.5 text-cream-muted text-sm">CVC</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="terms" required className="mt-1 accent-[#c9a84c]" />
                    <label htmlFor="terms" className="text-sm text-cream-muted leading-relaxed cursor-pointer">
                      I agree to the <Link href="#" className="text-gold hover:text-gold-light">Terms & Conditions</Link> and confirm my order details are correct.
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="secondary" size="lg" onClick={() => setStep(1)}>Back</Button>
                    <Button variant="primary" size="lg" loading={loading} onClick={handlePayment}>
                      Place Order {formatPrice(total())}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-dark-card border border-gold/12 rounded-2xl p-6 h-fit sticky top-24 space-y-4">
              <h3 className="font-heading text-cream font-semibold">Order Summary</h3>
              <div className="space-y-3 max-h-56 overflow-y-auto scrollbar-hide">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm gap-3">
                    <span className="text-cream-muted leading-tight truncate flex-1">
                      {item.productName} <span className="text-cream-faint">×{item.quantity}</span>
                      <br /><span className="text-[10px] font-label">{item.colour} · {item.size}</span>
                    </span>
                    <span className="text-cream shrink-0">{formatPrice(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gold/10 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-cream-muted"><span>Subtotal</span><span className="text-cream">{formatPrice(subtotal())}</span></div>
                {discount() > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>−{formatPrice(discount())}</span></div>}
                <div className="flex justify-between text-cream-muted"><span>Shipping ({shippingMethod})</span><span className="text-cream">{shippingCost() === 0 ? "Free" : formatPrice(shippingCost())}</span></div>
                <div className="flex justify-between font-heading font-bold text-lg pt-2 border-t border-gold/10">
                  <span className="text-cream">Total</span><span className="text-cream">{formatPrice(total())}</span>
                </div>
              </div>
              <div className="border-t border-gold/10 pt-4">
                <p className="font-label text-[10px] uppercase tracking-widest text-cream-faint mb-1">Estimated Delivery</p>
                <p className="text-sm text-cream flex items-center gap-2">
                  <Package size={14} className="text-gold" />
                  {estimatedDelivery(shippingMethod)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ToastProvider>
  );
}
