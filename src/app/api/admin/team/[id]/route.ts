import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { requireAdmin } from '@/lib/auth'
import { handle, ok, fail } from '@/lib/api-response'

/** Révoque les droits admin d'un compte (pas le sien). */
export const DELETE = handle(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const auth = requireAdmin(request)
    if (auth.userId === params.id) {
      return fail('VALIDATION_ERROR', 'Vous ne pouvez pas retirer vos propres droits', 400)
    }
    await connectDB()

    const remaining = await User.countDocuments({ role: 'admin' })
    if (remaining <= 1) return fail('VALIDATION_ERROR', 'Au moins un administrateur est requis', 400)

    const user = await User.findByIdAndUpdate(params.id, { role: 'user' })
    if (!user) return fail('NOT_FOUND', 'Compte non trouvé', 404)
    return ok({ message: 'Droits administrateur retirés' })
  },
)

export const dynamic = 'force-dynamic'
