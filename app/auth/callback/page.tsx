"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallback() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let mounted = true;

    async function handleAuth() {
      // 1. Check for PKCE secure code in the query params
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      
      if (code) {
        // Exchange the code for a session explicitly
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
           console.error("Auth Exchange Error:", error.message);
           if (mounted) setErrorMsg(`Secure verification failed: ${error.message}`);
           return;
        }
      }

      // 2. The session should now be active locally 
      const { data, error: sessionError } = await supabase.auth.getSession();
      
      if (data?.session) {
        const role = data.session?.user?.user_metadata?.role;
        router.push(role === "admin" ? "/admin" : "/dashboard");
      } else {
        console.error("No session found after callback", sessionError);
        if (mounted) setErrorMsg("Verification failed: Session could not be established. Redirecting...");
        setTimeout(() => {
          if (mounted) router.push("/login?error=verification_failed");
        }, 3000);
      }
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
