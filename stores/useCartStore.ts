"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  colour: string;
  colourHex: string;
  size: string;
  quantity: number;
  unitPrice: number;
  thumbnailUrl: string;
  designAssetUrl?: string;
  mockupSessionId?: string;
};

type Coupon = { code: string; type: "percent" | "fixed"; value: number };

type CartState = {
  items: CartItem[];
  coupon: Coupon | null;
  shippingMethod: "standard" | "express";
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  setShippingMethod: (method: "standard" | "express") => void;
  clearCart: () => void;
  subtotal: () => number;
  discount: () => number;
  shippingCost: () => number;
  total: () => number;
  itemCount: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      shippingMethod: "standard",

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.colour === item.colour && i.size === item.size
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),

      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),
      setShippingMethod: (method) => set({ shippingMethod: method }),
      clearCart: () => set({ items: [], coupon: null, shippingMethod: "standard" }),

      subtotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),

      discount: () => {
        const { coupon, subtotal } = get();
        if (!coupon) return 0;
        if (coupon.type === "percent") return (subtotal() * coupon.value) / 100;
        return Math.min(coupon.value, subtotal());
      },

      shippingCost: () => {
        const { shippingMethod, subtotal } = get();
        if (shippingMethod === "express") return 7.99;
        return subtotal() >= 50 ? 0 : 3.99;
      },

      total: () => {
        const { subtotal, discount, shippingCost } = get();
        return Math.max(0, subtotal() - discount() + shippingCost());
      },

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "pyv-cart" }
  )
);
