import Image from "next/image";
import Link from "next/link";
import { Download, Trash2, RefreshCw } from "lucide-react";
import { formatDateShort } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

const MOCKUPS = [
  { id: "m1", thumb: "/products/tshirt-black.png",    product: "Classic Premium Tee",     date: "2026-03-31", exported: true,  format: "PNG" },
  { id: "m2", thumb: "/products/hoodie-black.png",    product: "Heavyweight Hoodie",      date: "2026-03-28", exported: true,  format: "JPG" },
  { id: "m3", thumb: "/products/totebag-natural.png", product: "Canvas Tote Bag",         date: "2026-03-20", exported: false, format: null },
  { id: "m4", thumb: "/products/tshirt-white.png",    product: "Relaxed Fit Tee",         date: "2026-03-15", exported: false, format: null },
  { id: "m5", thumb: "/products/hoodie-navy.png",     product: "Classic Crewneck",        date: "2026-03-10", exported: true,  format: "PDF" },
  { id: "m6", thumb: "/products/tshirt-burgundy.png", product: "Classic Premium Tee",     date: "2026-03-05", exported: false, format: null },
];

export default function MockupsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-3xl text-cream">Saved Mockups</h1>
        <Link href="/mockup" className="text-sm text-gold hover:text-gold-light transition-colors flex items-center gap-1">
          + New Mockup
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {MOCKUPS.map((m) => (
          <div key={m.id} className="group bg-dark-card border border-gold/10 rounded-2xl overflow-hidden hover:border-gold/30 transition-all">
            <div className="aspect-square relative bg-dark-elevated overflow-hidden">
              <Image src={m.thumb} alt={m.product} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              {m.exported && (
                <div className="absolute top-2 right-2">
                  <Badge variant="gold">{m.format}</Badge>
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-dark/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <Link href="/mockup" title="Re-open in editor">
                  <button className="p-2.5 bg-gold text-dark rounded-lg hover:bg-gold-light transition-colors"><RefreshCw size={14} /></button>
                </Link>
                <button title="Download" className="p-2.5 bg-dark-elevated border border-gold/25 text-gold rounded-lg hover:bg-dark-card transition-colors"><Download size={14} /></button>
                <button title="Delete" className="p-2.5 bg-red-400/15 border border-red-400/30 text-red-400 rounded-lg hover:bg-red-400/25 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="p-3">
              <p className="font-heading text-xs text-cream font-semibold truncate">{m.product}</p>
              <p className="font-label text-[10px] text-cream-faint mt-0.5">{formatDateShort(m.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
