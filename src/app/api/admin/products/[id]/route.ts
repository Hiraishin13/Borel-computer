import { NextRequest } from 'next/server'
import { isValidObjectId } from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { Product } from '@/models/Product'
import { requireAdmin } from '@/lib/auth'
import { serializeProduct } from '@/lib/serializers'
import { handle, ok, fail } from '@/lib/api-response'

export const GET = handle(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    requireAdmin(request)
    await connectDB()

    const query = isValidObjectId(params.id) ? { _id: params.id } : { slug: params.id }
    const doc = await Product.findOne(query).lean()
    if (!doc) return fail('NOT_FOUND', 'Produit non trouvé', 404)

    return ok({ ...serializeProduct(doc), cost: doc.cost ?? 0 })
  },
)

export const dynamic = 'force-dynamic'
