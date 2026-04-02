"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Upload, Plus, Trash2, GripVertical } from "lucide-react";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function AddProductPage() {
  const [selectedSizes, setSelectedSizes] = useState(["S","M","L","XL"]);
  const [colours, setColours] = useState([{ name: "", hex: "#1a1a1a", active: true }]);

  const toggleSize = (s: string) =>
    setSelectedSizes((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);

  const addColour = () => setColours((c) => [...c, { name: "", hex: "#ffffff", active: true }]);
  const removeColour = (i: number) => setColours((c) => c.filter((_, idx) => idx !== i));

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-cream mb-8">Add New Product</h1>
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="xl:col-span-2 space-y-6">
          {/* Basic info */}
          <Card>
            <CardContent>
              <h2 className="font-heading text-cream font-semibold mb-5">Basic Information</h2>
              <div className="space-y-5">
                <Input id="p-name" label="Product Name" placeholder="e.g. Classic Premium Tee" required />
                <Input id="p-slug" label="Slug (auto-generated)" placeholder="classic-premium-tee" />
                <div className="grid grid-cols-2 gap-4">
                  <Input id="p-price" label="Base Price (£)" type="number" placeholder="19.99" required />
                  <Input id="p-compare" label="Compare Price (£)" type="number" placeholder="29.99" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label text-[11px] uppercase tracking-widest text-cream-faint mb-2">Category</label>
                    <select className="w-full bg-dark-elevated border border-gold/15 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors">
                      {["T-Shirts","Hoodies","Sweatshirts","Tote Bags"].map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <Input id="p-weight" label="Weight (grams)" type="number" placeholder="200" />
                </div>
                <Textarea id="p-desc" label="Description" placeholder="Describe the product…" rows={4} />
              </div>
            </CardContent>
          </Card>

          {/* Sizes */}
          <Card>
            <CardContent>
              <h2 className="font-heading text-cream font-semibold mb-5">Available Sizes</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSize(s)}
                    className={`px-4 py-2 rounded-lg border text-sm font-label transition-all ${selectedSizes.includes(s) ? "border-gold bg-gold/15 text-gold" : "border-gold/15 text-cream-muted hover:border-gold/40"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Colour variants */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading text-cream font-semibold">Colour Variants</h2>
                <Button variant="secondary" size="sm" onClick={addColour}><Plus size={14} /> Add Colour</Button>
              </div>
              <div className="space-y-4">
                {colours.map((c, i) => (
                  <div key={i} className="flex gap-4 items-start p-4 bg-dark-elevated rounded-xl border border-gold/10">
                    <GripVertical size={16} className="text-cream-faint mt-3 cursor-grab shrink-0" />
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <Input label="Colour Name" placeholder="e.g. Jet Black" value={c.name} onChange={(e) => setColours((cols) => cols.map((col, idx) => idx === i ? { ...col, name: e.target.value } : col))} />
                      <div>
                        <label className="block font-label text-[11px] uppercase tracking-widest text-cream-faint mb-2">Hex Colour</label>
                        <div className="flex items-center gap-3">
                          <input type="color" value={c.hex} onChange={(e) => setColours((cols) => cols.map((col, idx) => idx === i ? { ...col, hex: e.target.value } : col))}
                            className="w-10 h-10 rounded-lg cursor-pointer border border-gold/15 bg-transparent" />
                          <span className="font-label text-xs text-cream-muted">{c.hex}</span>
                        </div>
                      </div>
                      {/* Upload zones */}
                      <div className="col-span-2 grid grid-cols-2 gap-3">
                        {["Front Image (required)", "Back Image (optional)"].map((label) => (
                          <div key={label} className="border-2 border-dashed border-gold/20 rounded-xl p-4 text-center cursor-pointer hover:border-gold/40 transition-colors">
                            <Upload size={18} className="text-gold/40 mx-auto mb-1" />
                            <p className="text-xs text-cream-faint">{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => removeColour(i)} className="mt-3 p-1.5 text-red-400/50 hover:text-red-400 transition-colors shrink-0"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gallery */}
          <Card>
            <CardContent>
              <h2 className="font-heading text-cream font-semibold mb-5">Gallery Images</h2>
              <div className="border-2 border-dashed border-gold/20 rounded-xl p-8 text-center cursor-pointer hover:border-gold/40 transition-colors">
                <Upload size={24} className="text-gold/40 mx-auto mb-2" />
                <p className="text-sm text-cream-muted mb-1">Drag & drop or click to upload</p>
                <p className="font-label text-[10px] text-cream-faint uppercase tracking-widest">PNG · JPG · Max 5MB each</p>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardContent>
              <h2 className="font-heading text-cream font-semibold mb-5">SEO</h2>
              <div className="space-y-4">
                <Input id="p-meta-title" label="Meta Title" placeholder="Custom t-shirts UK | PrintYourVibe" />
                <Textarea id="p-meta-desc" label="Meta Description" placeholder="Short description for search engines…" rows={2} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="space-y-5">
          <Card>
            <CardContent>
              <h2 className="font-heading text-cream font-semibold mb-5">Publish</h2>
              <div className="space-y-3">
                <Button variant="primary" size="lg" className="w-full">Publish Product</Button>
                <Button variant="secondary" size="lg" className="w-full">Save as Draft</Button>
                <Button variant="ghost" size="lg" className="w-full text-cream-muted">Discard</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h2 className="font-heading text-cream font-semibold mb-4">Print Area</h2>
              <p className="text-xs text-cream-muted mb-4">Upload a product image first, then drag a rectangle to define the printable area.</p>
              <div className="aspect-square bg-dark-elevated rounded-xl border-2 border-dashed border-gold/20 flex items-center justify-center">
                <p className="text-xs text-cream-faint text-center px-4">Upload a front image to enable the print area tool</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
