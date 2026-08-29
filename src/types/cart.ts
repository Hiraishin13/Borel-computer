export interface CartItem {
  id: string
  productId: string
  name: string
  slug: string
  price: number
  quantity: number
  variant?: string
  image: string
  stock: number
}

export interface CartTotals {
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
}

export interface AppliedCoupon {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  discount: number
}
