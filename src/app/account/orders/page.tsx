'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { formatDate, formatPrice } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import type { PaginatedResponse, Order } from '@/types'

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Order>>('/orders')
      return data
    },
  })

  if (isLoading) return <p className="text-muted">Chargement…</p>
  if (!data?.data.length) return <p className="text-muted">Aucune commande pour le moment.</p>

  return (
    <div className="space-y-4">
      {data.data.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="card flex items-center justify-between p-4 hover:border-accent"
        >
          <div>
            <p className="font-semibold">{order.orderNumber}</p>
            <p className="text-xs text-muted">{formatDate(order.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm">{formatPrice(order.total)}</p>
            <p className="text-xs text-accent">{ORDER_STATUS_LABELS[order.status] ?? order.status}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
