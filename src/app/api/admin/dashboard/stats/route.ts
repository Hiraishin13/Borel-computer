import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Order } from '@/models/Order'
import { User } from '@/models/User'
import { Product } from '@/models/Product'
import { requireAdmin } from '@/lib/auth'
import { handle, ok } from '@/lib/api-response'

export const GET = handle(async (request: NextRequest) => {
  requireAdmin(request)
  await connectDB()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [revenueAgg, monthAgg, orderCounts, customers, newCustomers, products, outOfStock, lowStock] =
    await Promise.all([
      Order.aggregate<{ total: number }>([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate<{ total: number }>([
        { $match: { paymentStatus: 'completed', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
      Product.countDocuments(),
      Product.countDocuments({ stock: 0 }),
      Product.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
    ])

  const statusMap = Object.fromEntries(orderCounts.map((s) => [s._id, s.count]))
  const totalOrders = orderCounts.reduce((n, s) => n + s.count, 0)

  return ok({
    revenue: {
      total: revenueAgg[0]?.total ?? 0,
      month: monthAgg[0]?.total ?? 0,
      growth: 0,
    },
    orders: {
      total: totalOrders,
      pending: statusMap.pending ?? 0,
      completed: statusMap.delivered ?? 0,
      cancelled: statusMap.cancelled ?? 0,
    },
    customers: { total: customers, new: newCustomers, active: customers },
    products: { total: products, outOfStock, lowStock },
  })
})

export const dynamic = 'force-dynamic'
