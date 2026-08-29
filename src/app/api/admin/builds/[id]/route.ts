import { NextRequest } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/mongodb'
import { Build } from '@/models/Build'
import { Product } from '@/models/Product'
import { requireAdmin } from '@/lib/auth'
import { serializeBuild } from '@/lib/build-serializer'
import { handle, ok, fail } from '@/lib/api-response'

type Params = { params: { id: string } }

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  usage: z.string().optional(),
  description: z.string().optional(),
  heroImage: z.string().optional(),
  markupPct: z.number().min(0).max(200).optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  parts: z
    .array(
      z.object({
        slot: z.string().min(1),
        productId: z.string().min(1),
        color: z.string().optional(),
      }),
    )
    .optional(),
})

export const PATCH = handle(async (request: NextRequest, { params }: Params) => {
  requireAdmin(request)
  await connectDB()
  const body = patchSchema.parse(await request.json())

  const doc = await Build.findByIdAndUpdate(params.id, body, { new: true }).lean()
  if (!doc) return fail('NOT_FOUND', 'Configuration non trouvée', 404)

  const products = await Product.find({
    _id: { $in: (doc.parts ?? []).map((p) => p.productId) },
  }).lean()
  const map = new Map(products.map((p) => [String(p._id), p]))

  return ok(serializeBuild(doc, map))
})

export const DELETE = handle(async (request: NextRequest, { params }: Params) => {
  requireAdmin(request)
  await connectDB()
  const doc = await Build.findByIdAndDelete(params.id)
  if (!doc) return fail('NOT_FOUND', 'Configuration non trouvée', 404)
  return ok({ message: 'Configuration supprimée' })
})

export const dynamic = 'force-dynamic'
