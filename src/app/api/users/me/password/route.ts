import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { requireAuth } from '@/lib/auth'
import { passwordChangeSchema } from '@/lib/validators'
import { handle, ok, fail } from '@/lib/api-response'

export const POST = handle(async (request: NextRequest) => {
  const auth = requireAuth(request)
  await connectDB()
  const { currentPassword, newPassword } = passwordChangeSchema.parse(await request.json())

  const user = await User.findById(auth.userId).select('+password')
  if (!user) return fail('NOT_FOUND', 'Utilisateur non trouvé', 404)

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) return fail('AUTH_ERROR', 'Mot de passe actuel incorrect', 401)

  user.set('password', await bcrypt.hash(newPassword, 12))
  await user.save()

  return ok({ message: 'Mot de passe mis à jour' })
})

export const dynamic = 'force-dynamic'
