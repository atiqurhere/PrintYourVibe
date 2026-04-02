"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Plus, Pencil, Trash2, Star, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { db } from "@/lib/supabase/queries";
import type { Order } from "@/lib/supabase/queries";

interface Address {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

function addressFromOrder(order: Order): Address {
  return {
    id: `order-${order.id}`,
    label: "Last Order",
    fullName: order.shipping_name || "",
    line1: order.shipping_address?.line1 || "",
    city: order.shipping_address?.city || "",
    postcode: order.shipping_address?.postcode || "",
    country: order.shipping_address?.country || "United Kingdom",
    phone: "",
    isDefault: true,
  };
}

const BLANK = { label: "", fullName: "", line1: "", line2: "", city: "", postcode: "", country: "United Kingdom", phone: "" };

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editForm, setEditForm] = useState(BLANK);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }

      // Pull shipping addresses from the user's past orders as saved addresses
      const { data } = await db
        .from("orders")
        .select("id, shipping_name, shipping_address, shipping_email")
        .eq("user_id", session.user.id)
        .not("shipping_address", "is", null)
        .order("created_at", { ascending: false })
        .limit(5);

      if (data && data.length > 0) {
        // Deduplicate by postcode
        const seen = new Set<string>();
        const unique: Address[] = [];
        (data as Order[]).forEach((order, i) => {
          const key = order.shipping_address?.postcode;
          if (key && !seen.has(key)) {
            seen.add(key);
            unique.push({
              id: `order-${order.id}`,
              label: i === 0 ? "Recent" : `Order ${i + 1}`,
              fullName: order.shipping_name || "",
              line1: order.shipping_address?.line1 || "",
              city: order.shipping_address?.city || "",
              postcode: order.shipping_address?.postcode || "",
              country: order.shipping_address?.country || "United Kingdom",
              phone: "",
              isDefault: i === 0,
            });
          }
        });
        setAddresses(unique);
      }
      setLoading(false);
    }
    load();
  }, []);

  const up = (k: string, v: string) => setEditForm((p) => ({ ...p, [k]: v }));

  const setDefault = (id: string) =>
    setAddresses((a) => a.map((addr) => ({ ...addr, isDefault: addr.id === id })));

  const remove = (id: string) => setAddresses((a) => a.filter((addr) => addr.id !== id));

  const openAdd = () => { setEditForm(BLANK); setEditingId(null); setShowModal(true); };

  const handleSave = () => {
    if (!editForm.fullName || !editForm.line1 || !editForm.city || !editForm.postcode) return;
    if (editingId) {
      setAddresses((a) => a.map((addr) => addr.id === editingId ? { ...addr, ...editForm } : addr));
    } else {
      const newAddr: Address = {
        id: `local-${Date.now()}`,
        isDefault: addresses.length === 0,
        ...editForm,
      };
      setAddresses((a) => [...a, newAddr]);
    }
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-dark-elevated rounded-xl w-48" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-40 bg-dark-elevated rounded-2xl" />
          <div className="h-40 bg-dark-elevated rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-cream">Addresses</h1>
          <p className="text-cream-muted text-sm mt-1">Manage your saved delivery addresses.</p>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd}>
          <Plus size={15} /> Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-dark-card border border-gold/10 rounded-2xl text-center">
          <MapPin size={48} className="text-gold/20 mb-4" />
          <h2 className="font-heading text-xl text-cream mb-2">No saved addresses</h2>
          <p className="text-cream-muted text-sm mb-6">
            Addresses from your orders will appear here automatically.<br />
            You can also add one manually.
          </p>
          <Button variant="primary" size="sm" onClick={openAdd}>
            <Plus size={15} /> Add Address
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <Card key={addr.id}>
              <CardContent>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-label text-[11px] uppercase tracking-widest text-gold">{addr.label}</span>
                    {addr.isDefault && <Badge variant={"gold" as any}>Default</Badge>}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditForm({ label: addr.label, fullName: addr.fullName, line1: addr.line1, line2: addr.line2 || "", city: addr.city, postcode: addr.postcode, country: addr.country, phone: addr.phone }); setEditingId(addr.id); setShowModal(true); }}
                      className="p-1.5 text-cream-muted hover:text-cream transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => remove(addr.id)} className="p-1.5 text-red-400/60 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="font-heading text-sm text-cream font-semibold">{addr.fullName}</p>
                <p className="text-sm text-cream-muted mt-1 leading-relaxed">
                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                  {addr.city}, {addr.postcode}<br />
                  {addr.country}
                </p>
                {addr.phone && <p className="text-sm text-cream-muted mt-1">{addr.phone}</p>}
                {!addr.isDefault && (
                  <button
                    onClick={() => setDefault(addr.id)}
                    className="mt-4 flex items-center gap-1.5 text-xs text-gold hover:text-gold-light transition-colors"
                  >
                    <Star size={12} /> Set as default
                  </button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? "Edit Address" : "Add New Address"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input id="addr-label" label="Label" placeholder="Home, Work…" value={editForm.label} onChange={(e) => up("label", e.target.value)} />
            <Input id="addr-name" label="Full Name" placeholder="Your full name" value={editForm.fullName} onChange={(e) => up("fullName", e.target.value)} />
          </div>
          <Input id="addr-line1" label="Address Line 1" placeholder="12 Example Street" value={editForm.line1} onChange={(e) => up("line1", e.target.value)} />
          <Input id="addr-line2" label="Address Line 2 (optional)" placeholder="Flat 3" value={editForm.line2} onChange={(e) => up("line2", e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input id="addr-city" label="City" placeholder="London" value={editForm.city} onChange={(e) => up("city", e.target.value)} />
            <Input id="addr-postcode" label="Postcode" placeholder="SW1A 1AA" value={editForm.postcode} onChange={(e) => up("postcode", e.target.value)} />
          </div>
          <Input id="addr-phone" label="Phone (optional)" placeholder="+44 7700 000000" value={editForm.phone} onChange={(e) => up("phone", e.target.value)} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" size="md" className="flex-1" onClick={handleSave}>Save Address</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
