import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDateShort } from "@/lib/utils";

const DESIGNS = [
  { id: "d1", name: "Summer Vibes",   thumb: "/products/tshirt-black.png",    product: "Classic Premium Tee",  date: "2026-03-28" },
  { id: "d2", name: "Logo Drop",      thumb: "/products/hoodie-black.png",    product: "Heavyweight Hoodie",   date: "2026-03-20" },
  { id: "d3", name: "Nature Print",   thumb: "/products/totebag-natural.png", product: "Canvas Tote Bag",      date: "2026-03-12" },
];

export default function DesignsPage() {
  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-cream mb-6">Saved Designs</h1>
      {DESIGNS.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-cream-muted mb-6">No saved designs yet.</p>
          <Link href="/mockup"><Button variant="primary">Start Designing</Button></Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {DESIGNS.map((d) => (
            <div key={d.id} className="bg-dark-card border border-gold/10 rounded-2xl overflow-hidden hover:border-gold/30 transition-all group">
              <div className="aspect-video relative bg-dark-elevated overflow-hidden">
                <Image src={d.thumb} alt={d.name} fill className="object-contain p-6 group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-5">
                <h3 className="font-heading text-cream font-semibold mb-0.5">{d.name}</h3>
                <p className="font-label text-[10px] text-cream-faint uppercase tracking-wide">{d.product} · {formatDateShort(d.date)}</p>
                <div className="flex gap-2 mt-4">
                  <Link href="/mockup" className="flex-1">
                    <Button variant="primary" size="sm" className="w-full"><RefreshCw size={13} /> Re-order</Button>
                  </Link>
                  <button className="p-2 border border-gold/15 rounded-lg text-cream-muted hover:text-cream hover:border-gold/35 transition-all"><Pencil size={14} /></button>
                  <button className="p-2 border border-red-400/15 rounded-lg text-red-400/50 hover:text-red-400 hover:border-red-400/30 transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
