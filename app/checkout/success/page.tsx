"use client";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/stores/useCartStore";
import Navbar from "@/components/layout/Navbar";
import { ToastProvider } from "@/components/ui/Toast";
import { useEffect } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "—";
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    // Clear the cart once landing on success page
    clearCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ToastProvider>
      <Navbar />
      <main className="min-h-screen bg-dark pt-28 pb-24 flex items-center">
        <div className="max-w-xl mx-auto px-4 text-center w-full">
          {/* Success icon */}
          <div className="w-24 h-24 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center mx-auto mb-8 animate-scale-in">
            <CheckCircle2 size={48} className="text-green-400" />
          </div>

          <h1 className="font-display font-bold text-4xl text-cream mb-3">Order Confirmed!</h1>
          <p className="text-cream-muted text-lg mb-2">Thank you for your order 🎉</p>
          <p className="text-cream-faint text-sm mb-8">
            We&apos;ll send a confirmation email shortly. Your items will be printed and dispatched within 1–2 business days.
          </p>

          {/* Order number */}
          <div className="bg-dark-card border border-gold/15 rounded-2xl p-6 mb-8 text-left space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-label text-[11px] uppercase tracking-widest text-cream-faint">Order Number</span>
              <span className="font-heading font-bold text-gold text-lg">{orderNumber}</span>
            </div>
            <div className="border-t border-gold/10 pt-4 flex items-center gap-3">
              <Package size={16} className="text-gold shrink-0" />
              <p className="text-sm text-cream-muted">
                You can track your order status at any time from your{" "}
                <Link href="/dashboard/orders" className="text-gold hover:text-gold-light transition-colors">dashboard</Link>{" "}
                or the{" "}
                <Link href="/track-order" className="text-gold hover:text-gold-light transition-colors">order tracker</Link>.
              </p>
            </div>
          </div>

          {/* What happens next */}
          <div className="bg-dark-card border border-gold/12 rounded-2xl p-6 mb-8 text-left">
            <h2 className="font-heading text-cream font-semibold mb-4">What happens next?</h2>
            <div className="space-y-3">
              {[
                { icon: "📧", title: "Confirmation Email", desc: "We'll email your order details and receipt within minutes." },
                { icon: "🖨️", title: "Printing (1–2 days)",  desc: "Your design is printed with professional DTG equipment." },
                { icon: "🚚", title: "Dispatch & Delivery",   desc: "You'll get a tracking number via email when your parcel ships." },
              ].map((step) => (
                <div key={step.title} className="flex items-start gap-3">
                  <span className="text-xl shrink-0 mt-0.5">{step.icon}</span>
                  <div>
                    <p className="font-heading text-sm text-cream font-semibold">{step.title}</p>
                    <p className="font-label text-xs text-cream-faint mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button variant="secondary" size="lg">
                <Home size={16} /> Back to Home
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="primary" size="lg">
                Keep Shopping <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </ToastProvider>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark flex items-center justify-center text-cream-muted">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
