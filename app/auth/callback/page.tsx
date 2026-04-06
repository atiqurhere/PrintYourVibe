"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export default function AuthCallback() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let mounted = true;

    async function handleAuth() {
      // Determine intended destination from the 'next' or 'redirect' query param
      const searchParams = new URLSearchParams(window.location.search);
      const next = searchParams.get("next") || searchParams.get("redirect") || "/dashboard";
      const code = searchParams.get("code");

      // --- PKCE flow: exchange the code for a session ---
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("PKCE exchange error:", error.message);
          if (mounted) setErrorMsg(`Sign-in failed: ${error.message}`);
          return;
        }
      }

      // --- Wait for the auth state to settle (handles both PKCE and implicit/hash flows) ---
      // onAuthStateChange fires as soon as Supabase detects a valid session
      // (including from a #access_token= hash on first render)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;
        if (event === "SIGNED_IN" && session) {
          subscription.unsubscribe();
          const role = session.user?.user_metadata?.role;
          router.replace(role === "admin" ? "/admin" : next);
        }
      });

      // Fallback: check if session already exists right now (race condition safety)
      const { data } = await supabase.auth.getSession();
      if (data?.session && mounted) {
        subscription.unsubscribe();
        const role = data.session.user?.user_metadata?.role;
        router.replace(role === "admin" ? "/admin" : next);
        return;
      }

      // Final timeout: if nothing happens after 8s, something is wrong
      setTimeout(() => {
        if (!mounted) return;
        subscription.unsubscribe();
        supabase.auth.getSession().then(({ data: d }: { data: { session: Session | null } }) => {
          if (d?.session) {
            const role = d.session.user?.user_metadata?.role;
            router.replace(role === "admin" ? "/admin" : next);
          } else {
            if (mounted) setErrorMsg("Sign-in timed out. Please try again.");
            setTimeout(() => { if (mounted) router.replace("/login?error=timeout"); }, 3000);
          }
        });
      }, 8000);
    }

    handleAuth();

    return () => { mounted = false; };
  }, [router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-dark text-cream">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-t-2 border-gold animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-t-2 border-gold/50 animate-spin-slow"></div>
      </div>
      <h1 className="font-display text-2xl font-bold tracking-wide">
        Verifying Secure Login
      </h1>
      <p className={`text-sm mt-3 max-w-md text-center px-4 ${errorMsg ? "text-red-400" : "text-cream-muted"}`}>
        {errorMsg || "Please wait while we establish a secure connection..."}
      </p>
    </div>
  );
}
