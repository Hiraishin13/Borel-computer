import { NextRequest } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { requireAdmin } from '@/lib/auth'
import { handle, ok, fail } from '@/lib/api-response'

export const GET = handle(async (request: NextRequest) => {
  requireAdmin(request)
  await connectDB()
  const admins = await User.find({ role: 'admin' }).sort({ createdAt: 1 }).lean()
  return ok({
    data: admins.map((u) => ({
      id: String(u._id),
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      createdAt: new Date(u.createdAt).toISOString(),
    })),
  })
})

export const POST = handle(async (request: NextRequest) => {
  requireAdmin(request)
  await connectDB()
  const { email } = z.object({ email: z.string().email() }).parse(await request.json())

  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) return fail('NOT_FOUND', 'Aucun compte avec cet email', 404)
  if (user.role === 'admin') return fail('CONFLICT', 'Déjà administrateur', 409)

  user.role = 'admin'
  await user.save()
  return ok({ id: String(user._id), email: user.email })
})

export const dynamic = 'force-dynamic'
