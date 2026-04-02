"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordMatch = confirm === "" || password === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordMatch || password.length < 8) return;
    setError("");
    setLoading(true);

    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="animate-fade-in-up w-full">
      <div className="mb-6">
        <h1 className="font-display font-bold text-[1.85rem] text-cream mb-1.5">Set new password</h1>
        <p className="text-cream-muted text-sm">Choose a strong password for your account</p>
      </div>

      <div className="bg-dark-card border border-gold/12 rounded-2xl p-6 shadow-2xl">
        {error && (
          <div className="mb-4 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="new-password"
            label="New password"
            type={showPass ? "text" : "password"}
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={16} />}
            error={password.length > 0 && password.length < 8 ? "Too short" : undefined}
            rightIcon={
              <button type="button" onClick={() => setShowPass(!showPass)} className="hover:text-cream transition-colors" tabIndex={-1}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            required
          />
          <Input
            id="confirm-new-password"
            label="Confirm password"
            type="password"
            placeholder="Repeat your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            icon={<Lock size={16} />}
            error={!passwordMatch ? "Passwords don't match" : undefined}
            required
          />
          <Button type="submit" size="lg" variant="primary" className="w-full" loading={loading} disabled={!passwordMatch}>
            Update password <ArrowRight size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}
