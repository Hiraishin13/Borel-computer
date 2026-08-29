import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Promo } from '@/models/Promo'
import { requireAdmin } from '@/lib/auth'
import { promoCreateSchema } from '@/lib/validators'
import { handle, ok, fail } from '@/lib/api-response'

interface PromoLean {
  _id: unknown
  code: string
  type: 'percentage' | 'fixed'
  value: number
  description?: string
  maxUses?: number
  usedCount?: number
  validFrom: string | Date
  validUntil: string | Date
  minPurchase?: number
  applicableCategories?: string[]
  active?: boolean
  createdAt: string | Date
}

function serialize(p: PromoLean) {
  return {
    id: String(p._id),
    code: p.code,
    type: p.type,
    value: p.value,
    description: p.description ?? '',
    maxUses: p.maxUses ?? 0,
    usedCount: p.usedCount ?? 0,
    validFrom: new Date(p.validFrom).toISOString(),
    validUntil: new Date(p.validUntil).toISOString(),
    minPurchase: p.minPurchase ?? 0,
    applicableCategories: p.applicableCategories ?? [],
    active: p.active !== false,
    createdAt: new Date(p.createdAt).toISOString(),
  }
}

export const GET = handle(async (request: NextRequest) => {
  requireAdmin(request)
  await connectDB()
  const docs = await Promo.find().sort({ createdAt: -1 }).lean()
  return ok({ data: docs.map((d) => serialize(d as unknown as PromoLean)) })
})

export const POST = handle(async (request: NextRequest) => {
  requireAdmin(request)
  await connectDB()
  const body = promoCreateSchema.parse(await request.json())

  if (await Promo.findOne({ code: body.code })) {
    return fail('CONFLICT', 'Ce code existe déjà', 409)
  }

  const doc = await Promo.create({
    ...body,
    validFrom: new Date(body.validFrom),
    validUntil: new Date(body.validUntil),
  })
  return ok(serialize(doc.toObject() as unknown as PromoLean), 201)
})

export const dynamic = 'force-dynamic'
