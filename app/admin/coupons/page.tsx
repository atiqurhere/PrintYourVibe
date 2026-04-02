"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatPrice } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import type { Coupon } from "@/lib/supabase/queries";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Form
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"percent" | "fixed">("percent");
  const [newValue, setNewValue] = useState("");
  const [newMin, setNewMin] = useState("");
  const [newMax, setNewMax] = useState("");
  const [newExpires, setNewExpires] = useState("");

  useEffect(() => {
    supabase.from("coupons").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setCoupons((data ?? []) as Coupon[]); setLoading(false); });
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("coupons").update({ active: !current }).eq("id", id);
    setCoupons((c) => c.map((cp) => cp.id === id ? { ...cp, active: !current } : cp));
  };

  const remove = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    await supabase.from("coupons").delete().eq("id", id);
    setCoupons((c) => c.filter((cp) => cp.id !== id));
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const createCoupon = async () => {
    if (!newCode || !newValue) return;
    setCreating(true);
    const payload = {
      code: newCode.toUpperCase().replace(/\s/g, ""),
      type: newType,
      value: parseFloat(newValue),
      min_order: parseFloat(newMin) || 0,
      max_uses: newMax ? parseInt(newMax) : null,
      expires_at: newExpires ? new Date(newExpires).toISOString() : null,
      used_count: 0,
      active: true,
    };
    const { data, error } = await supabase.from("coupons").insert(payload).select().single();
    setCreating(false);
    if (error) { alert(`Error: ${error.message}`); return; }
    setCoupons((c) => [data as Coupon, ...c]);
    setShowModal(false);
    setNewCode(""); setNewType("percent"); setNewValue("");
    setNewMin(""); setNewMax(""); setNewExpires("");
  };

  const isExpired = (expires: string | null) => expires ? new Date(expires) < new Date() : false;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-cream">Coupons</h1>
          <p className="text-sm text-cream-muted mt-1">{loading ? "…" : `${coupons.filter((c) => c.active).length} active codes`}</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
          <Plus size={15} /> Create Coupon
        </Button>
      </div>

      <div className="bg-dark-card border border-gold/12 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/10">
              {["Code","Type","Value","Min Order","Usage","Expires","Status",""].map((h) => (
                <th key={h} className="text-left px-5 py-4 font-label text-[10px] uppercase tracking-widest text-cream-faint">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-gold/8">
                    {Array(8).fill(0).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 rounded bg-dark-elevated animate-pulse" /></td>)}
                  </tr>
                ))
              : coupons.map((c) => (
              <tr key={c.id} className={`border-b border-gold/8 last:border-0 hover:bg-dark-elevated/50 transition-colors ${(!c.active || isExpired(c.expires_at)) ? "opacity-50" : ""}`}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-label font-bold text-gold tracking-widest">{c.code}</span>
                    <button onClick={() => copyCode(c.code)} className="text-cream-faint hover:text-cream transition-colors" title="Copy">
                      <Copy size={12} />
                    </button>
                    {copied === c.code && <span className="text-[10px] text-green-400">Copied!</span>}
                  </div>
                </td>
                <td className="px-5 py-4 text-cream-muted capitalize">{c.type}</td>
                <td className="px-5 py-4 font-heading font-semibold text-cream">
                  {c.type === "percent" ? `${c.value}%` : formatPrice(c.value)}
                </td>
                <td className="px-5 py-4 text-cream-muted">{c.min_order > 0 ? formatPrice(c.min_order) : "—"}</td>
                <td className="px-5 py-4 text-cream-muted">
                  {c.used_count}
                  {c.max_uses && <span className="text-cream-faint">/{c.max_uses}</span>}
                  {c.max_uses && c.used_count >= c.max_uses && <span className="text-red-400 ml-1 text-[10px]">(full)</span>}
                </td>
                <td className="px-5 py-4 font-label text-[11px]">
                  {c.expires_at
                    ? <span className={isExpired(c.expires_at) ? "text-red-400" : "text-cream-faint"}>{c.expires_at.slice(0,10)}</span>
                    : <span className="text-cream-faint">Never</span>
                  }
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => toggleActive(c.id, c.active)} className={`transition-colors ${c.active ? "text-green-400" : "text-cream-faint"}`}>
                    {c.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => remove(c.id, c.code)} className="p-1.5 text-red-400/40 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && coupons.length === 0 && (
          <div className="py-12 text-center text-cream-muted">No coupons yet. Create your first one!</div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Coupon">
        <div className="space-y-4">
          <Input id="c-code" label="Code" placeholder="e.g. SUMMER20" value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label text-[11px] uppercase tracking-widest text-cream-faint mb-2">Discount Type</label>
              <select value={newType} onChange={(e) => setNewType(e.target.value as "percent" | "fixed")}
                className="w-full bg-dark-elevated border border-gold/15 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40">
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed Amount (£)</option>
              </select>
            </div>
            <Input id="c-value" label={newType === "percent" ? "Discount (%)" : "Amount (£)"} type="number" placeholder={newType === "percent" ? "e.g. 10" : "e.g. 5.00"} value={newValue} onChange={(e) => setNewValue(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input id="c-min" label="Min Order (£)" type="number" placeholder="0 = no minimum" value={newMin} onChange={(e) => setNewMin(e.target.value)} />
            <Input id="c-max" label="Max Uses" type="number" placeholder="Blank = unlimited" value={newMax} onChange={(e) => setNewMax(e.target.value)} />
          </div>
          <Input id="c-expires" label="Expiry Date" type="date" value={newExpires} onChange={(e) => setNewExpires(e.target.value)} />
          {newCode && newValue && (
            <div className="bg-dark-elevated rounded-xl px-4 py-3 text-xs text-cream-muted">
              Preview: <span className="text-gold font-label font-bold tracking-widest">{newCode}</span>
              {" "}— {newType === "percent" ? `${newValue}% off` : `${formatPrice(parseFloat(newValue || "0"))} off`}
              {newMin ? ` orders over ${formatPrice(parseFloat(newMin))}` : ""}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" size="md" className="flex-1" onClick={createCoupon} loading={creating} disabled={!newCode || !newValue}>
              Create Coupon
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
