'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { formatDate, formatPrice, cn } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import type { PaginatedResponse, Order } from '@/types'

const FILTERS = ['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const

export default function AdminOrdersPage() {
  const router = useRouter()
  const [status, setStatus] = useState<string>('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', status],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Order>>('/admin/orders', {
        params: status ? { status } : {},
      })
      return data
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">Commandes</h1>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {FILTERS.map((f) => (
          <button
            key={f || 'all'}
            onClick={() => setStatus(f)}
            className={cn(
              'rounded-full border px-3 py-1',
              status === f ? 'border-accent bg-accent text-light' : 'border-white/15 text-muted',
            )}
          >
            {f ? ORDER_STATUS_LABELS[f] : 'Toutes'}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-white/10 text-left text-xs text-muted">
            <tr>
              <th className="py-2 font-normal">Numéro</th>
              <th className="py-2 font-normal">Date</th>
              <th className="py-2 font-normal">Articles</th>
              <th className="py-2 text-right font-normal">Total</th>
              <th className="py-2 font-normal">Paiement</th>
              <th className="py-2 font-normal">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-muted">
                  Chargement…
                </td>
              </tr>
            ) : (
              data?.data.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => router.push(`/admin/orders/${o.id}`)}
                  className="cursor-pointer hover:bg-white/5"
                >
                  <td className="py-2 font-medium">{o.orderNumber}</td>
                  <td className="py-2 text-muted">{formatDate(o.createdAt)}</td>
                  <td className="py-2 text-muted">{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                  <td className="py-2 text-right">{formatPrice(o.total)}</td>
                  <td className="py-2">
                    <span
                      className={
                        o.paymentStatus === 'completed'
                          ? 'text-success'
                          : 'text-muted'
                      }
                    >
                      {o.paymentStatus === 'completed' ? 'Encaissé' : 'En attente'}
                    </span>
                  </td>
                  <td className="py-2 text-accent">{ORDER_STATUS_LABELS[o.status] ?? o.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
