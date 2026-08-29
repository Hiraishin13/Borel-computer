import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Review } from '@/models/Review'
import { Product } from '@/models/Product'
import { User } from '@/models/User'
import { requireAuth } from '@/lib/auth'
import { reviewSchema } from '@/lib/validators'
import { serializeReview } from '@/lib/serializers'
import { handle, ok, fail } from '@/lib/api-response'

type Params = { params: { id: string } }

export const GET = handle(async (request: NextRequest, { params }: Params) => {
  await connectDB()
  const sp = request.nextUrl.searchParams
  const page = Math.max(1, Number(sp.get('page') ?? 1))
  const limit = Math.min(50, Number(sp.get('limit') ?? 10))

  const [docs, total] = await Promise.all([
    Review.find({ productId: params.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Review.countDocuments({ productId: params.id }),
  ])

  return ok({
    data: docs.map(serializeReview),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
})

export const POST = handle(async (request: NextRequest, { params }: Params) => {
  const auth = requireAuth(request)
  await connectDB()

  const body = reviewSchema.parse(await request.json())
  const existing = await Review.findOne({ productId: params.id, userId: auth.userId })
  if (existing) return fail('CONFLICT', 'Vous avez déjà laissé un avis', 409)

  const user = await User.findById(auth.userId).lean()
  const review = await Review.create({
    ...body,
    productId: params.id,
    userId: auth.userId,
    userName: user ? `${user.firstName} ${user.lastName[0]}.` : 'Client',
  })

  // Recompute aggregate rating.
  const agg = await Review.aggregate<{ avg: number; count: number }>([
    { $match: { productId: review.productId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  if (agg[0]) {
    await Product.findByIdAndUpdate(params.id, {
      rating: Math.round(agg[0].avg * 10) / 10,
      reviews: agg[0].count,
    })
  }

  return ok(serializeReview(review.toObject()), 201)
})
