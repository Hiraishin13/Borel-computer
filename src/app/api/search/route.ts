import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Product } from '@/models/Product'
import { serializeProduct } from '@/lib/serializers'
import { handle, ok } from '@/lib/api-response'

export const GET = handle(async (request: NextRequest) => {
  const sp = request.nextUrl.searchParams
  const q = sp.get('q')?.trim()
  if (!q) return ok({ data: [], total: 0 })

  await connectDB()
  const started = Date.now()

  const filter: Record<string, unknown> = {
    published: { $ne: false },
    category: { $ne: 'services' },
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } },
    ],
  }
  if (sp.get('category')) filter.category = sp.get('category')

  const docs = await Product.find(filter).limit(20).lean()

  return ok({
    data: docs.map(serializeProduct),
    total: docs.length,
    time: (Date.now() - started) / 1000,
  })
})

export const dynamic = 'force-dynamic'
