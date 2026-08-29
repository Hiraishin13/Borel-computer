'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { formatPrice, formatDate } from '@/lib/utils'

interface Row {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  createdAt: string
  orders: number
  spent: number
  units: number
  lastOrderAt: string | null
}

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'customers', search],
    queryFn: async () =>
      (
        await apiClient.get<{ data: Row[] }>('/admin/customers', {
          params: search ? { search } : {},
        })
      ).data.data,
  })

  const rows = data ?? []

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-sm text-muted">{rows.length} clients</p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nom ou email…"
          className="input max-w-xs"
        />
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-white/10 text-left text-xs text-muted">
            <tr>
              <th className="py-2 font-normal">Client</th>
              <th className="py-2 font-normal">Contact</th>
              <th className="py-2 text-right font-normal">Commandes</th>
              <th className="py-2 text-right font-normal">Articles</th>
              <th className="py-2 text-right font-normal">Total dépensé</th>
              <th className="py-2 text-right font-normal">Dernière</th>
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
              rows.map((c) => (
                <tr key={c.id} className="hover:bg-white/5">
                  <td className="py-2">
                    <Link href={`/admin/customers/${c.id}`} className="font-medium hover:text-accent">
                      {c.firstName} {c.lastName}
                    </Link>
                    <p className="text-xs text-muted">Inscrit le {formatDate(c.createdAt)}</p>
                  </td>
                  <td className="py-2 text-muted">
                    <p>{c.email}</p>
                    {c.phone && <p className="text-xs">{c.phone}</p>}
                  </td>
                  <td className="py-2 text-right">{c.orders}</td>
                  <td className="py-2 text-right">{c.units}</td>
                  <td className="py-2 text-right font-medium">{formatPrice(c.spent)}</td>
                  <td className="py-2 text-right text-muted">
                    {c.lastOrderAt ? formatDate(c.lastOrderAt) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
