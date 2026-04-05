"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, GripVertical, ChevronUp, ChevronDown, Check, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase/client";
import type { Category } from "@/lib/supabase/queries";
import { slugify } from "@/lib/utils";

const EMPTY: Partial<Category> & { image_url: string | null } = {
  id: "", name: "", slug: "", description: null, image_url: null, sort_order: 0,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<(Category & { _isNew?: boolean }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCategories((data ?? []) as Category[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `categories/${editing.id || `new-${Date.now()}`}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
      setEditing((prev) => prev ? { ...prev, image_url: publicUrl } : prev);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!editing || !editing.name.trim()) return;
    setSaving(true);
    const isNew = editing._isNew;
    const payload: Category = {
      id: editing.id || slugify(editing.name),
      name: editing.name.trim(),
      slug: editing.slug || slugify(editing.name),
      description: editing.description ?? null,
      image_url: editing.image_url ?? null,
      sort_order: editing.sort_order ?? categories.length,
    };
    if (isNew) {
      await supabase.from("categories").insert(payload);
      setCategories((prev) => [...prev, payload]);
    } else {
      await supabase.from("categories").update(payload).eq("id", payload.id);
      setCategories((prev) => prev.map((c) => c.id === payload.id ? payload : c));
    }
    setSaving(false);
    setEditing(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Products in this category will lose their category.`)) return;
    await supabase.from("categories").delete().eq("id", id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleMove = (id: string, dir: "up" | "down") => {
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= prev.length) return prev;
      const reordered = [...prev];
      [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];
      const updated = reordered.map((c, i) => ({ ...c, sort_order: i }));
      updated.forEach((c) => supabase.from("categories").update({ sort_order: c.sort_order }).eq("id", c.id));
      return updated;
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-cream">Categories</h1>
          <p className="text-cream-muted mt-1 text-sm">{loading ? "…" : `${categories.length} categories`} — these appear in the Shop by Category section on the homepage.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setEditing({ ...(EMPTY as any), id: "", _isNew: true, sort_order: categories.length })}
        >
          <Plus size={15} /> Add Category
        </Button>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-dark-card border border-gold/20 rounded-2xl p-6 w-full max-w-lg animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-cream font-semibold">{editing._isNew ? "Add Category" : "Edit Category"}</h2>
              <button onClick={() => setEditing(null)} className="text-cream-faint hover:text-cream"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              {/* Image */}
              <div>
                <label className="block font-label text-[10px] uppercase tracking-widest text-cream-faint mb-2">Category Image</label>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-dark-elevated border-2 border-dashed border-gold/20 hover:border-gold/40 transition-colors cursor-pointer" onClick={() => document.getElementById("cat-img-upload")?.click()}>
                  {editing.image_url ? (
                    <Image src={editing.image_url} alt="category" fill className="object-cover"  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <Upload size={20} className="text-gold/40" />
                      <p className="font-label text-[10px] text-cream-faint uppercase tracking-wide">{uploading ? "Uploading…" : "Click to upload"}</p>
                    </div>
                  )}
                </div>
                <input id="cat-img-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>

              {/* Name */}
              <div>
                <label className="block font-label text-[10px] uppercase tracking-widest text-cream-faint mb-2">Name *</label>
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: slugify(e.target.value), id: editing._isNew ? slugify(e.target.value) : editing.id })}
                  placeholder="e.g. T-Shirts"
                  className="w-full bg-dark-elevated border border-gold/15 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block font-label text-[10px] uppercase tracking-widest text-cream-faint mb-2">Slug (URL)</label>
                <input
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  placeholder="t-shirts"
                  className="w-full bg-dark-elevated border border-gold/15 rounded-xl px-4 py-3 text-sm text-cream-muted font-label focus:outline-none focus:border-gold/40"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-label text-[10px] uppercase tracking-widest text-cream-faint mb-2">Description (optional)</label>
                <textarea
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value || null })}
                  rows={2}
                  placeholder="Short description for this category…"
                  className="w-full bg-dark-elevated border border-gold/15 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" size="lg" className="flex-1" onClick={() => setEditing(null)}>Cancel</Button>
              <Button variant="primary" size="lg" className="flex-1" loading={saving} onClick={handleSave}>
                <Check size={15} /> {editing._isNew ? "Create" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-dark-elevated animate-pulse" />)}
            </div>
          ) : categories.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-cream-muted mb-4">No categories yet.</p>
              <Button variant="primary" onClick={() => setEditing({ ...(EMPTY as any), id: "", _isNew: true, sort_order: 0 })}>
                <Plus size={15} /> Add your first category
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-4 p-4 bg-dark-elevated rounded-xl border border-gold/8 hover:border-gold/20 transition-colors">
                  <GripVertical size={14} className="text-cream-faint/30 cursor-grab shrink-0" />
                  <div className="w-12 h-12 rounded-lg bg-dark-card border border-gold/10 overflow-hidden shrink-0">
                    {cat.image_url ? (
                      <Image src={cat.image_url} alt={cat.name} width={48} height={48} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cream-faint/30 text-xs font-label">IMG</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-sm text-cream font-semibold">{cat.name}</p>
                    <p className="font-label text-[10px] text-cream-faint/60">/{cat.slug}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleMove(cat.id, "up")} className="p-1 text-cream-faint/40 hover:text-cream transition-colors"><ChevronUp size={14} /></button>
                    <button onClick={() => handleMove(cat.id, "down")} className="p-1 text-cream-faint/40 hover:text-cream transition-colors"><ChevronDown size={14} /></button>
                    <button onClick={() => setEditing(cat)} className="p-1.5 text-cream-faint hover:text-gold transition-colors"><Pencil size={13} /></button>
                    <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 text-red-400/40 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
