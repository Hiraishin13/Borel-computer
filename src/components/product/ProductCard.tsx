'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Product } from '@/types'
import { cn, discountPercent, formatPrice } from '@/lib/utils'
import { fadeInUp } from '@/lib/animations'
import { Badge } from '@/components/ui/Badge'
import { RatingStars } from '@/components/ui/RatingStars'
import { useCartStore } from '@/store/cart'
import { useBehaviorStore } from '@/store/behavior'

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const addItem = useCartStore((s) => s.addItem)
  const recordCartAdd = useBehaviorStore((s) => s.recordCartAdd)
  const off = discountPercent(product.price, product.discountPrice)
  const price = product.discountPrice ?? product.price

  return (
    <motion.article
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className="group card overflow-hidden"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-primary">
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex gap-2">
            {product.featured && <Badge tone="accent">Vedette</Badge>}
            {off && <Badge tone="danger">-{off}%</Badge>}
          </div>
        </div>
      </Link>

      <div className="p-4">
        <p className="text-xs uppercase tracking-wider text-muted">{product.subcategory}</p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-1 line-clamp-2 font-sans text-sm font-semibold text-light hover:text-accent">
            {product.name}
          </h3>
        </Link>

        <RatingStars rating={product.rating} count={product.reviews} className="mt-2" />

        <div className="mt-3 flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-accent">{formatPrice(price)}</span>
            {off && (
              <span className="text-xs text-muted line-through">{formatPrice(product.price)}</span>
            )}
          </div>
          <span
            className={cn(
              'text-xs',
              product.stock > 10 ? 'text-success' : product.stock > 0 ? 'text-warning' : 'text-danger',
            )}
          >
            {product.stock > 10 ? 'En stock' : product.stock > 0 ? `Plus que ${product.stock}` : 'Rupture'}
          </span>
        </div>

        <button
          type="button"
          disabled={product.stock === 0}
          onClick={() => {
            addItem({
              id: `${product.id}`,
              productId: product.id,
              name: product.name,
              slug: product.slug,
              price,
              image: product.thumbnail,
              stock: product.stock,
            })
            recordCartAdd({ brand: product.brand, subcategory: product.subcategory })
          }}
          className="btn-primary mt-4 w-full"
        >
          Ajouter au panier
        </button>
      </div>
    </motion.article>
  )
}
