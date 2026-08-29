'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useCartStore } from '@/store/cart'
import { ASSEMBLY_FEE } from '@/lib/constants'
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

export default function ConfiguratorPage() {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const [selection, setSelection] = useState<Selection>({})
  const [busy, setBusy] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['configurator'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ catalog: ConfigCatalog }>('/configurator')
      return data.catalog
    },
  })

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
  const total = componentsTotal + ASSEMBLY_FEE

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
        { slot: 'Assemblage', name: 'Assemblage, câblage & test 48h', price: ASSEMBLY_FEE },
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
