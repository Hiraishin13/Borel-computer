import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { requireAuth } from '@/lib/auth'
import { handle, ok } from '@/lib/api-response'

export const DELETE = handle(
  async (request: NextRequest, { params }: { params: { productId: string } }) => {
    const auth = requireAuth(request)
    await connectDB()
    await User.updateOne({ _id: auth.userId }, { $pull: { wishlist: params.productId } })
    return ok({ message: 'Supprimé des favoris' })
  },
)
