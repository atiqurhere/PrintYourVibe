import Link from "next/link";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CheckoutSuccessPage({ searchParams }: { searchParams: { order?: string } }) {
  const orderNumber = searchParams.order || "PYV-00000";
  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-lg w-full bg-dark-card border border-gold/15 rounded-3xl p-10 animate-scale-in">
        <div className="w-20 h-20 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={36} className="text-green-400" strokeWidth={1.5} />
        </div>
        <h1 className="font-display font-bold text-4xl text-cream mb-3">Order Confirmed!</h1>
        <p className="text-cream-muted mb-2">Thank you for your order. We&apos;re getting it ready.</p>
        <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/25 rounded-full px-4 py-2 my-5">
          <Package size={14} className="text-gold" />
          <span className="font-label text-xs text-gold uppercase tracking-widest">{orderNumber}</span>
        </div>
        <p className="text-sm text-cream-muted mb-10">
          A confirmation has been sent to your email. Your order will be carefully printed and dispatched within 2 business days.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/track-order">
            <Button variant="primary" size="lg" className="w-full">
              Track Your Order <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="secondary" size="lg" className="w-full">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
