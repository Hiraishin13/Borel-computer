'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ViewedProduct {
  id: string
  slug: string
  name: string
  category: string
  subcategory: string
  brand?: string
  price: number
  image: string
  at: number
}

interface Signal {
  /** poids cumulé (vue = 1, ajout panier = 4) */
  weight: number
  at: number
}

interface BehaviorState {
  views: ViewedProduct[]
  brands: Record<string, Signal>
  subcategories: Record<string, Signal>

  recordView: (p: Omit<ViewedProduct, 'at'>) => void
  recordCartAdd: (p: Pick<ViewedProduct, 'brand' | 'subcategory'>) => void

  topBrands: (n?: number) => string[]
  topSubcategories: (n?: number) => string[]
  recentSlugs: (n?: number) => string[]
}

const VIEW_CAP = 24
const HALF_LIFE_MS = 1000 * 60 * 60 * 24 * 14 // 14 jours

function bump(map: Record<string, Signal>, key: string | undefined, w: number) {
  if (!key) return
  const now = Date.now()
  const prev = map[key]
  // décroissance exponentielle du poids existant
  const decayed = prev ? prev.weight * Math.pow(0.5, (now - prev.at) / HALF_LIFE_MS) : 0
  map[key] = { weight: decayed + w, at: now }
}

function ranked(map: Record<string, Signal>, n: number): string[] {
  const now = Date.now()
  return Object.entries(map)
    .map(([k, s]) => [k, s.weight * Math.pow(0.5, (now - s.at) / HALF_LIFE_MS)] as const)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k)
}

export const useBehaviorStore = create<BehaviorState>()(
  persist(
    (set, get) => ({
      views: [],
      brands: {},
      subcategories: {},

      recordView: (p) =>
        set((state) => {
          const views = [
            { ...p, at: Date.now() },
            ...state.views.filter((v) => v.slug !== p.slug),
          ].slice(0, VIEW_CAP)
          const brands = { ...state.brands }
          const subcategories = { ...state.subcategories }
          bump(brands, p.brand, 1)
          bump(subcategories, p.subcategory, 1)
          return { views, brands, subcategories }
        }),

      recordCartAdd: (p) =>
        set((state) => {
          const brands = { ...state.brands }
          const subcategories = { ...state.subcategories }
          bump(brands, p.brand, 4)
          bump(subcategories, p.subcategory, 4)
          return { brands, subcategories }
        }),

      topBrands: (n = 3) => ranked(get().brands, n),
      topSubcategories: (n = 3) => ranked(get().subcategories, n),
      recentSlugs: (n = 12) => get().views.slice(0, n).map((v) => v.slug),
    }),
    { name: 'borel-behavior' },
  ),
)
