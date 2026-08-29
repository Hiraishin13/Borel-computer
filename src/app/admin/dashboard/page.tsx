'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { formatPrice } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import { StatCard } from '@/components/admin/StatCard'
import { RevenueChart } from '@/components/admin/RevenueChart'

interface Stats {
  revenue: {
    total: number
    collected: number
    pending: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  margin: { total: number; pct: number }
  orders: {
    total: number
    active: number
    unpaid: number
    avgBasket: number
    byStatus: Record<string, { count: number; total: number }>
  }
  customers: { total: number; new: number }
  products: {
    total: number
    published: number
    unpublished: number
    outOfStock: number
    lowStock: number
  }
  monthlyRevenue: { month: string; revenue: number }[]
  topProducts: { name: string; brand: string | null; units: number; revenue: number; margin: number }[]
  salesByBrand: { brand: string; units: number; revenue: number; margin: number; sold: boolean }[]
}

const STATUS_ORDER = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => (await apiClient.get<Stats>('/admin/dashboard/stats')).data,
  })

  if (isLoading || !data) return <p className="text-muted">Chargement…</p>

  const d = data

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <Link href="/admin/products" className="btn-secondary">
          Gérer les produits
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="CA total (hors annulées)"
          value={formatPrice(d.revenue.total)}
          hint={`${formatPrice(d.revenue.collected)} encaissés · ${formatPrice(d.revenue.pending)} à encaisser`}
        />
        <StatCard
          label="CA ce mois"
          value={formatPrice(d.revenue.thisMonth)}
          trend={d.revenue.growth}
          hint={`mois dernier : ${formatPrice(d.revenue.lastMonth)}`}
        />
        <StatCard
          label="Marge brute"
          value={formatPrice(d.margin.total)}
          hint={`${d.margin.pct}% du CA réalisé`}
        />
        <StatCard
          label="Commandes"
          value={String(d.orders.total)}
          hint={`${d.orders.unpaid} à traiter · panier moyen ${formatPrice(d.orders.avgBasket)}`}
        />
        <StatCard
          label="Clients"
          value={String(d.customers.total)}
          hint={`${d.customers.new} nouveaux ce mois`}
        />
        <StatCard
          label="Catalogue"
          value={`${d.products.published}/${d.products.total} publiés`}
          hint={`${d.products.unpublished} hors ligne · ${d.products.outOfStock} en rupture · ${d.products.lowStock} stock bas`}
        />
      </div>

      <RevenueChart data={d.monthlyRevenue} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Commandes par statut */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold">Commandes par statut</h2>
          <table className="mt-4 w-full text-sm">
            <tbody className="divide-y divide-white/10">
              {STATUS_ORDER.map((s) => {
                const row = d.orders.byStatus[s]
                return (
                  <tr key={s}>
                    <td className="py-2 text-muted">{ORDER_STATUS_LABELS[s] ?? s}</td>
                    <td className="py-2 text-right">{row?.count ?? 0}</td>
                    <td className="py-2 text-right text-muted">{formatPrice(row?.total ?? 0)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Top produits */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold">Meilleures ventes</h2>
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-xs text-muted">
              <tr>
                <th className="pb-2 font-normal">Produit</th>
                <th className="pb-2 text-right font-normal">Qté</th>
                <th className="pb-2 text-right font-normal">CA</th>
                <th className="pb-2 text-right font-normal">Marge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {d.topProducts.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-muted">
                    Aucune vente
                  </td>
                </tr>
              )}
              {d.topProducts.map((p) => (
                <tr key={p.name}>
                  <td className="max-w-[180px] truncate py-2">{p.name}</td>
                  <td className="py-2 text-right">{p.units}</td>
                  <td className="py-2 text-right">{formatPrice(p.revenue)}</td>
                  <td className="py-2 text-right text-success">{formatPrice(p.margin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ventes par marque */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold">Ventes par marque</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="text-left text-xs text-muted">
              <tr>
                <th className="pb-2 font-normal">Marque</th>
                <th className="pb-2 text-right font-normal">Unités</th>
                <th className="pb-2 text-right font-normal">CA</th>
                <th className="pb-2 text-right font-normal">Marge</th>
                <th className="pb-2 text-right font-normal">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {d.salesByBrand.map((b) => (
                <tr key={b.brand}>
                  <td className="py-2 font-medium">{b.brand}</td>
                  <td className="py-2 text-right">{b.units}</td>
                  <td className="py-2 text-right">{formatPrice(b.revenue)}</td>
                  <td className="py-2 text-right text-success">{formatPrice(b.margin)}</td>
                  <td className="py-2 text-right">
                    <span
                      className={
                        b.sold
                          ? 'rounded bg-success/15 px-2 py-0.5 text-xs text-success'
                          : 'rounded bg-white/10 px-2 py-0.5 text-xs text-muted'
                      }
                    >
                      {b.sold ? 'Vendu' : 'Non vendu'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
