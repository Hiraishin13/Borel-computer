import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { Product } from '@/models/Product'
import { requireAuth } from '@/lib/auth'
import { serializeProduct } from '@/lib/serializers'
import { handle, ok } from '@/lib/api-response'

export const GET = handle(async (request: NextRequest) => {
  const auth = requireAuth(request)
  await connectDB()
  const user = await User.findById(auth.userId).lean()
  const ids = user?.wishlist ?? []
  const docs = await Product.find({ _id: { $in: ids } }).lean()
  return ok({ data: docs.map(serializeProduct), total: docs.length })
})

export const POST = handle(async (request: NextRequest) => {
  const auth = requireAuth(request)
  await connectDB()
  const { productId } = await request.json()
  await User.updateOne({ _id: auth.userId }, { $addToSet: { wishlist: productId } })
  return ok({ id: productId, addedAt: new Date().toISOString() }, 201)
})

export const dynamic = 'force-dynamic'
