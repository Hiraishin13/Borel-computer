import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Promo } from '@/models/Promo'
import { requireAdmin } from '@/lib/auth'
import { promoUpdateSchema } from '@/lib/validators'
import { handle, ok, fail } from '@/lib/api-response'

type Params = { params: { id: string } }

export const PATCH = handle(async (request: NextRequest, { params }: Params) => {
  requireAdmin(request)
  await connectDB()
  const body = promoUpdateSchema.parse(await request.json())

  const update: Record<string, unknown> = { ...body }
  if (body.validUntil) update.validUntil = new Date(body.validUntil)

  const doc = await Promo.findByIdAndUpdate(params.id, update, { new: true }).lean()
  if (!doc) return fail('NOT_FOUND', 'Code promo non trouvé', 404)
  return ok({ id: String(doc._id), active: doc.active !== false })
})

export const DELETE = handle(async (request: NextRequest, { params }: Params) => {
  requireAdmin(request)
  await connectDB()
  const doc = await Promo.findByIdAndDelete(params.id)
  if (!doc) return fail('NOT_FOUND', 'Code promo non trouvé', 404)
  return ok({ message: 'Code supprimé' })
})

export const dynamic = 'force-dynamic'
