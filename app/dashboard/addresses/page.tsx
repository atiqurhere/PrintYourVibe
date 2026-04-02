"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Plus, Pencil, Trash2, Star } from "lucide-react";

const INITIAL_ADDRESSES = [
  { id: "a1", label: "Home",   fullName: "Jane Doe", line1: "12 Example Street",  city: "London",     postcode: "SW1A 1AA", country: "United Kingdom", phone: "+44 7700 000001", isDefault: true },
  { id: "a2", label: "Work",   fullName: "Jane Doe", line1: "55 Office Road",       city: "Manchester", postcode: "M1 1AB",   country: "United Kingdom", phone: "+44 7700 000002", isDefault: false },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
  const [showModal, setShowModal] = useState(false);

  const setDefault = (id: string) =>
    setAddresses((a) => a.map((addr) => ({ ...addr, isDefault: addr.id === id })));

  const remove = (id: string) => setAddresses((a) => a.filter((addr) => addr.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-3xl text-cream">Addresses</h1>
        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
          <Plus size={15} /> Add Address
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <Card key={addr.id}>
            <CardContent>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-label text-[11px] uppercase tracking-widest text-gold">{addr.label}</span>
                  {addr.isDefault && <Badge variant="gold">Default</Badge>}
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 text-cream-muted hover:text-cream transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => remove(addr.id)} className="p-1.5 text-red-400/60 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="font-heading text-sm text-cream font-semibold">{addr.fullName}</p>
              <p className="text-sm text-cream-muted mt-1 leading-relaxed">
                {addr.line1}<br />{addr.city}, {addr.postcode}<br />{addr.country}
              </p>
              <p className="text-sm text-cream-muted mt-1">{addr.phone}</p>
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

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New Address">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input id="addr-label" label="Label" placeholder="Home, Work…" />
            <Input id="addr-name" label="Full Name" placeholder="Jane Doe" />
          </div>
          <Input id="addr-line1" label="Address Line 1" placeholder="12 Example Street" />
          <Input id="addr-line2" label="Address Line 2 (optional)" placeholder="Flat 3" />
          <div className="grid grid-cols-2 gap-4">
            <Input id="addr-city" label="City" placeholder="London" />
            <Input id="addr-postcode" label="Postcode" placeholder="SW1A 1AA" />
          </div>
          <Input id="addr-phone" label="Phone" placeholder="+44 7700 000000" />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" size="md" className="flex-1" onClick={() => setShowModal(false)}>Save Address</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
