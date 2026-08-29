import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose'

const variantSchema = new Schema(
  {
    name: { type: String, required: true },
    options: { type: [String], default: [] },
  },
  { _id: true },
)

const productSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' },
    stock: { type: Number, default: 0, min: 0 },
    thumbnail: { type: String, required: true },
    images: { type: [String], default: [] },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
    featured: { type: Boolean, default: false, index: true },
    specifications: { type: Map, of: String, default: {} },
    variants: { type: [variantSchema], default: [] },
    compatibility: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    warranty: { type: String, default: '2 ans' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
)

productSchema.index({ name: 'text', description: 'text', tags: 'text' })

export type ProductDoc = InferSchemaType<typeof productSchema>

export const Product: Model<ProductDoc> =
  (models.Product as Model<ProductDoc>) ?? model<ProductDoc>('Product', productSchema)
