'use client'

import { useEffect } from 'react'
import { useBehaviorStore } from '@/store/behavior'

/** Enregistre la consultation du produit dans l'historique de navigation local. */
export function ProductBehaviorTracker({
  product,
}: {
  product: {
    id: string
    slug: string
    name: string
    category: string
    subcategory: string
    brand?: string
    price: number
    image: string
  }
}) {
  const recordView = useBehaviorStore((s) => s.recordView)

  useEffect(() => {
    recordView(product)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug])

  return null
}
