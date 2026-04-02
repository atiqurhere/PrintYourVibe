"use client";
import { useEffect, useState } from "react";
import { Star, Check, X, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateShort } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import type { Review } from "@/lib/supabase/queries";

type Filter = "pending" | "published" | "all";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("pending");

  useEffect(() => {
    supabase
      .from("reviews")
      .select("*, products(name)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setReviews((data ?? []).map((r: any) => ({ ...r, product: r.products })) as Review[]);
        setLoading(false);
      });
  }, []);

  const approve = async (id: string) => {
    await supabase.from("reviews").update({ published: true }).eq("id", id);
    setReviews((r) => r.map((rv) => rv.id === id ? { ...rv, published: true } : rv));
  };

  const reject = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    setReviews((r) => r.filter((rv) => rv.id !== id));
  };

  const filtered = reviews.filter((r) =>
    filter === "all" ? true : filter === "published" ? r.published : !r.published
  );

  const pendingCount = reviews.filter((r) => !r.published).length;

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-cream mb-6">Review Moderation</h1>

      {pendingCount > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-amber-400/8 border border-amber-400/20">
          <p className="text-sm text-amber-400">{pendingCount} review{pendingCount > 1 ? "s" : ""} awaiting approval</p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-gold/10 mb-6">
        {(["pending","published","all"] as Filter[]).map((f) => {
          const count = f === "all" ? reviews.length : f === "published" ? reviews.filter((r) => r.published).length : reviews.filter((r) => !r.published).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-3 text-xs font-label uppercase tracking-widest capitalize transition-colors relative flex items-center gap-1.5 ${filter === f ? "text-gold" : "text-cream-faint hover:text-cream"}`}
            >
              {f}
              <span className={`text-[10px] ${filter === f ? "text-gold/70" : "text-cream-faint/50"}`}>({count})</span>
              {filter === f && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full" />}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {loading
          ? Array(3).fill(0).map((_, i) => <div key={i} className="h-36 rounded-2xl bg-dark-elevated animate-pulse" />)
          : filtered.length === 0
            ? <p className="text-cream-muted py-10 text-center">
                {reviews.length === 0 ? "No reviews yet." : "No reviews in this category."}
              </p>
            : filtered.map((r) => (
          <div key={r.id} className="bg-dark-card border border-gold/12 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-heading text-sm text-cream font-semibold">{r.customer_name}</span>
                  <Badge variant={r.published ? "gold" : "outline"}>{r.published ? "Published" : "Pending"}</Badge>
                </div>
                <p className="font-label text-[10px] text-cream-faint uppercase tracking-wide">
                  {(r as any).product?.name ?? "Unknown product"} · {formatDateShort(r.created_at.slice(0, 10))}
                </p>
              </div>
              <div className="flex">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} size={14} className={i < r.rating ? "text-gold fill-gold" : "text-cream-faint"} />
                ))}
              </div>
            </div>
            {r.title && <h3 className="font-heading text-cream font-semibold mb-2">{r.title}</h3>}
            <p className="text-sm text-cream-muted leading-relaxed mb-5 italic">&ldquo;{r.body}&rdquo;</p>
            <div className="flex gap-3">
              {!r.published && (
                <Button variant="primary" size="sm" onClick={() => approve(r.id)}>
                  <Check size={14} /> Approve
                </Button>
              )}
              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => reject(r.id)}>
                <X size={14} /> Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
