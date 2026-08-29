import { getSettings } from '@/lib/settings'
import { handle, ok } from '@/lib/api-response'

/** Sous-ensemble public de la config boutique (pour le front). */
export const GET = handle(async () => {
  const s = await getSettings()
  return ok({
    shopName: s.shopName,
    contactEmail: s.contactEmail,
    whatsappNumber: s.whatsappNumber,
    announcement: s.announcementActive ? s.announcement : '',
    currency: s.currency,
    taxRate: s.taxRate,
    freeShippingThreshold: s.freeShippingThreshold,
    standardShipping: s.standardShipping,
    expressSurcharge: s.expressSurcharge,
    assemblyFee: s.assemblyFee,
  })
})

export const dynamic = 'force-dynamic'
