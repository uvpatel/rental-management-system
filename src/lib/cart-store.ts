"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  name: string;
  sku?: string;
  imageUrl?: string;
  dailyPrice: number; // paise
  securityDeposit: number; // paise
  quantity: number;
};

type CartState = {
  items: CartItem[];
  startAt: string;
  endAt: string;
  couponCode: string;
  fulfilmentMethod: "PICKUP" | "DELIVERY";
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDateRange: (startAt: string, endAt: string) => void;
  setCouponCode: (code: string) => void;
  setFulfilmentMethod: (method: "PICKUP" | "DELIVERY") => void;
  clearCart: () => void;
};

// Default date range: tomorrow to 3 days later
const defaultStart = new Date(Date.now() + 24 * 3600 * 1000).toISOString().split("T")[0];
const defaultEnd = new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString().split("T")[0];

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      startAt: defaultStart,
      endAt: defaultEnd,
      couponCode: "",
      fulfilmentMethod: "PICKUP",
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        })),
      setDateRange: (startAt, endAt) => set({ startAt, endAt }),
      setCouponCode: (couponCode) => set({ couponCode }),
      setFulfilmentMethod: (fulfilmentMethod) => set({ fulfilmentMethod }),
      clearCart: () => set({ items: [], couponCode: "" }),
    }),
    {
      name: "rental_cart_storage",
    }
  )
);
