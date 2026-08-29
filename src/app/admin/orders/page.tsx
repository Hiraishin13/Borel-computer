'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { formatDate, formatPrice } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import type { PaginatedResponse, Order } from '@/types'

export default function AdminOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Order>>('/admin/orders')
      return data
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">Commandes</h1>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-white/10 text-left text-muted">
            <tr>
              <th className="py-3">Numéro</th>
              <th className="py-3">Date</th>
              <th className="py-3">Total</th>
              <th className="py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-muted">
                  Chargement…
                </td>
              </tr>
            ) : (
              data?.data.map((o) => (
                <tr key={o.id}>
                  <td className="py-3">{o.orderNumber}</td>
                  <td className="py-3 text-muted">{formatDate(o.createdAt)}</td>
                  <td className="py-3">{formatPrice(o.total)}</td>
                  <td className="py-3 text-accent">{ORDER_STATUS_LABELS[o.status] ?? o.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
