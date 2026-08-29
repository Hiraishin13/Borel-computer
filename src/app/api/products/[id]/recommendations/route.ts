import { NextRequest } from 'next/server'
import { isValidObjectId, Types } from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { Product } from '@/models/Product'
import { Order } from '@/models/Order'
import { serializeProduct } from '@/lib/serializers'
import { PARTNER_SUBCATEGORIES, wattsFromSpec } from '@/lib/recommendations'
import { handle, ok, fail } from '@/lib/api-response'
import type { Product as ProductType } from '@/types'

type Params = { params: { id: string } }

const csv = (v: string | null) =>
  (v ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

export const GET = handle(async (request: NextRequest, { params }: Params) => {
  await connectDB()

  const query = isValidObjectId(params.id) ? { _id: params.id } : { slug: params.id }
  const current = await Product.findOne(query).lean()
  if (!current) return fail('NOT_FOUND', 'Produit non trouvé', 404)

  const sp = request.nextUrl.searchParams
  const affinityBrands = csv(sp.get('brands'))
  const affinitySubs = csv(sp.get('subcategories'))
  const exclude = new Set([...csv(sp.get('exclude')), current.slug])

  const currentId = String(current._id)
  const base = {
    published: { $ne: false },
    category: { $ne: 'services' },
    stock: { $gt: 0 },
    _id: { $ne: current._id },
  }

  const specs =
    current.specifications instanceof Map
      ? Object.fromEntries(current.specifications)
      : ((current.specifications ?? {}) as Record<string, string>)

  // --- 1. Souvent achetés ensemble (co-achat) ---
  const coAgg = await Order.aggregate<{ _id: Types.ObjectId; score: number }>([
    {
      $match: {
        status: { $ne: 'cancelled' },
        'items.productId': new Types.ObjectId(currentId),
      },
    },
    { $unwind: '$items' },
    { $match: { 'items.productId': { $ne: new Types.ObjectId(currentId) } } },
    { $group: { _id: '$items.productId', score: { $sum: '$items.quantity' } } },
    { $sort: { score: -1 } },
    { $limit: 10 },
  ])

  const coProducts = coAgg.length
    ? await Product.find({ ...base, _id: { $in: coAgg.map((c) => c._id) } }).lean()
    : []
  const coOrder = new Map(coAgg.map((c, i) => [String(c._id), i]))
  const boughtTogether = coProducts
    .filter((p) => !exclude.has(p.slug))
    .sort((a, b) => (coOrder.get(String(a._id)) ?? 99) - (coOrder.get(String(b._id)) ?? 99))
    .slice(0, 4)
    .map(serializeProduct)
  boughtTogether.forEach((p) => exclude.add(p.slug))

  // --- 2. Compléter la configuration (composants complémentaires) ---
  const partners = PARTNER_SUBCATEGORIES[current.subcategory] ?? []
  let complete: ProductType[] = []
  if (partners.length) {
    const pool = await Product.find({
      ...base,
      subcategory: { $in: partners },
    })
      .sort({ rating: -1, reviews: -1 })
      .limit(40)
      .lean()

    const gpuWatts = wattsFromSpec(specs['TDP'] ?? specs['Puissance'])
    const perSub = new Map<string, number>()
    for (const p of pool) {
      if (exclude.has(p.slug)) continue
      // Si on complète un GPU avec une alim, filtrer sur le wattage
      if (current.subcategory === 'GPU' && p.subcategory === 'Alimentation' && gpuWatts) {
        const ps =
          p.specifications instanceof Map
            ? Object.fromEntries(p.specifications)
            : (p.specifications ?? {})
        if (wattsFromSpec((ps as Record<string, string>)['Puissance']) < gpuWatts + 250) continue
      }
      const n = perSub.get(p.subcategory) ?? 0
      if (n >= 2) continue
      perSub.set(p.subcategory, n + 1)
      complete.push(serializeProduct(p))
    }
    complete = complete.slice(0, 6)
    complete.forEach((p) => exclude.add(p.slug))
  }

  // --- 3. Recommandé pour vous / produits similaires ---
  const affinityAll = Array.from(new Set([current.subcategory, ...affinitySubs]))
  const similarPool = await Product.find({
    ...base,
    subcategory: { $in: affinityAll },
  })
    .limit(60)
    .lean()

  const price = current.discountPrice ?? current.price
  const scored = similarPool
    .filter((p) => !exclude.has(p.slug))
    .map((p) => {
      const pPrice = p.discountPrice ?? p.price
      let score = (p.rating ?? 0) * 2 + Math.log10((p.reviews ?? 0) + 1)
      if (p.subcategory === current.subcategory) score += 3
      if (p.brand && affinityBrands.includes(p.brand)) score += 4
      if (affinitySubs.includes(p.subcategory)) score += 2
      // proximité de prix (±40 %)
      const ratio = pPrice / price
      if (ratio > 0.6 && ratio < 1.4) score += 2
      return { p, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)

  const personalized = affinityBrands.length > 0 || affinitySubs.length > 0
  const similar = scored.map((s) => serializeProduct(s.p))

  return ok({
    boughtTogether,
    complete,
    similar,
    personalized,
  })
})

export const dynamic = 'force-dynamic'
