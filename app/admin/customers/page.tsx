"use client";
import { useEffect, useState } from "react";
import { Search, Mail, ExternalLink } from "lucide-react";
import { formatPrice, formatDateShort } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

type CustomerStatus = "vip" | "active" | "new" | "guest";

interface Customer {
  id: string; full_name: string | null; email: string;
  orders_count: number; total_spent: number;
  joined: string; last_order: string | null; status: CustomerStatus;
}

const STATUS_COLORS: Record<CustomerStatus, string> = {
  vip:    "text-gold bg-gold/15 border-gold/30",
  active: "text-green-400 bg-green-400/10 border-green-400/25",
  new:    "text-blue-400 bg-blue-400/10 border-blue-400/25",
  guest:  "text-cream-faint bg-dark-elevated border-gold/10",
};
const STATUS_LABELS: Record<CustomerStatus, string> = { vip: "VIP", active: "Active", new: "New", guest: "Guest" };

type SortKey = "name" | "orders" | "spent" | "joined";

function computeStatus(orders: number): CustomerStatus {
  if (orders >= 5) return "vip";
  if (orders >= 2) return "active";
  if (orders >= 1) return "new";
  return "guest";
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("spent");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    async function load() {
      // Get all profiles with their order totals
      const [{ data: profiles }, { data: orders }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, created_at"),
        supabase.from("orders").select("user_id, total_pence, created_at").neq("status", "cancelled").neq("status", "refunded"),
      ]);

      // Also get emails from auth — we can only get our own, so display what we have
      const allProfiles = (profiles ?? []) as any[];
      const allOrders   = (orders ?? []) as any[];

      const grouped: Record<string, { count: number; total: number; last: string | null }> = {};
      allOrders.forEach((o: any) => {
        if (!o.user_id) return;
        if (!grouped[o.user_id]) grouped[o.user_id] = { count: 0, total: 0, last: null };
        grouped[o.user_id].count++;
        grouped[o.user_id].total += o.total_pence;
        if (!grouped[o.user_id].last || o.created_at > grouped[o.user_id].last!) {
          grouped[o.user_id].last = o.created_at;
        }
      });

      const list: Customer[] = allProfiles.map((p: any) => {
        const g = grouped[p.id] ?? { count: 0, total: 0, last: null };
        return {
          id: p.id,
          full_name: p.full_name,
          email: `${p.id.slice(0, 8)}@user`, // email is not in profiles table; shown as ID partial
          orders_count: g.count,
          total_spent: g.total / 100,
          joined: p.created_at,
          last_order: g.last,
          status: computeStatus(g.count),
        };
      });

      setCustomers(list);
      setLoading(false);
    }
    load();
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortBy(key); setSortDir("desc"); }
  };

  const filtered = customers
    .filter((c) => {
      const q = search.toLowerCase();
      return !q || (c.full_name ?? "").toLowerCase().includes(q) || c.id.includes(q);
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "name")   return (a.full_name ?? "").localeCompare(b.full_name ?? "") * dir;
      if (sortBy === "orders") return (a.orders_count - b.orders_count) * dir;
      if (sortBy === "spent")  return (a.total_spent - b.total_spent) * dir;
      if (sortBy === "joined") return a.joined.localeCompare(b.joined) * dir;
      return 0;
    });

  const totalRevenue = customers.reduce((s, c) => s + c.total_spent, 0);
  const SortIcon = ({ k }: { k: SortKey }) =>
    sortBy === k ? <span className="ml-1 text-gold">{sortDir === "desc" ? "↓" : "↑"}</span> : null;

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-cream mb-6">Customers</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Customers",  value: loading ? "…" : customers.length.toString() },
          { label: "VIP (5+ orders)",  value: loading ? "…" : customers.filter((c) => c.status === "vip").length.toString() },
          { label: "Active (2+ orders)", value: loading ? "…" : customers.filter((c) => c.status === "active").length.toString() },
          { label: "Avg. Lifetime Value", value: loading ? "…" : customers.length ? formatPrice(totalRevenue / customers.length) : "£0" },
        ].map((s) => (
          <div key={s.label} className="bg-dark-card border border-gold/12 rounded-xl p-4 text-center">
            <p className="font-display font-bold text-2xl text-cream">{s.value}</p>
            <p className="font-label text-[10px] text-cream-faint uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-faint" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or ID…"
          className="w-full bg-dark-elevated border border-gold/12 rounded-xl pl-10 pr-4 py-3 text-sm text-cream placeholder:text-cream-faint/50 focus:outline-none focus:border-gold/40 transition-colors" />
      </div>

      {/* Table */}
      <div className="bg-dark-card border border-gold/12 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/10">
              <th className="text-left px-5 py-4 font-label text-[10px] uppercase tracking-widest text-cream-faint cursor-pointer hover:text-cream" onClick={() => toggleSort("name")}>Customer <SortIcon k="name" /></th>
              <th className="text-left px-5 py-4 font-label text-[10px] uppercase tracking-widest text-cream-faint">Status</th>
              <th className="text-left px-5 py-4 font-label text-[10px] uppercase tracking-widest text-cream-faint cursor-pointer hover:text-cream" onClick={() => toggleSort("orders")}>Orders <SortIcon k="orders" /></th>
              <th className="text-left px-5 py-4 font-label text-[10px] uppercase tracking-widest text-cream-faint cursor-pointer hover:text-cream" onClick={() => toggleSort("spent")}>Total Spent <SortIcon k="spent" /></th>
              <th className="text-left px-5 py-4 font-label text-[10px] uppercase tracking-widest text-cream-faint cursor-pointer hover:text-cream" onClick={() => toggleSort("joined")}>Joined <SortIcon k="joined" /></th>
              <th className="text-left px-5 py-4 font-label text-[10px] uppercase tracking-widest text-cream-faint">Last Order</th>
              <th className="px-5 py-4" />
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-gold/8">
                    {Array(7).fill(0).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 rounded bg-dark-elevated animate-pulse" /></td>)}
                  </tr>
                ))
              : filtered.map((c) => (
              <tr key={c.id} className="border-b border-gold/8 last:border-0 hover:bg-dark-elevated/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gold/12 border border-gold/20 flex items-center justify-center shrink-0">
                      <span className="font-label text-xs text-gold font-bold">
                        {(c.full_name ?? "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-heading text-sm text-cream font-semibold">{c.full_name ?? "Unnamed"}</p>
                      <p className="font-label text-[10px] text-cream-faint">{c.id.slice(0, 8)}…</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-label font-semibold uppercase tracking-widest ${STATUS_COLORS[c.status]}`}>
                    {STATUS_LABELS[c.status]}
                  </span>
                </td>
                <td className="px-5 py-4 text-cream-muted">{c.orders_count}</td>
                <td className="px-5 py-4 font-heading font-semibold text-cream">{formatPrice(c.total_spent)}</td>
                <td className="px-5 py-4 font-label text-[11px] text-cream-faint">{formatDateShort(c.joined.slice(0, 10))}</td>
                <td className="px-5 py-4 font-label text-[11px] text-cream-faint">
                  {c.last_order ? formatDateShort(c.last_order.slice(0, 10)) : "—"}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 text-cream-faint hover:text-gold transition-colors" title="View orders">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center text-cream-muted">
            {customers.length === 0 ? "No registered customers yet." : "No customers match your search."}
          </div>
        )}
      </div>
      <p className="mt-4 text-xs text-cream-faint text-right">
        {loading ? "Loading…" : `${filtered.length} of ${customers.length} customers`}
      </p>
    </div>
  );
}
