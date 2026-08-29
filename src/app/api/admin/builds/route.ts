import { NextRequest } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/mongodb'
import { Build } from '@/models/Build'
import { Product } from '@/models/Product'
import { requireAdmin } from '@/lib/auth'
import { serializeBuild } from '@/lib/build-serializer'
import { slugify } from '@/lib/utils'
import { PC_USAGES } from '@/lib/constants'
import { handle, ok } from '@/lib/api-response'

const usageSlugs = PC_USAGES.map((u) => u.slug) as [string, ...string[]]

const buildSchema = z.object({
  name: z.string().min(1),
  usage: z.enum(usageSlugs),
  description: z.string().optional().default(''),
  heroImage: z.string().url().optional().or(z.literal('')).optional(),
  markupPct: z.number().min(0).max(200).optional().default(0),
  published: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
  parts: z
    .array(
      z.object({
        slot: z.string().min(1),
        productId: z.string().min(1),
        color: z.string().optional(),
      }),
    )
    .min(1),
})

async function withProducts(builds: unknown[]) {
  const all = builds as { parts?: { productId: unknown }[] }[]
  const ids = all.flatMap((b) => (b.parts ?? []).map((p) => p.productId))
  const products = await Product.find({ _id: { $in: ids } }).lean()
  return new Map(products.map((p) => [String(p._id), p]))
}

export const GET = handle(async (request: NextRequest) => {
  requireAdmin(request)
  await connectDB()
  const builds = await Build.find().sort({ createdAt: -1 }).lean()
  const map = await withProducts(builds)
  return ok({ data: builds.map((b) => serializeBuild(b, map)) })
})

export const POST = handle(async (request: NextRequest) => {
  requireAdmin(request)
  await connectDB()
  const body = buildSchema.parse(await request.json())

  const doc = await Build.create({
    ...body,
    heroImage: body.heroImage || undefined,
    slug: `${slugify(body.name)}-${Date.now().toString(36)}`,
  })

  const map = await withProducts([doc.toObject()])
  return ok(serializeBuild(doc.toObject(), map), 201)
})

export const dynamic = 'force-dynamic'
