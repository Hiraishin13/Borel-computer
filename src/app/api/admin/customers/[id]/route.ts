import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { Order } from '@/models/Order'
import { requireAdmin } from '@/lib/auth'
import { serializeOrder } from '@/lib/serializers'
import { handle, ok, fail } from '@/lib/api-response'

export const GET = handle(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    requireAdmin(request)
    await connectDB()

    const user = await User.findById(params.id).lean()
    if (!user) return fail('NOT_FOUND', 'Client non trouvé', 404)

    const orderDocs = await Order.find({ userId: params.id }).sort({ createdAt: -1 }).lean()
    const orders = orderDocs.map(serializeOrder)

    // Ce que ce client achète (agrégé par article)
    const boughtMap = new Map<string, { name: string; units: number; total: number }>()
    for (const o of orders) {
      if (o.status === 'cancelled') continue
      for (const it of o.items) {
        const cur = boughtMap.get(it.name) ?? { name: it.name, units: 0, total: 0 }
        cur.units += it.quantity
        cur.total += it.price * it.quantity
        boughtMap.set(it.name, cur)
      }
    }
    const bought = [...boughtMap.values()]
      .map((b) => ({ ...b, total: Math.round(b.total) }))
      .sort((a, b) => b.total - a.total)

    const active = orders.filter((o) => o.status !== 'cancelled')

    return ok({
      customer: {
        id: String(user._id),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? null,
        addresses: user.addresses ?? [],
        createdAt: new Date(user.createdAt).toISOString(),
      },
      summary: {
        orders: active.length,
        spent: Math.round(active.reduce((s, o) => s + o.total, 0)),
        avgBasket: active.length
          ? Math.round(active.reduce((s, o) => s + o.total, 0) / active.length)
          : 0,
      },
      bought,
      orders,
    })
  },
)

export const dynamic = 'force-dynamic'
