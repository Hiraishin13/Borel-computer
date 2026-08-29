'use client'

import { useMemo, useState } from 'react'
import { formatPrice } from '@/lib/utils'

/** Minimal PC configurator skeleton — component data would come from /api/products?category=composants. */
const PARTS = {
  cpu: [
    { id: 'r5', name: 'AMD Ryzen 5 7600X', price: 249 },
    { id: 'r7', name: 'AMD Ryzen 7 7800X3D', price: 419 },
    { id: 'i7', name: 'Intel Core i7-14700K', price: 429 },
  ],
  gpu: [
    { id: '4060', name: 'GeForce RTX 4060 Ti', price: 449 },
    { id: '4070s', name: 'GeForce RTX 4070 Super', price: 659 },
    { id: '4080s', name: 'GeForce RTX 4080 Super', price: 1109 },
  ],
  ram: [
    { id: '16', name: '16 Go DDR5 6000', price: 69 },
    { id: '32', name: '32 Go DDR5 6000', price: 129 },
    { id: '64', name: '64 Go DDR5 6000', price: 259 },
  ],
  storage: [
    { id: '1tb', name: 'SSD NVMe 1 To Gen4', price: 89 },
    { id: '2tb', name: 'SSD NVMe 2 To Gen4', price: 159 },
  ],
} as const

type PartKey = keyof typeof PARTS
const LABELS: Record<PartKey, string> = {
  cpu: 'Processeur',
  gpu: 'Carte graphique',
  ram: 'Mémoire',
  storage: 'Stockage',
}

export default function ConfiguratorPage() {
  const [selection, setSelection] = useState<Record<PartKey, string>>({
    cpu: PARTS.cpu[0].id,
    gpu: PARTS.gpu[0].id,
    ram: PARTS.ram[0].id,
    storage: PARTS.storage[0].id,
  })

  const total = useMemo(() => {
    return (Object.keys(PARTS) as PartKey[]).reduce((sum, key) => {
      const part = PARTS[key].find((p) => p.id === selection[key])
      return sum + (part?.price ?? 0)
    }, 150) // montage + boîtier + alim de base
  }, [selection])

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">Configurateur PC</h1>
      <p className="mt-2 text-muted">Composez votre configuration sur mesure, assemblée par nos techniciens.</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          {(Object.keys(PARTS) as PartKey[]).map((key) => (
            <div key={key}>
              <p className="mb-3 text-sm font-semibold">{LABELS[key]}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {PARTS[key].map((part) => (
                  <button
                    key={part.id}
                    onClick={() => setSelection((s) => ({ ...s, [key]: part.id }))}
                    className={`card p-4 text-left text-sm transition-colors ${
                      selection[key] === part.id ? 'border-accent' : 'hover:border-white/30'
                    }`}
                  >
                    <span className="block font-medium">{part.name}</span>
                    <span className="mt-1 block text-accent">{formatPrice(part.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="card h-fit p-6">
          <h2 className="text-lg font-semibold">Votre configuration</h2>
          <dl className="mt-4 space-y-2 text-sm text-muted">
            {(Object.keys(PARTS) as PartKey[]).map((key) => {
              const part = PARTS[key].find((p) => p.id === selection[key])
              return (
                <div key={key} className="flex justify-between">
                  <dt>{LABELS[key]}</dt>
                  <dd className="text-right text-light">{part?.name}</dd>
                </div>
              )
            })}
            <div className="flex justify-between">
              <dt>Assemblage + boîtier</dt>
              <dd className="text-light">{formatPrice(150)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between border-t border-white/10 pt-4 text-base font-bold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <button className="btn-primary mt-6 w-full">Ajouter au panier</button>
        </div>
      </div>
    </div>
  )
}
