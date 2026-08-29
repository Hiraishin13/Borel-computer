'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { formatPrice } from '@/lib/utils'
import { StatCard } from '@/components/admin/StatCard'

interface Stats {
  revenue: { total: number; month: number; growth: number }
  orders: { total: number; pending: number; completed: number; cancelled: number }
  customers: { total: number; new: number; active: number }
  products: { total: number; outOfStock: number; lowStock: number }
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get<Stats>('/admin/dashboard/stats')
      return data
    },
  })

  if (isLoading || !data) return <p className="text-muted">Chargement…</p>

  return (
    <div>
      <h1 className="text-2xl font-bold">Tableau de bord</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Chiffre d'affaires"
          value={formatPrice(data.revenue.total)}
          hint="ce mois"
          trend={data.revenue.growth}
        />
        <StatCard label="Commandes" value={String(data.orders.total)} hint={`${data.orders.pending} en attente`} />
        <StatCard label="Clients" value={String(data.customers.total)} hint={`${data.customers.new} nouveaux`} />
        <StatCard
          label="Produits"
          value={String(data.products.total)}
          hint={`${data.products.lowStock} stock faible`}
        />
      </div>
    </div>
  )
}
