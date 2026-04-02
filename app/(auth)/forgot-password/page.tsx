"use client";
import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="animate-fade-in-up w-full">
        <div className="bg-dark-card border border-gold/12 rounded-2xl p-8 text-center shadow-2xl">
          <CheckCircle size={40} className="text-gold mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl text-cream mb-2">Reset link sent</h2>
          <p className="text-cream-muted text-sm mb-5">
            Check <span className="text-gold">{email}</span> and click the link to reset your password.
          </p>
          <Link href="/login">
            <Button variant="secondary" size="md" className="w-full">Back to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up w-full">
      <div className="mb-6">
        <h1 className="font-display font-bold text-[1.85rem] text-cream mb-1.5">Reset password</h1>
        <p className="text-cream-muted text-sm">We&apos;ll send you a reset link</p>
      </div>

      <div className="bg-dark-card border border-gold/12 rounded-2xl p-6 shadow-2xl">
        {error && (
          <div className="mb-4 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={16} />}
            required
          />
          <Button type="submit" size="lg" variant="primary" className="w-full" loading={loading}>
            Send reset link <ArrowRight size={16} />
          </Button>
        </form>
        <div className="border-t border-gold/10 mt-4 pt-4 text-center">
          <Link href="/login" className="text-sm text-cream-muted hover:text-gold transition-colors">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
