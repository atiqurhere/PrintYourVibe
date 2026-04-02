import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4 text-center">
      <div className="max-w-md w-full bg-dark-card border border-gold/15 rounded-3xl p-10">
        <div className="w-16 h-16 rounded-full bg-red-400/10 border border-red-400/30 flex items-center justify-center mx-auto mb-6">
          <XCircle size={30} className="text-red-400" strokeWidth={1.5} />
        </div>
        <h1 className="font-display font-bold text-3xl text-cream mb-3">Payment Cancelled</h1>
        <p className="text-cream-muted mb-8">Your order has not been placed. Your cart is still saved.</p>
        <div className="flex flex-col gap-3">
          <Link href="/cart"><Button variant="primary" size="lg" className="w-full">Return to Cart</Button></Link>
          <Link href="/products"><Button variant="secondary" size="lg" className="w-full">Continue Shopping</Button></Link>
        </div>
      </div>
    </div>
  );
}
