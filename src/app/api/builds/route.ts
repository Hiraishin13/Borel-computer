import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Build } from '@/models/Build'
import { Product } from '@/models/Product'
import { serializeBuild } from '@/lib/build-serializer'
import { getSettings } from '@/lib/settings'
import { handle, ok } from '@/lib/api-response'

export const GET = handle(async (request: NextRequest) => {
  await connectDB()

  const usage = request.nextUrl.searchParams.get('usage')
  const filter: Record<string, unknown> = { published: true }
  if (usage) filter.usage = usage

  const builds = await Build.find(filter).sort({ featured: -1, createdAt: -1 }).lean()

  const ids = builds.flatMap((b) => (b.parts ?? []).map((p) => p.productId))
  const [products, cfg] = await Promise.all([
    Product.find({ _id: { $in: ids } }).lean(),
    getSettings(),
  ])
  const map = new Map(products.map((p) => [String(p._id), p]))

  return ok({ data: builds.map((b) => serializeBuild(b, map, cfg.assemblyFee)) })
})

export const dynamic = 'force-dynamic'
