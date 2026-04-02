"use client";
import Image from "next/image";
import Link from "next/link";
import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { Star, Truck, RotateCcw, ShieldCheck, Plus, Minus, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { useCartStore } from "@/stores/useCartStore";
import { getProductBySlug } from "@/lib/supabase/queries";
import type { Product, ProductColour } from "@/lib/supabase/queries";

const TABS = [
  { label: "Description",        value: "description" },
  { label: "Sizing Guide",       value: "sizing"      },
  { label: "Shipping & Returns", value: "shipping"    },
];

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColour, setSelectedColour] = useState<ProductColour | null>(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [activeImage, setActiveImage] = useState("");
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    getProductBySlug(slug).then((p) => {
      if (!p) { setLoading(false); return; }
      setProduct(p);
      setSelectedColour(p.colours?.[0] ?? null);
      setActiveImage(p.colours?.[0]?.mockup_front_url ?? "");
      // Default to first available size
      const firstSize = p.available_sizes?.[0]?.label ?? "M";
      setSelectedSize(firstSize);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-24 pb-24 bg-dark min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 animate-pulse">
            <div className="aspect-square rounded-2xl bg-dark-card border border-gold/12" />
            <div className="space-y-4">
              <div className="h-4 rounded bg-dark-elevated w-1/4" />
              <div className="h-10 rounded bg-dark-elevated w-3/4" />
              <div className="h-8 rounded bg-dark-elevated w-1/3" />
              <div className="h-24 rounded bg-dark-elevated" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) notFound();

  const sizeModifier = product.available_sizes?.find((s) => s.label === selectedSize)?.price_modifier ?? 0;
  const currentPrice = product.base_price + sizeModifier;

  const handleAddToCart = () => {
    if (!selectedColour) return;
    addItem({
      id: `${product.id}-${selectedColour.id}-${selectedSize}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      colour: selectedColour.name,
      colourHex: selectedColour.hex,
      size: selectedSize,
      quantity: qty,
      unitPrice: currentPrice,
      thumbnailUrl: selectedColour.mockup_front_url ?? "",
    });
  };

  return (
    <div className="pt-24 pb-24 bg-dark min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-cream-faint mb-8">
          <Link href="/products" className="hover:text-gold transition-colors">Products</Link>
          <span>/</span>
          <span className="text-cream-muted">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-14">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-dark-card border border-gold/12 mb-4">
              <Image src={activeImage || "/products/placeholder.png"} alt={product.name} width={600} height={600} className="object-contain p-8 w-full h-full" />
            </div>
            <div className="flex gap-3">
              {product.gallery?.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(url)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border transition-all ${activeImage === url ? "border-gold" : "border-gold/15 hover:border-gold/40"}`}
                >
                  <Image src={url} alt={`${product.name} view ${i + 1}`} width={80} height={80} className="object-contain p-2 w-full h-full" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-label text-[11px] uppercase tracking-widest text-gold mb-2">{product.category_name}</p>
                <h1 className="font-display font-bold text-cream" style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}>{product.name}</h1>
              </div>
              {product.compare_price && <Badge variant="pending">Sale</Badge>}
            </div>

            <div className="flex items-center gap-2 mb-5">
              <div className="flex">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} size={14} className={i < Math.floor(product.rating) ? "text-gold fill-gold" : "text-cream-faint"} />
                ))}
              </div>
              <span className="text-sm text-cream-muted">{product.rating} ({product.review_count} reviews)</span>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <span className="font-display font-semibold text-3xl text-cream">{formatPrice(currentPrice)}</span>
              {product.compare_price && (
                <span className="text-cream-faint text-xl line-through">{formatPrice(product.compare_price)}</span>
              )}
            </div>

            {/* Colour */}
            <div className="mb-6">
              <p className="font-label text-[11px] uppercase tracking-widest text-cream-faint mb-3">
                Colour — <span className="text-cream">{selectedColour?.name}</span>
              </p>
              <div className="flex gap-3">
                {product.colours?.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedColour(c); setActiveImage(c.mockup_front_url ?? ""); }}
                    title={c.name}
                    style={{ backgroundColor: c.hex }}
                    className={`w-8 h-8 rounded-full transition-all ${selectedColour?.id === c.id ? "ring-2 ring-gold ring-offset-2 ring-offset-dark scale-110" : "hover:scale-105 ring-1 ring-gold/15"}`}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="font-label text-[11px] uppercase tracking-widest text-cream-faint">Size</p>
                <button className="text-xs text-gold hover:text-gold-light transition-colors">Size guide →</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.available_sizes?.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setSelectedSize(s.label)}
                    className={`px-4 py-2 rounded-lg border text-sm font-label transition-all ${selectedSize === s.label ? "border-gold bg-gold/15 text-gold" : "border-gold/15 text-cream-muted hover:border-gold/40 hover:text-cream"}`}
                  >
                    {s.label}
                    {s.price_modifier > 0 && <span className="text-[10px] ml-1 opacity-60">+£{s.price_modifier}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty */}
            <div className="flex items-center gap-4 mb-8">
              <p className="font-label text-[11px] uppercase tracking-widest text-cream-faint">Qty</p>
              <div className="flex items-center gap-3 bg-dark-elevated rounded-xl border border-gold/12 px-1">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2.5 text-cream-muted hover:text-cream transition-colors">
                  <Minus size={14} />
                </button>
                <span className="font-heading font-semibold text-cream w-6 text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="p-2.5 text-cream-muted hover:text-cream transition-colors">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 mb-8">
              <Link href={`/mockup?product=${product.slug}`}>
                <Button size="lg" variant="primary" className="w-full">
                  Design & Customize <ArrowRight size={16} />
                </Button>
              </Link>
              <Button size="lg" variant="secondary" className="w-full" onClick={handleAddToCart}>
                Add to Cart (No Design)
              </Button>
            </div>

            {/* Trust */}
            <div className="grid grid-cols-3 gap-3 border-t border-gold/10 pt-6">
              {[
                { icon: <Truck size={16} />,        label: "Free shipping over £50" },
                { icon: <RotateCcw size={16} />,    label: "Free returns"           },
                { icon: <ShieldCheck size={16} />,  label: "Secure checkout"        },
              ].map(({ icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-center">
                  <span className="text-gold">{icon}</span>
                  <span className="font-label text-[10px] uppercase tracking-wide text-cream-faint">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-20">
          <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
          <div className="pt-8">
            {activeTab === "description" && (
              <div className="max-w-2xl">
                <p className="text-cream-muted leading-relaxed">{product.description}</p>
              </div>
            )}
            {activeTab === "sizing" && (
              <div className="max-w-lg">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gold/10">
                      {["Size", "Chest (in)", "Length (in)"].map((h) => (
                        <th key={h} className="text-left py-3 pr-6 font-label text-[11px] uppercase tracking-widest text-cream-faint">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[["XS","34–36","27"],["S","36–38","28"],["M","38–40","29"],["L","40–42","30"],["XL","42–44","31"],["XXL","44–46","32"]].map(([s, c, l]) => (
                      <tr key={s} className="border-b border-gold/8">
                        <td className="py-3 pr-6 font-label text-xs text-cream">{s}</td>
                        <td className="py-3 pr-6 text-cream-muted">{c}</td>
                        <td className="py-3 text-cream-muted">{l}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === "shipping" && (
              <div className="max-w-xl space-y-4 text-cream-muted text-sm leading-relaxed">
                <p><strong className="text-cream">Standard Shipping (3–5 business days)</strong> — £3.99, free on orders over £50. Production time 2 days.</p>
                <p><strong className="text-cream">Express Shipping (1–2 business days)</strong> — £7.99 flat rate. Production time 1 day.</p>
                <p><strong className="text-cream">Returns</strong> — We accept returns within 30 days of delivery for non-personalised items. Custom print items cannot be returned unless faulty.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
