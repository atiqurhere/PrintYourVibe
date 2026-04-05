"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Star, Check, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase/client";
import type { Testimonial } from "@/lib/supabase/queries";

const EMPTY_T: Omit<Testimonial, "sort_order"> & { id: string; _isNew?: boolean } = {
  id: "", name: "", location: null, rating: 5,
  body: "", avatar: null, product_name: null, published: true, _isNew: true,
};

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<(Testimonial & { _isNew?: boolean }) | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order");
    setItems((data ?? []) as Testimonial[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleTogglePublish = async (t: Testimonial) => {
    const updated = { ...t, published: !t.published };
    await supabase.from("testimonials").update({ published: updated.published }).eq("id", t.id);
    setItems((prev) => prev.map((x) => x.id === t.id ? updated : x));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    setItems((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSave = async () => {
    if (!editing || !editing.name.trim() || !editing.body.trim()) return;
    setSaving(true);
    const isNew = editing._isNew;
    const payload: Testimonial = {
      id: editing.id || `t-${Date.now()}`,
      name: editing.name.trim(),
      location: editing.location || null,
      rating: editing.rating,
      body: editing.body.trim(),
      avatar: editing.avatar || null,
      product_name: editing.product_name || null,
      sort_order: editing.sort_order ?? items.length,
      published: editing.published ?? true,
    };
    if (isNew) {
      await supabase.from("testimonials").insert(payload);
      setItems((prev) => [...prev, payload]);
    } else {
      await supabase.from("testimonials").update(payload).eq("id", payload.id);
      setItems((prev) => prev.map((t) => t.id === payload.id ? payload : t));
    }
    setSaving(false);
    setEditing(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-cream">Testimonials</h1>
          <p className="text-cream-muted mt-1 text-sm">
            {loading ? "…" : `${items.length} testimonials, ${items.filter((t) => t.published).length} published`} — shown on the homepage Reviews section.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setEditing({ ...EMPTY_T, sort_order: items.length })}>
          <Plus size={15} /> Add Testimonial
        </Button>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-dark-card border border-gold/20 rounded-2xl p-6 w-full max-w-lg animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-cream font-semibold">{editing._isNew ? "Add Testimonial" : "Edit Testimonial"}</h2>
              <button onClick={() => setEditing(null)} className="text-cream-faint hover:text-cream"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-[10px] uppercase tracking-widest text-cream-faint mb-2">Customer Name *</label>
                  <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    placeholder="Jane Smith"
                    className="w-full bg-dark-elevated border border-gold/15 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40" />
                </div>
                <div>
                  <label className="block font-label text-[10px] uppercase tracking-widest text-cream-faint mb-2">Location</label>
                  <input value={editing.location ?? ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                    placeholder="London, UK"
                    className="w-full bg-dark-elevated border border-gold/15 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40" />
                </div>
              </div>

              <div>
                <label className="block font-label text-[10px] uppercase tracking-widest text-cream-faint mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button key={r} onClick={() => setEditing({ ...editing, rating: r })}
                      className={`p-1 transition-colors ${r <= editing.rating ? "text-gold" : "text-cream-faint/30"}`}>
                      <Star size={20} className={r <= editing.rating ? "fill-gold" : ""} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-label text-[10px] uppercase tracking-widest text-cream-faint mb-2">Review *</label>
                <textarea value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                  rows={4} placeholder="The quality is absolutely amazing…"
                  className="w-full bg-dark-elevated border border-gold/15 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-[10px] uppercase tracking-widest text-cream-faint mb-2">Product Name</label>
                  <input value={editing.product_name ?? ""} onChange={(e) => setEditing({ ...editing, product_name: e.target.value })}
                    placeholder="Classic Premium Tee"
                    className="w-full bg-dark-elevated border border-gold/15 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40" />
                </div>
                <div>
                  <label className="block font-label text-[10px] uppercase tracking-widest text-cream-faint mb-2">Avatar Initial</label>
                  <input value={editing.avatar ?? ""} onChange={(e) => setEditing({ ...editing, avatar: e.target.value.slice(0, 2).toUpperCase() })}
                    placeholder="JS" maxLength={2}
                    className="w-full bg-dark-elevated border border-gold/15 rounded-xl px-4 py-3 text-sm text-cream text-center font-bold focus:outline-none focus:border-gold/40 uppercase" />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <button type="button" onClick={() => setEditing({ ...editing, published: !editing.published })}
                  className={`w-10 h-5 rounded-full transition-colors ${editing.published ? "bg-gold" : "bg-dark-elevated border border-gold/20"}`}>
                  <span className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform mx-0.5 ${editing.published ? "translate-x-5" : "translate-x-0"}`} />
                </button>
                <span className="font-heading text-sm text-cream-muted">Published (visible on site)</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" size="lg" className="flex-1" onClick={() => setEditing(null)}>Cancel</Button>
              <Button variant="primary" size="lg" className="flex-1" loading={saving} onClick={handleSave}>
                <Check size={15} /> {editing._isNew ? "Add" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          Array(3).fill(0).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-dark-card border border-gold/8 animate-pulse" />)
        ) : items.length === 0 ? (
          <Card>
            <CardContent>
              <div className="py-16 text-center">
                <p className="text-cream-muted mb-4">No testimonials yet.</p>
                <Button variant="primary" onClick={() => setEditing({ ...EMPTY_T, sort_order: 0 })}><Plus size={15} /> Add first testimonial</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          items.map((t) => (
            <div key={t.id} className={`bg-dark-card border rounded-2xl p-5 transition-colors ${t.published ? "border-gold/12" : "border-gold/6 opacity-60"}`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center shrink-0">
                  <span className="font-label text-xs text-gold font-bold">{t.avatar || t.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-heading text-sm text-cream font-semibold">{t.name}</p>
                    {t.location && <span className="font-label text-[10px] text-cream-faint">{t.location}</span>}
                    {t.product_name && <span className="font-label text-[10px] text-gold/60">· {t.product_name}</span>}
                  </div>
                  <div className="flex mb-2">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} size={11} className={i < t.rating ? "text-gold fill-gold" : "text-cream-faint"} />
                    ))}
                  </div>
                  <p className="text-cream-muted text-sm leading-relaxed line-clamp-2 italic">"{t.body}"</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleTogglePublish(t)} className={`p-1.5 transition-colors ${t.published ? "text-green-400 hover:text-green-300" : "text-cream-faint/40 hover:text-cream"}`} title={t.published ? "Hide from site" : "Publish to site"}>
                    {t.published ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => setEditing(t)} className="p-1.5 text-cream-faint hover:text-gold transition-colors"><Pencil size={13} /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 text-red-400/40 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
