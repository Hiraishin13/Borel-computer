import type { Order, Product, Review } from '@/types'
import { CURRENCY } from './constants'


/** Converts a Mongoose lean document into a plain, client-safe object. */
export function serializeProduct(doc: any): Product {
  const specs =
    doc.specifications instanceof Map
      ? Object.fromEntries(doc.specifications)
      : (doc.specifications ?? {})

  return {
    id: String(doc._id),
    sku: doc.sku,
    name: doc.name,
    brand: doc.brand ?? undefined,
    slug: doc.slug,
    description: doc.description,
    category: doc.category,
    subcategory: doc.subcategory,
    price: doc.price,
    discountPrice: doc.discountPrice ?? undefined,
    currency: doc.currency ?? CURRENCY,
    stock: doc.stock ?? 0,
    thumbnail: doc.thumbnail,
    images: doc.images ?? [],
    rating: doc.rating ?? 0,
    reviews: doc.reviews ?? 0,
    featured: Boolean(doc.featured),
    specifications: specs,
    variants: (doc.variants ?? []).map((v: any) => ({
      id: String(v._id),
      name: v.name,
      options: v.options ?? [],
    })),
    compatibility: (doc.compatibility ?? []).map(String),
    warranty: doc.warranty ?? '2 ans',
    tags: doc.tags ?? [],
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  }
}

export function serializeReview(doc: any): Review {
  return {
    id: String(doc._id),
    productId: String(doc.productId),
    userId: String(doc.userId),
    userName: doc.userName,
    rating: doc.rating,
    title: doc.title,
    comment: doc.comment,
    images: doc.images ?? [],
    helpful: doc.helpful ?? 0,
    verified: Boolean(doc.verified),
    createdAt: new Date(doc.createdAt).toISOString(),
  }
}

export function serializeOrder(doc: any): Order {
  return {
    id: String(doc._id),
    orderNumber: doc.orderNumber,
    userId: String(doc.userId),
    status: doc.status,
    items: (doc.items ?? []).map((i: any) => ({
      productId: String(i.productId),
      sku: i.sku,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      variant: i.variant ?? undefined,
      image: i.image ?? undefined,
    })),
    subtotal: doc.subtotal,
    shipping: doc.shipping ?? 0,
    tax: doc.tax ?? 0,
    discount: doc.discount ?? 0,
    total: doc.total,
    shippingAddress: doc.shippingAddress,
    billingAddress: doc.billingAddress ?? undefined,
    paymentMethod: doc.paymentMethod ?? 'stripe',
    paymentStatus: doc.paymentStatus ?? 'pending',
    tracking: doc.tracking ?? undefined,
    notes: doc.notes ?? undefined,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  }
}
