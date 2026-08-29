import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Order } from '@/models/Order'
import { User } from '@/models/User'
import { Product } from '@/models/Product'
import { requireAdmin } from '@/lib/auth'
import { handle, ok } from '@/lib/api-response'

const ACTIVE = { status: { $ne: 'cancelled' } }

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export const GET = handle(async (request: NextRequest) => {
  requireAdmin(request)
  await connectDB()

  const now = new Date()
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const start12mAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)

  const [
    revenueAll,
    revenueCollected,
    revenueThisMonth,
    revenueLastMonth,
    statusAgg,
    monthlyAgg,
    itemAgg,
    productCounts,
    customerTotal,
    customerNew,
  ] = await Promise.all([
    Order.aggregate<{ total: number; count: number }>([
      { $match: ACTIVE },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]),
    Order.aggregate<{ total: number }>([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.aggregate<{ total: number }>([
      { $match: { ...ACTIVE, createdAt: { $gte: startThisMonth } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.aggregate<{ total: number }>([
      { $match: { ...ACTIVE, createdAt: { $gte: startLastMonth, $lt: startThisMonth } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.aggregate<{ _id: string; count: number; total: number }>([
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$total' } } },
    ]),
    Order.aggregate<{ _id: string; revenue: number }>([
      { $match: { ...ACTIVE, createdAt: { $gte: start12mAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$total' },
        },
      },
    ]).then((r) => r.map((x) => ({ _id: x._id, revenue: x.revenue }))),
    // Ventes par produit (marge = prix vente - coût courant)
    Order.aggregate<{
      _id: unknown
      name: string
      brand: string | null
      units: number
      revenue: number
      cost: number
    }>([
      { $match: ACTIVE },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          units: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $addFields: {
          brand: { $ifNull: [{ $arrayElemAt: ['$product.brand', 0] }, null] },
          cost: {
            $multiply: [{ $ifNull: [{ $arrayElemAt: ['$product.cost', 0] }, 0] }, '$units'],
          },
        },
      },
      { $project: { product: 0 } },
    ]),
    Product.aggregate<{ _id: string; count: number }>([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $eq: ['$stock', 0] }, then: 'out' },
                { case: { $lte: ['$stock', 5] }, then: 'low' },
              ],
              default: 'ok',
            },
          },
          count: { $sum: 1 },
        },
      },
    ]),
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', createdAt: { $gte: startThisMonth } }),
  ])

  const [publishedCount, totalProducts, brands] = await Promise.all([
    Product.countDocuments({ published: { $ne: false }, category: { $ne: 'services' } }),
    Product.countDocuments({ category: { $ne: 'services' } }),
    Product.distinct('brand', { category: { $ne: 'services' } }),
  ])

  // --- Revenus ---
  const revenueTotal = revenueAll[0]?.total ?? 0
  const orderCount = revenueAll[0]?.count ?? 0
  const thisMonth = revenueThisMonth[0]?.total ?? 0
  const lastMonth = revenueLastMonth[0]?.total ?? 0
  const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : thisMonth > 0 ? 100 : 0

  // --- Marge ---
  const soldRevenue = itemAgg.reduce((s, i) => s + i.revenue, 0)
  const soldCost = itemAgg.reduce((s, i) => s + i.cost, 0)
  const margin = soldRevenue - soldCost
  const marginPct = soldRevenue > 0 ? (margin / soldRevenue) * 100 : 0

  // --- Statuts ---
  const byStatus: Record<string, { count: number; total: number }> = {}
  for (const s of statusAgg) byStatus[s._id] = { count: s.count, total: s.total }
  const totalOrders = statusAgg.reduce((n, s) => n + s.count, 0)
  const unpaid = (byStatus.pending?.count ?? 0) + (byStatus.processing?.count ?? 0)

  // --- Revenus mensuels (12 derniers mois, zéros comblés) ---
  const monthlyMap = new Map(monthlyAgg.map((m) => [m._id, m.revenue]))
  const monthlyRevenue: { month: string; revenue: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = monthKey(d)
    monthlyRevenue.push({ month: key, revenue: Math.round(monthlyMap.get(key) ?? 0) })
  }

  // --- Top produits ---
  const topProducts = [...itemAgg]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6)
    .map((i) => ({
      name: i.name,
      brand: i.brand,
      units: i.units,
      revenue: Math.round(i.revenue),
      margin: Math.round(i.revenue - i.cost),
    }))

  // --- Ventes par marque (toutes les marques, vendues ou non) ---
  const brandMap = new Map<string, { units: number; revenue: number; cost: number }>()
  for (const i of itemAgg) {
    const key = i.brand ?? '—'
    const cur = brandMap.get(key) ?? { units: 0, revenue: 0, cost: 0 }
    cur.units += i.units
    cur.revenue += i.revenue
    cur.cost += i.cost
    brandMap.set(key, cur)
  }
  const salesByBrand = (brands as string[])
    .filter(Boolean)
    .map((brand) => {
      const s = brandMap.get(brand) ?? { units: 0, revenue: 0, cost: 0 }
      return {
        brand,
        units: s.units,
        revenue: Math.round(s.revenue),
        margin: Math.round(s.revenue - s.cost),
        sold: s.units > 0,
      }
    })
    .sort((a, b) => b.revenue - a.revenue || a.brand.localeCompare(b.brand))

  const stockMap = Object.fromEntries(productCounts.map((p) => [p._id, p.count]))

  return ok({
    revenue: {
      total: Math.round(revenueTotal),
      collected: Math.round(revenueCollected[0]?.total ?? 0),
      pending: Math.round(revenueTotal - (revenueCollected[0]?.total ?? 0)),
      thisMonth: Math.round(thisMonth),
      lastMonth: Math.round(lastMonth),
      growth: Math.round(growth * 10) / 10,
    },
    margin: {
      total: Math.round(margin),
      pct: Math.round(marginPct * 10) / 10,
    },
    orders: {
      total: totalOrders,
      active: orderCount,
      unpaid,
      avgBasket: orderCount > 0 ? Math.round(revenueTotal / orderCount) : 0,
      byStatus,
    },
    customers: { total: customerTotal, new: customerNew },
    products: {
      total: totalProducts,
      published: publishedCount,
      unpublished: totalProducts - publishedCount,
      outOfStock: stockMap.out ?? 0,
      lowStock: stockMap.low ?? 0,
    },
    monthlyRevenue,
    topProducts,
    salesByBrand,
  })
})

export const dynamic = 'force-dynamic'
