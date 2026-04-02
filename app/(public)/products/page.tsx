"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal, Star, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getProducts, getCategories } from "@/lib/supabase/queries";
import type { Product, Category } from "@/lib/supabase/queries";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SORT_OPTIONS = [
  { label: "Newest",          value: "newest"     },
  { label: "Price: Low–High", value: "price-asc"  },
  { label: "Price: High–Low", value: "price-desc" },
  { label: "Best Rated",      value: "rating"     },
];

export default function ProductsPage() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sort, setSort]           = useState("newest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()]).then(([prods, cats]) => {
      setProducts(prods);
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (selectedCat !== "all") list = list.filter((p) => p.category_id === selectedCat);
    if (selectedSizes.length) {
      list = list.filter((p) => p.available_sizes?.some((s) => selectedSizes.includes(s.label)));
    }
    if (sort === "price-asc")  list.sort((a, b) => a.base_price - b.base_price);
    if (sort === "price-desc") list.sort((a, b) => b.base_price - a.base_price);
    if (sort === "rating")     list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [products, search, selectedCat, selectedSizes, sort]);

  const toggleSize = (s: string) =>
    setSelectedSizes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const FilterPanel = () => (
    <div className="space-y-8">
      <div>
        <p className="font-label text-[11px] uppercase tracking-widest text-cream-faint mb-4">Category</p>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedCat("all")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCat === "all" ? "bg-gold/15 text-gold" : "text-cream-muted hover:text-cream hover:bg-dark-elevated"}`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${selectedCat === cat.id ? "bg-gold/15 text-gold" : "text-cream-muted hover:text-cream hover:bg-dark-elevated"}`}
            >
              {cat.name}
              <span className="font-label text-[10px] opacity-60">
                {products.filter((p) => p.category_id === cat.id).length}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="font-label text-[11px] uppercase tracking-widest text-cream-faint mb-4">Size</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-label transition-all ${selectedSizes.includes(s) ? "border-gold bg-gold/15 text-gold" : "border-gold/15 text-cream-muted hover:border-gold/40 hover:text-cream"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      {(selectedCat !== "all" || selectedSizes.length > 0) && (
        <button
          onClick={() => { setSelectedCat("all"); setSelectedSizes([]); }}
          className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
        >
          <X size={12} /> Clear filters
        </button>
      )}
    </div>
  );

  return (
    <>
      <section className="pt-32 pb-12 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="font-label text-[11px] uppercase tracking-widest text-gold">Shop</span>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-cream mt-2 mb-4">Our Products</h1>
          <p className="text-cream-muted max-w-lg">Premium blanks, ready for your designs. Every product is carefully selected for print quality, durability, and wear.</p>
        </div>
      </section>

      <div className="bg-dark pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8 pt-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-faint" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full bg-dark-elevated border border-gold/12 rounded-xl pl-10 pr-4 py-3 text-sm text-cream placeholder:text-cream-faint/50 focus:outline-none focus:border-gold/40 transition-colors"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-dark-elevated border border-gold/12 rounded-xl px-4 py-3 text-sm text-cream-muted focus:outline-none focus:border-gold/40 transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 bg-dark-elevated border border-gold/12 rounded-xl px-4 py-3 text-sm text-cream-muted hover:border-gold/30 transition-colors"
            >
              <SlidersHorizontal size={15} /> Filter
            </button>
          </div>

          <div className="flex gap-8">
            <aside className="hidden lg:block w-56 shrink-0 sticky top-24 self-start">
              <FilterPanel />
            </aside>

            <div className="flex-1">
              <p className="font-label text-[11px] uppercase tracking-widest text-cream-faint mb-6">
                {loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "product" : "products"}`}
              </p>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square rounded-xl bg-dark-card border border-gold/10 mb-3" />
                      <div className="h-3 rounded bg-dark-elevated mb-2 w-2/3" />
                      <div className="h-4 rounded bg-dark-elevated mb-1" />
                      <div className="h-3 rounded bg-dark-elevated w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-cream-muted mb-4">No products match those filters.</p>
                  <Button variant="secondary" onClick={() => { setSearch(""); setSelectedCat("all"); setSelectedSizes([]); }}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {filtered.map((product) => (
                    <div key={product.id} className="group">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-dark-card border border-gold/10 mb-3 card-hover">
                        <Image
                          src={product.colours?.[0]?.mockup_front_url ?? "/products/placeholder.png"}
                          alt={product.name}
                          fill
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.compare_price && (
                          <div className="absolute top-3 left-3"><Badge variant="pending">Sale</Badge></div>
                        )}
                        {product.is_featured && (
                          <div className="absolute top-3 right-3"><Badge variant="gold">Popular</Badge></div>
                        )}
                        <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-4">
                          <Link href={`/mockup?product=${product.slug}`} className="w-full">
                            <Button size="sm" variant="primary" className="w-full">Customize</Button>
                          </Link>
                          <Link href={`/products/${product.slug}`} className="w-full">
                            <Button size="sm" variant="secondary" className="w-full">View Details</Button>
                          </Link>
                        </div>
                      </div>
                      <p className="font-label text-[10px] uppercase tracking-widest text-cream-faint mb-1">{product.category_name}</p>
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-heading text-sm text-cream font-semibold mb-1.5 hover:text-gold transition-colors">{product.name}</h3>
                      </Link>
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="flex">
                          {Array(5).fill(0).map((_, i) => (
                            <Star key={i} size={11} className={i < Math.floor(product.rating) ? "text-gold fill-gold" : "text-cream-faint"} />
                          ))}
                        </div>
                        <span className="font-label text-[10px] text-cream-faint">({product.review_count})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-semibold text-cream text-sm">{formatPrice(product.base_price)}</span>
                        {product.compare_price && (
                          <span className="text-cream-faint text-xs line-through">{formatPrice(product.compare_price)}</span>
                        )}
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        {product.colours?.slice(0, 4).map((c) => (
                          <div key={c.id} title={c.name} style={{ backgroundColor: c.hex }}
                            className="w-4 h-4 rounded-full border border-gold/15 cursor-pointer hover:scale-110 transition-transform" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-dark-card border-l border-gold/15 p-6 overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-heading text-cream font-semibold">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="text-cream-muted hover:text-cream"><X size={20} /></button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </>
  );
}
