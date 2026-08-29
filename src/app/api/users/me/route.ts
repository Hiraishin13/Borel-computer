import { NextRequest } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { requireAuth } from '@/lib/auth'
import { handle, ok, fail } from '@/lib/api-response'

const patchSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  profileImage: z.string().url().optional(),
})

export const GET = handle(async (request: NextRequest) => {
  const auth = requireAuth(request)
  await connectDB()
  const user = await User.findById(auth.userId).lean()
  if (!user) return fail('NOT_FOUND', 'Utilisateur non trouvé', 404)

  return ok({
    id: String(user._id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone ?? null,
    profileImage: user.profileImage ?? null,
    role: user.role,
    addresses: user.addresses ?? [],
    createdAt: new Date(user.createdAt).toISOString(),
  })
})

export const PATCH = handle(async (request: NextRequest) => {
  const auth = requireAuth(request)
  await connectDB()
  const updates = patchSchema.parse(await request.json())
  await User.updateOne({ _id: auth.userId }, updates)
  return ok({ message: 'Profil mis à jour' })
})

export const dynamic = 'force-dynamic'
