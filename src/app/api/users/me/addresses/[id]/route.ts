import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { requireAuth } from '@/lib/auth'
import { handle, ok, fail } from '@/lib/api-response'

export const DELETE = handle(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const auth = requireAuth(request)
    await connectDB()

    const res = await User.updateOne(
      { _id: auth.userId },
      { $pull: { addresses: { _id: params.id } } },
    )
    if (res.modifiedCount === 0) return fail('NOT_FOUND', 'Adresse non trouvée', 404)
    return ok({ message: 'Adresse supprimée' })
  },
)

export const dynamic = 'force-dynamic'
