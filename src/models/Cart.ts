import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose'

const cartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    variant: { type: String },
  },
  { _id: true },
)

const cartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    items: { type: [cartItemSchema], default: [] },
    couponCode: { type: String },
  },
  { timestamps: true },
)

export type CartDoc = InferSchemaType<typeof cartSchema>

export const Cart: Model<CartDoc> =
  (models.Cart as Model<CartDoc>) ?? model<CartDoc>('Cart', cartSchema)
