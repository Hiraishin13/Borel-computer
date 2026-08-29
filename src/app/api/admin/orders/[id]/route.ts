import { NextRequest } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/mongodb'
import { Order } from '@/models/Order'
import { User } from '@/models/User'
import { requireAdmin } from '@/lib/auth'
import { serializeOrder } from '@/lib/serializers'
import { handle, ok, fail } from '@/lib/api-response'

type Params = { params: { id: string } }

export const GET = handle(async (request: NextRequest, { params }: Params) => {
  requireAdmin(request)
  await connectDB()

  const doc = await Order.findById(params.id).lean()
  if (!doc) return fail('NOT_FOUND', 'Commande non trouvée', 404)

  const user = await User.findById(doc.userId).lean()

  return ok({
    order: serializeOrder(doc),
    customer: user
      ? {
          id: String(user._id),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone ?? null,
        }
      : null,
    invoiceSentAt: doc.invoiceSentAt ? new Date(doc.invoiceSentAt).toISOString() : null,
  })
})

const patchSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  paymentStatus: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
})

export const PATCH = handle(async (request: NextRequest, { params }: Params) => {
  requireAdmin(request)
  await connectDB()
  const body = patchSchema.parse(await request.json())

  const update: Record<string, unknown> = {}
  if (body.status) update.status = body.status
  if (body.paymentStatus) update.paymentStatus = body.paymentStatus
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
})

export const dynamic = 'force-dynamic'
