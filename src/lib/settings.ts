import { connectDB } from './mongodb'
import { Settings } from '@/models/Settings'
import {
  SITE,
  TAX_RATE,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING,
  EXPRESS_SHIPPING_SURCHARGE,
  ASSEMBLY_FEE,
  CURRENCY,
} from './constants'

export interface ShopSettings {
  shopName: string
  contactEmail: string
  whatsappNumber: string
  announcement: string
  announcementActive: boolean
  sellerName: string
  sellerAddress: string
  sellerPhone: string
  sellerEmail: string
  sellerTaxId: string
  invoiceFooter: string
  currency: string
  taxRate: number
  freeShippingThreshold: number
  standardShipping: number
  expressSurcharge: number
  assemblyFee: number
  lowStockThreshold: number
}

export const DEFAULT_SETTINGS: ShopSettings = {
  shopName: SITE.name,
  contactEmail: 'contact@borelcomputer.com',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '',
  announcement: '',
  announcementActive: false,
  sellerName: SITE.name,
  sellerAddress: '',
  sellerPhone: '',
  sellerEmail: 'contact@borelcomputer.com',
  sellerTaxId: '',
  invoiceFooter:
    'Cette facture fait foi de commande. Le paiement s’effectue au moment de la remise des articles.',
  currency: CURRENCY,
  taxRate: TAX_RATE,
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  standardShipping: STANDARD_SHIPPING,
  expressSurcharge: EXPRESS_SHIPPING_SURCHARGE,
  assemblyFee: ASSEMBLY_FEE,
  lowStockThreshold: 5,
}

let cache: { value: ShopSettings; at: number } | null = null
const TTL = 30_000

/** Config boutique, avec cache court (serverless). */
export async function getSettings(): Promise<ShopSettings> {
  if (cache && Date.now() - cache.at < TTL) return cache.value
  try {
    await connectDB()
    const doc = await Settings.findOneAndUpdate(
      { key: 'global' },
      { $setOnInsert: { key: 'global' } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean()
    const value: ShopSettings = { ...DEFAULT_SETTINGS, ...stripMeta(doc) }
    // un numéro vide en base = on retombe sur la variable d'environnement
    if (!value.whatsappNumber) value.whatsappNumber = DEFAULT_SETTINGS.whatsappNumber
    cache = { value, at: Date.now() }
    return value
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function invalidateSettings() {
  cache = null
}

function stripMeta(doc: Record<string, unknown> | null): Partial<ShopSettings> {
  if (!doc) return {}
  const rest = { ...doc }
  delete rest._id
  delete rest.__v
  delete rest.key
  delete rest.createdAt
  delete rest.updatedAt
  return rest as Partial<ShopSettings>
}
