'use client'

import Link from 'next/link'
import { useProducts } from '@/hooks/useProducts'
import { ProductGrid } from '@/components/product/ProductGrid'

export function FeaturedProducts() {
  const { data, isLoading } = useProducts({ limit: 8, sortBy: 'rating', order: 'desc' })

  return (
    <section className="container-page py-20">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold">Produits vedettes</h2>
          <p className="mt-2 text-muted">Notre sélection du moment</p>
        </div>
        <Link href="/products" className="hidden text-sm text-accent hover:underline sm:block">
          Tout voir →
        </Link>
      </div>
      <ProductGrid products={data?.data} loading={isLoading} />
    </section>
  )
}
