import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Order } from '@/models/Order'
import { requireAuth } from '@/lib/auth'
import { serializeOrder } from '@/lib/serializers'
import { handle, ok, fail } from '@/lib/api-response'

type Params = { params: { id: string } }

export const GET = handle(async (request: NextRequest, { params }: Params) => {
  const auth = requireAuth(request)
  await connectDB()

  const doc = await Order.findById(params.id).lean()
  if (!doc) return fail('NOT_FOUND', 'Commande non trouvée', 404)
  if (String(doc.userId) !== auth.userId && auth.role !== 'admin') {
    return fail('PERMISSION_ERROR', 'Accès refusé', 403)
  }
  return ok(serializeOrder(doc))
})
