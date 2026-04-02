"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordMatch = confirm === "" || password === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordMatch || password.length < 8) return;
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: "user" },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // If email confirmation is not required, redirect immediately
    if (data.session) {
      router.push("/dashboard");
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="animate-fade-in-up w-full">
        <div className="bg-dark-card border border-gold/12 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📬</span>
          </div>
          <h2 className="font-display font-bold text-xl text-cream mb-2">Check your inbox</h2>
          <p className="text-cream-muted text-sm leading-relaxed mb-5">
            We sent a confirmation link to <span className="text-gold font-medium">{email}</span>.
            Click it to activate your account.
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
      <div className="mb-3">
        <h1 className="font-display font-bold text-[1.7rem] text-cream mb-1">Create your account</h1>
        <p className="text-cream-muted text-xs">Start designing and save your creations for free</p>
      </div>

      <div className="bg-dark-card border border-gold/12 rounded-2xl p-5 shadow-2xl shadow-black/40">
        {error && (
          <div className="mb-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <Input
            id="full-name"
            label="Full Name"
            type="text"
            placeholder="Jane Smith"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            icon={<User size={15} />}
            required
            autoComplete="name"
          />

          <Input
            id="email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={15} />}
            required
            autoComplete="email"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="password"
              label="Password"
              type={showPass ? "text" : "password"}
              placeholder="Min. 8 chars"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={15} />}
              error={password.length > 0 && password.length < 8 ? "Too short" : undefined}
              rightIcon={
                <button type="button" onClick={() => setShowPass(!showPass)} className="hover:text-cream transition-colors" tabIndex={-1}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
              required
              autoComplete="new-password"
            />
            <Input
              id="confirm-password"
              label="Confirm"
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              icon={<Lock size={15} />}
              error={!passwordMatch ? "Mismatch" : undefined}
              rightIcon={
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="hover:text-cream transition-colors" tabIndex={-1}>
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
              required
              autoComplete="new-password"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer group pt-0.5">
            <div className="relative mt-0.5 shrink-0">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required className="sr-only" />
              <div className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${agreed ? "bg-gold border-gold" : "border-gold/30 bg-dark-elevated group-hover:border-gold/60"}`}>
                {agreed && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
            <span className="text-xs text-cream-muted leading-relaxed">
              I agree to the{" "}
              <Link href="/terms" className="text-gold hover:text-gold-light">Terms</Link>
              {" "}&amp;{" "}
              <Link href="/privacy" className="text-gold hover:text-gold-light">Privacy Policy</Link>
            </span>
          </label>

          <Button type="submit" size="lg" variant="primary" className="w-full" loading={loading} disabled={!passwordMatch || !agreed}>
            Create Account <ArrowRight size={16} />
          </Button>
        </form>

        <div className="border-t border-gold/10 mt-4 pt-4 flex items-center justify-between gap-4">
          <p className="text-sm text-cream-muted">
            Have an account?{" "}
            <Link href="/login" className="text-gold hover:text-gold-light transition-colors font-semibold">
              Sign in →
            </Link>
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1.5 text-xs"
            onClick={async () => {
              await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: `${window.location.origin}/auth/callback` },
              });
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </Button>
        </div>
      </div>
    </div>
  );
}
