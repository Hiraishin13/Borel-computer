import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Product } from '@/models/Product'
import { serializeProduct } from '@/lib/serializers'
import { normalizeText } from '@/lib/utils'
import { handle, ok } from '@/lib/api-response'

export const GET = handle(async (request: NextRequest) => {
  const sp = request.nextUrl.searchParams
  const q = sp.get('q')?.trim()
  if (!q) return ok({ data: [], total: 0 })

  await connectDB()
  const started = Date.now()

  // recherche insensible à la casse ET aux accents via le champ searchText normalisé
  const terms = normalizeText(q)
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

  const filter: Record<string, unknown> = {
    published: { $ne: false },
    category: { $ne: 'services' },
    $and: terms.map((t) => ({ searchText: { $regex: t } })),
  }
  if (sp.get('category')) filter.category = sp.get('category')

  const docs = await Product.find(filter).sort({ rating: -1, reviews: -1 }).limit(24).lean()

  return ok({
    data: docs.map(serializeProduct),
    total: docs.length,
    time: (Date.now() - started) / 1000,
  })
})

export const dynamic = 'force-dynamic'
