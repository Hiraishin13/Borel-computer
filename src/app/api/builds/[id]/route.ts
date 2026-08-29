import { NextRequest } from 'next/server'
import { isValidObjectId } from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { Build } from '@/models/Build'
import { Product } from '@/models/Product'
import { serializeBuild } from '@/lib/build-serializer'
import { getSettings } from '@/lib/settings'
import { handle, ok, fail } from '@/lib/api-response'

export const GET = handle(
  async (_request: NextRequest, { params }: { params: { id: string } }) => {
    await connectDB()

    const query = isValidObjectId(params.id) ? { _id: params.id } : { slug: params.id }
    const build = await Build.findOne(query).lean()
    if (!build || !build.published) return fail('NOT_FOUND', 'Configuration non trouvée', 404)

    const [products, cfg] = await Promise.all([
      Product.find({ _id: { $in: (build.parts ?? []).map((p) => p.productId) } }).lean(),
      getSettings(),
    ])
    const map = new Map(products.map((p) => [String(p._id), p]))

    return ok(serializeBuild(build, map, cfg.assemblyFee))
  },
)

export const dynamic = 'force-dynamic'
