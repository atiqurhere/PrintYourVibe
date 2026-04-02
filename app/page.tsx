import PublicLayout from "@/components/layout/PublicLayout";
import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { categories, featuredProducts, testimonials, galleryPhotos } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PrintYourVibe — Custom Print on Demand UK",
  description: "Upload your artwork and preview it live on premium t-shirts, hoodies and more. No account needed. UK printed, fast delivery.",
};

const trustItems = [
  { icon: "🇬🇧", label: "UK Printed" },
  { icon: "↩️", label: "Free Returns" },
  { icon: "🔒", label: "Secure Checkout" },
  { icon: "🚚", label: "Fast Dispatch" },
];

const howItWorks = [
  { step: "01", title: "Choose a Product", desc: "Browse our range of premium garments and accessories. Pick your style, colour, and size." },
  { step: "02", title: "Upload Your Design", desc: "Drop your artwork onto our live 2D mockup tool. Drag, scale, and rotate until it's perfect." },
  { step: "03", title: "We Print & Deliver", desc: "We produce your order with professional DTG printing and deliver straight to your door." },
];

export default function LandingPage() {
  return (
    <PublicLayout>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-radial-gold">
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left — text */}
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 font-label text-[11px] uppercase tracking-widest text-gold border border-gold/25 rounded-full px-3 py-1.5 mb-8 bg-gold/5">
              <Sparkles size={11} /> No Account Needed · Free to Try
            </span>
            <h1 className="font-display font-bold leading-[1.05] text-cream mb-6" style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}>
              Wear Your<br />
              <em className="text-gradient-gold not-italic">Vision.</em>
            </h1>
            <p className="text-cream-muted text-lg leading-relaxed max-w-md mb-10">
              Upload your artwork, see it live on premium garments, and get everything
              UK-printed and delivered to your door. No minimum order.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/mockup">
                <Button size="lg" variant="primary" className="gap-2.5">
                  <Sparkles size={16} /> Start Designing Free
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="secondary">
                  Browse Products <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right — floating product cards */}
          <div className="hidden lg:flex items-center justify-center relative h-[520px]">
            {/* Main card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 animate-float z-10"
              style={{ animationDelay: "0s" }}>
              <div className="bg-dark-card border border-gold/20 rounded-2xl p-4 shadow-2xl gold-glow">
                <div className="aspect-square rounded-xl overflow-hidden bg-dark-elevated mb-3">
                  <Image src="/products/tshirt-black.png" alt="Custom black tee" width={256} height={256} className="object-cover w-full h-full" />
                </div>
                <p className="font-heading text-sm text-cream font-semibold">Classic Premium Tee</p>
                <p className="font-label text-xs text-gold mt-0.5">From £19.99</p>
              </div>
            </div>
            {/* Secondary card top-left */}
            <div className="absolute top-8 left-0 w-44 animate-float z-20" style={{ animationDelay: "1.5s" }}>
              <div className="bg-dark-card border border-gold/15 rounded-xl p-3 shadow-xl">
                <div className="aspect-square rounded-lg overflow-hidden bg-dark-elevated mb-2">
                  <Image src="/products/hoodie-black.png" alt="Custom hoodie" width={176} height={176} className="object-cover w-full h-full" />
                </div>
                <p className="font-heading text-xs text-cream font-semibold">Heavyweight Hoodie</p>
                <p className="font-label text-[10px] text-gold mt-0.5">From £42.99</p>
              </div>
            </div>
            {/* Secondary card bottom-right */}
            <div className="absolute bottom-8 right-0 w-44 animate-float z-20" style={{ animationDelay: "0.8s" }}>
              <div className="bg-dark-card border border-gold/15 rounded-xl p-3 shadow-xl">
                <div className="aspect-square rounded-lg overflow-hidden bg-dark-elevated mb-2">
                  <Image src="/products/totebag-natural.png" alt="Custom tote" width={176} height={176} className="object-cover w-full h-full" />
                </div>
                <p className="font-heading text-xs text-cream font-semibold">Canvas Tote Bag</p>
                <p className="font-label text-[10px] text-gold mt-0.5">From £14.99</p>
              </div>
            </div>
            {/* Glow orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gold/6 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ── Trust Bar ─────────────────────────────────────── */}
      <section className="border-y border-gold/10 bg-dark-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gold/10">
            {trustItems.map(({ icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-3 py-5 px-4">
                <span className="text-lg">{icon}</span>
                <span className="font-label text-[11px] uppercase tracking-widest text-cream-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="font-label text-[11px] uppercase tracking-widest text-gold">Process</span>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-cream mt-3">
              How It Works
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* connecting line */}
            <div className="hidden md:block absolute top-12 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-gold/10 via-gold/30 to-gold/10" />
            {howItWorks.map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-full border border-gold/25 bg-dark-card flex items-center justify-center mb-6 group-hover:border-gold/50 group-hover:gold-glow transition-all duration-300 relative z-10">
                  <span className="font-display font-bold text-3xl text-gradient-gold">{step}</span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-cream mb-3">{title}</h3>
                <p className="text-cream-muted text-sm leading-relaxed max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mockup Tool CTA ──────────────────────────────── */}
      <section className="py-24 bg-dark-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gold opacity-60" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="font-label text-[11px] uppercase tracking-widest text-gold mb-4 block">Free Tool</span>
          <h2 className="font-display font-bold text-cream mb-5" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
            Try Before You Buy —<br />No Account Needed
          </h2>
          <p className="text-cream-muted text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Our live mockup tool lets you drag, drop, and arrange your design on real product photography.
            See exactly how your print will look before you order a single item.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/mockup">
              <Button size="lg" variant="primary">
                Try the Mockup Tool Free <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="secondary">Browse Products</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Category Grid ──────────────────────────────── */}
      <section className="py-24 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="font-label text-[11px] uppercase tracking-widest text-gold">Collections</span>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-cream mt-3">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/products?cat=${cat.slug}`} className="group block">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-dark-card border border-gold/15 card-hover">
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-heading text-cream font-semibold text-lg">{cat.name}</h3>
                    <p className="font-label text-xs text-gold tracking-wide">{cat.item_count} products</p>
                    <span className="inline-flex items-center gap-1 text-xs text-gold/70 group-hover:text-gold transition-colors mt-1.5">
                      Explore <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────── */}
      <section className="py-24 bg-dark-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="font-label text-[11px] uppercase tracking-widest text-gold">Popular</span>
              <h2 className="font-display font-bold text-4xl text-cream mt-2">Featured Products</h2>
            </div>
            <Link href="/products" className="text-sm text-gold hover:text-gold-light transition-colors flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product) => (
              <div key={product.id} className="group">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-dark-card border border-gold/10 mb-3 card-hover">
                  <Image
                    src={product.colours[0].mockup_front_url}
                    alt={product.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.compare_price && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-500/90 text-white text-[10px] font-label px-2 py-0.5 rounded-full">
                        SALE
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <Link href={`/mockup?product=${product.slug}`}>
                      <Button size="sm" variant="primary">Customize</Button>
                    </Link>
                  </div>
                </div>
                <div>
                  <p className="font-label text-[10px] uppercase tracking-widest text-cream-faint mb-1">{product.category_name}</p>
                  <h3 className="font-heading text-sm text-cream font-semibold mb-1 group-hover:text-gold transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex">{Array(5).fill(0).map((_, i) => (
                      <Star key={i} size={11} className={i < Math.floor(product.rating) ? "text-gold fill-gold" : "text-cream-faint"} />
                    ))}</div>
                    <span className="font-label text-[10px] text-cream-faint">({product.review_count})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-semibold text-cream">{formatPrice(product.base_price)}</span>
                    {product.compare_price && (
                      <span className="text-cream-faint text-xs line-through">{formatPrice(product.compare_price)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="py-24 bg-dark overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="font-label text-[11px] uppercase tracking-widest text-gold">Reviews</span>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-cream mt-3">What Our Customers Say</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.slice(0, 3).map((t) => (
              <div key={t.id} className="bg-dark-card rounded-2xl p-6 border border-gold/12 card-hover">
                <div className="flex mb-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} size={14} className={i < t.rating ? "text-gold fill-gold" : "text-cream-faint"} />
                  ))}
                </div>
                <p className="text-cream-muted text-sm leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gold/8">
                  <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center">
                    <span className="font-label text-xs text-gold font-bold">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="font-heading text-sm text-cream font-semibold">{t.name}</p>
                    <p className="font-label text-[10px] text-cream-faint uppercase tracking-wide">{t.location} · {t.product}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Customer Gallery ─────────────────────────────── */}
      <section className="py-24 bg-dark-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="font-label text-[11px] uppercase tracking-widest text-gold">Community</span>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-cream mt-3">Real Orders, Real People</h2>
          </div>
          <div className="masonry">
            {galleryPhotos.map((photo, i) => (
              <div key={photo.id} className="masonry-item group cursor-pointer">
                <div className="rounded-xl overflow-hidden border border-gold/10 card-hover">
                  <Image
                    src={photo.url}
                    alt={photo.alt}
                    width={400}
                    height={i % 3 === 0 ? 500 : 350}
                    className="object-cover w-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="py-28 bg-dark text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gold" />
        <div className="relative max-w-2xl mx-auto px-4">
          <h2 className="font-display font-bold text-cream mb-5" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
            Ready to Create Something<br />
            <em className="text-gradient-gold not-italic">Unforgettable?</em>
          </h2>
          <p className="text-cream-muted text-lg mb-10">
            Join thousands of customers who have brought their designs to life with PrintYourVibe.
          </p>
          <Link href="/mockup">
            <Button size="lg" variant="primary" className="gold-glow-pulse">
              Start Designing — It&apos;s Free <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
