import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { Order } from '@/models/Order'
import { requireAdmin } from '@/lib/auth'
import { handle, ok } from '@/lib/api-response'

export const GET = handle(async (request: NextRequest) => {
  requireAdmin(request)
  await connectDB()

  const search = request.nextUrl.searchParams.get('search')
  const filter: Record<string, unknown> = { role: 'user' }
  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: 'i' } },
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
    ]
  }

  const [users, orderAgg] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).limit(300).lean(),
    Order.aggregate<{
      _id: unknown
      orders: number
      spent: number
      lastOrderAt: Date
      units: number
    }>([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$userId',
          orders: { $sum: 1 },
          spent: { $sum: '$total' },
          lastOrderAt: { $max: '$createdAt' },
          units: { $sum: { $sum: '$items.quantity' } },
        },
      },
    ]),
  ])

  const stats = new Map(orderAgg.map((o) => [String(o._id), o]))

  const data = users.map((u) => {
    const s = stats.get(String(u._id))
    return {
      id: String(u._id),
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone ?? null,
      createdAt: new Date(u.createdAt).toISOString(),
      orders: s?.orders ?? 0,
      spent: Math.round(s?.spent ?? 0),
      units: s?.units ?? 0,
      lastOrderAt: s?.lastOrderAt ? new Date(s.lastOrderAt).toISOString() : null,
    }
  })

  data.sort((a, b) => b.spent - a.spent)

  return ok({ data, total: data.length })
})

export const dynamic = 'force-dynamic'
