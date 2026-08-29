import { NextRequest } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/mongodb'
import { Order } from '@/models/Order'
import { requireAdmin } from '@/lib/auth'
import { serializeOrder } from '@/lib/serializers'
import { handle, ok, fail } from '@/lib/api-response'

const schema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
})

export const PATCH = handle(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    requireAdmin(request)
    await connectDB()
    const body = schema.parse(await request.json())

    const update: Record<string, unknown> = {}
    if (body.status) update.status = body.status
    if (body.trackingNumber || body.carrier) {
      update.tracking = {
        carrier: body.carrier,
        trackingNumber: body.trackingNumber,
        status: body.status ?? 'shipped',
      }
    }

    const doc = await Order.findByIdAndUpdate(params.id, update, { new: true }).lean()
    if (!doc) return fail('NOT_FOUND', 'Commande non trouvée', 404)
    return ok(serializeOrder(doc))
  },
)
