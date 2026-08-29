'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import type { Order } from '@/types'

interface CustomerDetail {
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
    addresses: { street: string; city: string; postalCode: string; country: string }[]
    createdAt: string
  }
  summary: { orders: number; spent: number; avgBasket: number }
  bought: { name: string; units: number; total: number }[]
  orders: Order[]
}

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'customer', params.id],
    queryFn: async () =>
      (await apiClient.get<CustomerDetail>(`/admin/customers/${params.id}`)).data,
  })

  if (isLoading || !data) return <p className="text-muted">Chargement…</p>

  const { customer: c, summary, bought, orders } = data

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/customers" className="text-sm text-muted hover:text-light">
          ← Clients
        </Link>
        <h1 className="mt-1 text-2xl font-bold">
          {c.firstName} {c.lastName}
        </h1>
        <p className="text-sm text-muted">
          {c.email}
          {c.phone ? ` · ${c.phone}` : ''} · inscrit le {formatDate(c.createdAt)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wider text-muted">Commandes</p>
          <p className="mt-1 text-2xl font-bold">{summary.orders}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wider text-muted">Total dépensé</p>
          <p className="mt-1 text-2xl font-bold">{formatPrice(summary.spent)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wider text-muted">Panier moyen</p>
          <p className="mt-1 text-2xl font-bold">{formatPrice(summary.avgBasket)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-sm font-semibold">Ce qu&apos;il achète</h2>
          <table className="mt-4 w-full text-sm">
            <tbody className="divide-y divide-white/10">
              {bought.length === 0 && (
                <tr>
                  <td className="py-3 text-center text-muted">Aucun achat</td>
                </tr>
              )}
              {bought.map((b) => (
                <tr key={b.name}>
                  <td className="py-2">{b.name}</td>
                  <td className="py-2 text-right text-muted">×{b.units}</td>
                  <td className="py-2 text-right">{formatPrice(b.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold">Adresses</h2>
          {c.addresses.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Aucune adresse enregistrée.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {c.addresses.map((a, i) => (
                <li key={i}>
                  {a.street}, {a.postalCode} {a.city}, {a.country}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold">Commandes</h2>
        <div className="mt-4 space-y-2">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/admin/orders/${o.id}`}
              className="flex items-center justify-between rounded-md border border-white/10 p-3 text-sm hover:border-accent"
            >
              <div>
                <span className="font-medium">{o.orderNumber}</span>
                <span className="ml-2 text-xs text-muted">{formatDate(o.createdAt)}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-accent">
                  {ORDER_STATUS_LABELS[o.status] ?? o.status}
                </span>
                <span>{formatPrice(o.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
