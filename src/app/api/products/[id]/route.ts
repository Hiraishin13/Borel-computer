import { NextRequest } from 'next/server'
import { isValidObjectId } from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { Product } from '@/models/Product'
import { requireAdmin } from '@/lib/auth'
import { serializeProduct } from '@/lib/serializers'
import { productUpdateSchema } from '@/lib/validators'
import { handle, ok, fail } from '@/lib/api-response'

type Params = { params: { id: string } }

/** `id` may be a Mongo ObjectId or a slug. */
function byIdOrSlug(id: string) {
  return isValidObjectId(id) ? { _id: id } : { slug: id }
}

export const GET = handle(async (_request: NextRequest, { params }: Params) => {
  await connectDB()
  const doc = await Product.findOne(byIdOrSlug(params.id)).lean()
  if (!doc) return fail('NOT_FOUND', 'Produit non trouvé', 404)
  return ok(serializeProduct(doc))
})

export const PATCH = handle(async (request: NextRequest, { params }: Params) => {
  requireAdmin(request)
  await connectDB()
  const updates: Record<string, unknown> = productUpdateSchema.parse(await request.json())
  if (Array.isArray(updates.images) && updates.images.length > 0 && !updates.thumbnail) {
    updates.thumbnail = updates.images[0]
  }
  const doc = await Product.findOneAndUpdate(byIdOrSlug(params.id), updates, { new: true }).lean()
  if (!doc) return fail('NOT_FOUND', 'Produit non trouvé', 404)
  return ok(serializeProduct(doc))
})

export const DELETE = handle(async (request: NextRequest, { params }: Params) => {
  requireAdmin(request)
  await connectDB()
  const doc = await Product.findOneAndDelete(byIdOrSlug(params.id))
  if (!doc) return fail('NOT_FOUND', 'Produit non trouvé', 404)
  return ok({ message: 'Produit supprimé' })
})
