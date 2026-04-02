import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function generateOrderNumber(): string {
  const num = Math.floor(Math.random() * 90000) + 10000;
  return `PYV-${num}`;
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + "…" : str;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .trim();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function estimatedDelivery(method: "standard" | "express"): string {
  const now = new Date();
  const production = method === "express" ? 1 : 2;
  const shipping = method === "express" ? 2 : 5;
  const earliest = new Date(now);
  earliest.setDate(now.getDate() + production + (method === "express" ? 1 : 3));
  const latest = new Date(now);
  latest.setDate(now.getDate() + production + shipping);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${fmt(earliest)} – ${fmt(latest)}`;
}

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "printing",
  "dispatched",
  "delivered",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:    "text-status-pending   bg-status-pending/10   border-status-pending/30",
  confirmed:  "text-status-confirmed bg-status-confirmed/10 border-status-confirmed/30",
  printing:   "text-status-printing  bg-status-printing/10  border-status-printing/30",
  dispatched: "text-status-dispatched bg-status-dispatched/10 border-status-dispatched/30",
  delivered:  "text-status-delivered bg-status-delivered/10 border-status-delivered/30",
  cancelled:  "text-status-cancelled  bg-status-cancelled/10  border-status-cancelled/30",
  refunded:   "text-status-refunded  bg-status-refunded/10  border-status-refunded/30",
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:    "Pending",
  confirmed:  "Confirmed",
  printing:   "Printing",
  dispatched: "Dispatched",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
  refunded:   "Refunded",
};
