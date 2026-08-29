import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { signToken } from '@/lib/jwt'
import { registerSchema } from '@/lib/validators'
import { handle, ok, fail } from '@/lib/api-response'

export const POST = handle(async (request: NextRequest) => {
  const body = registerSchema.parse(await request.json())
  await connectDB()

  const existing = await User.findOne({ email: body.email })
  if (existing) return fail('CONFLICT', 'Email déjà utilisé', 409)

  const password = await bcrypt.hash(body.password, 12)
  const user = await User.create({ ...body, password })

  const token = signToken({ userId: String(user._id), email: user.email, role: user.role })

  return ok(
    { id: String(user._id), email: user.email, firstName: user.firstName, role: user.role, token },
    201,
  )
})
