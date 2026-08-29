'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useCartStore } from '@/store/cart'
import { useSettings } from '@/hooks/useSettings'
import type { Build } from '@/types'
import {
  CONFIG_SLOTS,
  checkCompatibility,
  incompatibleIds,
  performanceTier,
  type ConfigCatalog,
  type Selection,
  type SlotKey,
} from '@/lib/configurator'
import { downloadConfigSheet } from '@/lib/config-sheet'
import type { Product } from '@/types'
import { SlotPicker } from '@/components/configurator/SlotPicker'
import { ConfigSummary, type SummaryLine } from '@/components/configurator/ConfigSummary'

function ConfiguratorInner() {
  const router = useRouter()
  const buildId = useSearchParams().get('build')
  const addItem = useCartStore((s) => s.addItem)
  const { assemblyFee } = useSettings()
  const [selection, setSelection] = useState<Selection>({})
  const [busy, setBusy] = useState(false)
  const preloaded = useRef(false)

  const { data, isLoading } = useQuery({
    queryKey: ['configurator'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ catalog: ConfigCatalog }>('/configurator')
      return data.catalog
    },
  })

  const baseBuild = useQuery({
    queryKey: ['build', buildId],
    queryFn: async () => (await apiClient.get<Build>(`/builds/${buildId}`)).data,
    enabled: Boolean(buildId),
  })

  // Pré-remplit la sélection à partir d'un modèle (?build=...)
  useEffect(() => {
    if (preloaded.current || !baseBuild.data) return
    const next: Selection = {}
    for (const part of baseBuild.data.parts) {
      next[part.slot as SlotKey] = { productId: part.productId, color: part.color }
    }
    setSelection(next)
    preloaded.current = true
  }, [baseBuild.data])

  const assembly = useQuery({
    queryKey: ['product', 'assemblage-cablage-test'],
    queryFn: async () => {
      const { data } = await apiClient.get<Product>('/products/assemblage-cablage-test')
      return data
    },
  })

  const catalog = data
  const bad = useMemo(
    () => (catalog ? incompatibleIds(catalog, selection) : ({} as Record<SlotKey, Set<string>>)),
    [catalog, selection],
  )
  const report = useMemo(
    () =>
      catalog
        ? checkCompatibility(catalog, selection)
        : { errors: [], warnings: [], estimatedWatts: 0, recommendedPsu: 0 },
    [catalog, selection],
  )

  const productFor = (slot: SlotKey): Product | undefined => {
    const id = selection[slot]?.productId
    return id ? catalog?.[slot]?.find((p) => p.id === id) : undefined
  }

  const lines: SummaryLine[] = CONFIG_SLOTS.flatMap(({ key, label }) => {
    const p = productFor(key)
    if (!p) return []
    return [{ slot: label, name: p.name, color: selection[key]?.color, price: p.discountPrice ?? p.price }]
  })

  const componentsTotal = lines.reduce((s, l) => s + l.price, 0)
  const total = componentsTotal + assemblyFee

  const missing = CONFIG_SLOTS.filter((s) => s.required && !selection[s.key]).map((s) => s.label)

  function handleAddToCart() {
    if (!catalog) return
    setBusy(true)
    try {
      CONFIG_SLOTS.forEach(({ key }) => {
        const p = productFor(key)
        if (!p) return
        const color = selection[key]?.color
        addItem({
          id: `${p.id}${color ? `-${color}` : ''}`,
          productId: p.id,
          name: color ? `${p.name} — ${color}` : p.name,
          slug: p.slug,
          price: p.discountPrice ?? p.price,
          image: p.thumbnail,
          stock: p.stock,
        })
      })
      if (assembly.data) {
        addItem({
          id: assembly.data.id,
          productId: assembly.data.id,
          name: assembly.data.name,
          slug: assembly.data.slug,
          price: assembly.data.price,
          image: assembly.data.thumbnail,
          stock: assembly.data.stock,
        })
      }
      router.push('/cart')
    } finally {
      setBusy(false)
    }
  }

  function handleDownload() {
    void downloadConfigSheet({
      lines: [
        ...lines.map((l) => ({ slot: l.slot, name: l.name, detail: l.color, price: l.price })),
        { slot: 'Assemblage', name: 'Assemblage, câblage & test 48h', price: assemblyFee },
      ],
      total,
      estimatedWatts: report.estimatedWatts,
      performance: performanceTier(productFor('GPU')),
      warnings: [...report.errors, ...report.warnings],
    })
  }

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">Configurateur PC</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Composez votre configuration sur mesure : choisissez la marque, le modèle et la finition de
        chaque composant. La compatibilité et la consommation sont vérifiées en temps réel.
      </p>
      {baseBuild.data && (
        <p className="mt-3 inline-block rounded bg-white/5 px-3 py-1 text-sm text-muted">
          Basé sur le modèle <span className="text-light">{baseBuild.data.name}</span> — modifiez ce
          que vous voulez.
        </p>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {isLoading || !catalog ? (
            <p className="text-muted">Chargement du catalogue…</p>
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

        <ConfigSummary
          lines={lines}
          total={total}
          assemblyFee={assemblyFee}
          report={report}
          performance={performanceTier(productFor('GPU'))}
          missing={missing}
          onAddToCart={handleAddToCart}
          onDownload={handleDownload}
          busy={busy}
        />
      </div>
    </div>
  )
}

export default function ConfiguratorPage() {
  return (
    <Suspense fallback={<div className="container-page py-12 text-muted">Chargement…</div>}>
      <ConfiguratorInner />
    </Suspense>
  )
}
