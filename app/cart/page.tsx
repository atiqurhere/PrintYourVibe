"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight, Package, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useCartStore } from "@/stores/useCartStore";
import { formatPrice } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import type { Metadata } from "next";

function CartContent() {
  const {
    items, coupon, shippingMethod,
    removeItem, updateQuantity, applyCoupon, removeCoupon, setShippingMethod,
    subtotal, discount, shippingCost, total,
  } = useCartStore();

  const { toast } = useToast();
  const [couponInput, setCouponInput] = useState(coupon?.code ?? "");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal: subtotal() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setCouponError(data.error || "Invalid coupon code.");
      } else {
        applyCoupon({ code: data.code, type: data.type, value: data.value });
        toast(`Coupon applied! ${data.type === "percent" ? `${data.value}%` : formatPrice(data.value)} off your order.`, "success");
      }
    } catch {
      setCouponError("Something went wrong. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-dark flex items-center justify-center pt-24">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-dark-card border border-gold/15 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} className="text-gold/30" />
          </div>
          <h1 className="font-display font-bold text-3xl text-cream mb-3">Your cart is empty</h1>
          <p className="text-cream-muted mb-8">Add some products to get started.</p>
          <Link href="/products">
            <Button variant="primary" size="lg">Browse Products <ArrowRight size={16} /></Button>
          </Link>
          <div className="mt-4">
            <Link href="/mockup" className="text-sm text-gold hover:text-gold-light transition-colors">
              Or start designing for free →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-dark pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="font-label text-[11px] uppercase tracking-widest text-gold">Your Cart</span>
          <h1 className="font-display font-bold text-4xl text-cream mt-2">
            {items.length} {items.length === 1 ? "item" : "items"}
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-dark-card border border-gold/12 rounded-2xl p-5 flex gap-5 group hover:border-gold/25 transition-colors">
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-xl bg-dark-elevated overflow-hidden shrink-0 border border-gold/10">
                  <Image
                    src={item.thumbnailUrl || "/products/placeholder.png"}
                    alt={item.productName}
                    width={80} height={80}
                    className="object-contain w-full h-full p-1"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-cream font-semibold text-sm mb-1">{item.productName}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full border border-gold/20" style={{ backgroundColor: item.colourHex }} />
                          <span className="font-label text-[10px] text-cream-faint uppercase tracking-wide">{item.colour}</span>
                        </span>
                        <span className="font-label text-[10px] text-cream-faint">·</span>
                        <span className="font-label text-[10px] text-cream-faint uppercase tracking-wide">Size {item.size}</span>
                        {item.designAssetUrl && (
                          <>
                            <span className="font-label text-[10px] text-cream-faint">·</span>
                            <span className="font-label text-[10px] text-gold flex items-center gap-1">
                              <Sparkles size={9} /> Custom Design
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-cream-faint/40 hover:text-red-400 transition-colors shrink-0"
                      title="Remove"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity */}
                    <div className="flex items-center gap-1 bg-dark-elevated border border-gold/10 rounded-lg p-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-cream-muted hover:text-cream hover:bg-dark-card transition-all"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-7 text-center font-label text-xs text-cream">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-cream-muted hover:text-cream hover:bg-dark-card transition-all"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="font-heading font-semibold text-cream text-sm">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Shipping method */}
            <div className="bg-dark-card border border-gold/12 rounded-2xl p-5">
              <h2 className="font-heading text-cream font-semibold mb-4 flex items-center gap-2">
                <Package size={16} className="text-gold" /> Shipping Method
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { value: "standard" as const, label: "Standard Delivery", time: "3–5 business days", price: subtotal() >= 50 ? "Free" : "£3.99" },
                  { value: "express" as const, label: "Express Delivery",  time: "1–2 business days", price: "£7.99" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setShippingMethod(opt.value)}
                    className={`text-left p-4 rounded-xl border transition-all ${shippingMethod === opt.value ? "border-gold bg-gold/8" : "border-gold/12 hover:border-gold/30"}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-heading text-sm text-cream font-semibold">{opt.label}</span>
                      <span className={`font-label text-xs font-bold ${opt.price === "Free" ? "text-green-400" : "text-gold"}`}>{opt.price}</span>
                    </div>
                    <p className="font-label text-[10px] text-cream-faint uppercase tracking-wide">{opt.time}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Continue shopping */}
            <Link href="/products" className="inline-flex items-center gap-2 text-sm text-cream-muted hover:text-cream transition-colors">
              ← Continue shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            {/* Coupon */}
            <div className="bg-dark-card border border-gold/12 rounded-2xl p-5">
              <h2 className="font-heading text-cream font-semibold mb-4 flex items-center gap-2">
                <Tag size={16} className="text-gold" /> Coupon Code
              </h2>
              {coupon ? (
                <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                  <div>
                    <p className="font-label text-xs text-green-400 font-bold">{coupon.code}</p>
                    <p className="font-label text-[10px] text-cream-faint mt-0.5">
                      {coupon.type === "percent" ? `${coupon.value}% off` : `${formatPrice(coupon.value)} off`}
                    </p>
                  </div>
                  <button onClick={() => { removeCoupon(); setCouponInput(""); }} className="text-cream-faint hover:text-red-400 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      placeholder="ENTER CODE"
                      className="flex-1 bg-dark-elevated border border-gold/15 rounded-xl px-4 py-2.5 font-label text-xs text-cream placeholder:text-cream-faint/40 focus:outline-none focus:border-gold/40 uppercase tracking-widest transition-colors"
                    />
                    <Button variant="secondary" size="sm" onClick={handleApplyCoupon} loading={couponLoading}>
                      Apply
                    </Button>
                  </div>
                  {couponError && <p className="text-red-400 font-label text-[10px]">{couponError}</p>}
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="bg-dark-card border border-gold/12 rounded-2xl p-5">
              <h2 className="font-heading text-cream font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-cream-muted">
                  <span>Subtotal</span>
                  <span className="text-cream">{formatPrice(subtotal())}</span>
                </div>
                {discount() > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({coupon?.code})</span>
                    <span>−{formatPrice(discount())}</span>
                  </div>
                )}
                <div className="flex justify-between text-cream-muted">
                  <span>Shipping ({shippingMethod})</span>
                  <span className={shippingCost() === 0 ? "text-green-400" : "text-cream"}>
                    {shippingCost() === 0 ? "Free" : formatPrice(shippingCost())}
                  </span>
                </div>
                {subtotal() < 50 && shippingMethod === "standard" && (
                  <p className="font-label text-[10px] text-cream-faint bg-gold/5 border border-gold/10 rounded-lg px-3 py-2">
                    Add {formatPrice(50 - subtotal())} more for free shipping
                  </p>
                )}
                <div className="flex justify-between font-heading font-bold text-lg pt-3 border-t border-gold/10">
                  <span className="text-cream">Total</span>
                  <span className="text-cream">{formatPrice(total())}</span>
                </div>
              </div>

              <Link href="/checkout" className="block mt-5">
                <Button variant="primary" size="lg" className="w-full gold-glow-pulse">
                  Proceed to Checkout <ArrowRight size={16} />
                </Button>
              </Link>
              <p className="text-center font-label text-[9px] uppercase tracking-widest text-cream-faint mt-3">
                🔒 Secure checkout via Stripe
              </p>
            </div>

            {/* Trust */}
            <div className="bg-dark-card border border-gold/12 rounded-2xl p-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "🇬🇧", label: "UK Printed" },
                  { icon: "🚚", label: "Fast Dispatch" },
                  { icon: "↩️", label: "Free Returns" },
                  { icon: "🔒", label: "Secure Payment" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-base">{item.icon}</span>
                    <span className="font-label text-[10px] uppercase tracking-wide text-cream-faint">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CartPage() {
  return (
    <ToastProvider>
      <Navbar />
      <CartContent />
    </ToastProvider>
  );
}
