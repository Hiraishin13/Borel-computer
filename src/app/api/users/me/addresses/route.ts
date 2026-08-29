import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { requireAuth } from '@/lib/auth'
import { addressSchema } from '@/lib/validators'
import { handle, ok, fail } from '@/lib/api-response'

/* Sérialise les sous-documents adresse. */
function serialize(addresses: unknown[]) {
  return (addresses as Record<string, unknown>[]).map((a) => ({
    id: String(a._id),
    type: a.type,
    street: a.street,
    city: a.city,
    postalCode: a.postalCode,
    country: a.country,
    default: Boolean(a.default),
  }))
}

export const GET = handle(async (request: NextRequest) => {
  const auth = requireAuth(request)
  await connectDB()
  const user = await User.findById(auth.userId).lean()
  if (!user) return fail('NOT_FOUND', 'Utilisateur non trouvé', 404)
  return ok({ data: serialize(user.addresses ?? []) })
})

export const POST = handle(async (request: NextRequest) => {
  const auth = requireAuth(request)
  await connectDB()
  const body = addressSchema.parse(await request.json())

  const user = await User.findById(auth.userId)
  if (!user) return fail('NOT_FOUND', 'Utilisateur non trouvé', 404)

  if (body.default) {
    user.addresses.forEach((a) => {
      a.default = false
    })
  }
  user.addresses.push(body)
  await user.save()

  return ok({ data: serialize(user.toObject().addresses ?? []) }, 201)
})

export const dynamic = 'force-dynamic'
