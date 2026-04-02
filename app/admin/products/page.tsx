"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, Pause, Play, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

interface AdminProduct {
  id: string; name: string; slug: string; base_price: number;
  active: boolean; created_at: string;
  category_name?: string;
  colours?: { id: string; hex: string; name: string; mockup_front_url: string | null }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: prods }, { data: colours }, { data: cats }] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("product_colours").select("id, product_id, hex, name, mockup_front_url").order("sort_order"),
        supabase.from("categories").select("id, name"),
      ]);
      const catMap = Object.fromEntries((cats ?? []).map((c: any) => [c.id, c.name]));
      setProducts(
        (prods ?? []).map((p: any) => ({
          ...p,
          category_name: catMap[p.category_id] ?? "",
          colours: (colours ?? []).filter((c: any) => c.product_id === p.id),
        }))
      );
      setLoading(false);
    }
    load();
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("products").update({ active: !current }).eq("id", id);
    setProducts((p) => p.map((prod) => prod.id === id ? { ...prod, active: !current } : prod));
  };

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will also remove all colours, sizes, and gallery images.`)) return;
    await supabase.from("products").delete().eq("id", id);
    setProducts((p) => p.filter((prod) => prod.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-cream">Products</h1>
          <p className="text-sm text-cream-muted mt-1">{loading ? "…" : `${products.length} products`}</p>
        </div>
        <Link href="/admin/products/new">
          <Button variant="primary" size="sm"><Plus size={15} /> Add Product</Button>
        </Link>
      </div>

      <div className="bg-dark-card border border-gold/12 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/10">
              {["Product","Category","Base Price","Colours","Status","Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-4 font-label text-[10px] uppercase tracking-widest text-cream-faint">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array(4).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-gold/8">
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 rounded bg-dark-elevated animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              : products.map((p) => (
              <tr key={p.id} className={`border-b border-gold/8 last:border-0 hover:bg-dark-elevated/50 transition-colors ${!p.active ? "opacity-50" : ""}`}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-dark-elevated overflow-hidden shrink-0">
                      {p.colours?.[0]?.mockup_front_url ? (
                        <Image src={p.colours[0].mockup_front_url} alt={p.name} width={40} height={40} className="object-contain w-full h-full p-1" />
                      ) : <div className="w-full h-full bg-dark-elevated" />}
                    </div>
                    <span className="font-heading text-sm text-cream font-semibold">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-cream-muted">{p.category_name}</td>
                <td className="px-5 py-4 font-heading font-semibold text-cream">{formatPrice(p.base_price)}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-1.5">
                    {p.colours?.map((c) => (
                      <div key={c.id} style={{ backgroundColor: c.hex }} title={c.name} className="w-4 h-4 rounded-full border border-black/20" />
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <Badge variant={p.active ? "gold" : "outline"}>{p.active ? "Active" : "Paused"}</Badge>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/products/${p.id}`}>
                      <button title="Edit" className="p-1.5 text-cream-muted hover:text-cream transition-colors"><Pencil size={14} /></button>
                    </Link>
                    <button
                      title={p.active ? "Pause" : "Activate"}
                      onClick={() => toggleActive(p.id, p.active)}
                      className={`p-1.5 transition-colors ${p.active ? "text-amber-400/60 hover:text-amber-400" : "text-green-400/60 hover:text-green-400"}`}
                    >
                      {p.active ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button
                      title="Delete"
                      onClick={() => deleteProduct(p.id, p.name)}
                      className="p-1.5 text-red-400/50 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && products.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-cream-muted mb-4">No products yet.</p>
            <Link href="/admin/products/new">
              <Button variant="primary"><Plus size={15} /> Add your first product</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
