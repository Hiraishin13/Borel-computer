'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductFilters } from '@/components/product/ProductFilters'
import type { ProductListQuery } from '@/types'

function Catalogue() {
  const params = useSearchParams()
  const query: ProductListQuery = {
    category: params.get('category') ?? undefined,
    search: params.get('search') ?? undefined,
    sortBy: (params.get('sortBy') as ProductListQuery['sortBy']) ?? undefined,
    order: (params.get('order') as ProductListQuery['order']) ?? undefined,
    page: params.get('page') ? Number(params.get('page')) : 1,
    limit: 24,
  }
  const { data, isLoading } = useProducts(query)

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">Catalogue</h1>
      <p className="mt-2 text-muted">
        {data?.pagination.total ?? 0} produit{(data?.pagination.total ?? 0) > 1 ? 's' : ''}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <ProductFilters />
        <ProductGrid products={data?.data} loading={isLoading} />
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container-page py-12">Chargement…</div>}>
      <Catalogue />
    </Suspense>
  )
}
