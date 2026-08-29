export type ProductCategory =
  | 'ordinateurs'
  | 'composants'
  | 'peripheriques'
  | 'logiciels'
  | 'refurbished'

export interface ProductVariant {
  id: string
  name: string
  options: string[]
}

export interface Product {
  id: string
  sku: string
  name: string
  brand?: string
  slug: string
  description: string
  category: ProductCategory
  subcategory: string
  price: number
  discountPrice?: number
  currency: string
  stock: number
  thumbnail: string
  images: string[]
  rating: number
  reviews: number
  featured: boolean
  specifications: Record<string, string>
  variants: ProductVariant[]
  compatibility: string[]
  warranty: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface ProductListQuery {
  category?: string
  subcategory?: string
  search?: string
  sortBy?: 'price' | 'rating' | 'createdAt' | 'name'
  order?: 'asc' | 'desc'
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
}
