import type { Product } from '@/types'
import { ProductCard } from './ProductCard'
import { Skeleton } from '@/components/ui/Skeleton'

export function ProductGrid({
  products,
  loading,
  emptyLabel = 'Aucun produit trouvé.',
}: {
  products?: Product[]
  loading?: boolean
  emptyLabel?: string
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4]" />
        ))}
      </div>
    )
  }

  if (!products?.length) {
    return <p className="py-20 text-center text-muted">{emptyLabel}</p>
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}
    </div>
  )
}
