import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose'

const partSchema = new Schema(
  {
    slot: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    color: { type: String },
  },
  { _id: false },
)

const buildSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    usage: { type: String, required: true, index: true }, // gaming, semi-gaming, multimedia, ...
    description: { type: String, default: '' },
    heroImage: { type: String },
    parts: { type: [partSchema], default: [] },
    /** Marge appliquée sur le prix des composants (%). 0 = prix coûtant + assemblage. */
    markupPct: { type: Number, default: 0, min: 0 },
    published: { type: Boolean, default: false, index: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export type BuildDoc = InferSchemaType<typeof buildSchema>

export const Build: Model<BuildDoc> =
  (models.Build as Model<BuildDoc>) ?? model<BuildDoc>('Build', buildSchema)
