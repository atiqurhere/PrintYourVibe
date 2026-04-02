"use client";
import Link from "next/link";
import { useState, Suspense } from "react";
import { CheckCircle2, Package, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCartStore } from "@/stores/useCartStore";
import { formatPrice, generateOrderNumber, estimatedDelivery } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import { ToastProvider } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase/client";

function CheckoutContent() {
  const { items, subtotal, discount, shippingCost, total, shippingMethod, coupon } = useCartStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "", firstName: "", lastName: "",
    line1: "", line2: "", city: "", postcode: "", phone: "",
  });

  const handleUpdate = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const validateStep1 = () => {
    if (!form.email || !form.firstName || !form.lastName || !form.line1 || !form.city || !form.postcode) {
      setError("Please fill in all required fields.");
      return false;
    }
    setError("");
    return true;
  };

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      // Get current user session (optional — guest checkout supported)
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shipping: form,
          coupon: coupon || null,
          userId,
          shippingMethod,
          subtotalPence: Math.round(subtotal() * 100),
          discountPence: Math.round(discount() * 100),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
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
                  {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>}
                  <Input id="email" label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => handleUpdate("email", e.target.value)} required />
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
                  <Button variant="primary" size="lg" className="w-full mt-2" onClick={() => { if (validateStep1()) setStep(2); }}>
                    Continue to Payment <ArrowRight size={16} />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="bg-dark-card border border-gold/12 rounded-2xl p-8 space-y-6">
                  <h2 className="font-heading text-xl text-cream font-semibold">Payment</h2>
                  {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>}
                  <div className="bg-dark-elevated border border-gold/10 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Lock size={14} className="text-gold" />
                      <p className="text-sm text-cream font-heading">Secure Payment via Stripe</p>
                    </div>
                    <p className="text-sm text-cream-muted leading-relaxed">
                      Clicking "Place Order" will take you to our secure Stripe checkout page where
                      you can enter your card details. Your payment information is never stored on our servers.
                    </p>
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gold/10">
                      {["VISA", "MC", "AMEX", "APPLE PAY"].map((brand) => (
                        <span key={brand} className="font-label text-[9px] uppercase tracking-widest text-cream-faint border border-gold/15 rounded px-1.5 py-0.5">{brand}</span>
                      ))}
                    </div>
                  </div>

                  {/* Shipping review */}
                  <div className="bg-dark-elevated border border-gold/10 rounded-xl p-4 text-sm">
                    <p className="font-label text-[10px] uppercase tracking-widest text-cream-faint mb-2">Shipping to</p>
                    <p className="text-cream">{form.firstName} {form.lastName}</p>
                    <p className="text-cream-muted">{form.line1}{form.line2 ? `, ${form.line2}` : ""}, {form.city}, {form.postcode}</p>
                    <button onClick={() => setStep(1)} className="text-xs text-gold hover:text-gold-light transition-colors mt-1">Edit</button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="secondary" size="lg" onClick={() => setStep(1)}>Back</Button>
                    <Button variant="primary" size="lg" loading={loading} onClick={handlePayment}>
                      Place Order — {formatPrice(total())}
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark flex items-center justify-center text-cream-muted">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
