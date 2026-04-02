import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About PrintYourVibe",
  description: "UK-based custom print-on-demand. Premium quality printing on sustainable garments, delivered fast.",
};

const stats = [
  { num: "12,000+", label: "Orders Fulfilled" },
  { num: "4.9/5",   label: "Average Rating" },
  { num: "1–2 days", label: "Production Time" },
  { num: "100%",    label: "UK Printed" },
];

const values = [
  { emoji: "🏆", title: "Premium Quality",  desc: "We use only the finest 100% organic cotton and water-based eco inks for prints that look great and last." },
  { emoji: "⚡", title: "Fast Production",  desc: "Orders are produced and dispatched within 1–2 business days. No long waits, no excuses." },
  { emoji: "🌿", title: "Sustainable",      desc: "Our printing process uses water-based inks, and all packaging is fully recyclable and plastic-free." },
  { emoji: "✨", title: "No Minimums",      desc: "Order just one piece or a thousand. Every order gets the same premium care and attention to detail." },
];

export default function AboutPage() {
  return (
    <div className="bg-dark min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="font-label text-[11px] uppercase tracking-widest text-gold">About Us</span>
          <h1 className="font-display font-bold text-cream mt-4 mb-6" style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
            Print Is Personal.<br /><em className="text-gradient-gold not-italic">We Make It Possible.</em>
          </h1>
          <p className="text-cream-muted text-lg leading-relaxed max-w-2xl mx-auto">
            PrintYourVibe is a UK-based custom print-on-demand studio. We believe everyone deserves to wear their ideas — whether that&apos;s a personal project, a small business, or a gift for someone special.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 border-t border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="font-label text-[11px] uppercase tracking-widest text-gold">Our Story</span>
              <h2 className="font-display font-bold text-4xl text-cream mt-3 mb-6">Born From a Frustration</h2>
              <div className="space-y-4 text-cream-muted leading-relaxed">
                <p>We started PrintYourVibe after being frustrated with low-quality, overpriced custom printing. Blurry prints, cheap fabrics, and two-week delivery times were the norm.</p>
                <p>So we built something different — a platform where you can upload your artwork, see it live on a real product, and have it at your door within days. No compromise on quality. No minimum orders. No fuss.</p>
                <p>Today, we&apos;ve helped thousands of individuals, small businesses, and creative agencies bring their designs to life.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-dark-card border border-gold/15 rounded-2xl p-6 text-center">
                  <p className="font-display font-bold text-3xl text-gradient-gold mb-2">{s.num}</p>
                  <p className="font-label text-[10px] uppercase tracking-widest text-cream-faint">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-dark-card border-t border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="font-label text-[11px] uppercase tracking-widest text-gold">What We Stand For</span>
            <h2 className="font-display font-bold text-4xl text-cream mt-3">Our Values</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-dark-elevated border border-gold/12 rounded-2xl p-6 hover:border-gold/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-xl mb-5">{v.emoji}</div>
                <h3 className="font-heading text-cream font-semibold mb-3">{v.title}</h3>
                <p className="text-sm text-cream-muted leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display font-bold text-4xl text-cream mb-5">Ready to Create Something?</h2>
          <p className="text-cream-muted mb-8">Try our free mockup tool and see your design on a real product in seconds.</p>
          <Link href="/mockup">
            <Button size="lg" variant="primary">Start Designing Free <ArrowRight size={16} /></Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
