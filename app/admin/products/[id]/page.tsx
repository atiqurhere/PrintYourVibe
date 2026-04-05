"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, Trash2, GripVertical, Upload, Check, ArrowLeft, Sparkles, AlertCircle, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { supabase } from "@/lib/supabase/client";
import { slugify, formatPrice } from "@/lib/utils";
import type { Category, Product, ProductColour, ProductSize } from "@/lib/supabase/queries";
import Image from "next/image";

const SIZES_DEFAULT = ["XS", "S", "M", "L", "XL", "XXL"];

interface ColourRow {
  _key: string;
  id?: string;
  name: string;
  hex: string;
  frontFile: File | null;
  frontPreview: string | null;
  backFile: File | null;
  backPreview: string | null;
  frontUrl?: string;
  backUrl?: string;
}

interface SizeEntry { label: string; price_modifier: number }

async function uploadImage(file: File, path: string): Promise<string | null> {
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) return null;
  const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
  return publicUrl;
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${value ? "bg-gold" : "bg-dark-elevated border border-gold/20"}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${value ? "left-[calc(100%-1.375rem)]" : "left-0.5"}`} />
    </button>
  );
}

export default function EditProductPage() {
  const router = useRouter();
  const { id: productId } = useParams() as { id: string };

  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state
  const [name, setName]           = useState("");
  const [slug, setSlug]           = useState("");
  const [description, setDesc]    = useState("");
  const [basePrice, setBase]      = useState("");
  const [comparePrice, setCompare]= useState("");
  const [categoryId, setCatId]    = useState("");
  const [isFeatured, setFeatured] = useState(false);
  const [isActive, setActive]     = useState(true);
  const [selectedSizes, setSizes] = useState<SizeEntry[]>([]);
  const [colours, setColours]     = useState<ColourRow[]>([]);

  const load = useCallback(async () => {
    const [
      { data: prod },
      { data: cols },
      { data: sizes },
      { data: cats },
    ] = await Promise.all([
      supabase.from("products").select("*").eq("id", productId).single(),
      supabase.from("product_colours").select("*").eq("product_id", productId).order("sort_order"),
      supabase.from("product_sizes").select("*").eq("product_id", productId).order("sort_order"),
      supabase.from("categories").select("*").order("sort_order"),
    ]);

    if (!prod) { router.push("/admin/products"); return; }

    const p = prod as any;
    setName(p.name ?? "");
    setSlug(p.slug ?? "");
    setDesc(p.description ?? "");
    setBase(String(p.base_price ?? ""));
    setCompare(p.compare_price ? String(p.compare_price) : "");
    setCatId(p.category_id ?? "");
    setFeatured(p.is_featured ?? false);
    setActive(p.active ?? true);

    setSizes((sizes ?? []).map((s: any) => ({ label: s.label, price_modifier: s.price_modifier ?? 0 })));
    setColours((cols ?? []).map((c: any, i: number) => ({
      _key: `existing-${i}`,
      id: c.id,
      name: c.name,
      hex: c.hex,
      frontFile: null, frontPreview: null,
      backFile: null,  backPreview: null,
      frontUrl: c.mockup_front_url ?? "",
      backUrl:  c.mockup_back_url  ?? "",
    })));
    setCategories((cats ?? []) as Category[]);
    setLoading(false);
  }, [productId, router]);

  useEffect(() => { load(); }, [load]);

  const toggleSize = (label: string) => {
    setSizes((prev) => {
      const exists = prev.find((s) => s.label === label);
      if (exists) return prev.filter((s) => s.label !== label);
      return [...prev, { label, price_modifier: 0 }];
    });
  };
  const setSizeMod = (label: string, mod: number) =>
    setSizes((prev) => prev.map((s) => s.label === label ? { ...s, price_modifier: mod } : s));

  const addColour = () =>
    setColours((p) => [...p, { _key: `new-${Date.now()}`, name: "", hex: "#ffffff", frontFile: null, frontPreview: null, backFile: null, backPreview: null }]);

  const removeColour = (key: string) => setColours((p) => p.filter((c) => c._key !== key));

  const updateColour = (key: string, update: Partial<ColourRow>) =>
    setColours((p) => p.map((c) => c._key === key ? { ...c, ...update } : c));

  const handleFileSelect = (key: string, side: "front" | "back", file: File) => {
    const preview = URL.createObjectURL(file);
    if (side === "front") updateColour(key, { frontFile: file, frontPreview: preview });
    else updateColour(key, { backFile: file, backPreview: preview });
  };

  const handleSave = async () => {
    setError("");
    if (!name.trim()) { setError("Product name is required."); return; }
    if (!basePrice || isNaN(parseFloat(basePrice))) { setError("Valid base price is required."); return; }
    if (colours.some((c) => !c.name.trim())) { setError("All colour variants must have a name."); return; }
    setSaving(true);

    try {
      // Upload any new images
      const coloursWithUrls = [...colours];
      for (let i = 0; i < coloursWithUrls.length; i++) {
        const col = coloursWithUrls[i];
        if (col.frontFile) {
          const url = await uploadImage(col.frontFile, `${productId}/${col._key}-front.${col.frontFile.name.split(".").pop()}`);
          if (url) coloursWithUrls[i] = { ...col, frontUrl: url };
        }
        if (col.backFile) {
          const url = await uploadImage(col.backFile, `${productId}/${col._key}-back.${col.backFile.name.split(".").pop()}`);
          if (url) coloursWithUrls[i] = { ...coloursWithUrls[i], backUrl: url };
        }
      }

      // Update product
      await supabase.from("products").update({
        name: name.trim(), slug: slug.trim(),
        description: description.trim() || null,
        base_price: parseFloat(basePrice),
        compare_price: comparePrice ? parseFloat(comparePrice) : null,
        category_id: categoryId || null,
        is_featured: isFeatured, active: isActive,
      }).eq("id", productId);

      // Sync colours — delete all, re-insert
      await supabase.from("product_colours").delete().eq("product_id", productId);
      for (let i = 0; i < coloursWithUrls.length; i++) {
        const col = coloursWithUrls[i];
        await supabase.from("product_colours").insert({
          id: col.id ?? `${productId}-col-${i}-${Date.now()}`,
          product_id: productId,
          name: col.name.trim(),
          hex: col.hex,
          mockup_front_url: col.frontUrl ?? null,
          mockup_back_url:  col.backUrl  ?? null,
          sort_order: i,
        });
      }

      // Sync sizes
      await supabase.from("product_sizes").delete().eq("product_id", productId);
      const sorted = [...selectedSizes].sort((a, b) => SIZES_DEFAULT.indexOf(a.label) - SIZES_DEFAULT.indexOf(b.label));
      for (let i = 0; i < sorted.length; i++) {
        await supabase.from("product_sizes").insert({
          product_id: productId, label: sorted[i].label,
          price_modifier: sorted[i].price_modifier, sort_order: i,
        });
      }

      setSuccess(true);
      setTimeout(() => router.push("/admin/products"), 1200);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete this product? This action cannot be undone.`)) return;
    setDeleting(true);
    await supabase.from("products").delete().eq("id", productId);
    router.push("/admin/products");
  };

  const handleToggleActive = async () => {
    const next = !isActive;
    await supabase.from("products").update({ active: next }).eq("id", productId);
    setActive(next);
  };

  if (loading) return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 bg-dark-elevated rounded-xl w-80" />
      <div className="grid grid-cols-2 gap-6">
        {[1,2,3,4].map((i) => <div key={i} className="h-40 bg-dark-elevated rounded-2xl" />)}
      </div>
    </div>
  );

  if (success) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-400/15 border border-green-400/30 flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-green-400" />
        </div>
        <h2 className="font-display font-bold text-2xl text-cream mb-2">Product Updated!</h2>
        <p className="text-cream-muted">Redirecting…</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push("/admin/products")} className="p-2 rounded-xl text-cream-muted hover:text-cream hover:bg-dark-elevated transition-all">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="font-display font-bold text-3xl text-cream">Edit Product</h1>
          <p className="text-cream-muted text-sm mt-1 font-label">{slug}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleToggleActive}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-label transition-all ${isActive ? "border-amber-400/30 text-amber-400 hover:bg-amber-400/8" : "border-green-400/30 text-green-400 hover:bg-green-400/8"}`}>
            {isActive ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Activate</>}
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-400/20 text-xs font-label text-red-400/70 hover:text-red-400 hover:border-red-400/40 transition-all">
            <Trash2 size={12} /> {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardContent>
              <h2 className="font-heading text-cream font-semibold mb-5">Basic Information</h2>
              <div className="space-y-5">
                <Input id="e-name" label="Product Name *" value={name} onChange={(e) => setName(e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label text-[10px] uppercase tracking-widest text-cream-faint mb-2">Slug</label>
                    <input value={slug} onChange={(e) => setSlug(e.target.value)}
                      className="w-full bg-dark-elevated border border-gold/15 rounded-xl px-4 py-3 text-sm text-cream-muted font-label focus:outline-none focus:border-gold/40" />
                  </div>
                  <div>
                    <label className="block font-label text-[10px] uppercase tracking-widest text-cream-faint mb-2">Category</label>
                    <select value={categoryId} onChange={(e) => setCatId(e.target.value)}
                      className="w-full bg-dark-elevated border border-gold/15 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 cursor-pointer">
                      <option value="">— No category —</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input id="e-price" label="Base Price (£) *" type="number" step="0.01" min="0" value={basePrice} onChange={(e) => setBase(e.target.value)} />
                  <Input id="e-compare" label="Compare Price (£)" type="number" step="0.01" min="0" value={comparePrice} onChange={(e) => setCompare(e.target.value)} />
                </div>
                <Textarea id="e-desc" label="Description" rows={4} value={description} onChange={(e) => setDesc(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Sizes */}
          <Card>
            <CardContent>
              <h2 className="font-heading text-cream font-semibold mb-5">Available Sizes</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {SIZES_DEFAULT.map((s) => {
                  const sel = selectedSizes.find((x) => x.label === s);
                  return (
                    <button key={s} onClick={() => toggleSize(s)}
                      className={`px-4 py-2 rounded-lg border text-sm font-label transition-all ${sel ? "border-gold bg-gold/15 text-gold" : "border-gold/15 text-cream-muted hover:border-gold/40"}`}>
                      {s}
                    </button>
                  );
                })}
              </div>
              {selectedSizes.length > 0 && (
                <div className="space-y-2">
                  <p className="font-label text-[10px] uppercase tracking-widest text-cream-faint mb-3">Price Modifiers</p>
                  {[...selectedSizes].sort((a, b) => SIZES_DEFAULT.indexOf(a.label) - SIZES_DEFAULT.indexOf(b.label)).map((s) => (
                    <div key={s.label} className="flex items-center gap-3">
                      <span className="font-label text-xs text-cream-muted w-8">{s.label}</span>
                      <input type="number" step="0.01" min="0" value={s.price_modifier}
                        onChange={(e) => setSizeMod(s.label, parseFloat(e.target.value) || 0)}
                        className="w-24 bg-dark-elevated border border-gold/15 rounded-lg px-3 py-1.5 text-sm text-cream text-right focus:outline-none focus:border-gold/40" />
                      <span className="font-label text-[10px] text-cream-faint">=  {formatPrice(parseFloat(basePrice || "0") + s.price_modifier)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Colours */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading text-cream font-semibold">Colour Variants</h2>
                <Button variant="secondary" size="sm" onClick={addColour}><Plus size={14} /> Add Colour</Button>
              </div>
              <div className="space-y-4">
                {colours.map((col, i) => (
                  <ColourRow key={col._key} col={col} index={i}
                    onUpdate={(u) => updateColour(col._key, u)}
                    onRemove={() => removeColour(col._key)}
                    onFile={(side, file) => handleFileSelect(col._key, side, file)} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardContent>
              <h2 className="font-heading text-cream font-semibold mb-5">Settings</h2>
              <div className="space-y-3 mb-5">
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl border border-gold/10 hover:border-gold/20 transition-colors">
                  <div>
                    <p className="font-heading text-sm text-cream">Active</p>
                    <p className="font-label text-[10px] text-cream-faint mt-0.5">Visible in store</p>
                  </div>
                  <Toggle value={isActive} onChange={setActive} />
                </label>
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl border border-gold/10 hover:border-gold/20 transition-colors">
                  <div>
                    <p className="font-heading text-sm text-cream flex items-center gap-1.5">
                      <Sparkles size={13} className="text-gold" /> Featured
                    </p>
                    <p className="font-label text-[10px] text-cream-faint mt-0.5">Shows in hero & featured section</p>
                  </div>
                  <Toggle value={isFeatured} onChange={setFeatured} />
                </label>
              </div>
              <div className="space-y-2">
                <Button variant="primary" size="lg" className="w-full" loading={saving} onClick={handleSave}>
                  <Check size={15} /> Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ColourRow({ col, index, onUpdate, onRemove, onFile }: {
  col: ColourRow; index: number;
  onUpdate: (u: Partial<ColourRow>) => void;
  onRemove: () => void;
  onFile: (side: "front" | "back", file: File) => void;
}) {
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef  = useRef<HTMLInputElement>(null);

  return (
    <div className="p-4 bg-dark-elevated rounded-xl border border-gold/10 space-y-4">
      <div className="flex items-center gap-3">
        <GripVertical size={14} className="text-cream-faint/30" />
        <span className="font-label text-[10px] text-cream-faint uppercase tracking-widest">Variant {index + 1}</span>
        {index > 0 && (
          <button onClick={onRemove} className="ml-auto p-1 text-red-400/40 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-label text-[10px] uppercase tracking-widest text-cream-faint mb-2">Name *</label>
          <input value={col.name} onChange={(e) => onUpdate({ name: e.target.value })} placeholder="e.g. Jet Black"
            className="w-full bg-dark-card border border-gold/15 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40" />
        </div>
        <div>
          <label className="block font-label text-[10px] uppercase tracking-widest text-cream-faint mb-2">Hex Colour</label>
          <div className="flex items-center gap-3 bg-dark-card border border-gold/15 rounded-xl px-3 py-2">
            <input type="color" value={col.hex} onChange={(e) => onUpdate({ hex: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" />
            <span className="font-label text-xs text-cream-muted">{col.hex}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(["front", "back"] as const).map((side) => {
          const preview = side === "front" ? (col.frontPreview ?? col.frontUrl) : (col.backPreview ?? col.backUrl);
          const ref = side === "front" ? frontRef : backRef;
          return (
            <div key={side}>
              <label className="block font-label text-[10px] uppercase tracking-widest text-cream-faint mb-2">
                {side === "front" ? "Front Image" : "Back Image"}
              </label>
              <div onClick={() => ref.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-gold/20 hover:border-gold/40 transition-colors cursor-pointer overflow-hidden flex items-center justify-center bg-dark-card">
                {preview ? (
                  <img src={preview} alt={side} className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="text-center"><Upload size={14} className="text-gold/30 mx-auto mb-1" /><p className="font-label text-[9px] text-cream-faint uppercase tracking-wide">Upload</p></div>
                )}
              </div>
              <input ref={ref} type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && onFile(side, e.target.files[0])} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
