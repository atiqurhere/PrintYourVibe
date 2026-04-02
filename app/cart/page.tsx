"use client";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, Tag, ShoppingBag, Truck, Zap, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { formatPrice, estimatedDelivery } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";
import { useState } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, coupon, applyCoupon, removeCoupon,
          shippingMethod, setShippingMethod, subtotal, discount, shippingCost, total } = useCartStore();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  const [couponLoading, setCouponLoading] = useState(false);

  const handleCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotalPence: Math.round(subtotal() * 100) }),
      });
      const data = await res.json();
      if (data.valid) {
        applyCoupon({ code: data.code, type: data.type, value: data.value });
        setCouponError("");
      } else {
        setCouponError(data.error || "Invalid or expired coupon code.");
      }
    } catch {
      setCouponError("Could not validate coupon. Please try again.");
    } finally {
      setCouponLoading(false);
      setCouponInput("");
    }
  };


  const isEmpty = items.length === 0;

  return (
    <ToastProvider>
      <Navbar />
      <main className="min-h-screen bg-dark pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display font-bold text-4xl text-cream mb-10">Your Cart</h1>

          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <ShoppingBag size={48} className="text-gold/30 mb-5" />
              <h2 className="font-heading text-2xl text-cream mb-3">Your cart is empty</h2>
              <p className="text-cream-muted mb-8">Design something amazing and add it here.</p>
              <Link href="/mockup">
                <Button variant="primary" size="lg">Start Designing Free</Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-dark-card border border-gold/12 rounded-2xl p-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-dark-elevated shrink-0">
                      <Image src={item.thumbnailUrl} alt={item.productName} width={80} height={80} className="object-contain w-full h-full p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-sm text-cream font-semibold truncate">{item.productName}</h3>
                      <p className="font-label text-[10px] text-cream-faint uppercase tracking-wide mt-0.5">
                        {item.colour} · Size {item.size}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-2 bg-dark-elevated rounded-lg border border-gold/10 px-1">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 text-cream-muted hover:text-cream transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="font-heading text-sm text-cream w-5 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 text-cream-muted hover:text-cream transition-colors">
                            <Plus size={12} />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="p-1.5 text-red-400/60 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-heading font-semibold text-cream">{formatPrice(item.unitPrice * item.quantity)}</p>
                      {item.quantity > 1 && <p className="font-label text-[10px] text-cream-faint mt-1">{formatPrice(item.unitPrice)} each</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="bg-dark-card border border-gold/12 rounded-2xl p-6 sticky top-24 space-y-5">
                  <h2 className="font-heading text-lg text-cream font-semibold">Order Summary</h2>

                  {/* Coupon */}
                  {coupon ? (
                    <div className="flex items-center justify-between bg-green-400/8 border border-green-400/20 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-green-400" />
                        <span className="font-label text-xs text-green-400 uppercase tracking-widest">{coupon.code}</span>
                      </div>
                      <button onClick={removeCoupon} className="text-xs text-cream-faint hover:text-red-400 transition-colors">Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                        placeholder="Coupon code"
                        className="flex-1 bg-dark-elevated border border-gold/15 rounded-lg px-3 py-2.5 text-sm text-cream placeholder:text-cream-faint/50 focus:outline-none focus:border-gold/40 transition-colors"
                        onKeyDown={(e) => e.key === "Enter" && handleCoupon()}
                      />
                      <button onClick={handleCoupon} disabled={couponLoading} className="px-4 py-2.5 bg-gold/15 border border-gold/25 text-gold rounded-lg text-xs font-label hover:bg-gold/25 transition-colors disabled:opacity-50">
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-red-400 text-xs -mt-3">{couponError}</p>}

                  {/* Shipping method */}
                  <div className="space-y-2">
                    <p className="font-label text-[11px] uppercase tracking-widest text-cream-faint mb-3">Shipping</p>
                    {([
                      { value: "standard", label: "Standard", sub: "3–5 business days", price: subtotal() >= 50 ? 0 : 3.99, icon: <Truck size={15} /> },
                      { value: "express",  label: "Express",  sub: "1–2 business days",  price: 7.99, icon: <Zap size={15} /> },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setShippingMethod(opt.value)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${shippingMethod === opt.value ? "border-gold/40 bg-gold/8" : "border-gold/10 hover:border-gold/25"}`}
                      >
                        <span className={shippingMethod === opt.value ? "text-gold" : "text-cream-muted"}>{opt.icon}</span>
                        <div className="flex-1">
                          <p className="font-heading text-sm text-cream font-semibold">{opt.label}</p>
                          <p className="font-label text-[10px] text-cream-faint">{opt.sub} · Est. {estimatedDelivery(opt.value)}</p>
                        </div>
                        <span className="font-heading text-sm text-cream">{opt.price === 0 ? "Free" : formatPrice(opt.price)}</span>
                      </button>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-gold/10 pt-4 space-y-2.5">
                    <div className="flex justify-between text-sm text-cream-muted">
                      <span>Subtotal</span><span className="text-cream">{formatPrice(subtotal())}</span>
                    </div>
                    {discount() > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-400">Discount</span><span className="text-green-400">−{formatPrice(discount())}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-cream-muted">
                      <span>Shipping</span>
                      <span className="text-cream">{shippingCost() === 0 ? "Free" : formatPrice(shippingCost())}</span>
                    </div>
                    <div className="flex justify-between font-heading font-bold text-lg pt-2 border-t border-gold/10">
                      <span className="text-cream">Total</span>
                      <span className="text-cream">{formatPrice(total())}</span>
                    </div>
                  </div>

                  <Link href="/checkout">
                    <Button variant="primary" size="lg" className="w-full">
                      Proceed to Checkout <ArrowRight size={16} />
                    </Button>
                  </Link>
                  <Link href="/products" className="block text-center text-xs text-cream-faint hover:text-gold transition-colors">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </ToastProvider>
  );
}
