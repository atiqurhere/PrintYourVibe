import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Sparkles, Heart, Globe, Award, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — PrintYourVibe",
  description: "We're a UK-based print-on-demand platform helping creators, brands, and individuals express their vibe through premium custom garments.",
};

const stats = [
  { value: "10,000+", label: "Orders Delivered" },
  { value: "4.9★",    label: "Average Rating" },
  { value: "48hr",    label: "Average Dispatch" },
  { value: "100%",    label: "UK Printed" },
];

const values = [
  { icon: <Sparkles size={22} />, title: "Quality First", desc: "We use professional-grade DTG printing on carefully selected premium blanks. Every garment goes through quality checks before dispatch." },
  { icon: <Heart size={22} />,    title: "Creator-Led",   desc: "PrintYourVibe was built by creators, for creators. We understand what it means to care deeply about how your art looks on fabric." },
  { icon: <Globe size={22} />,    title: "UK Made",       desc: "Everything is printed locally in the UK, keeping our supply chain short, our quality high, and our carbon footprint low." },
  { icon: <Award size={22} />,    title: "No Minimums",   desc: "Order one piece or a hundred — we treat every order with the same care. Great custom print shouldn't require bulk commitments." },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-20 bg-dark relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-gold opacity-50" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <span className="font-label text-[11px] uppercase tracking-widest text-gold">About Us</span>
            <h1 className="font-display font-bold text-cream mt-4 mb-6" style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
              Your Vision,<br /><span className="text-gradient-gold">Printed Perfectly.</span>
            </h1>
            <p className="text-cream-muted text-lg leading-relaxed max-w-2xl mx-auto">
              PrintYourVibe is a UK-based print-on-demand platform built for people who take their art seriously.
              We combine a seamless design experience with professional DTG printing and fast, reliable delivery.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-dark-2 border-y border-gold/10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-display font-bold text-3xl md:text-4xl text-gradient-gold">{s.value}</p>
                  <p className="font-label text-[10px] uppercase tracking-widest text-cream-faint mt-2">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-24 bg-dark">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="font-label text-[11px] uppercase tracking-widest text-gold">Our Story</span>
                <h2 className="font-display font-bold text-3xl md:text-4xl text-cream mt-4 mb-6">
                  Started by Creators,<br />Built for Creators
                </h2>
                <div className="space-y-4 text-cream-muted leading-relaxed">
                  <p>
                    PrintYourVibe started with a simple frustration: custom printing platforms were expensive, slow, and painful to use. Minimum orders of 50 units. Poor mockup tools. Inconsistent quality.
                  </p>
                  <p>
                    We built PrintYourVibe to fix all of that. Our live 2D mockup tool lets you see exactly how your design will look before you order. No account needed, no minimum order.
                  </p>
                  <p>
                    Every product is printed in-house in the UK using professional Direct-to-Garment equipment, and dispatched within 48 hours of your order being confirmed.
                  </p>
                </div>
                <div className="mt-8">
                  <Link href="/mockup">
                    <Button variant="primary" size="lg">Try the Mockup Tool <ArrowRight size={16} /></Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-3xl bg-dark-card border border-gold/15 overflow-hidden flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center mx-auto mb-4">
                      <Sparkles size={32} className="text-gold" />
                    </div>
                    <p className="font-display font-bold text-2xl text-cream mb-2">PrintYourVibe</p>
                    <p className="font-label text-[10px] text-cream-faint uppercase tracking-widest">UK Custom Print Studio</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-gold/10 border border-gold/20 rounded-2xl p-4">
                  <p className="font-display font-bold text-3xl text-gold">48hr</p>
                  <p className="font-label text-[9px] uppercase tracking-wider text-cream-faint">avg dispatch</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 bg-dark-2">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="font-label text-[11px] uppercase tracking-widest text-gold">What We Stand For</span>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-cream mt-4">Our Values</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v) => (
                <div key={v.title} className="bg-dark-card border border-gold/12 rounded-2xl p-6 card-hover">
                  <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mb-4">
                    {v.icon}
                  </div>
                  <h3 className="font-heading text-cream font-semibold mb-2">{v.title}</h3>
                  <p className="text-cream-muted text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-dark">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-cream mb-6">Ready to print your vibe?</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/mockup"><Button variant="primary" size="lg"><Sparkles size={16} /> Start Designing Free</Button></Link>
              <Link href="/contact"><Button variant="secondary" size="lg">Get in Touch</Button></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
