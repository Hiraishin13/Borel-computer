'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { formatPrice, cn } from '@/lib/utils'
import { PC_USAGES, usageLabel } from '@/lib/constants'
import {
  CONFIG_SLOTS,
  incompatibleIds,
  checkCompatibility,
  type ConfigCatalog,
  type Selection,
  type SlotKey,
} from '@/lib/configurator'
import { SlotPicker } from '@/components/configurator/SlotPicker'
import type { Build } from '@/types'

export default function AdminBuildsPage() {
  const qc = useQueryClient()
  const [creating, setCreating] = useState(false)

  const builds = useQuery({
    queryKey: ['admin', 'builds'],
    queryFn: async () => (await apiClient.get<{ data: Build[] }>('/admin/builds')).data.data,
  })

  const patch = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      apiClient.patch(`/admin/builds/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'builds'] }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/builds/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'builds'] }),
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">PC configurés</h1>
          <p className="text-sm text-muted">
            Assemblez des configurations types et publiez-les par usage.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setCreating((v) => !v)}>
          {creating ? 'Fermer' : 'Nouveau PC'}
        </button>
      </div>

      {creating && <BuildEditor onDone={() => setCreating(false)} />}

      <div className="mt-8 space-y-3">
        {builds.data?.length === 0 && (
          <p className="text-sm text-muted">Aucune configuration pour le moment.</p>
        )}
        {builds.data?.map((b) => (
          <div key={b.id} className="card flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <p className="font-semibold">{b.name}</p>
              <p className="text-xs text-muted">
                {usageLabel(b.usage)} · {b.parts.length} composants ·{' '}
                {b.inStock ? 'en stock' : <span className="text-danger">rupture</span>}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-accent">{formatPrice(b.price)}</span>
              <button
                onClick={() => patch.mutate({ id: b.id, body: { published: !b.published } })}
                className={cn(
                  'inline-flex h-5 w-9 items-center rounded-full px-0.5 transition-colors',
                  b.published ? 'justify-end bg-success' : 'justify-start bg-white/20',
                )}
                aria-label="Publier"
              >
                <span className="h-4 w-4 rounded-full bg-white" />
              </button>
              <button
                onClick={() => remove.mutate(b.id)}
                className="text-xs text-muted hover:text-danger"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BuildEditor({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient()
  const [selection, setSelection] = useState<Selection>({})
  const [error, setError] = useState<string | null>(null)

  const { data: catalog } = useQuery({
    queryKey: ['configurator'],
    queryFn: async () =>
      (await apiClient.get<{ catalog: ConfigCatalog }>('/configurator')).data.catalog,
  })

  const bad = useMemo(
    () => (catalog ? incompatibleIds(catalog, selection) : ({} as Record<SlotKey, Set<string>>)),
    [catalog, selection],
  )
  const report = catalog
    ? checkCompatibility(catalog, selection)
    : { errors: [] as string[], warnings: [] as string[], estimatedWatts: 0, recommendedPsu: 0 }

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiClient.post('/admin/builds', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'builds'] })
      onDone()
    },
    onError: (e) => setError(e instanceof Error ? e.message : 'Erreur'),
  })

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const parts = CONFIG_SLOTS.flatMap(({ key }) => {
      const sel = selection[key]
      return sel ? [{ slot: key, productId: sel.productId, color: sel.color }] : []
    })
    if (parts.length < 4) {
      setError('Sélectionnez au moins le CPU, la carte mère, le GPU, la RAM et le stockage.')
      return
    }
    create.mutate({
      name: f.get('name'),
      usage: f.get('usage'),
      description: f.get('description') || '',
      heroImage: f.get('heroImage') || '',
      markupPct: Number(f.get('markupPct')) || 0,
      published: f.get('published') === 'on',
      parts,
    })
  }

  return (
    <form onSubmit={submit} className="card mt-4 space-y-5 p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required placeholder="Nom (ex: Borel Arena RTX 4070)" className="input" />
        <select name="usage" className="input" defaultValue="gaming">
          {PC_USAGES.map((u) => (
            <option key={u.slug} value={u.slug}>
              {u.label}
            </option>
          ))}
        </select>
        <input name="heroImage" type="url" placeholder="URL image (optionnel)" className="input" />
        <input
          name="markupPct"
          type="number"
          step="1"
          defaultValue={0}
          placeholder="Marge % sur composants"
          className="input"
        />
        <textarea
          name="description"
          placeholder="Description"
          rows={2}
          className="input sm:col-span-2"
        />
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input name="published" type="checkbox" /> Publier immédiatement
        </label>
      </div>

      <div className="space-y-4">
        {!catalog ? (
          <p className="text-sm text-muted">Chargement du catalogue…</p>
        ) : (
          CONFIG_SLOTS.map(({ key, label, required }) => (
            <SlotPicker
              key={key}
              label={label}
              required={required}
              products={catalog[key] ?? []}
              selection={selection[key]}
              incompatible={bad[key] ?? new Set()}
              onSelect={(value) =>
                setSelection((prev) => {
                  const next = { ...prev }
                  if (value) next[key] = value
                  else delete next[key]
                  return next
                })
              }
            />
          ))
        )}
      </div>

      {report.errors.map((er) => (
        <p key={er} className="text-sm text-danger">
          ⚠ {er}
        </p>
      ))}
      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={create.isPending || report.errors.length > 0}
        className="btn-primary"
      >
        {create.isPending ? '…' : 'Enregistrer la configuration'}
      </button>
    </form>
  )
}
