"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, Menu, X, User, ChevronRight } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Products",     href: "/products" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About",        href: "/about" },
  { label: "Contact",      href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-500",
          scrolled
            ? "bg-dark-2/90 backdrop-blur-xl border-b border-gold/10 shadow-lg shadow-black/40"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center shadow-md shadow-gold/30 group-hover:shadow-gold/50 transition-shadow">
                <span className="font-label font-bold text-dark text-xs">PYV</span>
              </div>
              <span className="font-heading font-semibold text-cream text-base hidden sm:block tracking-wide">
                Print<span className="text-gold">Your</span>Vibe
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="px-4 py-2 text-sm text-cream-muted hover:text-cream font-body transition-colors duration-200 rounded-lg hover:bg-dark-elevated"
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2.5 rounded-lg hover:bg-dark-elevated transition-colors text-cream-muted hover:text-cream"
                aria-label={`Cart – ${itemCount} items`}
              >
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-gold text-dark text-[10px] font-label font-bold rounded-full flex items-center justify-center px-1">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>

              {/* Account button (desktop) */}
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-cream-muted">
                    <User size={15} /> Sign In
                  </Button>
                </Link>
                <Link href="/mockup">
                  <Button variant="primary" size="sm">
                    Start Designing
                  </Button>
                </Link>
              </div>

              {/* Burger (mobile) */}
              <button
                className="md:hidden p-2.5 rounded-lg hover:bg-dark-elevated transition-colors text-cream-muted hover:text-cream"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-dark-2 animate-fade-in">
          {/* header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gold/10">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
                <span className="font-label font-bold text-dark text-xs">PYV</span>
              </div>
              <span className="font-heading font-semibold text-cream">PrintYourVibe</span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-lg hover:bg-dark-elevated text-cream-muted hover:text-cream transition-colors"
            >
              <X size={22} />
            </button>
          </div>

          {/* links */}
          <div className="flex flex-col px-6 py-8 gap-2 flex-1">
            {navLinks.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between py-4 border-b border-gold/8 text-cream-muted hover:text-cream transition-colors"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="font-heading text-lg">{l.label}</span>
                <ChevronRight size={18} className="text-gold/50" />
              </Link>
            ))}
            <Link
              href="/cart"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between py-4 border-b border-gold/8 text-cream-muted hover:text-cream transition-colors"
            >
              <span className="font-heading text-lg">Cart {itemCount > 0 && `(${itemCount})`}</span>
              <ChevronRight size={18} className="text-gold/50" />
            </Link>
          </div>

          {/* CTA */}
          <div className="px-6 pb-10 flex flex-col gap-3">
            <Link href="/mockup" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" size="lg" className="w-full">Start Designing Free</Button>
            </Link>
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="secondary" size="lg" className="w-full">Sign In</Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
