import { ASSEMBLY_FEE } from './constants'
import type { Build, BuildPart } from '@/types'

/**
 * Sérialise un Build Mongoose avec ses composants peuplés.
 * `productMap` : id produit -> document produit lean.
 */
export function serializeBuild(doc: any, productMap: Map<string, any>): Build {
  const parts: BuildPart[] = (doc.parts ?? [])
    .map((p: any) => {
      const prod = productMap.get(String(p.productId))
      if (!prod) return null
      return {
        slot: p.slot,
        productId: String(p.productId),
        color: p.color ?? undefined,
        name: prod.name,
        brand: prod.brand ?? undefined,
        slug: prod.slug,
        image: prod.thumbnail,
        price: prod.discountPrice ?? prod.price,
        stock: prod.stock ?? 0,
      }
    })
    .filter(Boolean) as BuildPart[]

  const componentsTotal = parts.reduce((s, p) => s + p.price, 0)
  const markupPct = doc.markupPct ?? 0
  const price = Math.round(componentsTotal * (1 + markupPct / 100) + ASSEMBLY_FEE)

  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    usage: doc.usage,
    description: doc.description ?? '',
    heroImage: doc.heroImage ?? parts[0]?.image,
    parts,
    markupPct,
    componentsTotal: Math.round(componentsTotal),
    assemblyFee: ASSEMBLY_FEE,
    price,
    published: Boolean(doc.published),
    featured: Boolean(doc.featured),
    inStock: parts.length > 0 && parts.every((p) => p.stock > 0),
    createdAt: new Date(doc.createdAt).toISOString(),
  }
}
