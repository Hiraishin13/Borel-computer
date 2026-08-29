import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Product } from '@/models/Product'
import { Order } from '@/models/Order'
import { requireAdmin } from '@/lib/auth'
import { productSchema } from '@/lib/validators'
import { slugify } from '@/lib/utils'
import { handle, ok } from '@/lib/api-response'

export const GET = handle(async (request: NextRequest) => {
  requireAdmin(request)
  await connectDB()

  const sp = request.nextUrl.searchParams
  const filter: Record<string, unknown> = {}
  if (sp.get('category')) filter.category = sp.get('category')
  if (sp.get('published') === 'false') filter.published = false
  if (sp.get('published') === 'true') filter.published = { $ne: false }
  if (sp.get('search')) filter.name = { $regex: sp.get('search'), $options: 'i' }

  const [docs, sold] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).limit(300).lean(),
    Order.aggregate<{ _id: unknown; units: number; revenue: number }>([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          units: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
    ]),
  ])

  const soldMap = new Map(sold.map((s) => [String(s._id), s]))

  const data = docs.map((d) => {
    const price = d.discountPrice ?? d.price
    const cost = d.cost ?? 0
    const s = soldMap.get(String(d._id))
    return {
      id: String(d._id),
      sku: d.sku,
      name: d.name,
      brand: d.brand ?? null,
      category: d.category,
      subcategory: d.subcategory,
      price: d.price,
      discountPrice: d.discountPrice ?? null,
      cost,
      marginUnit: Math.round((price - cost) * 100) / 100,
      marginPct: price > 0 ? Math.round(((price - cost) / price) * 1000) / 10 : 0,
      stock: d.stock ?? 0,
      published: d.published !== false,
      featured: Boolean(d.featured),
      unitsSold: s?.units ?? 0,
      revenue: Math.round(s?.revenue ?? 0),
      thumbnail: d.thumbnail,
    }
  })

  return ok({ data, total: data.length })
})

export const POST = handle(async (request: NextRequest) => {
  requireAdmin(request)
  await connectDB()

  const body = productSchema.parse(await request.json())
  const doc = await Product.create({
    ...body,
    slug: slugify(`${body.name}-${body.sku}`),
    thumbnail: body.images[0],
    currency: 'USD',
  })

  return ok({ id: String(doc._id) }, 201)
})

export const dynamic = 'force-dynamic'
