'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'
import { usePagination } from '@/hooks/usePagination'
import { Pagination } from '@/components/ui/Pagination'
import { Loader } from '@/components/ui/Loader'

interface Promo {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  description: string
  maxUses: number
  usedCount: number
  validFrom: string
  validUntil: string
  minPurchase: number
  applicableCategories: string[]
  active: boolean
}

export default function AdminPromosPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'promos'],
    queryFn: async () => (await apiClient.get<{ data: Promo[] }>('/admin/promos')).data.data,
  })

  const create = useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiClient.post('/admin/promos', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'promos'] })
      setShowForm(false)
    },
  })

  const patch = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      apiClient.patch(`/admin/promos/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'promos'] }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/promos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'promos'] }),
  })

  const promos = data ?? []
  const { page, setPage, pageCount, pageItems } = usePagination(promos, 10)

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Promotions</h1>
          <p className="text-sm text-muted">{promos.length} codes</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Fermer' : 'Nouveau code'}
        </button>
      </div>

      {showForm && (
        <PromoForm
          onSubmit={(p) => create.mutate(p)}
          pending={create.isPending}
          error={create.error instanceof Error ? create.error.message : null}
        />
      )}

      {isLoading ? (
        <Loader />
      ) : promos.length === 0 ? (
        <p className="mt-8 text-sm text-muted">Aucun code promo.</p>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-white/10 text-left text-xs text-muted">
                <tr>
                  <th className="py-2 font-normal">Code</th>
                  <th className="py-2 font-normal">Réduction</th>
                  <th className="py-2 font-normal">Conditions</th>
                  <th className="py-2 text-right font-normal">Utilisations</th>
                  <th className="py-2 font-normal">Validité</th>
                  <th className="py-2 text-center font-normal">Actif</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {pageItems.map((p) => {
                  const expired = new Date(p.validUntil) < new Date()
                  return (
                    <tr key={p.id} className={cn(expired && 'opacity-50')}>
                      <td className="py-2 font-mono font-semibold">{p.code}</td>
                      <td className="py-2">
                        {p.type === 'percentage' ? `-${p.value}%` : `-${formatPrice(p.value)}`}
                      </td>
                      <td className="py-2 text-xs text-muted">
                        {p.minPurchase > 0 ? `dès ${formatPrice(p.minPurchase)}` : 'sans minimum'}
                        {p.applicableCategories.length > 0 &&
                          ` · ${p.applicableCategories.join(', ')}`}
                      </td>
                      <td className="py-2 text-right">
                        {p.usedCount}
                        {p.maxUses > 0 ? ` / ${p.maxUses}` : ''}
                      </td>
                      <td className="py-2 text-xs text-muted">
                        {expired ? 'Expiré' : `jusqu'au ${formatDate(p.validUntil)}`}
                      </td>
                      <td className="py-2 text-center">
                        <button
                          onClick={() => patch.mutate({ id: p.id, body: { active: !p.active } })}
                          className={cn(
                            'inline-flex h-5 w-9 items-center rounded-full px-0.5 transition-colors',
                            p.active ? 'justify-end bg-success' : 'justify-start bg-white/20',
                          )}
                          aria-label="Activer"
                        >
                          <span className="h-4 w-4 rounded-full bg-white" />
                        </button>
                      </td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => remove.mutate(p.id)}
                          className="text-xs text-muted hover:text-danger"
                        >
                          Suppr.
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageCount={pageCount} onChange={setPage} className="mt-6" />
        </>
      )}
    </div>
  )
}

function PromoForm({
  onSubmit,
  pending,
  error,
}: {
  onSubmit: (p: Record<string, unknown>) => void
  pending: boolean
  error: string | null
}) {
  const today = new Date().toISOString().slice(0, 10)
  const in90 = new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        onSubmit({
          code: f.get('code'),
          type: f.get('type'),
          value: Number(f.get('value')),
          description: f.get('description') || '',
          maxUses: Number(f.get('maxUses')) || 0,
          minPurchase: Number(f.get('minPurchase')) || 0,
          validFrom: f.get('validFrom'),
          validUntil: f.get('validUntil'),
          applicableCategories: f.getAll('categories').map(String),
          active: true,
        })
      }}
      className="card mt-4 grid gap-3 p-5 sm:grid-cols-2"
    >
      <input name="code" required placeholder="CODE (ex: RENTREE10)" className="input uppercase" />
      <select name="type" className="input" defaultValue="percentage">
        <option value="percentage">Pourcentage (%)</option>
        <option value="fixed">Montant fixe ($)</option>
      </select>
      <input name="value" required type="number" step="0.01" placeholder="Valeur" className="input" />
      <input
        name="minPurchase"
        type="number"
        step="0.01"
        placeholder="Achat minimum ($)"
        className="input"
      />
      <input name="maxUses" type="number" placeholder="Utilisations max (0 = illimité)" className="input" />
      <input name="description" placeholder="Description interne" className="input" />
      <label className="text-xs text-muted">
        Valable du
        <input name="validFrom" type="date" defaultValue={today} className="input mt-1" />
      </label>
      <label className="text-xs text-muted">
        au
        <input name="validUntil" type="date" defaultValue={in90} className="input mt-1" />
      </label>
      <fieldset className="sm:col-span-2">
        <legend className="text-xs text-muted">Catégories concernées (aucune = toutes)</legend>
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          {CATEGORIES.map((c) => (
            <label key={c.slug} className="flex items-center gap-1.5">
              <input type="checkbox" name="categories" value={c.slug} /> {c.label}
            </label>
          ))}
        </div>
      </fieldset>
      {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary sm:col-span-2">
        {pending ? '…' : 'Créer le code'}
      </button>
    </form>
  )
}
