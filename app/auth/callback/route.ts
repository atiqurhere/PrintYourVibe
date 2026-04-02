import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Supabase redirects here after email confirmation / OAuth */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    // The browser client will exchange the code for a session automatically
    // Just redirect to the page — the Supabase JS client handles the code
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Fallback
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
