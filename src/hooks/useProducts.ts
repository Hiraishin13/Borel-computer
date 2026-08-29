'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse, Product, ProductListQuery } from '@/types'

export function useProducts(query: ProductListQuery = {}) {
  return useQuery({
    queryKey: ['products', query],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Product>>('/products', {
        params: query,
      })
      return data
    },
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Product>(`/products/${id}`)
      return data
    },
    enabled: Boolean(id),
  })
}
