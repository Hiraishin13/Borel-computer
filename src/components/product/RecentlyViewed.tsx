'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useBehaviorStore } from '@/store/behavior'
import { formatPrice } from '@/lib/utils'

/** Bande "Vus récemment" alimentée par l'historique local. */
export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const views = useBehaviorStore((s) => s.views)
  const items = views.filter((v) => v.slug !== excludeSlug).slice(0, 8)

  if (items.length < 2) return null

  return (
    <section className="mt-16">
      <h2 className="text-xl font-bold">Vus récemment</h2>
      <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
        {items.map((v) => (
          <Link
            key={v.slug}
            href={`/products/${v.slug}`}
            className="group w-40 shrink-0"
          >
            <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
              <Image
                src={v.image}
                alt={v.name}
                fill
                sizes="160px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-light group-hover:text-accent">{v.name}</p>
            <p className="text-xs text-accent">{formatPrice(v.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
