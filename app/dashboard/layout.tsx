"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, ShoppingBag, Layers, Bookmark, MapPin, User, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/layout/Navbar";

const navItems = [
  { label: "Overview",      href: "/dashboard",           icon: <LayoutDashboard size={18} /> },
  { label: "Orders",        href: "/dashboard/orders",    icon: <ShoppingBag size={18} /> },
  { label: "Mockups",       href: "/dashboard/mockups",   icon: <Layers size={18} /> },
  { label: "Saved Designs", href: "/dashboard/designs",   icon: <Bookmark size={18} /> },
  { label: "Addresses",     href: "/dashboard/addresses", icon: <MapPin size={18} /> },
  { label: "Profile",       href: "/dashboard/profile",   icon: <User size={18} /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userName, setUserName] = useState("...");
  const [userEmail, setUserEmail] = useState("");
  const [initials, setInitials] = useState("?");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return;
      const name = session.user.user_metadata?.full_name
        || session.user.user_metadata?.name
        || session.user.email?.split("@")[0]
        || "User";
      const email = session.user.email || "";
      const parts = name.trim().split(" ");
      const init = parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();

      setUserName(name);
      setUserEmail(email);
      setInitials(init);
      setIsAdmin(session.user.user_metadata?.role === "admin");
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-dark flex">
        {/* Sidebar */}
        <aside className="w-64 bg-dark-card border-r border-gold/10 flex flex-col fixed top-0 bottom-0 left-0 z-30">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-gold/10">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center shadow-md shadow-gold/30">
                <span className="font-label font-bold text-dark text-xs">PYV</span>
              </div>
              <span className="font-heading font-semibold text-cream text-sm">PrintYourVibe</span>
            </Link>
          </div>

          {/* User */}
          <div className="px-4 py-4 border-b border-gold/10">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center shrink-0">
                <span className="font-label text-xs text-gold font-bold">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="font-heading text-sm text-cream font-semibold truncate">{userName}</p>
                <p className="font-label text-[10px] text-cream-faint truncate">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-heading transition-all duration-200",
                    active
                      ? "bg-gold/12 text-gold border border-gold/20"
                      : "text-cream-muted hover:text-cream hover:bg-dark-elevated"
                  )}
                >
                  <span className={active ? "text-gold" : ""}>{item.icon}</span>
                  {item.label}
                  {active && <ChevronRight size={14} className="ml-auto text-gold/50" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="px-3 pb-6 border-t border-gold/10 pt-4 space-y-1">
            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-heading text-cream-muted hover:text-cream hover:bg-dark-elevated transition-all">
                <LayoutDashboard size={18} /> Admin Panel
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-heading text-red-400/70 hover:text-red-400 hover:bg-red-400/8 transition-all"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 ml-64 min-h-screen p-8 overflow-auto">{children}</main>
      </div>
    </ToastProvider>
  );
}
