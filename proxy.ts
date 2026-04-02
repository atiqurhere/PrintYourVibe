import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read the Supabase auth token cookie (Supabase stores as sb-<project-ref>-auth-token)
  const hasAuthCookie = [...request.cookies.getAll()].some(
    (c) => c.name.includes("auth-token") || c.name === "sb-access-token"
  );

  // Parse role from any auth cookie that may have it
  let role: string | undefined;
  try {
    const authCookie = [...request.cookies.getAll()].find(
      (c) => c.name.includes("auth-token") || c.name === "sb-access-token"
    );
    if (authCookie?.value) {
      const parsed = JSON.parse(decodeURIComponent(authCookie.value));
      role = parsed?.user?.user_metadata?.role;
    }
  } catch {
    // Ignore parse errors
  }

  const isAuthenticated = hasAuthCookie;

  // Protect /dashboard/*
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protect /admin/* — must be logged in AND have admin role
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
