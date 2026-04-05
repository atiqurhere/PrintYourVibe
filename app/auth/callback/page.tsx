"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // The Supabase JS client automatically exchanges the URL '?code=...' 
    // for a valid session, and stores it in localStorage.
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || session) {
        // Redirect to appropriate dashboard based on user role
        const role = session.user?.user_metadata?.role;
        router.push(role === "admin" ? "/admin" : "/dashboard");
      }
    });

    // Fallback: If onAuthStateChange misses the initial load, manually check session after a tiny delay
    const timer = setTimeout(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          const role = data.session.user?.user_metadata?.role;
          router.push(role === "admin" ? "/admin" : "/dashboard");
        } else {
          // If no session is found, send back to login
          router.push("/login?error=verification_failed");
        }
      });
    }, 2500);

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(timer);
    };
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
      <p className="text-cream-muted text-sm mt-2">
        Please wait while we establish a secure connection...
      </p>
    </div>
  );
}
