import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose'

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    variant: { type: String },
    image: { type: String },
  },
  { _id: false },
)

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    shippingAddress: { type: Schema.Types.Mixed, required: true },
    billingAddress: { type: Schema.Types.Mixed },
    paymentMethod: { type: String, enum: ['cash', 'stripe'], default: 'cash' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    stripePaymentIntentId: { type: String },
    tracking: {
      carrier: String,
      trackingNumber: String,
      status: String,
      estimatedDelivery: String,
    },
    invoiceSentAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true },
)

export type OrderDoc = InferSchemaType<typeof orderSchema>

export const Order: Model<OrderDoc> =
  (models.Order as Model<OrderDoc>) ?? model<OrderDoc>('Order', orderSchema)
