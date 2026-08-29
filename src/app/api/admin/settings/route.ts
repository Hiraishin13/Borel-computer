import { NextRequest } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/mongodb'
import { Settings } from '@/models/Settings'
import { requireAdmin } from '@/lib/auth'
import { getSettings, invalidateSettings } from '@/lib/settings'
import { handle, ok } from '@/lib/api-response'

export const GET = handle(async (request: NextRequest) => {
  requireAdmin(request)
  return ok(await getSettings())
})

const schema = z.object({
  shopName: z.string().min(1).optional(),
  contactEmail: z.string().email().optional(),
  whatsappNumber: z
    .string()
    .transform((s) => s.replace(/[^0-9]/g, ''))
    .optional(),
  announcement: z.string().max(200).optional(),
  announcementActive: z.boolean().optional(),
  currency: z.enum(['USD', 'EUR', 'CAD', 'XOF', 'CDF']).optional(),
  taxRate: z.number().min(0).max(1).optional(),
  freeShippingThreshold: z.number().min(0).optional(),
  standardShipping: z.number().min(0).optional(),
  expressSurcharge: z.number().min(0).optional(),
  assemblyFee: z.number().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
})

export const PATCH = handle(async (request: NextRequest) => {
  requireAdmin(request)
  await connectDB()
  const body = schema.parse(await request.json())

  await Settings.findOneAndUpdate({ key: 'global' }, { $set: body }, { upsert: true })
  invalidateSettings()

  return ok(await getSettings())
})

export const dynamic = 'force-dynamic'
