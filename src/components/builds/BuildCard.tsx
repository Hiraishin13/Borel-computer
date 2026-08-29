'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Build } from '@/types'
import { formatPrice } from '@/lib/utils'
import { fadeInUp } from '@/lib/animations'
import { Badge } from '@/components/ui/Badge'
import { useCartStore } from '@/store/cart'

const KEY_SLOTS = ['CPU', 'GPU', 'RAM', 'Stockage']

export function BuildCard({ build, index = 0 }: { build: Build; index?: number }) {
  const addItem = useCartStore((s) => s.addItem)

  const highlights = KEY_SLOTS.map((slot) => build.parts.find((p) => p.slot === slot)?.name).filter(
    Boolean,
  ) as string[]

  function addAll() {
    build.parts.forEach((p) => {
      addItem({
        id: `${p.productId}${p.color ? `-${p.color}` : ''}`,
        productId: p.productId,
        name: p.color ? `${p.name} — ${p.color}` : p.name,
        slug: p.slug,
        price: p.price,
        image: p.image,
        stock: p.stock,
      })
    })
  }

  return (
    <motion.article
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className="card flex flex-col overflow-hidden"
    >
      <div className="relative aspect-[16/10] bg-primary">
        {build.heroImage && (
          <Image
            src={build.heroImage}
            alt={build.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          {build.featured && <Badge tone="accent">Populaire</Badge>}
          {!build.inStock && <Badge tone="danger">Rupture</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-semibold">{build.name}</h3>
        <ul className="mt-2 space-y-0.5 text-xs text-muted">
          {highlights.map((h) => (
            <li key={h} className="truncate">
              • {h}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-accent">{formatPrice(build.price)}</p>
            <p className="text-[11px] text-muted">assemblage &amp; test inclus</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={addAll} disabled={!build.inStock} className="btn-primary flex-1">
            Ajouter au panier
          </button>
          <Link
            href={`/configurator?build=${build.id}`}
            className="btn-secondary shrink-0"
            title="Personnaliser"
          >
            Personnaliser
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
