/**
 * lib/supabase/queries.ts
 * Typed Supabase query helpers used by all pages.
 * Admin operations use the service-role client (server-side only).
 * Public operations use the anon client (client or server).
 */
import { createClient } from "@supabase/supabase-js";

// ── Clients ───────────────────────────────────────────────────────────────
const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const svc  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Browser / server component anon client */
export const db = createClient(url, anon);

/** Service-role client — ONLY use in server components / API routes */
export const dbAdmin = typeof window === "undefined" && svc
  ? createClient(url, svc, { auth: { persistSession: false } })
  : db;

// ── Types ─────────────────────────────────────────────────────────────────

export interface Category {
  id: string; name: string; slug: string;
  description: string | null; image_url: string | null; sort_order: number;
}

export interface ProductColour {
  id: string; product_id: string; name: string; hex: string;
  mockup_front_url: string | null; mockup_back_url: string | null; sort_order: number;
}

export interface ProductSize {
  id: string; product_id: string; label: string;
  price_modifier: number; sort_order: number;
}

export interface Product {
  id: string; category_id: string | null; name: string; slug: string;
  description: string | null; base_price: number; compare_price: number | null;
  rating: number; review_count: number; is_featured: boolean;
  print_area: { front: { x: number; y: number; w: number; h: number }; back?: { x: number; y: number; w: number; h: number } } | null;
  active: boolean; created_at: string;
  // Joined
  category_name?: string;
  colours?: ProductColour[];
  available_sizes?: ProductSize[];
  gallery?: string[];
}

export interface Order {
  id: string; number: string; user_id: string | null; status: OrderStatus;
  subtotal_pence: number; shipping_pence: number; discount_pence: number; total_pence: number;
  coupon_code: string | null; stripe_session_id: string | null; stripe_payment_intent: string | null;
  items: OrderItem[]; tracking: { carrier: string; number: string } | null;
  history: OrderHistoryEntry[]; shipping_name: string | null; shipping_email: string | null;
  shipping_address: { line1: string; city: string; postcode: string; country: string } | null;
  created_at: string; updated_at: string;
}

export interface OrderItem {
  productId: string; productName: string; productSlug: string;
  colour: string; colourHex: string; size: string;
  quantity: number; unitPrice: number; thumbnailUrl: string;
  designUrl?: string;
}

export interface OrderHistoryEntry { status: OrderStatus; note: string; by: string; at: string; }

export type OrderStatus = "pending" | "confirmed" | "printing" | "dispatched" | "delivered" | "cancelled" | "refunded";

export interface Review {
  id: string; product_id: string; user_id: string | null;
  customer_name: string; customer_location: string | null;
  rating: number; title: string | null; body: string;
  published: boolean; created_at: string;
  product?: { name: string };
}

export interface Coupon {
  id: string; code: string; type: "percent" | "fixed"; value: number;
  min_order: number; max_uses: number | null; used_count: number;
  expires_at: string | null; active: boolean; created_at: string;
}

export interface Testimonial {
  id: string; name: string; location: string | null; rating: number;
  body: string; avatar: string | null; product_name: string | null; sort_order: number;
}

export interface Settings {
  id: string; store_name: string; support_email: string; support_phone: string;
  std_shipping: number; express_shipping: number; free_threshold: number;
  watermark_text: string; notification_events: string[];
}

export interface Profile {
  id: string; full_name: string | null; role: "user" | "admin";
  avatar_url: string | null; created_at: string;
  email?: string; orders_count?: number; total_spent?: number;
}

// ── Category Queries ──────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const { data } = await db.from("categories").select("*").order("sort_order");
  return (data ?? []) as Category[];
}

// ── Product Queries ───────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const [{ data: products }, { data: colours }, { data: sizes }, { data: gallery }, { data: cats }] =
    await Promise.all([
      db.from("products").select("*").eq("active", true).order("created_at", { ascending: false }),
      db.from("product_colours").select("*").order("sort_order"),
      db.from("product_sizes").select("*").order("sort_order"),
      db.from("product_gallery").select("*").order("sort_order"),
      db.from("categories").select("id, name"),
    ]);

  const catMap = Object.fromEntries((cats ?? []).map((c: any) => [c.id, c.name]));
  return (products ?? []).map((p: any) => ({
    ...p,
    category_name: catMap[p.category_id] ?? "",
    colours: (colours ?? []).filter((c: any) => c.product_id === p.id),
    available_sizes: (sizes ?? []).filter((s: any) => s.product_id === p.id),
    gallery: (gallery ?? []).filter((g: any) => g.product_id === p.id).map((g: any) => g.url),
  })) as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data: p } = await db.from("products").select("*, categories(name)").eq("slug", slug).eq("active", true).single();
  if (!p) return null;
  const [{ data: colours }, { data: sizes }, { data: gallery }] = await Promise.all([
    db.from("product_colours").select("*").eq("product_id", p.id).order("sort_order"),
    db.from("product_sizes").select("*").eq("product_id", p.id).order("sort_order"),
    db.from("product_gallery").select("*").eq("product_id", p.id).order("sort_order"),
  ]);
  return {
    ...p,
    category_name: (p as any).categories?.name ?? "",
    colours: colours ?? [],
    available_sizes: sizes ?? [],
    gallery: (gallery ?? []).map((g: any) => g.url),
  } as Product;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.is_featured);
}

// ── Order Queries (Admin) ─────────────────────────────────────────────────

export async function getOrders(client = db): Promise<Order[]> {
  const { data } = await client.from("orders").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Order[];
}

export async function getOrderById(id: string, client = db): Promise<Order | null> {
  const { data } = await client.from("orders").select("*").eq("id", id).single();
  return data as Order | null;
}

export async function updateOrderStatus(
  id: string, status: OrderStatus, historyEntry: OrderHistoryEntry, client = db
): Promise<void> {
  // Fetch current history
  const { data } = await client.from("orders").select("history").eq("id", id).single();
  const existing: OrderHistoryEntry[] = (data as any)?.history ?? [];
  await client.from("orders")
    .update({ status, history: [...existing, historyEntry], updated_at: new Date().toISOString() })
    .eq("id", id);
}

export async function updateOrderTracking(
  id: string, tracking: { carrier: string; number: string }, historyEntry: OrderHistoryEntry, client = db
): Promise<void> {
  const { data } = await client.from("orders").select("history").eq("id", id).single();
  const existing: OrderHistoryEntry[] = (data as any)?.history ?? [];
  await client.from("orders")
    .update({ tracking, history: [...existing, historyEntry], updated_at: new Date().toISOString() })
    .eq("id", id);
}

// ── Review Queries ────────────────────────────────────────────────────────

export async function getReviews(publishedOnly = false, client = db): Promise<Review[]> {
  let q = client.from("reviews").select("*, products(name)").order("created_at", { ascending: false });
  if (publishedOnly) q = q.eq("published", true);
  const { data } = await q;
  return (data ?? []).map((r: any) => ({ ...r, product: r.products })) as Review[];
}

export async function approveReview(id: string, client = db): Promise<void> {
  await client.from("reviews").update({ published: true }).eq("id", id);
}

export async function deleteReview(id: string, client = db): Promise<void> {
  await client.from("reviews").delete().eq("id", id);
}

// ── Coupon Queries ────────────────────────────────────────────────────────

export async function getCoupons(client = db): Promise<Coupon[]> {
  const { data } = await client.from("coupons").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Coupon[];
}

export async function createCoupon(coupon: Omit<Coupon, "id" | "used_count" | "created_at">, client = db): Promise<void> {
  await client.from("coupons").insert({ ...coupon, used_count: 0 });
}

export async function toggleCoupon(id: string, active: boolean, client = db): Promise<void> {
  await client.from("coupons").update({ active }).eq("id", id);
}

export async function deleteCoupon(id: string, client = db): Promise<void> {
  await client.from("coupons").delete().eq("id", id);
}

// ── Testimonials ──────────────────────────────────────────────────────────

export async function getTestimonials(): Promise<Testimonial[]> {
  const { data } = await db.from("testimonials").select("*").eq("published", true).order("sort_order");
  return (data ?? []) as Testimonial[];
}

// ── Settings ──────────────────────────────────────────────────────────────

export async function getSettings(client = db): Promise<Settings | null> {
  const { data } = await client.from("settings").select("*").eq("id", "global").single();
  return data as Settings | null;
}

export async function saveSettings(settings: Partial<Settings>, client = db): Promise<void> {
  await client.from("settings").upsert({ id: "global", ...settings });
}

// ── Admin Stats ───────────────────────────────────────────────────────────

export async function getAdminStats(client = db) {
  const [{ data: orders }, { data: profiles }] = await Promise.all([
    client.from("orders").select("total_pence, status, created_at"),
    client.from("profiles").select("id, created_at"),
  ]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const allOrders = (orders ?? []) as any[];
  const monthOrders = allOrders.filter((o: any) => o.created_at >= startOfMonth);
  const revenue = monthOrders.reduce((s: number, o: any) => s + (o.total_pence ?? 0) / 100, 0);
  const totalRevenue = allOrders.reduce((s: number, o: any) => s + (o.total_pence ?? 0) / 100, 0);
  const pending = allOrders.filter((o: any) => o.status === "pending").length;
  const avgOrder = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;

  const statusCounts: Record<string, number> = {};
  allOrders.forEach((o: any) => { statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1; });

  return {
    revenue,
    totalOrders: allOrders.length,
    monthOrders: monthOrders.length,
    avgOrder,
    totalCustomers: (profiles ?? []).length,
    pending,
    statusCounts,
  };
}
