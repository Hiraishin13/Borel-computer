import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { signToken } from '@/lib/jwt'
import { loginSchema } from '@/lib/validators'
import { handle, ok, fail } from '@/lib/api-response'

export const POST = handle(async (request: NextRequest) => {
  const { email, password } = loginSchema.parse(await request.json())
  await connectDB()

  const user = await User.findOne({ email }).select('+password')
  if (!user) return fail('AUTH_ERROR', 'Email ou mot de passe incorrect', 401)

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return fail('AUTH_ERROR', 'Email ou mot de passe incorrect', 401)

  const token = signToken({ userId: String(user._id), email: user.email, role: user.role })

  return ok({
    id: String(user._id),
    email: user.email,
    firstName: user.firstName,
    role: user.role,
    token,
  })
})
