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
    brand: { type: String, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    cost: { type: Number, default: 0, min: 0 }, // prix d'achat, pour le calcul de marge
    currency: { type: String, default: 'USD' },
    stock: { type: Number, default: 0, min: 0 },
    published: { type: Boolean, default: true, index: true },
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
    /** name + brand + subcategory + tags + description, minuscule sans accents */
    searchText: { type: String, default: '', index: true },
  },
  { timestamps: true },
)

/** Recalcule searchText avant chaque save/update. */
function buildSearchText(src: Record<string, unknown>): string {
  const variants = Array.isArray(src.variants)
    ? (src.variants as { options?: string[] }[]).flatMap((v) => v.options ?? []).join(' ')
    : ''
  const parts = [
    src.name,
    src.brand,
    src.subcategory,
    src.category,
    Array.isArray(src.tags) ? src.tags.join(' ') : '',
    variants,
    src.description,
  ]
  return parts
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

const TEXT_KEYS = ['name', 'brand', 'subcategory', 'category', 'tags', 'description']

productSchema.pre('save', function (next) {
  this.searchText = buildSearchText(this.toObject())
  next()
})

productSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], async function () {
  const update = (this.getUpdate() ?? {}) as Record<string, unknown> & { $set?: Record<string, unknown> }
  const set = update.$set ?? update
  if (!TEXT_KEYS.some((k) => k in set)) return
  const current = await this.model.findOne(this.getQuery()).lean()
  const merged = { ...(current ?? {}), ...set } as Record<string, unknown>
  set.searchText = buildSearchText(merged)
  if (update.$set) update.$set = set
  else this.setUpdate(set)
})

export type ProductDoc = InferSchemaType<typeof productSchema>

export const Product: Model<ProductDoc> =
  (models.Product as Model<ProductDoc>) ?? model<ProductDoc>('Product', productSchema)
