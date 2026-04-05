"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical, Upload, Check, ArrowLeft, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { supabase } from "@/lib/supabase/client";
import { slugify, formatPrice } from "@/lib/utils";
import type { Category } from "@/lib/supabase/queries";

const SIZES_DEFAULT = ["XS", "S", "M", "L", "XL", "XXL"];

interface ColourVariant {
  _key: string;
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
  if (error) {
    console.error("Upload error:", error.message);
    return null;
  }
  const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
  return publicUrl;
}

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Basic fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Sizes
  const [selectedSizes, setSelectedSizes] = useState<SizeEntry[]>(
    ["S", "M", "L", "XL"].map((l) => ({ label: l, price_modifier: 0 }))
  );

  // Colours
  const [colours, setColours] = useState<ColourVariant[]>([
    { _key: "c-0", name: "", hex: "#1a1a1a", frontFile: null, frontPreview: null, backFile: null, backPreview: null },
  ]);

  useEffect(() => {
    supabase.from("categories").select("*").order("sort_order")
      .then(({ data }) => setCategories((data ?? []) as Category[]));
  }, []);

  // Auto-slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugManual) setSlug(slugify(val));
  };

  const toggleSize = (label: string) => {
    setSelectedSizes((prev) => {
      const exists = prev.find((s) => s.label === label);
      if (exists) return prev.filter((s) => s.label !== label);
      return [...prev, { label, price_modifier: 0 }];
    });
  };

  const setSizeMod = (label: string, mod: number) => {
    setSelectedSizes((prev) => prev.map((s) => s.label === label ? { ...s, price_modifier: mod } : s));
  };

  const addColour = () => {
    setColours((p) => [...p, { _key: `c-${Date.now()}`, name: "", hex: "#ffffff", frontFile: null, frontPreview: null, backFile: null, backPreview: null }]);
  };

  const removeColour = (key: string) => {
    setColours((p) => p.filter((c) => c._key !== key));
  };

  const updateColour = (key: string, update: Partial<ColourVariant>) => {
    setColours((p) => p.map((c) => c._key === key ? { ...c, ...update } : c));
  };

  const handleFileSelect = (key: string, side: "front" | "back", file: File) => {
    const preview = URL.createObjectURL(file);
    if (side === "front") updateColour(key, { frontFile: file, frontPreview: preview });
    else updateColour(key, { backFile: file, backPreview: preview });
  };

  const validate = (): boolean => {
    if (!name.trim()) { setError("Product name is required."); return false; }
    if (!slug.trim()) { setError("Slug is required."); return false; }
    if (!basePrice || isNaN(parseFloat(basePrice))) { setError("Valid base price is required."); return false; }
    if (colours.some((c) => !c.name.trim())) { setError("All colour variants must have a name."); return false; }
    if (colours.some((c) => !c.frontFile && !c.frontUrl)) { setError("Each colour variant must have a front image."); return false; }
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    if (!validate()) return;
    setSaving(true);

    try {
      const productId = `prod-${Date.now()}`;

      // 1. Upload images for each colour
      const coloursWithUrls: (ColourVariant & { frontUrl: string; backUrl?: string })[] = [];
      for (const col of colours) {
        let frontUrl = col.frontUrl ?? "";
        let backUrl  = col.backUrl  ?? undefined;

        if (col.frontFile) {
          const url = await uploadImage(col.frontFile, `${productId}/${col._key}-front.${col.frontFile.name.split(".").pop()}`);
          if (!url) { setError(`Failed to upload front image for "${col.name}".`); setSaving(false); return; }
          frontUrl = url;
        }
        if (col.backFile) {
          const url = await uploadImage(col.backFile, `${productId}/${col._key}-back.${col.backFile.name.split(".").pop()}`);
          if (url) backUrl = url;
        }
        coloursWithUrls.push({ ...col, frontUrl, backUrl });
      }

      // 2. Insert product
      const { error: prodErr } = await supabase.from("products").insert({
        id:            productId,
        name:          name.trim(),
        slug:          slug.trim(),
        description:   description.trim() || null,
        base_price:    parseFloat(basePrice),
        compare_price: comparePrice ? parseFloat(comparePrice) : null,
        category_id:   categoryId || null,
        is_featured:   isFeatured,
        active:        isActive,
        rating:        0,
        review_count:  0,
      });
      if (prodErr) throw new Error(prodErr.message);

      // 3. Insert colours
      for (let i = 0; i < coloursWithUrls.length; i++) {
        const col = coloursWithUrls[i];
        const { error: colErr } = await supabase.from("product_colours").insert({
          id:               `${productId}-col-${i}`,
          product_id:       productId,
          name:             col.name.trim(),
          hex:              col.hex,
          mockup_front_url: col.frontUrl,
          mockup_back_url:  col.backUrl ?? null,
          sort_order:       i,
        });
        if (colErr) console.error("Colour insert error:", colErr);
      }

      // 4. Insert sizes
      const sizesSorted = [...selectedSizes].sort((a, b) => SIZES_DEFAULT.indexOf(a.label) - SIZES_DEFAULT.indexOf(b.label));
      for (let i = 0; i < sizesSorted.length; i++) {
        await supabase.from("product_sizes").insert({
          product_id:     productId,
          label:          sizesSorted[i].label,
          price_modifier: sizesSorted[i].price_modifier,
          sort_order:     i,
        });
      }

      setSuccess(true);
      setTimeout(() => router.push("/admin/products"), 1200);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-400/15 border border-green-400/30 flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-green-400" />
          </div>
          <h2 className="font-display font-bold text-2xl text-cream mb-2">Product Created!</h2>
          <p className="text-cream-muted">Redirecting to products list…</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 rounded-xl text-cream-muted hover:text-cream hover:bg-dark-elevated transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display font-bold text-3xl text-cream">Add New Product</h1>
          <p className="text-cream-muted text-sm mt-1">All fields marked * are required.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="grid xl:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="xl:col-span-2 space-y-6">

          {/* Basic info */}
          <Card>
            <CardContent>
              <h2 className="font-heading text-cream font-semibold mb-5">Basic Information</h2>
              <div className="space-y-5">
                <Input id="p-name" label="Product Name *" placeholder="e.g. Classic Premium Tee"
                  value={name} onChange={(e) => handleNameChange(e.target.value)} required />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label text-[10px] uppercase tracking-widest text-cream-faint mb-2">Slug *</label>
                    <input value={slug}
                      onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
                      placeholder="classic-premium-tee"
                      className="w-full bg-dark-elevated border border-gold/15 rounded-xl px-4 py-3 text-sm text-cream-muted font-label focus:outline-none focus:border-gold/40" />
                  </div>
                  <div>
                    <label className="block font-label text-[10px] uppercase tracking-widest text-cream-faint mb-2">Category</label>
                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-dark-elevated border border-gold/15 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 cursor-pointer">
                      <option value="">— No category —</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input id="p-price" label="Base Price (£) *" type="number" placeholder="19.99" min="0" step="0.01"
                    value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />
                  <Input id="p-compare" label="Compare Price (£)" type="number" placeholder="29.99" min="0" step="0.01"
                    value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} />
                </div>
                <Textarea id="p-desc" label="Description" placeholder="Describe the product — material, weight, fit, etc." rows={4}
                  value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Sizes */}
          <Card>
            <CardContent>
              <h2 className="font-heading text-cream font-semibold mb-5">Available Sizes</h2>
              <div className="flex flex-wrap gap-2 mb-5">
                {SIZES_DEFAULT.map((s) => {
                  const selected = selectedSizes.find((x) => x.label === s);
                  return (
                    <button key={s} onClick={() => toggleSize(s)}
                      className={`px-4 py-2 rounded-lg border text-sm font-label transition-all ${selected ? "border-gold bg-gold/15 text-gold" : "border-gold/15 text-cream-muted hover:border-gold/40"}`}>
                      {s}
                    </button>
                  );
                })}
              </div>
              {selectedSizes.length > 0 && (
                <div className="space-y-2">
                  <p className="font-label text-[10px] uppercase tracking-widest text-cream-faint mb-3">Price Modifiers (£ added to base price)</p>
                  {[...selectedSizes].sort((a, b) => SIZES_DEFAULT.indexOf(a.label) - SIZES_DEFAULT.indexOf(b.label)).map((s) => (
                    <div key={s.label} className="flex items-center gap-3">
                      <span className="font-label text-xs text-cream-muted w-8">{s.label}</span>
                      <input type="number" step="0.01" min="0" value={s.price_modifier}
                        onChange={(e) => setSizeMod(s.label, parseFloat(e.target.value) || 0)}
                        className="w-24 bg-dark-elevated border border-gold/15 rounded-lg px-3 py-1.5 text-sm text-cream text-right focus:outline-none focus:border-gold/40" />
                      <span className="font-label text-[10px] text-cream-faint">
                        = {formatPrice(parseFloat(basePrice || "0") + s.price_modifier)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Colour Variants */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading text-cream font-semibold">Colour Variants</h2>
                <Button variant="secondary" size="sm" onClick={addColour}><Plus size={14} /> Add Colour</Button>
              </div>
              <div className="space-y-4">
                {colours.map((col, i) => (
                  <ColourVariantRow
                    key={col._key}
                    col={col}
                    index={i}
                    onUpdate={(update) => updateColour(col._key, update)}
                    onRemove={() => removeColour(col._key)}
                    onFileSelect={(side, file) => handleFileSelect(col._key, side, file)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Publish */}
          <Card>
            <CardContent>
              <h2 className="font-heading text-cream font-semibold mb-5">Publish</h2>
              <div className="space-y-3 mb-5">
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl border border-gold/10 hover:border-gold/20 transition-colors">
                  <div>
                    <p className="font-heading text-sm text-cream">Active</p>
                    <p className="font-label text-[10px] text-cream-faint mt-0.5">Visible in store</p>
                  </div>
                  <Toggle value={isActive} onChange={setIsActive} />
                </label>
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl border border-gold/10 hover:border-gold/20 transition-colors">
                  <div>
                    <p className="font-heading text-sm text-cream flex items-center gap-1.5">
                      <Sparkles size={13} className="text-gold" /> Featured
                    </p>
                    <p className="font-label text-[10px] text-cream-faint mt-0.5">Shows in hero & featured section</p>
                  </div>
                  <Toggle value={isFeatured} onChange={setIsFeatured} />
                </label>
              </div>
              <div className="space-y-2">
                <Button variant="primary" size="lg" className="w-full" loading={saving} onClick={handleSubmit}>
                  <Check size={15} /> Publish Product
                </Button>
                <Button variant="secondary" size="lg" className="w-full" onClick={() => router.push("/admin/products")}>
                  Discard
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Storage note */}
          <div className="bg-gold/5 border border-gold/15 rounded-xl p-4">
            <p className="font-label text-[9px] uppercase tracking-widest text-gold mb-1">Storage Note</p>
            <p className="text-cream-muted text-xs leading-relaxed">
              Images are uploaded to your <strong className="text-cream">product-images</strong> Supabase Storage bucket.
              Make sure the bucket exists and is set to <strong className="text-cream">Public</strong> in your Supabase dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-colors relative ${value ? "bg-gold" : "bg-dark-elevated border border-gold/20"}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${value ? "left-[calc(100%-1.375rem)]" : "left-0.5"}`} />
    </button>
  );
}

function ColourVariantRow({ col, index, onUpdate, onRemove, onFileSelect }: {
  col: ColourVariant;
  index: number;
  onUpdate: (u: Partial<ColourVariant>) => void;
  onRemove: () => void;
  onFileSelect: (side: "front" | "back", file: File) => void;
}) {
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef  = useRef<HTMLInputElement>(null);

  return (
    <div className="p-4 bg-dark-elevated rounded-xl border border-gold/10 space-y-4">
      <div className="flex items-center gap-3">
        <GripVertical size={14} className="text-cream-faint/30 shrink-0" />
        <span className="font-label text-[10px] text-cream-faint uppercase tracking-widest">Variant {index + 1}</span>
        {index > 0 && (
          <button onClick={onRemove} className="ml-auto p-1 text-red-400/40 hover:text-red-400 transition-colors">
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-label text-[10px] uppercase tracking-widest text-cream-faint mb-2">Colour Name *</label>
          <input value={col.name} onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="e.g. Jet Black"
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
          const preview = side === "front" ? col.frontPreview : col.backPreview;
          const ref = side === "front" ? frontRef : backRef;
          return (
            <div key={side}>
              <label className="block font-label text-[10px] uppercase tracking-widest text-cream-faint mb-2">
                {side === "front" ? "Front Image *" : "Back Image (optional)"}
              </label>
              <div
                onClick={() => ref.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-gold/20 hover:border-gold/40 transition-colors cursor-pointer overflow-hidden flex items-center justify-center bg-dark-card relative"
              >
                {preview ? (
                  <img src={preview} alt={side} className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="text-center">
                    <Upload size={16} className="text-gold/30 mx-auto mb-1" />
                    <p className="font-label text-[9px] text-cream-faint uppercase tracking-wide">Upload</p>
                  </div>
                )}
              </div>
              <input
                ref={ref}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFileSelect(side, e.target.files[0])}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
