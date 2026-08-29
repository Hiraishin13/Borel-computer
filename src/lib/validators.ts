import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
})

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

export const addressSchema = z.object({
  type: z.enum(['shipping', 'billing']),
  street: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  default: z.boolean().optional().default(false),
})

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(120),
  comment: z.string().min(1).max(2000),
  images: z.array(z.string().url()).max(5).optional().default([]),
})

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  variant: z.string().optional(),
})

export const checkoutSchema = z.object({
  shippingAddressId: z.string().min(1),
  billingAddressId: z.string().min(1),
  shippingMethod: z.enum(['standard', 'express']),
  paymentMethod: z.literal('stripe'),
  couponCode: z.string().optional(),
})

export const productSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  subcategory: z.string().min(1),
  price: z.number().positive(),
  discountPrice: z.number().positive().optional(),
  stock: z.number().int().min(0),
  images: z.array(z.string().url()).min(1),
  specifications: z.record(z.string()).optional().default({}),
  featured: z.boolean().optional().default(false),
})
