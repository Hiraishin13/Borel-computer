import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose'

const reviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    images: { type: [String], default: [] },
    helpful: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
)

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true })

export type ReviewDoc = InferSchemaType<typeof reviewSchema>

export const Review: Model<ReviewDoc> =
  (models.Review as Model<ReviewDoc>) ?? model<ReviewDoc>('Review', reviewSchema)
