'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { ProductGrid } from '@/components/product/ProductGrid'
import type { Product } from '@/types'

export default function WishlistPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Product[] }>('/wishlists')
      return data.data
    },
  })

  return (
    <ProductGrid
      products={data}
      loading={isLoading}
      emptyLabel="Votre liste de favoris est vide."
    />
  )
}
