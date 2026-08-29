import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose'
import {
  SITE,
  TAX_RATE,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING,
  EXPRESS_SHIPPING_SURCHARGE,
  ASSEMBLY_FEE,
  CURRENCY,
} from '@/lib/constants'

/** Document singleton (`key: "global"`) de configuration de la boutique. */
const settingsSchema = new Schema(
  {
    key: { type: String, default: 'global', unique: true },

    shopName: { type: String, default: SITE.name },
    contactEmail: { type: String, default: 'contact@borelcomputer.com' },
    whatsappNumber: { type: String, default: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '' },
    announcement: { type: String, default: '' },
    announcementActive: { type: Boolean, default: false },

    // --- Bloc vendeur affiché sur la facture ---
    sellerName: { type: String, default: SITE.name },
    sellerAddress: { type: String, default: '' },
    sellerPhone: { type: String, default: '' },
    sellerEmail: { type: String, default: 'contact@borelcomputer.com' },
    sellerTaxId: { type: String, default: '' },
    invoiceFooter: {
      type: String,
      default:
        'Cette facture fait foi de commande. Le paiement s’effectue au moment de la remise des articles.',
    },

    currency: { type: String, default: CURRENCY },
    taxRate: { type: Number, default: TAX_RATE, min: 0, max: 1 },
    freeShippingThreshold: { type: Number, default: FREE_SHIPPING_THRESHOLD, min: 0 },
    standardShipping: { type: Number, default: STANDARD_SHIPPING, min: 0 },
    expressSurcharge: { type: Number, default: EXPRESS_SHIPPING_SURCHARGE, min: 0 },
    assemblyFee: { type: Number, default: ASSEMBLY_FEE, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
  },
  { timestamps: true },
)

export type SettingsDoc = InferSchemaType<typeof settingsSchema>

export const Settings: Model<SettingsDoc> =
  (models.Settings as Model<SettingsDoc>) ?? model<SettingsDoc>('Settings', settingsSchema)
