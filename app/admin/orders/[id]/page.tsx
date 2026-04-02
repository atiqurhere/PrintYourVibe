"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft, Package, User, MapPin, History,
  Truck, FileText, RefreshCcw, XCircle, CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { formatPrice, formatDate } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import type { Order, OrderStatus, OrderHistoryEntry } from "@/lib/supabase/queries";

const STATUS_FLOW: OrderStatus[] = ["pending","confirmed","printing","dispatched","delivered","cancelled","refunded"];
const CARRIERS = ["Royal Mail","DPD","Evri","DHL","UPS","FedEx"];

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [nextStatus, setNextStatus] = useState<OrderStatus>("pending");
  const [history, setHistory] = useState<OrderHistoryEntry[]>([]);
  const [trackingCarrier, setTrackingCarrier] = useState("Royal Mail");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingTracking, setSavingTracking] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    supabase.from("orders").select("*").eq("id", id).single().then(({ data }) => {
      if (!data) { setLoading(false); return; }
      const o = data as Order;
      setOrder(o);
      setStatus(o.status);
      setNextStatus(o.status);
      setHistory(o.history ?? []);
      if (o.tracking) {
        setTrackingCarrier(o.tracking.carrier);
        setTrackingNumber(o.tracking.number);
      }
      setLoading(false);
    });
  }, [id]);

  const pushHistory = async (entry: OrderHistoryEntry, extra?: Record<string, unknown>) => {
    const newHistory = [...history, entry];
    await supabase.from("orders").update({ ...extra, history: newHistory, updated_at: new Date().toISOString() }).eq("id", id);
    setHistory(newHistory);
  };

  const handleStatusUpdate = async () => {
    if (nextStatus === status) return;
    setSaving(true);
    const at = new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
    await pushHistory({ status: nextStatus, note: `Status updated to ${nextStatus}.`, by: "Admin", at }, { status: nextStatus });
    setStatus(nextStatus);
    setSaving(false);
  };

  const handleSaveTracking = async () => {
    if (!trackingNumber.trim()) return;
    setSavingTracking(true);
    const tracking = { carrier: trackingCarrier, number: trackingNumber };
    const at = new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
    await pushHistory({ status, note: `Tracking: ${trackingCarrier} ${trackingNumber}`, by: "Admin", at }, { tracking });
    setSavingTracking(false);
  };

  const handleSaveNote = async () => {
    if (!note.trim()) return;
    setSavingNote(true);
    const at = new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
    await pushHistory({ status, note: `📝 ${note}`, by: "Admin", at });
    setNote("");
    setSavingNote(false);
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this order? This cannot be undone.")) return;
    const at = new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
    await pushHistory({ status: "cancelled", note: "Order cancelled by admin.", by: "Admin", at }, { status: "cancelled" });
    setStatus("cancelled");
    setNextStatus("cancelled");
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-dark-elevated" />
        <div className="grid xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-5">
            {Array(3).fill(0).map((_, i) => <div key={i} className="h-40 rounded-2xl bg-dark-elevated" />)}
          </div>
          <div className="space-y-5">
            {Array(2).fill(0).map((_, i) => <div key={i} className="h-32 rounded-2xl bg-dark-elevated" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!order) notFound();

  const items: any[] = Array.isArray(order.items) ? order.items : [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/orders" className="text-cream-muted hover:text-cream transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-heading text-2xl text-cream font-semibold">{order.number}</h1>
        <Badge variant={status}>{status}</Badge>
        <span className="ml-auto font-label text-xs text-cream-faint">{formatDate(order.created_at.slice(0, 10))}</span>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-5">
          {/* Items */}
          <Card>
            <CardContent>
              <h2 className="font-heading text-cream font-semibold mb-4 flex items-center gap-2">
                <Package size={15} className="text-gold" /> Ordered Items
              </h2>
              {items.length === 0
                ? <p className="text-cream-faint text-sm">No item data stored.</p>
                : items.map((item: any, i: number) => (
                <div key={i} className="flex gap-4 py-4 border-b border-gold/8 last:border-0">
                  {item.thumbnailUrl && (
                    <img src={item.thumbnailUrl} alt={item.productName} className="w-14 h-14 object-contain p-1 bg-dark-elevated rounded-xl shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-heading text-sm text-cream font-semibold">{item.productName}</p>
                    <p className="font-label text-[10px] text-cream-faint uppercase tracking-wide mt-0.5">
                      {item.colour} · {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="font-heading font-semibold text-cream">{formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-cream-muted"><span>Subtotal</span><span className="text-cream">{formatPrice(order.subtotal_pence / 100)}</span></div>
                <div className="flex justify-between text-cream-muted">
                  <span>Shipping</span>
                  <span className="text-cream">{order.shipping_pence === 0 ? "Free" : formatPrice(order.shipping_pence / 100)}</span>
                </div>
                {order.discount_pence > 0 && (
                  <div className="flex justify-between text-green-400"><span>Discount {order.coupon_code && `(${order.coupon_code})`}</span><span>−{formatPrice(order.discount_pence / 100)}</span></div>
                )}
                <div className="flex justify-between font-heading font-bold text-base pt-2 border-t border-gold/10">
                  <span className="text-cream">Total</span>
                  <span className="text-cream">{formatPrice(order.total_pence / 100)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status update */}
          <Card>
            <CardContent>
              <h2 className="font-heading text-cream font-semibold mb-4 flex items-center gap-2">
                <RefreshCcw size={15} className="text-gold" /> Update Status
              </h2>
              <div className="flex gap-3 mb-5">
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
                  className="flex-1 bg-dark-elevated border border-gold/15 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors"
                >
                  {STATUS_FLOW.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <Button variant="primary" size="md" onClick={handleStatusUpdate} loading={saving} disabled={nextStatus === status}>
                  <CheckCircle2 size={15} /> Update
                </Button>
              </div>
              {/* Progress bar */}
              <div className="flex items-center gap-1">
                {["pending","confirmed","printing","dispatched","delivered"].map((s, i) => {
                  const steps = ["pending","confirmed","printing","dispatched","delivered"];
                  const idx = steps.indexOf(status);
                  return (
                    <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= idx ? "bg-gold" : "bg-dark-elevated"}`} />
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] font-label text-cream-faint mt-1.5 uppercase tracking-wider">
                <span>Pending</span><span>Confirmed</span><span>Printing</span><span>Dispatched</span><span>Delivered</span>
              </div>
            </CardContent>
          </Card>

          {/* Tracking */}
          <Card>
            <CardContent>
              <h2 className="font-heading text-cream font-semibold mb-4 flex items-center gap-2">
                <Truck size={15} className="text-gold" /> Tracking
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-label text-[11px] uppercase tracking-widest text-cream-faint mb-2">Carrier</label>
                  <select value={trackingCarrier} onChange={(e) => setTrackingCarrier(e.target.value)}
                    className="w-full bg-dark-elevated border border-gold/15 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40">
                    {CARRIERS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-label text-[11px] uppercase tracking-widest text-cream-faint mb-2">Tracking Number</label>
                  <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="e.g. RM123456789GB"
                    className="w-full bg-dark-elevated border border-gold/15 rounded-xl px-4 py-3 text-sm text-cream placeholder:text-cream-faint/50 focus:outline-none focus:border-gold/40 transition-colors" />
                </div>
              </div>
              <Button variant="secondary" size="md" onClick={handleSaveTracking} loading={savingTracking}>Save Tracking</Button>
            </CardContent>
          </Card>

          {/* Note */}
          <Card>
            <CardContent>
              <h2 className="font-heading text-cream font-semibold mb-4 flex items-center gap-2">
                <FileText size={15} className="text-gold" /> Internal Note
              </h2>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notes visible to admins only…" rows={3}
                className="w-full bg-dark-elevated border border-gold/15 rounded-xl px-4 py-3 text-sm text-cream placeholder:text-cream-faint/50 focus:outline-none focus:border-gold/40 resize-none mb-3" />
              <Button variant="secondary" size="sm" onClick={handleSaveNote} loading={savingNote} disabled={!note.trim()}>Add Note</Button>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardContent>
              <h2 className="font-heading text-cream font-semibold mb-5 flex items-center gap-2">
                <History size={15} className="text-gold" /> Order Timeline
              </h2>
              {history.length === 0
                ? <p className="text-cream-faint text-sm">No history yet.</p>
                : [...history].reverse().map((h, i) => (
                <div key={i} className="flex gap-4 pb-5">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-6 h-6 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center z-10">
                      <div className="w-2 h-2 rounded-full bg-gold" />
                    </div>
                    {i < history.length - 1 && <div className="w-px flex-1 bg-gold/10 mt-1" />}
                  </div>
                  <div className="pb-1">
                    <p className="font-heading text-sm text-cream font-semibold capitalize">{h.status}</p>
                    <p className="text-xs text-cream-muted mt-0.5">{h.note}</p>
                    <p className="font-label text-[10px] text-cream-faint mt-1">{h.by} · {h.at}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card>
            <CardContent>
              <h3 className="font-heading text-sm text-cream font-semibold mb-4 flex items-center gap-2"><User size={14} className="text-gold" /> Customer</h3>
              <p className="font-heading text-sm text-cream font-semibold">{order.shipping_name ?? "Guest"}</p>
              <p className="text-sm text-cream-muted mt-0.5">{order.shipping_email ?? "—"}</p>
            </CardContent>
          </Card>

          {order.shipping_address && (
            <Card>
              <CardContent>
                <h3 className="font-heading text-sm text-cream font-semibold mb-4 flex items-center gap-2"><MapPin size={14} className="text-gold" /> Shipping Address</h3>
                <div className="text-sm text-cream-muted space-y-0.5">
                  <p className="text-cream font-semibold">{order.shipping_name}</p>
                  <p>{order.shipping_address.line1}</p>
                  <p>{order.shipping_address.city}, {order.shipping_address.postcode}</p>
                  <p>{order.shipping_address.country}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent>
              <h3 className="font-heading text-sm text-cream font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="secondary" size="sm" className="w-full text-amber-400 border-amber-400/20 hover:border-amber-400/40"
                  onClick={() => alert("Stripe refund — configure STRIPE_SECRET_KEY in .env")}>
                  Issue Refund
                </Button>
                <Button variant="destructive" size="sm" className="w-full flex items-center gap-2 justify-center"
                  onClick={handleCancel} disabled={status === "cancelled"}>
                  <XCircle size={14} /> Cancel Order
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="font-heading text-sm text-cream font-semibold mb-3">Summary</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-cream-muted">Order #</span><span className="text-cream font-label font-bold">{order.number}</span></div>
                <div className="flex justify-between"><span className="text-cream-muted">Date</span><span className="text-cream">{formatDate(order.created_at.slice(0, 10))}</span></div>
                <div className="flex justify-between pt-2 border-t border-gold/10 font-heading font-semibold text-sm">
                  <span className="text-cream">Total</span>
                  <span className="text-gold">{formatPrice(order.total_pence / 100)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
