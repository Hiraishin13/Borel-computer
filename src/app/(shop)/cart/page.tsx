'use client'

import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { CartItemRow } from '@/components/cart/CartItemRow'
import { CartSummary } from '@/components/cart/CartSummary'
import { Button } from '@/components/ui/Button'

export default function CartPage() {
  const items = useCartStore((s) => s.items)

  if (items.length === 0) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">Votre panier est vide</h1>
        <p className="mt-2 text-muted">Parcourez le catalogue et ajoutez vos produits favoris.</p>
        <Button href="/products" className="mt-8">
          Voir le catalogue
        </Button>
      </div>
    )
  }

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">Panier</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="divide-y divide-white/10">
          {items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </div>
        <div className="space-y-4">
          <CartSummary />
          <Link href="/products" className="block text-center text-sm text-muted hover:text-light">
            ← Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  )
}
