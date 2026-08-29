'use client'

import { useState } from 'react'
import type { Product } from '@/types'
import { useCartStore } from '@/store/cart'
import { useBehaviorStore } from '@/store/behavior'
import { cn } from '@/lib/utils'

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const recordCartAdd = useBehaviorStore((s) => s.recordCartAdd)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const price = product.discountPrice ?? product.price
  const disabled = product.stock === 0

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center rounded-md border border-white/10">
        <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-2 text-muted hover:text-light">
          −
        </button>
        <span className="w-10 text-center">{qty}</span>
        <button
          onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
          className="px-4 py-2 text-muted hover:text-light"
        >
          +
        </button>
      </div>

      <button
        disabled={disabled}
        onClick={() => {
          addItem(
            {
              id: product.id,
              productId: product.id,
              name: product.name,
              slug: product.slug,
              price,
              image: product.thumbnail,
              stock: product.stock,
            },
            qty,
          )
          recordCartAdd({ brand: product.brand, subcategory: product.subcategory })
          setAdded(true)
          setTimeout(() => setAdded(false), 2000)
        }}
        className={cn('btn-primary min-w-48', added && 'bg-success hover:bg-success')}
      >
        {disabled ? 'Rupture de stock' : added ? 'Ajouté ✓' : 'Ajouter au panier'}
      </button>
    </div>
  )
}
