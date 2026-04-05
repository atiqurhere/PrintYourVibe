"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Plus, Trash2, GripVertical, Save, ChevronDown, ChevronUp,
  Layers, Shield, Pencil, Check, X
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { supabase } from "@/lib/supabase/client";
import type { ContentBlock } from "@/lib/supabase/queries";

const SECTIONS = [
  { key: "how_it_works", label: "How It Works", icon: <Layers size={16} />, hint: "3 steps shown on the landing page below the hero." },
  { key: "trust_bar",    label: "Trust Bar",     icon: <Shield size={16} />, hint: "Small badges in the bar below the hero (e.g. UK Printed, Free Returns)." },
] as const;

function BlockRow({
  block,
  onSave,
  onDelete,
  onMove,
}: {
  block: ContentBlock;
  onSave: (b: ContentBlock) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMove: (id: string, dir: "up" | "down") => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(block);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className={`bg-dark-elevated border rounded-xl p-4 transition-colors ${editing ? "border-gold/40" : "border-gold/10 hover:border-gold/20"}`}>
      {!editing ? (
        <div className="flex items-center gap-3">
          <GripVertical size={14} className="text-cream-faint/40 cursor-grab shrink-0" />
          <span className="text-xl w-8 shrink-0">{block.icon || "?"}</span>
          <div className="flex-1 min-w-0">
            <p className="font-heading text-sm text-cream font-semibold truncate">{block.title || "(no title)"}</p>
            {block.description && (
              <p className="font-label text-[10px] text-cream-faint truncate mt-0.5">{block.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => onMove(block.id, "up")} className="p-1 text-cream-faint/40 hover:text-cream transition-colors"><ChevronUp size={14} /></button>
            <button onClick={() => onMove(block.id, "down")} className="p-1 text-cream-faint/40 hover:text-cream transition-colors"><ChevronDown size={14} /></button>
            <button onClick={() => { setDraft(block); setEditing(true); }} className="p-1.5 text-cream-faint hover:text-gold transition-colors"><Pencil size={13} /></button>
            <button onClick={() => onDelete(block.id)} className="p-1.5 text-red-400/40 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block font-label text-[10px] uppercase tracking-widest text-cream-faint mb-1.5">Icon / Emoji</label>
              <input
                value={draft.icon ?? ""}
                onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
                placeholder="🇬🇧"
                className="w-full bg-dark-card border border-gold/15 rounded-lg px-3 py-2 text-center text-xl focus:outline-none focus:border-gold/40"
              />
            </div>
            <div className="col-span-3">
              <label className="block font-label text-[10px] uppercase tracking-widest text-cream-faint mb-1.5">Title</label>
              <input
                value={draft.title ?? ""}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="e.g. UK Printed"
                className="w-full bg-dark-card border border-gold/15 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/40"
              />
            </div>
          </div>
          <div>
            <label className="block font-label text-[10px] uppercase tracking-widest text-cream-faint mb-1.5">Description (optional)</label>
            <textarea
              value={draft.description ?? ""}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={2}
              placeholder="Short description shown on the landing page…"
              className="w-full bg-dark-card border border-gold/15 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/40 resize-none"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <button
                type="button"
                onClick={() => setDraft({ ...draft, active: !draft.active })}
                className={`w-9 h-5 rounded-full transition-colors ${draft.active ? "bg-gold" : "bg-dark-card border border-gold/20"}`}
              >
                <span className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform mx-0.5 ${draft.active ? "translate-x-4" : "translate-x-0"}`} />
              </button>
              <span className="font-label text-xs text-cream-muted">Visible on site</span>
            </label>
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="p-1.5 text-cream-faint hover:text-cream transition-colors"><X size={14} /></button>
              <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
                <Check size={13} /> Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminContentPage() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"how_it_works" | "trust_bar">("how_it_works");

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("content_blocks")
      .select("*")
      .order("section")
      .order("sort_order");
    setBlocks((data ?? []) as ContentBlock[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const sectionBlocks = blocks.filter((b) => b.section === activeSection);

  const handleSave = async (b: ContentBlock) => {
    await supabase
      .from("content_blocks")
      .upsert({ ...b, updated_at: new Date().toISOString() });
    setBlocks((prev) => prev.map((x) => x.id === b.id ? b : x));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this block?")) return;
    await supabase.from("content_blocks").delete().eq("id", id);
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleMove = (id: string, dir: "up" | "down") => {
    setBlocks((prev) => {
      const section = prev.filter((b) => b.section === activeSection);
      const others  = prev.filter((b) => b.section !== activeSection);
      const idx = section.findIndex((b) => b.id === id);
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= section.length) return prev;
      const reordered = [...section];
      [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];
      const updated = reordered.map((b, i) => ({ ...b, sort_order: i + 1 }));
      // Persist order
      updated.forEach((b) => supabase.from("content_blocks").update({ sort_order: b.sort_order }).eq("id", b.id));
      return [...others, ...updated];
    });
  };

  const handleAdd = async () => {
    const newId = `${activeSection.replace("_", "-")}-${Date.now()}`;
    const maxOrder = sectionBlocks.reduce((m, b) => Math.max(m, b.sort_order), 0);
    const newBlock: ContentBlock = {
      id: newId,
      section: activeSection,
      sort_order: maxOrder + 1,
      icon: activeSection === "trust_bar" ? "✨" : String(maxOrder + 1).padStart(2, "0"),
      title: "",
      description: null,
      active: true,
      updated_at: new Date().toISOString(),
    };
    await supabase.from("content_blocks").insert(newBlock);
    setBlocks((prev) => [...prev, newBlock]);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-cream">Landing Page Content</h1>
        <p className="text-cream-muted mt-1 text-sm">Edit the content displayed on your homepage — all changes go live immediately.</p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-dark-elevated border border-gold/10 rounded-xl p-1 mb-6 w-fit">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-heading transition-all ${activeSection === s.key ? "bg-gold/15 text-gold border border-gold/20" : "text-cream-muted hover:text-cream"}`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-cream font-semibold">
                {SECTIONS.find((s) => s.key === activeSection)?.label}
              </h2>
              <p className="font-label text-[10px] text-cream-faint mt-1 uppercase tracking-wide">
                {SECTIONS.find((s) => s.key === activeSection)?.hint}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleAdd}>
              <Plus size={14} /> Add Item
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-dark-elevated animate-pulse" />)}
            </div>
          ) : sectionBlocks.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-cream-muted text-sm mb-3">No items yet.</p>
              <Button variant="secondary" size="sm" onClick={handleAdd}><Plus size={14} /> Add first item</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {sectionBlocks.map((b) => (
                <BlockRow key={b.id} block={b} onSave={handleSave} onDelete={handleDelete} onMove={handleMove} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview note */}
      <div className="mt-4 bg-gold/5 border border-gold/15 rounded-xl p-4">
        <p className="font-label text-[10px] uppercase tracking-widest text-gold mb-1">Live Preview</p>
        <p className="text-cream-muted text-sm">Changes are applied immediately. Visit your <a href="/" target="_blank" className="text-gold hover:text-gold-light underline underline-offset-2">homepage</a> to see updates.</p>
      </div>
    </div>
  );
}
