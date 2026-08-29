import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose'

const addressSchema = new Schema(
  {
    type: { type: String, enum: ['shipping', 'billing'], required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    default: { type: Boolean, default: false },
  },
  { _id: true },
)

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    profileImage: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    addresses: { type: [addressSchema], default: [] },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    resetToken: { type: String, select: false },
    resetTokenExpiry: { type: Date, select: false },
  },
  { timestamps: true },
)

export type UserDoc = InferSchemaType<typeof userSchema>

export const User: Model<UserDoc> =
  (models.User as Model<UserDoc>) ?? model<UserDoc>('User', userSchema)
