import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Order } from '@/models/Order'
import { requireAuth } from '@/lib/auth'
import { serializeOrder } from '@/lib/serializers'
import { handle, ok } from '@/lib/api-response'

export const GET = handle(async (request: NextRequest) => {
  const auth = requireAuth(request)
  await connectDB()

  const sp = request.nextUrl.searchParams
  const page = Math.max(1, Number(sp.get('page') ?? 1))
  const limit = Math.min(50, Number(sp.get('limit') ?? 10))
  const filter: Record<string, unknown> = { userId: auth.userId }
  if (sp.get('status')) filter.status = sp.get('status')

  const [docs, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ])

  return ok({
    data: docs.map(serializeOrder),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
})

export const dynamic = 'force-dynamic'
