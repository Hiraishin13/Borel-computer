import type { Address } from './user'

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface OrderItem {
  productId: string
  sku: string
  name: string
  price: number
  quantity: number
  variant?: string
  image?: string
}

export interface OrderTracking {
  carrier: string
  trackingNumber: string
  status: string
  estimatedDelivery?: string
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  shippingAddress: Address
  billingAddress?: Address
  paymentMethod: string
  paymentStatus: PaymentStatus
  tracking?: OrderTracking
  notes?: string
  createdAt: string
  updatedAt: string
}
