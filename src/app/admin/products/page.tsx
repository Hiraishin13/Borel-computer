'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { formatPrice, cn } from '@/lib/utils'

interface AdminProduct {
  id: string
  sku: string
  name: string
  brand: string | null
  category: string
  subcategory: string
  price: number
  discountPrice: number | null
  cost: number
  marginUnit: number
  marginPct: number
  stock: number
  published: boolean
  featured: boolean
  unitsSold: number
  revenue: number
  thumbnail: string
}

export default function AdminProductsPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'true' | 'false'>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', filter],
    queryFn: async () => {
      const params = filter === 'all' ? {} : { published: filter }
      return (await apiClient.get<{ data: AdminProduct[] }>('/admin/products', { params })).data.data
    },
  })

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
      apiClient.patch(`/products/${id}`, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })

  const create = useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiClient.post('/admin/products', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      setShowForm(false)
    },
  })

  const rows = data ?? []
  const publishedCount = rows.filter((r) => r.published).length

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Produits</h1>
          <p className="text-sm text-muted">
            {publishedCount} publiés / {rows.length}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Fermer' : 'Nouvel article'}
        </button>
      </div>

      {showForm && (
        <NewProductForm
          onSubmit={(payload) => create.mutate(payload)}
          pending={create.isPending}
          error={create.error instanceof Error ? create.error.message : null}
        />
      )}

      <div className="mt-6 flex gap-2 text-xs">
        {(['all', 'true', 'false'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full border px-3 py-1',
              filter === f ? 'border-accent bg-accent text-light' : 'border-white/15 text-muted',
            )}
          >
            {f === 'all' ? 'Tous' : f === 'true' ? 'Publiés' : 'Hors ligne'}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="border-b border-white/10 text-left text-xs text-muted">
            <tr>
              <th className="py-2 font-normal">Article</th>
              <th className="py-2 font-normal">Marque</th>
              <th className="py-2 text-right font-normal">Prix</th>
              <th className="py-2 text-right font-normal">Coût</th>
              <th className="py-2 text-right font-normal">Marge</th>
              <th className="py-2 text-right font-normal">Stock</th>
              <th className="py-2 text-right font-normal">Vendus</th>
              <th className="py-2 text-center font-normal">Publié</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-muted">
                  Chargement…
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  busy={update.isPending}
                  onPatch={(patch) => update.mutate({ id: p.id, patch })}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProductRow({
  product: p,
  busy,
  onPatch,
}: {
  product: AdminProduct
  busy: boolean
  onPatch: (patch: Record<string, unknown>) => void
}) {
  const [cost, setCost] = useState(String(p.cost))
  const price = p.discountPrice ?? p.price
  const marginPct = price > 0 ? Math.round(((price - Number(cost || 0)) / price) * 100) : 0

  return (
    <tr className={cn(!p.published && 'opacity-60')}>
      <td className="py-2">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded bg-primary">
            <Image src={p.thumbnail} alt="" fill className="object-cover" sizes="36px" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{p.name}</p>
            <p className="truncate text-xs text-muted">{p.sku}</p>
          </div>
        </div>
      </td>
      <td className="py-2 text-muted">{p.brand ?? '—'}</td>
      <td className="py-2 text-right">{formatPrice(price)}</td>
      <td className="py-2 text-right">
        <input
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          onBlur={() => {
            const n = Number(cost)
            if (!Number.isNaN(n) && n !== p.cost) onPatch({ cost: n })
          }}
          inputMode="decimal"
          className="w-20 rounded border border-white/10 bg-secondary px-2 py-1 text-right text-xs"
        />
      </td>
      <td
        className={cn(
          'py-2 text-right font-medium',
          marginPct < 15 ? 'text-danger' : marginPct < 25 ? 'text-warning' : 'text-success',
        )}
      >
        {marginPct}%
      </td>
      <td className={cn('py-2 text-right', p.stock === 0 && 'text-danger', p.stock > 0 && p.stock <= 5 && 'text-warning')}>
        {p.stock}
      </td>
      <td className="py-2 text-right">{p.unitsSold}</td>
      <td className="py-2 text-center">
        <button
          disabled={busy}
          onClick={() => onPatch({ published: !p.published })}
          className={cn(
            'inline-flex h-5 w-9 items-center rounded-full px-0.5 transition-colors',
            p.published ? 'bg-success justify-end' : 'bg-white/20 justify-start',
          )}
          aria-label={p.published ? 'Dépublier' : 'Publier'}
        >
          <span className="h-4 w-4 rounded-full bg-white" />
        </button>
      </td>
    </tr>
  )
}

function NewProductForm({
  onSubmit,
  pending,
  error,
}: {
  onSubmit: (payload: Record<string, unknown>) => void
  pending: boolean
  error: string | null
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        const n = (k: string) => Number(f.get(k))
        onSubmit({
          sku: f.get('sku'),
          name: f.get('name'),
          brand: f.get('brand') || undefined,
          description: f.get('description'),
          category: f.get('category'),
          subcategory: f.get('subcategory'),
          price: n('price'),
          cost: n('cost') || 0,
          stock: n('stock') || 0,
          images: [String(f.get('image'))],
          published: f.get('published') === 'on',
        })
      }}
      className="card mt-4 grid gap-3 p-5 sm:grid-cols-2"
    >
      <input name="name" required placeholder="Nom" className="input sm:col-span-2" />
      <input name="sku" required placeholder="SKU" className="input" />
      <input name="brand" placeholder="Marque" className="input" />
      <input name="category" required placeholder="Catégorie (ex: composants)" className="input" />
      <input name="subcategory" required placeholder="Sous-catégorie (ex: GPU)" className="input" />
      <input name="price" required type="number" step="0.01" placeholder="Prix" className="input" />
      <input name="cost" type="number" step="0.01" placeholder="Coût d'achat" className="input" />
      <input name="stock" type="number" placeholder="Stock" className="input" />
      <input name="image" required type="url" placeholder="URL image" className="input" />
      <textarea name="description" required placeholder="Description" className="input sm:col-span-2" rows={2} />
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input name="published" type="checkbox" defaultChecked /> Publier immédiatement
      </label>
      {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary sm:col-span-2">
        {pending ? '…' : 'Créer l’article'}
      </button>
    </form>
  )
}
