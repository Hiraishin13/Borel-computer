'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, CartTotals } from '@/types'
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING, TAX_RATE } from '@/lib/constants'

interface CartState {
  items: CartItem[]
  couponDiscount: number
  couponCode: string | null
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  applyCoupon: (code: string, discount: number) => void
  clearCoupon: () => void
  clear: () => void
  count: () => number
  totals: (cfg?: TotalsConfig) => CartTotals
}

interface TotalsConfig {
  taxRate: number
  freeShippingThreshold: number
  standardShipping: number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponDiscount: 0,
      couponCode: null,

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.variant === item.variant,
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === existing.id
                  ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock) }
                  : i,
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity }] }
        }),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i,
          ),
        })),

      applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
      clearCoupon: () => set({ couponCode: null, couponDiscount: 0 }),
      clear: () => set({ items: [], couponCode: null, couponDiscount: 0 }),

      count: () => get().items.reduce((n, i) => n + i.quantity, 0),

      totals: (cfg) => {
        const taxRate = cfg?.taxRate ?? TAX_RATE
        const freeAt = cfg?.freeShippingThreshold ?? FREE_SHIPPING_THRESHOLD
        const std = cfg?.standardShipping ?? STANDARD_SHIPPING

        const { items, couponDiscount } = get()
        const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
        const discount = Math.min(couponDiscount, subtotal)
        const taxable = subtotal - discount
        const tax = +(taxable * taxRate).toFixed(2)
        const shipping = subtotal === 0 || subtotal >= freeAt ? 0 : std
        const total = +(taxable + tax + shipping).toFixed(2)
        return { subtotal, tax, shipping, discount, total }
      },
    }),
    { name: 'borel-cart' },
  ),
)
