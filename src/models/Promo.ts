import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose'

const promoSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    description: { type: String },
    maxUses: { type: Number, default: 0 }, // 0 = illimité
    usedCount: { type: Number, default: 0 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    minPurchase: { type: Number, default: 0 },
    applicableCategories: { type: [String], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export type PromoDoc = InferSchemaType<typeof promoSchema>

export const Promo: Model<PromoDoc> =
  (models.Promo as Model<PromoDoc>) ?? model<PromoDoc>('Promo', promoSchema)
