'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import type { Product } from '@/types'
import { cn, formatPrice } from '@/lib/utils'
import { colorOptions, type SlotSelection } from '@/lib/configurator'

export function SlotPicker({
  label,
  required,
  products,
  selection,
  onSelect,
  incompatible,
}: {
  label: string
  required: boolean
  products: Product[]
  selection: SlotSelection | undefined
  onSelect: (value: SlotSelection | undefined) => void
  /** ids de produits marqués incompatibles avec le reste de la config */
  incompatible: Set<string>
}) {
  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand).filter(Boolean))) as string[],
    [products],
  )
  const [brand, setBrand] = useState<string | null>(null)
  const visible = brand ? products.filter((p) => p.brand === brand) : products

  const selected = products.find((p) => p.id === selection?.productId)

  return (
    <section className="card p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">
          {label}
          {!required && <span className="ml-2 text-xs font-normal text-muted">(optionnel)</span>}
        </h2>
        {selected ? (
          <p className="text-sm text-muted">
            {selected.name}
            {selection?.color ? ` — ${selection.color}` : ''} ·{' '}
            <span className="text-accent">{formatPrice(selected.discountPrice ?? selected.price)}</span>
            <button onClick={() => onSelect(undefined)} className="ml-3 text-xs hover:text-danger">
              retirer
            </button>
          </p>
        ) : (
          <p className="text-sm text-muted">Non sélectionné</p>
        )}
      </header>

      {brands.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip active={brand === null} onClick={() => setBrand(null)}>
            Toutes marques
          </Chip>
          {brands.map((b) => (
            <Chip key={b} active={brand === b} onClick={() => setBrand(b)}>
              {b}
            </Chip>
          ))}
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {visible.map((p) => {
          const isSelected = selection?.productId === p.id
          const bad = incompatible.has(p.id)
          const colors = colorOptions(p)
          return (
            <button
              key={p.id}
              type="button"
              onClick={() =>
                onSelect(
                  isSelected
                    ? undefined
                    : { productId: p.id, color: colors[0] },
                )
              }
              className={cn(
                'flex gap-3 rounded-md border p-3 text-left transition-colors',
                isSelected ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-white/30',
                bad && !isSelected && 'opacity-50',
              )}
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-primary">
                <Image src={p.thumbnail} alt="" fill className="object-cover" sizes="56px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="mt-0.5 truncate text-xs text-muted">
                  {Object.values(p.specifications).slice(0, 2).join(' · ')}
                </p>
                <p className="mt-1 text-sm font-semibold text-accent">
                  {formatPrice(p.discountPrice ?? p.price)}
                </p>
                {bad && <p className="mt-1 text-xs text-danger">Incompatible</p>}

                {isSelected && colors.length > 1 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {colors.map((c) => (
                      <span
                        key={c}
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelect({ productId: p.id, color: c })
                        }}
                        className={cn(
                          'rounded px-2 py-0.5 text-[11px]',
                          selection?.color === c
                            ? 'bg-accent text-light'
                            : 'bg-white/10 text-muted hover:text-light',
                        )}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          )
        })}
        {visible.length === 0 && (
          <p className="col-span-full py-4 text-center text-sm text-muted">
            Aucun composant disponible.
          </p>
        )}
      </div>
    </section>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs transition-colors',
        active ? 'border-accent bg-accent text-light' : 'border-white/15 text-muted hover:text-light',
      )}
    >
      {children}
    </button>
  )
}
