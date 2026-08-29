import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Promo } from '@/models/Promo'
import { handle, ok } from '@/lib/api-response'

export const POST = handle(async (request: NextRequest) => {
  const { code, cartTotal } = await request.json()
  await connectDB()

  const promo = await Promo.findOne({ code: String(code).toUpperCase(), active: true })
  const now = new Date()

  if (
    !promo ||
    promo.validFrom > now ||
    promo.validUntil < now ||
    (promo.maxUses !== 0 && promo.usedCount >= promo.maxUses)
  ) {
    return ok({ valid: false, message: 'Code promo invalide ou expiré' })
  }

  if (cartTotal < promo.minPurchase) {
    return ok({
      valid: false,
      message: `Minimum d'achat de ${promo.minPurchase} € requis`,
    })
  }

  const discount =
    promo.type === 'percentage'
      ? (cartTotal * promo.value) / 100
      : Math.min(promo.value, cartTotal)

  return ok({
    valid: true,
    code: promo.code,
    type: promo.type,
    value: promo.value,
    discount: +discount.toFixed(2),
    message: 'Code appliqué',
  })
})
