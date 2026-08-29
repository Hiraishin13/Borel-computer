'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { CartItem } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cart'

export function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCartStore()

  return (
    <div className="flex gap-4 py-5">
      <Link href={`/products/${item.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-primary">
        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between gap-4">
          <div>
            <Link href={`/products/${item.slug}`} className="text-sm font-semibold hover:text-accent">
              {item.name}
            </Link>
            {item.variant && <p className="text-xs text-muted">{item.variant}</p>}
          </div>
          <button onClick={() => removeItem(item.id)} className="text-xs text-muted hover:text-danger">
            Retirer
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center rounded-md border border-white/10">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="px-3 py-1 text-muted hover:text-light"
              aria-label="Diminuer"
            >
              −
            </button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="px-3 py-1 text-muted hover:text-light"
              aria-label="Augmenter"
            >
              +
            </button>
          </div>
          <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
        </div>
      </div>
    </div>
  )
}
