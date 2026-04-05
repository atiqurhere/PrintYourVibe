"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, ShoppingBag, Package, Users, Tag,
  Star, Settings, LogOut, ChevronRight, Bell, Layers,
  MessageSquare, FileEdit
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase/client";

const navItems = [
  { label: "Dashboard",    href: "/admin",              icon: <LayoutDashboard size={18} /> },
  { label: "Orders",       href: "/admin/orders",       icon: <ShoppingBag size={18} /> },
  { label: "Products",     href: "/admin/products",     icon: <Package size={18} /> },
  { label: "Categories",   href: "/admin/categories",   icon: <Layers size={18} /> },
  { label: "Customers",    href: "/admin/customers",    icon: <Users size={18} /> },
  { label: "Coupons",      href: "/admin/coupons",      icon: <Tag size={18} /> },
  { label: "Reviews",      href: "/admin/reviews",      icon: <Star size={18} /> },
  { label: "Testimonials", href: "/admin/testimonials", icon: <MessageSquare size={18} /> },
  { label: "Content",      href: "/admin/content",      icon: <FileEdit size={18} /> },
  { label: "Settings",     href: "/admin/settings",     icon: <Settings size={18} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState("Admin");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminInitials, setAdminInitials] = useState("AD");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      const name: string = data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Admin";
      const email = data.user.email || "";
      const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
      setAdminName(name);
      setAdminEmail(email);
      setAdminInitials(initials);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-dark flex">
        {/* Sidebar */}
        <aside className="w-64 bg-dark-card border-r border-gold/10 flex flex-col fixed top-0 bottom-0 left-0 z-30">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-gold/10">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center shadow-md shadow-gold/30">
                <span className="font-label font-bold text-dark text-xs">PYV</span>
              </div>
              <div>
                <span className="font-heading font-semibold text-cream text-sm block">PrintYourVibe</span>
                <span className="font-label text-[9px] text-gold uppercase tracking-widest">Admin Panel</span>
              </div>
            </Link>
          </div>

          {/* Admin profile */}
          <div className="px-4 py-4 border-b border-gold/10">
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-dark-elevated transition-colors">
              <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/35 flex items-center justify-center shrink-0">
                <span className="font-label text-xs text-gold font-bold">{adminInitials}</span>
              </div>
              <div className="min-w-0">
                <p className="font-heading text-sm text-cream font-semibold truncate">{adminName}</p>
                <p className="font-label text-[10px] text-gold/70 truncate">{adminEmail}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
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
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight size={14} className="text-gold/50" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="px-3 pb-6 border-t border-gold/10 pt-4 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-heading text-cream-muted hover:text-cream hover:bg-dark-elevated transition-all"
            >
              <LayoutDashboard size={18} /> User Dashboard
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-heading text-red-400/70 hover:text-red-400 hover:bg-red-400/8 transition-all"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 ml-64 min-h-screen overflow-auto">
          {/* Top bar */}
          <div className="sticky top-0 z-20 bg-dark/80 backdrop-blur-xl border-b border-gold/10 px-8 py-4 flex items-center justify-between">
            <h2 className="font-heading text-sm text-cream-muted capitalize">
              {navItems.find(
                (n) => pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href))
              )?.label || "Dashboard"}
            </h2>
            <div className="flex items-center gap-3">
              <Link href="/products" target="_blank" className="text-xs text-cream-muted hover:text-cream transition-colors">
                View Store →
              </Link>
              <button className="relative p-2 text-cream-muted hover:text-cream transition-colors">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full" />
              </button>
            </div>
          </div>
          <div className="p-8">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
