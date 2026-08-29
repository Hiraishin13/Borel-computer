import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Product } from '@/models/Product'
import { requireAdmin } from '@/lib/auth'
import { productSchema } from '@/lib/validators'
import { serializeProduct } from '@/lib/serializers'
import { slugify } from '@/lib/utils'
import { handle, ok } from '@/lib/api-response'

export const GET = handle(async (request: NextRequest) => {
  await connectDB()
  const sp = request.nextUrl.searchParams

  const page = Math.max(1, Number(sp.get('page') ?? 1))
  const limit = Math.min(60, Math.max(1, Number(sp.get('limit') ?? 20)))
  const sortBy = sp.get('sortBy') ?? 'createdAt'
  const order = sp.get('order') === 'asc' ? 1 : -1

  // Catalogue public : articles publiés uniquement, hors prestations de service.
  const query: Record<string, unknown> = {
    category: { $ne: 'services' },
    published: { $ne: false },
  }
  if (sp.get('category')) query.category = sp.get('category')
  if (sp.get('subcategory')) query.subcategory = sp.get('subcategory')
  if (sp.get('featured')) query.featured = true
  const min = sp.get('minPrice')
  const max = sp.get('maxPrice')
  if (min || max) {
    query.price = {
      ...(min ? { $gte: Number(min) } : {}),
      ...(max ? { $lte: Number(max) } : {}),
    }
  }
  const search = sp.get('search')
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ]
  }

  const [docs, total] = await Promise.all([
    Product.find(query)
      .sort({ [sortBy]: order })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ])

  return ok({
    data: docs.map(serializeProduct),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
})

export const POST = handle(async (request: NextRequest) => {
  requireAdmin(request)
  await connectDB()

  const body = productSchema.parse(await request.json())
  const doc = await Product.create({
    ...body,
    slug: slugify(body.name),
    thumbnail: body.images[0],
  })

  return ok(serializeProduct(doc.toObject()), 201)
})
