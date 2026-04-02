import { ToastProvider } from "@/components/ui/Toast";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-dark flex">

        {/* ── Left: Brand panel ─────────────────────────────────────── */}
        <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-dark-2 via-dark to-dark-card" />
          <div className="absolute inset-0 bg-radial-gold opacity-30" />
          <div className="absolute inset-0 opacity-[0.035]" style={{
            backgroundImage: "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }} />

          {/* Logo */}
          <div className="relative z-10 p-7">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center shadow-md shadow-gold/30">
                <span className="font-label font-bold text-dark text-[10px]">PYV</span>
              </div>
              <span className="font-heading font-semibold text-cream text-base">
                Print<span className="text-gold">Your</span>Vibe
              </span>
            </Link>
          </div>

          {/* Centre content */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 pb-6">
            {/* Compact product cards */}
            <div className="relative w-56 h-52 mb-7 shrink-0">
              <div className="absolute top-0 left-0 w-32 h-36 bg-dark-card border border-gold/20 rounded-xl p-2.5 shadow-xl rotate-[-6deg]">
                <div className="w-full h-20 bg-dark-elevated rounded-lg mb-1.5 flex items-center justify-center text-3xl">👕</div>
                <p className="font-heading text-[11px] text-cream font-semibold">Custom Tee</p>
                <p className="font-label text-[10px] text-gold">From £19.99</p>
              </div>
              <div className="absolute bottom-0 right-0 w-32 h-36 bg-dark-card border border-gold/20 rounded-xl p-2.5 shadow-xl rotate-[5deg]">
                <div className="w-full h-20 bg-dark-elevated rounded-lg mb-1.5 flex items-center justify-center text-3xl">🧥</div>
                <p className="font-heading text-[11px] text-cream font-semibold">Hoodie</p>
                <p className="font-label text-[10px] text-gold">From £42.99</p>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-gold/10 border-2 border-gold/30 rounded-full flex items-center justify-center">
                <div className="text-center">
                  <p className="font-display font-bold text-xl text-gradient-gold">PYV</p>
                  <p className="font-label text-[8px] uppercase tracking-widest text-gold/70 mt-0.5">Design Studio</p>
                </div>
              </div>
            </div>

            <h2 className="font-display font-bold text-2xl text-cream text-center mb-3 leading-snug">
              Your design,<br />
              <em className="text-gradient-gold not-italic">your identity.</em>
            </h2>
            <p className="text-cream-muted text-xs text-center max-w-[240px] leading-relaxed">
              Upload your artwork and see it live on premium UK-printed garments. No minimums.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-5 mt-6 pt-5 border-t border-gold/10 w-full justify-center">
              {[
                { num: "12k+", label: "Orders" },
                { num: "4.9★", label: "Rating" },
                { num: "1–2d", label: "Dispatch" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-display font-bold text-lg text-gradient-gold">{s.num}</p>
                  <p className="font-label text-[9px] uppercase tracking-widest text-cream-faint">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 px-7 pb-5">
            <p className="text-cream-faint/30 text-[10px]">© {new Date().getFullYear()} PrintYourVibe Ltd · UK Registered</p>
          </div>
        </div>

        {/* ── Right: Form panel ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-dark min-h-screen overflow-y-auto">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4 lg:py-5 border-b border-gold/8 lg:border-none shrink-0">
            <Link href="/" className="flex items-center gap-2 group lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
                <span className="font-label font-bold text-dark text-xs">PYV</span>
              </div>
              <span className="font-heading font-semibold text-cream text-base">
                Print<span className="text-gold">Your</span>Vibe
              </span>
            </Link>
            <div className="ml-auto">
              <Link href="/products" className="text-sm text-cream-muted hover:text-cream transition-colors">
                Browse Products →
              </Link>
            </div>
          </div>

          {/* Form — vertically centred within available space */}
          <div className="flex flex-col items-center justify-center flex-1 px-6 sm:px-10 py-8">
            <div className="w-full max-w-[400px]">
              {children}
            </div>
          </div>
        </div>

      </div>
    </ToastProvider>
  );
}
